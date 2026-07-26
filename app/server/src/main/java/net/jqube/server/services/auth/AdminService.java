package net.jqube.server.services.auth;

// DTOs
import net.jqube.server.dtos.requests.AssignRoleRequestDTO;
import net.jqube.server.dtos.auth.RoleDTO;
import net.jqube.server.dtos.auth.UserResponseDTO;

// Models
import net.jqube.server.models.Role;

import java.util.List;

public interface AdminService {

    List<UserResponseDTO> getAllUsers();

    UserResponseDTO getUserById(Long id);

    void deleteUser(Long id);

    UserResponseDTO assignRoles(Long userId, AssignRoleRequestDTO assignRoleRequestDTO);

    Role createRole(RoleDTO roleDTO);

    List<Role> getAllRoles();
}