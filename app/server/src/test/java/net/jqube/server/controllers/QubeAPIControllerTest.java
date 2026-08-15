package net.jqube.server.controllers;

import net.jqube.server.dtos.qube.ImportRepoRequestDTO;
import net.jqube.server.dtos.qube.ImportRepoResponseDTO;
import net.jqube.server.dtos.qube.NewQubeDTO;
import net.jqube.server.dtos.qube.QubeDTO;
import net.jqube.server.enums.QubeRoles;
import net.jqube.server.models.auth.User;
import net.jqube.server.services.github.GithubRepoService;
import net.jqube.server.services.qubes.QubeService;

import com.fasterxml.jackson.databind.ObjectMapper;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(SpringExtension.class)
@DisplayName("QubeAPIController Unit Tests")
class QubeAPIControllerTest {

    @Mock
    private QubeService qubeService;

    @Mock
    private GithubRepoService githubRepoService;

    @InjectMocks
    private QubeAPIController qubeApiController;

    private MockMvc mockMvc;

    private final ObjectMapper objectMapper = new ObjectMapper();

    private User createTestUser() {
        User user = new User();
        user.setId(UUID.randomUUID());
        user.setUsername("testuser");
        user.setEmail("test@example.com");
        user.setEnabled(true);
        user.setAccountLocked(false);
        user.setFailedLoginAttempts(0);
        return user;
    }

    private QubeDTO createQubeDTO() {
        return new QubeDTO(
                UUID.randomUUID(),
                "Test Qube",
                "test-qube",
                "Test description",
                12345L,
                "node123",
                "owner",
                "repo",
                "owner/repo",
                "main",
                "develop",
                "https://github.com/owner/repo.git",
                "https://github.com/owner/repo",
                false,
                "/workspaces/owner/repo",
                true,
                false,
                false,
                false,
                QubeRoles.OWNER
        );
    }

    @Test
    @DisplayName("GET /api/v1/qube - should return all qubes with 200")
    void getAllQubes_success() throws Exception {
        mockMvc = MockMvcBuilders.standaloneSetup(qubeApiController).build();

        QubeDTO qubeDTO = createQubeDTO();
        when(qubeService.getAllQubes()).thenReturn(List.of(qubeDTO));

        mockMvc.perform(get("/api/v1/qube")
                        .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.status").value(200))
                .andExpect(jsonPath("$.data[0].name").value("Test Qube"))
                .andExpect(jsonPath("$.message").value("Qubes fetched successfully!"));
    }

    @Test
    @DisplayName("GET /api/v1/qube/{id} - should return qube by ID with 200")
    void getQubeById_success() throws Exception {
        mockMvc = MockMvcBuilders.standaloneSetup(qubeApiController).build();

        UUID qubeId = UUID.randomUUID();
        QubeDTO qubeDTO = createQubeDTO();
        when(qubeService.getQube(qubeId)).thenReturn(qubeDTO);

        mockMvc.perform(get("/api/v1/qube/" + qubeId)
                        .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.name").value("Test Qube"))
                .andExpect(jsonPath("$.message").value("Qube fetched successfully!"));
    }

    @Test
    @DisplayName("GET /api/v1/qube/slug/{slug} - should return qube by slug with 200")
    void getQubeBySlug_success() throws Exception {
        mockMvc = MockMvcBuilders.standaloneSetup(qubeApiController).build();

        QubeDTO qubeDTO = createQubeDTO();
        when(qubeService.getQubeBySlug("test-qube")).thenReturn(qubeDTO);

        mockMvc.perform(get("/api/v1/qube/slug/test-qube")
                        .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.slug").value("test-qube"))
                .andExpect(jsonPath("$.message").value("Qube fetched successfully!"));
    }

    @Test
    @DisplayName("POST /api/v1/qube/import - should import repo as qube with 201")
    void importRepo_success() throws Exception {
        mockMvc = MockMvcBuilders.standaloneSetup(qubeApiController).build();

        ImportRepoResponseDTO response = ImportRepoResponseDTO.builder()
                .id(UUID.randomUUID())
                .name("My Security Project")
                .slug("my-security-project")
                .githubRepositoryId(100L)
                .repositoryOwner("octocat")
                .repositoryName("Hello-World")
                .repositoryFullName("octocat/Hello-World")
                .defaultBranch("main")
                .targetBranch("develop")
                .cloneUrl("https://github.com/octocat/Hello-World.git")
                .htmlUrl("https://github.com/octocat/Hello-World")
                .privateRepository(false)
                .workspacePath("/workspaces/octocat/hello-world")
                .webhookEnabled(true)
                .autoScanEnabled(true)
                .aiRemediationEnabled(false)
                .archived(false)
                .currentUserRole(QubeRoles.OWNER)
                .importedFrom("octocat/Hello-World")
                .build();

        when(qubeService.importRepoFromGithubAndCreateQube(any(ImportRepoRequestDTO.class))).thenReturn(response);

        ImportRepoRequestDTO request = new ImportRepoRequestDTO(
                "octocat/Hello-World",
                "My Security Project",
                "develop",
                "/workspaces/octocat/hello-world",
                true,
                true,
                false
        );

        mockMvc.perform(post("/api/v1/qube/import")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.status").value(201))
                .andExpect(jsonPath("$.message").value("Repository imported as Qube successfully!"))
                .andExpect(jsonPath("$.data.name").value("My Security Project"))
                .andExpect(jsonPath("$.data.imported_from").value("octocat/Hello-World"));
    }

    @Test
    @DisplayName("PUT /api/v1/qube/{id} - should update qube with 200")
    void updateQube_success() throws Exception {
        mockMvc = MockMvcBuilders.standaloneSetup(qubeApiController).build();

        UUID qubeId = UUID.randomUUID();
        QubeDTO qubeDTO = createQubeDTO();
        when(qubeService.updateQube(any(UUID.class), any(NewQubeDTO.class))).thenReturn(qubeDTO);

        NewQubeDTO request = new NewQubeDTO(
                "Updated Qube",
                "Updated description",
                "main",
                "develop",
                "/workspaces/owner/repo",
                true,
                true,
                false
        );

        mockMvc.perform(put("/api/v1/qube/" + qubeId)
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.status").value(200))
                .andExpect(jsonPath("$.message").value("Qube updated successfully!"));
    }

    @Test
    @DisplayName("DELETE /api/v1/qube/{id} - should delete qube with 200")
    void deleteQube_success() throws Exception {
        mockMvc = MockMvcBuilders.standaloneSetup(qubeApiController).build();

        UUID qubeId = UUID.randomUUID();

        mockMvc.perform(delete("/api/v1/qube/" + qubeId)
                        .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.status").value(200))
                .andExpect(jsonPath("$.message").value("Qube deleted successfully!"));
    }

    @Test
    @DisplayName("POST /api/v1/qube/{id}/archive - should archive qube with 200")
    void archiveQube_success() throws Exception {
        mockMvc = MockMvcBuilders.standaloneSetup(qubeApiController).build();

        UUID qubeId = UUID.randomUUID();

        mockMvc.perform(post("/api/v1/qube/" + qubeId + "/archive")
                        .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.status").value(200))
                .andExpect(jsonPath("$.message").value("Qube archived successfully!"));
    }
}
