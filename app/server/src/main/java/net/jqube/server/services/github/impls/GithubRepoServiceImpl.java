package net.jqube.server.services.github.impls;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.jqube.server.constants.GithubConstants;
import net.jqube.server.dtos.github.BranchResponseDTO;
import net.jqube.server.dtos.github.RepoResponseDTO;
import net.jqube.server.exceptions.auth.BranchNotFoundException;
import net.jqube.server.exceptions.auth.GithubAuthenticationException;
import net.jqube.server.exceptions.auth.InvalidRequestException;
import net.jqube.server.exceptions.auth.RepositoryNotFoundException;
import net.jqube.server.exceptions.shared.EncryptionException;
import net.jqube.server.exceptions.shared.UserNotFoundException;
import net.jqube.server.models.github.GithubAccount;
import net.jqube.server.models.auth.User;
import net.jqube.server.repositories.GitHubAccountRepository;
import net.jqube.server.repositories.UserRepository;
import net.jqube.server.responses.dataDTOs.GithubUserResponse;
import net.jqube.server.services.github.GithubRepoService;
import net.jqube.server.security.crypto.EncryptionService;
import org.springframework.cache.CacheManager;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import java.time.Instant;
import java.util.Arrays;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class GithubRepoServiceImpl implements GithubRepoService {

    private final RestClient restClient;

    private final UserRepository userRepository;

    private final GitHubAccountRepository githubAccountRepository;

    private final EncryptionService encryptionService;

    private final CacheManager cacheManager;

    private String getAccessToken(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new UserNotFoundException("User not found."));

        GithubAccount githubAccount =
                githubAccountRepository
                        .findByUser(user)
                        .orElseThrow(() ->
                                new GithubAuthenticationException(
                                        "GitHub account not connected."
                                ));

        return encryptionService.decrypt(
                githubAccount.getEncryptedAccessToken()
        );
    }

    private RestClient.RequestHeadersSpec<?> githubGet(
            UUID userId,
            String uri,
            Object... uriVariables
    ) {

        return restClient
                .get()
                .uri(uri, uriVariables)
                .header(
                        GithubConstants.AUTHORIZATION,
                        GithubConstants.BEARER + getAccessToken(userId)
                )
                .accept(MediaType.parseMediaType(GithubConstants.ACCEPT));
    }

    private void validateRepoParams(String owner, String repository) {
        if (owner == null || owner.isBlank()) {
            throw new InvalidRequestException("Repository owner must not be blank.");
        }
        if (repository == null || repository.isBlank()) {
            throw new InvalidRequestException("Repository name must not be blank.");
        }
    }

    @Override
    public List<RepoResponseDTO> getAllRepos(UUID userId) {
        Objects.requireNonNull(userId, "User ID must not be null.");

        RepoResponseDTO[] repositories;
        try {
            repositories = githubGet(
                    userId,
                    GithubConstants.USER_REPOS_ENDPOINT
            )
                    .retrieve()
                    .body(RepoResponseDTO[].class);
        } catch (HttpClientErrorException.NotFound ex) {
            log.warn("GitHub repos not found for user {}", userId);
            return List.of();
        } catch (RestClientException ex) {
            log.error("Failed to fetch repos for user {}", userId, ex);
            throw new GithubAuthenticationException(
                    "Failed to fetch repositories: " + ex.getMessage()
            );
        }

        if (repositories == null) {
            return List.of();
        }

        return Arrays.asList(repositories);
    }

    @Override
    public RepoResponseDTO getRepo(
            UUID userId,
            String owner,
            String repository
    ) {
        Objects.requireNonNull(userId, "User ID must not be null.");
        validateRepoParams(owner, repository);

        try {
            RepoResponseDTO repo = githubGet(
                    userId,
                    GithubConstants.REPOSITORIES_ENDPOINT
                            + "/{owner}/{repository}",
                    owner,
                    repository
            )
                    .retrieve()
                    .body(RepoResponseDTO.class);

            if (repo == null) {
                throw new RepositoryNotFoundException(
                        "Repository not found: " + owner + "/" + repository
                );
            }

            return repo;
        } catch (HttpClientErrorException.NotFound ex) {
            throw new RepositoryNotFoundException(
                    "Repository not found: " + owner + "/" + repository
            );
        } catch (RestClientException ex) {
            log.error("Failed to fetch repo {}/{} for user {}", owner, repository, userId, ex);
            throw new GithubAuthenticationException(
                    "Failed to fetch repository: " + ex.getMessage()
            );
        }
    }

    @Override
    public List<BranchResponseDTO> getRepoBranches(
            UUID userId,
            String owner,
            String repository
    ) {
        Objects.requireNonNull(userId, "User ID must not be null.");
        validateRepoParams(owner, repository);

        BranchResponseDTO[] branches;
        try {
            branches = githubGet(
                    userId,
                    GithubConstants.REPOSITORIES_ENDPOINT
                            + "/{owner}/{repository}/branches",
                    owner,
                    repository
            )
                    .retrieve()
                    .body(BranchResponseDTO[].class);
        } catch (HttpClientErrorException.NotFound ex) {
            throw new RepositoryNotFoundException(
                    "Repository not found: " + owner + "/" + repository
            );
        } catch (RestClientException ex) {
            log.error("Failed to fetch branches for {}/{} user {}", owner, repository, userId, ex);
            throw new GithubAuthenticationException(
                    "Failed to fetch branches: " + ex.getMessage()
            );
        }

        if (branches == null) {
            return List.of();
        }

        return Arrays.asList(branches);
    }

    @Override
    public BranchResponseDTO getDefaultBranch(
            UUID userId,
            String owner,
            String repository
    ) {
        Objects.requireNonNull(userId, "User ID must not be null.");
        validateRepoParams(owner, repository);

        RepoResponseDTO repo = getRepo(userId, owner, repository);

        if (repo == null || repo.defaultBranch() == null || repo.defaultBranch().isBlank()) {
            throw new RepositoryNotFoundException(
                    "Default branch not configured for repository: " + owner + "/" + repository
            );
        }

        return getRepoBranches(userId, owner, repository)
                .stream()
                .filter(branch ->
                        repo.defaultBranch().equals(branch.name())
                )
                .findFirst()
                .orElseThrow(() ->
                        new BranchNotFoundException(
                                "Default branch not found: " + repo.defaultBranch()
                                        + " in repository " + owner + "/" + repository
                        )
                );
    }

    @Override
    public boolean repositoryExists(
            UUID userId,
            String owner,
            String repository
    ) {
        Objects.requireNonNull(userId, "User ID must not be null.");
        validateRepoParams(owner, repository);

        try {
            getRepo(userId, owner, repository);
            return true;
        } catch (RepositoryNotFoundException ex) {
            return false;
        } catch (InvalidRequestException | GithubAuthenticationException ex) {
            throw ex;
        } catch (Exception ex) {
            log.error("Unexpected error checking repository existence for {}/{}", owner, repository, ex);
            throw new GithubAuthenticationException(
                    "Failed to verify repository existence: " + ex.getMessage()
            );
        }
    }

    @Override
    public boolean hasRepoAccess(
            UUID userId,
            String owner,
            String repository
    ) {
        Objects.requireNonNull(userId, "User ID must not be null.");
        validateRepoParams(owner, repository);

        try {
            RepoResponseDTO repo = getRepo(
                    userId,
                    owner,
                    repository
            );

            if (repo.permissions() == null) {
                return false;
            }

            return Boolean.TRUE.equals(repo.permissions().pull());

        } catch (RepositoryNotFoundException ex) {
            return false;
        } catch (InvalidRequestException | GithubAuthenticationException ex) {
            throw ex;
        } catch (Exception ex) {
            log.error("Unexpected error checking repo access for {}/{}", owner, repository, ex);
            throw new GithubAuthenticationException(
                    "Failed to verify repository access: " + ex.getMessage()
            );
        }
    }

    @Override
    public void synchronizeRepo(
            UUID userId,
            String owner,
            String repository
    ) {
        Objects.requireNonNull(userId, "User ID must not be null.");
        validateRepoParams(owner, repository);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found."));

        GithubAccount githubAccount = githubAccountRepository
                .findByUser(user)
                .orElseThrow(() -> new GithubAuthenticationException(
                        "GitHub account not connected."
                ));

        try {
            RepoResponseDTO repo = getRepo(userId, owner, repository);

            if (repo == null) {
                throw new RepositoryNotFoundException(
                        "Repository not found: " + owner + "/" + repository
                );
            }

            GithubUserResponse githubUser;
            try {
                githubUser = restClient.get()
                        .uri(GithubConstants.USER_ENDPOINT)
                        .header(GithubConstants.AUTHORIZATION, GithubConstants.BEARER + getAccessToken(userId))
                        .accept(MediaType.parseMediaType(GithubConstants.ACCEPT))
                        .retrieve()
                        .body(GithubUserResponse.class);
            } catch (RestClientException ex) {
                log.error("Failed to fetch GitHub profile during sync for user {}", userId, ex);
                throw new GithubAuthenticationException(
                        "Failed to sync GitHub account: " + ex.getMessage()
                );
            }

            if (githubUser != null) {
                githubAccount.setUsername(githubUser.getLogin());
                githubAccount.setName(githubUser.getName());
                githubAccount.setEmail(githubUser.getEmail());
                githubAccount.setAvatarUrl(githubUser.getAvatarUrl());
                githubAccount.setProfileUrl(githubUser.getProfileUrl());
                githubAccount.setBio(githubUser.getBio());
                githubAccount.setCompany(githubUser.getCompany());
                githubAccount.setBlog(githubUser.getBlog());
                githubAccount.setLocation(githubUser.getLocation());
                githubAccount.setPublicRepos(githubUser.getPublicRepos());
                githubAccount.setFollowers(githubUser.getFollowers());
                githubAccount.setFollowing(githubUser.getFollowing());
            }

            githubAccount.setLastSyncedAt(Instant.now());
            githubAccountRepository.save(githubAccount);

            log.info("Synchronized GitHub account for user {} with repo {}/{}",
                    userId, owner, repository);

        } catch (RepositoryNotFoundException | BranchNotFoundException | InvalidRequestException |
                 GithubAuthenticationException ex) {
            throw ex;
        } catch (EncryptionException ex) {
            log.error("Encryption error during GitHub sync for user {}", userId, ex);
            throw new GithubAuthenticationException(
                    "Failed to decrypt access token during sync."
            );
        } catch (Exception ex) {
            log.error("Unexpected error during GitHub sync for user {}", userId, ex);
            throw new GithubAuthenticationException(
                    "Failed to sync GitHub account: " + ex.getMessage()
            );
        }
    }
}
