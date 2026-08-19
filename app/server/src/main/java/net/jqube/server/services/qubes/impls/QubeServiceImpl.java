package net.jqube.server.services.qubes.impls;

import lombok.extern.slf4j.Slf4j;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import net.jqube.server.dtos.github.BranchResponseDTO;
import net.jqube.server.dtos.github.RepoResponseDTO;
import net.jqube.server.dtos.qube.ImportRepoRequestDTO;
import net.jqube.server.dtos.qube.ImportRepoResponseDTO;
import net.jqube.server.dtos.qube.NewQubeDTO;
import net.jqube.server.dtos.qube.QubeDTO;

import net.jqube.server.exceptions.auth.BranchNotFoundException;
import net.jqube.server.exceptions.qube.InvalidRepoIdentifierException;
import net.jqube.server.exceptions.qube.QubeAlreadyLinkedException;
import net.jqube.server.exceptions.qube.QubeNotFoundException;
import net.jqube.server.exceptions.qube.QubeSlugConflictException;
import net.jqube.server.exceptions.qube.AccessDeniedException;
import net.jqube.server.models.auth.User;

import net.jqube.server.enums.QubeRoles;
import net.jqube.server.enums.QubeAuthorities;
import net.jqube.server.models.qube.Qube;
import net.jqube.server.models.qube.QubeMember;
import net.jqube.server.constants.QubeConstants;
import net.jqube.server.models.qube.QubeMetrics;

import net.jqube.server.repositories.QubeRepository;
import net.jqube.server.repositories.UserRepository;
import net.jqube.server.repositories.QubeMetricsRepository;
import net.jqube.server.repositories.QubeMemberRepository;

import net.jqube.server.services.github.GithubRepoService;
import net.jqube.server.services.qubes.QubeService;
import net.jqube.server.mappers.QubeMapper;
import net.jqube.server.security.qube.QubeAuthorizationService;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;


import java.time.Instant;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

@Slf4j
@Service
@Transactional
@RequiredArgsConstructor
public class QubeServiceImpl implements QubeService {


    private final QubeRepository qubeRepository;
    private final QubeMemberRepository qubeMemberRepository;
    private final QubeMetricsRepository qubeMetricsRepository;
    private final UserRepository userRepository;
    private final GithubRepoService githubRepoService;
    private final QubeMapper qubeMapper;
    private final QubeAuthorizationService qubeAuthorizationService;

    @Override
    public ImportRepoResponseDTO importRepoFromGithubAndCreateQube(ImportRepoRequestDTO request) {
        log.info("Importing GitHub repository: {}", request.repositoryIdentifier());

        User currentUser = getCurrentUser();

        String[] parts = parseRepositoryIdentifier(request.repositoryIdentifier());
        String owner = parts[0];
        String repository = parts[1];

        RepoResponseDTO repo = githubRepoService.getRepo(currentUser.getId(), owner, repository);

        if (qubeRepository.existsByGithubRepositoryIdAndIsDeletedFalse(repo.id())) {
            throw new QubeAlreadyLinkedException(
                    "Repository " + owner + "/" + repository + " is already imported as a Qube."
            );
        }

        BranchResponseDTO defaultBranch = githubRepoService.getDefaultBranch(
                currentUser.getId(), owner, repository
        );

        String resolvedTargetBranch = resolveTargetBranch(request.targetBranch(), defaultBranch.name());

        if (request.targetBranch() != null && !request.targetBranch().isBlank()
                && !resolvedTargetBranch.equals(defaultBranch.name())) {
            List<BranchResponseDTO> branches = githubRepoService.getRepoBranches(
                    currentUser.getId(), owner, repository
            );
            boolean targetExists = branches.stream()
                    .anyMatch(branch -> branch.name().equals(resolvedTargetBranch));
            if (!targetExists) {
                throw new BranchNotFoundException(
                        "Target branch not found: " + resolvedTargetBranch
                                + " in repository " + owner + "/" + repository
                );
            }
        }

        String slug = generateUniqueSlug(request.name());

        Qube qube = qubeMapper.toEntity(
                request,
                repo,
                defaultBranch.name(),
                resolvedTargetBranch,
                slug
        );

        Qube savedQube = qubeRepository.save(qube);
        createOwnerMembership(savedQube, currentUser);
        initializeMetrics(savedQube);

        log.info("Repository imported successfully: id={}, slug={}, repo={}/{}",
                savedQube.getId(), slug, owner, repository);

        return qubeMapper.toImportResponse(savedQube, QubeRoles.OWNER, owner + "/" + repository);
    }

    @Override
    @Transactional(readOnly = true)
    public QubeDTO getQube(UUID qubeId) {
        log.debug("Fetching qube: id={}", qubeId);

        Qube qube = getActiveQubeEntity(qubeId);

        User currentUser = getCurrentUser();

        QubeMember member = qubeMemberRepository
                .findByQubeIdAndUserIdAndActiveTrue(qubeId, currentUser.getId())
                .orElseThrow(() ->
                        new AccessDeniedException("You are not an active member of this Qube")
                );

        qubeAuthorizationService.requirePermission(member, QubeAuthorities.VIEW_QUBE);

        return qubeMapper.toDTO(qube, member.getRole());
    }

    @Override
    @Transactional(readOnly = true)
    public QubeDTO getQubeBySlug(String slug) {
        log.debug("Fetching qube by slug: {}", slug);

        Qube qube = qubeRepository.findBySlugAndIsDeletedFalse(slug)
                .orElseThrow(() ->
                        new QubeNotFoundException("Qube not found with slug: " + slug)
                );

        User currentUser = getCurrentUser();

        QubeMember member = qubeMemberRepository
                .findByQubeIdAndUserIdAndActiveTrue(qube.getId(), currentUser.getId())
                .orElseThrow(() ->
                        new AccessDeniedException("You are not an active member of this Qube")
                );

        qubeAuthorizationService.requirePermission(member, QubeAuthorities.VIEW_QUBE);

        return qubeMapper.toDTO(qube, member.getRole());
    }

    @Override
    @Transactional(readOnly = true)
    public List<QubeDTO> getAllQubes() {
        log.debug("Fetching all active qubes for current user");

        User currentUser = getCurrentUser();

        List<QubeMember> memberships = qubeMemberRepository
                .findAllByUserIdAndActiveTrue(currentUser.getId());

        return memberships.stream()
                .map(membership -> qubeMapper.toDTO(membership.getQube(), membership.getRole()))
                .toList();
    }

    @Override
    public QubeDTO updateQube(UUID qubeId, NewQubeDTO request) {
        log.info("Updating qube: id={}", qubeId);

        User currentUser = getCurrentUser();
        Qube qube = getActiveQubeEntity(qubeId);
        QubeMember member = getActiveMember(qubeId, currentUser.getId());

        qubeAuthorizationService.requirePermission(member, QubeAuthorities.UPDATE_QUBE);

        qubeMapper.updateEntity(qube, request);
        Qube savedQube = qubeRepository.save(qube);
        log.info("Qube updated successfully: id={}", qubeId);
        return qubeMapper.toDTO(savedQube, member.getRole());
    }

    @Override
    public void archiveQube(UUID qubeId) {
        log.info("Archiving qube: id={}", qubeId);

        User currentUser = getCurrentUser();
        Qube qube = getActiveQubeEntity(qubeId);
        QubeMember member = getActiveMember(qubeId, currentUser.getId());

        qubeAuthorizationService.requirePermission(member, QubeAuthorities.ARCHIVE_QUBE);

        qube.setArchived(true);
        qubeRepository.save(qube);

        log.info("Qube archived successfully: id={}", qubeId);
    }

    @Override
    public void deleteQube(UUID qubeId) {
        log.info("Deleting qube: id={}", qubeId);

        User currentUser = getCurrentUser();
        Qube qube = getActiveQubeEntity(qubeId);
        QubeMember member = getActiveMember(qubeId, currentUser.getId());

        qubeAuthorizationService.requirePermission(member, QubeAuthorities.DELETE_QUBE);

        qube.setIsDeleted(true);
        qube.setDeletedAt(Instant.now());
        qube.setDeletedBy(currentUser.getId());

        qubeRepository.save(qube);

        log.info("Qube soft-deleted successfully: id={}", qubeId);
    }

    private Qube getActiveQubeEntity(UUID qubeId) {
        Objects.requireNonNull(qubeId, "Qube ID must not be null");

        return qubeRepository.findById(qubeId)
                .filter(qube -> !qube.getIsDeleted())
                .orElseThrow(() ->
                        new QubeNotFoundException("Qube not found or has been deleted: " + qubeId)
                );
    }

    private QubeMember getActiveMember(UUID qubeId, UUID userId) {
        return qubeMemberRepository
                .findByQubeIdAndUserIdAndActiveTrue(qubeId, userId)
                .orElseThrow(() ->
                        new AccessDeniedException("You are not an active member of this Qube")
                );
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder
                .getContext()
                .getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            throw new SecurityException("User is not authenticated");
        }

        String principal = authentication.getName();

        return userRepository.findByUsername(principal)
                .orElseThrow(() ->
                        new QubeNotFoundException("Authenticated user not found: " + principal)
                );
    }

    private void createOwnerMembership(Qube qube, User owner) {
        QubeMember ownerMembership = QubeMember.builder()
                .qube(qube)
                .user(owner)
                .role(QubeRoles.OWNER)
                .invitationAccepted(true)
                .active(true)
                .joinedAt(Instant.now())
                .build();

        qubeMemberRepository.save(ownerMembership);
    }

    private void initializeMetrics(Qube qube) {
        QubeMetrics metrics = QubeMetrics.builder()
                .qube(qube)
                .build();

        qubeMetricsRepository.save(metrics);
    }

    private void validateNoDuplicateGithubRepo(Long githubRepositoryId) {
        Objects.requireNonNull(githubRepositoryId, "GitHub repository ID must not be null");

        if (qubeRepository.existsByGithubRepositoryIdAndIsDeletedFalse(githubRepositoryId)) {
            throw new QubeAlreadyLinkedException(
                    "This GitHub repository is already connected to an active Qube"
            );
        }
    }

    private String generateUniqueSlug(String name) {
        Objects.requireNonNull(name, "Qube name must not be null");

        String baseSlug = name
                .toLowerCase()
                .trim()
                .replaceAll("[^a-z0-9]+", "-")
                .replaceAll("^-|-$", "");

        if (baseSlug.isEmpty()) {
            baseSlug = "qube";
        }

        if (!qubeRepository.existsBySlugAndIsDeletedFalse(baseSlug)) {
            return baseSlug;
        }

        String slug = baseSlug;
        int counter = 1;

        while (counter < QubeConstants.MAX_SLUG_GENERATION_ATTEMPTS) {
            slug = baseSlug + "-" + counter++;
            if (!qubeRepository.existsBySlugAndIsDeletedFalse(slug)) {
                return slug;
            }
        }

        throw new QubeSlugConflictException(
                "Unable to generate a unique slug for: " + name
                        + ". Please try a different name."
        );
    }

    private String resolveTargetBranch(String requestedBranch, String defaultBranch) {
        if (requestedBranch == null || requestedBranch.isBlank()) {
            return defaultBranch;
        }

        String trimmed = requestedBranch.trim();
        if (trimmed.isEmpty()) {
            return defaultBranch;
        }

        return trimmed;
    }

    private String[] parseRepositoryIdentifier(String identifier) {
        Objects.requireNonNull(identifier, "Repository identifier must not be null");

        String trimmed = identifier.trim();

        if (!trimmed.contains("/")) {
            throw new InvalidRepoIdentifierException(
                    "Repository identifier must contain exactly one '/' separator: " + identifier
            );
        }

        String[] parts = trimmed.split("/", 2);

        if (parts[0].isBlank() || parts[1].isBlank()) {
            throw new InvalidRepoIdentifierException(
                    "Repository identifier parts must not be blank: " + identifier
            );
        }

        if (parts[1].contains("/")) {
            throw new InvalidRepoIdentifierException(
                    "Repository identifier must contain exactly one '/' separator: " + identifier
            );
        }

        return parts;
    }

}
