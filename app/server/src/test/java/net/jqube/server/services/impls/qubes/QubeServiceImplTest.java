package net.jqube.server.services.impls.qubes;

import net.jqube.server.dtos.github.BranchCommitDTO;
import net.jqube.server.dtos.github.BranchResponseDTO;
import net.jqube.server.dtos.github.RepoOwnerDTO;
import net.jqube.server.dtos.github.RepoPermissionsDTO;
import net.jqube.server.dtos.github.RepoResponseDTO;
import net.jqube.server.dtos.qube.ImportRepoRequestDTO;
import net.jqube.server.dtos.qube.ImportRepoResponseDTO;
import net.jqube.server.enums.QubeRoles;
import net.jqube.server.exceptions.qube.InvalidRepoIdentifierException;
import net.jqube.server.exceptions.qube.QubeNotFoundException;
import net.jqube.server.exceptions.qube.AccessDeniedException;
import net.jqube.server.models.auth.User;
import net.jqube.server.models.qube.Qube;
import net.jqube.server.models.qube.QubeMember;
import net.jqube.server.models.qube.QubeMetrics;
import net.jqube.server.repositories.QubeMemberRepository;
import net.jqube.server.repositories.QubeMetricsRepository;
import net.jqube.server.repositories.QubeRepository;
import net.jqube.server.repositories.UserRepository;
import net.jqube.server.services.github.GithubRepoService;
import net.jqube.server.mappers.QubeMapper;
import net.jqube.server.security.qube.QubeAuthorizationService;
import net.jqube.server.services.qubes.impls.QubeServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.api.AfterEach;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("QubeServiceImpl Unit Tests")
class QubeServiceImplTest {

    @Mock
    private QubeRepository qubeRepository;

    @Mock
    private QubeMemberRepository qubeMemberRepository;

    @Mock
    private QubeMetricsRepository qubeMetricsRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private GithubRepoService githubRepoService;

    @Mock
    private QubeMapper qubeMapper;

    @Mock
    private QubeAuthorizationService qubeAuthorizationService;

    @Mock
    private SecurityContext securityContext;

    @Mock
    private Authentication authentication;

    @InjectMocks
    private QubeServiceImpl qubeService;

    @BeforeEach
    void setUp() {
        org.springframework.security.core.context.SecurityContextHolder.setContext(securityContext);
    }

    @AfterEach
    void tearDown() {
        org.springframework.security.core.context.SecurityContextHolder.clearContext();
    }

    private User createTestUser() {
        User user = new User();
        user.setId(UUID.randomUUID());
        user.setUsername("testuser");
        user.setEmail("test@example.com");
        return user;
    }

    private Qube createTestQube(UUID id, String slug) {
        Qube qube = Qube.builder()
                .id(id)
                .name("Test Qube")
                .slug(slug)
                .githubRepositoryId(12345L)
                .repositoryOwner("owner")
                .repositoryName("repo")
                .repositoryFullName("owner/repo")
                .defaultBranch("main")
                .targetBranch("main")
                .cloneUrl("https://github.com/owner/repo.git")
                .htmlUrl("https://github.com/owner/repo")
                .privateRepository(false)
                .webhookEnabled(true)
                .autoScanEnabled(false)
                .aiRemediationEnabled(false)
                .archived(false)
                .build();
        return qube;
    }

    @Test
    @DisplayName("importRepoFromGithub - should parse valid owner/repo identifier")
    void importRepoFromGithub_validIdentifier_success() {
        User currentUser = createTestUser();
        ImportRepoRequestDTO request = new ImportRepoRequestDTO(
                "octocat/Hello-World",
                "My Security Qube",
                "develop",
                true,
                true,
                false
        );

        RepoResponseDTO repo = RepoResponseDTO.builder()
                .id(100L)
                .nodeId("node100")
                .name("Hello-World")
                .fullName("octocat/Hello-World")
                .owner(new RepoOwnerDTO(1L, "octocat", "https://github.com/images/error/octocat_happy.gif", "https://github.com/octocat", "User"))
                .description("My first repo")
                .defaultBranch("main")
                .cloneUrl("https://github.com/octocat/Hello-World.git")
                .htmlUrl("https://github.com/octocat/Hello-World")
                .privateRepository(false)
                .permissions(new RepoPermissionsDTO(false, false, true, false, true))
                .build();

        BranchResponseDTO mainBranch = new BranchResponseDTO("main", new BranchCommitDTO("abc123", "https://api.github.com/repos/octocat/Hello-World/git/commits/abc123"), false);

        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.isAuthenticated()).thenReturn(true);
        when(authentication.getName()).thenReturn("testuser");
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(currentUser));

        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.isAuthenticated()).thenReturn(true);
        when(authentication.getName()).thenReturn("testuser");
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(currentUser));

        when(qubeRepository.existsByGithubRepositoryIdAndIsDeletedFalse(100L)).thenReturn(false);
        when(githubRepoService.getRepo(currentUser.getId(), "octocat", "Hello-World")).thenReturn(repo);
        when(githubRepoService.getDefaultBranch(currentUser.getId(), "octocat", "Hello-World")).thenReturn(mainBranch);
        when(githubRepoService.getRepoBranches(currentUser.getId(), "octocat", "Hello-World"))
                .thenReturn(List.of(
                        new BranchResponseDTO("main", new BranchCommitDTO("abc123", "https://api.github.com/repos/octocat/Hello-World/git/commits/abc123"), false),
                        new BranchResponseDTO("develop", new BranchCommitDTO("def456", "https://api.github.com/repos/octocat/Hello-World/git/commits/def456"), false)
                ));
        when(qubeRepository.existsBySlugAndIsDeletedFalse("my-security-qube")).thenReturn(false);
        when(qubeRepository.save(any(Qube.class))).thenAnswer(invocation -> {
            Qube q = invocation.getArgument(0);
            q.setId(UUID.randomUUID());
            return q;
        });
        when(qubeMemberRepository.save(any(QubeMember.class))).thenAnswer(i -> i.getArgument(0));
        when(qubeMetricsRepository.save(any(QubeMetrics.class))).thenAnswer(i -> i.getArgument(0));

        Qube mappedQube = Qube.builder()
                .id(UUID.randomUUID())
                .name("My Security Qube")
                .slug("my-security-qube")
                .githubRepositoryId(100L)
                .repositoryOwner("octocat")
                .repositoryName("Hello-World")
                .repositoryFullName("octocat/Hello-World")
                .defaultBranch("main")
                .targetBranch("develop")
                .cloneUrl("https://github.com/octocat/Hello-World.git")
                .htmlUrl("https://github.com/octocat/Hello-World")
                .privateRepository(false)
                .webhookEnabled(true)
                .autoScanEnabled(true)
                .aiRemediationEnabled(false)
                .archived(false)
                .build();
        when(qubeMapper.toEntity(any(ImportRepoRequestDTO.class), any(RepoResponseDTO.class), anyString(), anyString(), anyString()))
                .thenReturn(mappedQube);

        ImportRepoResponseDTO expectedResponse = ImportRepoResponseDTO.builder()
                .id(mappedQube.getId())
                .name("My Security Qube")
                .slug("my-security-qube")
                .githubRepositoryId(100L)
                .repositoryOwner("octocat")
                .repositoryName("Hello-World")
                .repositoryFullName("octocat/Hello-World")
                .defaultBranch("main")
                .targetBranch("develop")
                .cloneUrl("https://github.com/octocat/Hello-World.git")
                .htmlUrl("https://github.com/octocat/Hello-World")
                .privateRepository(false)
                .webhookEnabled(true)
                .autoScanEnabled(true)
                .aiRemediationEnabled(false)
                .archived(false)
                .currentUserRole(QubeRoles.OWNER)
                .importedFrom("octocat/Hello-World")
                .build();
        when(qubeMapper.toImportResponse(mappedQube, QubeRoles.OWNER, "octocat/Hello-World")).thenReturn(expectedResponse);

        ImportRepoResponseDTO result = qubeService.importRepoFromGithubAndCreateQube(request);

        assertThat(result).isNotNull();
        assertThat(result.name()).isEqualTo("My Security Qube");
        assertThat(result.slug()).isEqualTo("my-security-qube");
        assertThat(result.targetBranch()).isEqualTo("develop");
        assertThat(result.importedFrom()).isEqualTo("octocat/Hello-World");
        assertThat(result.currentUserRole()).isEqualTo(QubeRoles.OWNER);
    }

    @Test
    @DisplayName("importRepoFromGithub - should throw InvalidRepoIdentifierException for malformed identifier")
    void importRepoFromGithub_invalidIdentifier_throwsException() {
        User currentUser = createTestUser();
        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.isAuthenticated()).thenReturn(true);
        when(authentication.getName()).thenReturn("testuser");
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(currentUser));

        assertThrows(InvalidRepoIdentifierException.class,
                () -> qubeService.importRepoFromGithubAndCreateQube(new ImportRepoRequestDTO("invalid", null, null, null, null, null)));

        assertThrows(InvalidRepoIdentifierException.class,
                () -> qubeService.importRepoFromGithubAndCreateQube(new ImportRepoRequestDTO("owner/", null, null, null, null, null)));

        assertThrows(InvalidRepoIdentifierException.class,
                () -> qubeService.importRepoFromGithubAndCreateQube(new ImportRepoRequestDTO("/repo", null, null, null, null, null)));
    }

    @Test
    @DisplayName("getQube - should throw QubeNotFoundException when qube does not exist")
    void getQube_notFound_throwsException() {
        UUID qubeId = UUID.randomUUID();
        when(qubeRepository.findById(qubeId)).thenReturn(Optional.empty());

        assertThrows(QubeNotFoundException.class, () -> qubeService.getQube(qubeId));
    }

    @Test
    @DisplayName("getQube - should throw AccessDeniedException when user is not a member")
    void getQube_notMember_throwsException() {
        UUID qubeId = UUID.randomUUID();
        Qube qube = createTestQube(qubeId, "test-qube");
        User currentUser = createTestUser();

        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.isAuthenticated()).thenReturn(true);
        when(authentication.getName()).thenReturn("testuser");
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(currentUser));
        when(qubeRepository.findById(qubeId)).thenReturn(Optional.of(qube));
        when(qubeMemberRepository.findByQubeIdAndUserIdAndActiveTrue(qubeId, currentUser.getId()))
                .thenReturn(Optional.empty());

        assertThrows(AccessDeniedException.class, () -> qubeService.getQube(qubeId));
    }

    @Test
    @DisplayName("deleteQube - should soft-delete qube when user is owner")
    void deleteQube_success() {
        UUID qubeId = UUID.randomUUID();
        Qube qube = createTestQube(qubeId, "test-qube");
        User currentUser = createTestUser();

        QubeMember ownerMembership = QubeMember.builder()
                .qube(qube)
                .user(currentUser)
                .role(QubeRoles.OWNER)
                .active(true)
                .build();

        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.isAuthenticated()).thenReturn(true);
        when(authentication.getName()).thenReturn("testuser");
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(currentUser));
        when(qubeRepository.findById(qubeId)).thenReturn(Optional.of(qube));
        when(qubeMemberRepository.findByQubeIdAndUserIdAndActiveTrue(qubeId, currentUser.getId()))
                .thenReturn(Optional.of(ownerMembership));
        when(qubeRepository.save(any(Qube.class))).thenAnswer(i -> i.getArgument(0));

        assertDoesNotThrow(() -> qubeService.deleteQube(qubeId));

        assertThat(qube.getIsDeleted()).isTrue();
        assertThat(qube.getDeletedBy()).isEqualTo(currentUser.getId());
        assertThat(qube.getDeletedAt()).isNotNull();
    }
}
