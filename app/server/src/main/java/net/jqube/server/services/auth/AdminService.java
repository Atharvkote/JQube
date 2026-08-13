package net.jqube.server.services.auth;

// DTOs
import net.jqube.server.dtos.requests.AssignRoleRequestDTO;
import net.jqube.server.dtos.auth.RoleDTO;
import net.jqube.server.dtos.auth.UserResponseDTO;

// Models
import net.jqube.server.models.auth.Role;

import java.util.List;
import java.util.UUID; // Import UUID

public interface AdminService {

    List<UserResponseDTO> getAllUsers();

    UserResponseDTO getUserById(UUID id); // Changed type to UUID

    void deleteUser(UUID id); // Changed type to UUID

    UserResponseDTO assignRoles(UUID userId, AssignRoleRequestDTO assignRoleRequestDTO); // Changed type to UUID

    Role createRole(RoleDTO roleDTO);

    List<Role> getAllRoles();
}