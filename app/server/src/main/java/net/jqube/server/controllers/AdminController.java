package net.jqube.server.controllers;

// DTOS
import net.jqube.server.dtos.auth.RoleDTO;
import net.jqube.server.dtos.auth.UserResponseDTO;
import net.jqube.server.dtos.requests.AssignRoleRequestDTO;

// Models
import net.jqube.server.models.auth.Role;

// Response Models
import net.jqube.server.responses.ErrorResponse;
import net.jqube.server.responses.Response;

// Services
import net.jqube.server.services.auth.AdminService;

// OpenAPI
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;

// Deps
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

// Annotations
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;

// Utils
import java.util.List;
import java.util.UUID; // Import UUID


@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/admin")
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Admin", description = "User management and role-based access control (admin only)")
@SecurityRequirement(name = "bearerAuth")
public class AdminController {

    private final AdminService adminService;

    @Operation(summary = "List all users", description = "Returns every registered user with their assigned roles.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Users retrieved successfully",
                    content = @Content(array = @ArraySchema(schema = @Schema(implementation = UserResponseDTO.class)))),
            @ApiResponse(responseCode = "403", description = "Caller does not have the ADMIN role",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    @GetMapping("/users")
    public ResponseEntity<Response<List<UserResponseDTO>>> getAllUsers() {
        List<UserResponseDTO> users = adminService.getAllUsers();
        return ResponseEntity.ok(
                Response.<List<UserResponseDTO>>builder()
                        .success(true)
                        .status(HttpStatus.OK.value())
                        .data(users)
                        .message("Successfully retrieved all users")
                        .build()
        );
    }

    @Operation(summary = "Get a user by ID")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "User retrieved successfully",
                    content = @Content(schema = @Schema(implementation = UserResponseDTO.class))),
            @ApiResponse(responseCode = "404", description = "No user with this ID",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    @GetMapping("/users/{id}")
    public ResponseEntity<Response<UserResponseDTO>> getUserById(
            @Parameter(description = "User ID", example = "a1b2c3d4-e5f6-7890-1234-567890abcdef") // Updated example
            @PathVariable UUID id) { // Changed type to UUID
        UserResponseDTO user = adminService.getUserById(id);
        return ResponseEntity.ok(
                Response.<UserResponseDTO>builder()
                        .success(true)
                        .status(HttpStatus.OK.value())
                        .data(user)
                        .message("Successfully retrieved user")
                        .build()
        );
    }

    @Operation(summary = "Delete a user", description = "Permanently deletes a user account. This action cannot be undone.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "User deleted successfully"),
            @ApiResponse(responseCode = "404", description = "No user with this ID",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    @DeleteMapping("/users/{id}")
    public ResponseEntity<Response<Void>> deleteUser(
            @Parameter(description = "User ID", example = "a1b2c3d4-e5f6-7890-1234-567890abcdef") // Updated example
            @PathVariable UUID id) { // Changed type to UUID
        adminService.deleteUser(id);
        return ResponseEntity.ok(
                Response.<Void>builder()
                        .success(true)
                        .status(HttpStatus.OK.value())
                        .data(null)
                        .message("Successfully deleted user")
                        .build()
        );
    }

    @Operation(
            summary = "Replace a user's roles",
            description = "REPLACES (does not merge with) the user's existing role set with the roles supplied " +
                    "in the request body. Omitting an existing role - e.g. ROLE_USER - revokes it. " +
                    "Role names must match a value from SystemRoles (e.g. ROLE_ADMIN, ROLE_USER, ROLE_VIEWER)."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Roles assigned successfully",
                    content = @Content(schema = @Schema(implementation = UserResponseDTO.class))),
            @ApiResponse(responseCode = "400", description = "One or more role names are not valid",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "404", description = "User or role not found",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    @PutMapping("/users/{id}/roles")
    public ResponseEntity<Response<UserResponseDTO>> assignRoles(
            @Parameter(description = "User ID", example = "a1b2c3d4-e5f6-7890-1234-567890abcdef") // Updated example
            @PathVariable UUID id, // Changed type to UUID
            @Valid @RequestBody AssignRoleRequestDTO assignRoleRequestDTO) {
        UserResponseDTO user = adminService.assignRoles(id, assignRoleRequestDTO);
        return ResponseEntity.ok(
                Response.<UserResponseDTO>builder()
                        .success(true)
                        .status(HttpStatus.OK.value())
                        .data(user)
                        .message("Successfully assigned roles")
                        .build()
        );
    }

    @Operation(summary = "Create a new role", description = "Creates a new RBAC role. The role name must be unique.")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Role created successfully",
                    content = @Content(schema = @Schema(implementation = Role.class))),
            @ApiResponse(responseCode = "400", description = "Role name is not a valid SystemRoles value",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "409", description = "Role already exists",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    @PostMapping("/roles")
    public ResponseEntity<Response<Role>> createRole(@Valid @RequestBody RoleDTO roleDTO) {
        Role role = adminService.createRole(roleDTO);
        return new ResponseEntity<>(
                Response.<Role>builder()
                        .success(true)
                        .status(HttpStatus.CREATED.value())
                        .data(role)
                        .message("Successfully created role")
                        .build(),
                HttpStatus.CREATED
        );
    }

    @Operation(summary = "List all roles")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Roles retrieved successfully",
                    content = @Content(array = @ArraySchema(schema = @Schema(implementation = Role.class))))
    })
    @GetMapping("/roles")
    public ResponseEntity<Response<List<Role>>> getAllRoles() {
        List<Role> roles = adminService.getAllRoles();
        return ResponseEntity.ok(
                Response.<List<Role>>builder()
                        .success(true)
                        .status(HttpStatus.OK.value())
                        .data(roles)
                        .message("Successfully retrieved all roles")
                        .build()
        );
    }
}