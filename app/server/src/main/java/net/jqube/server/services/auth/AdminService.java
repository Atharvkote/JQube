package net.jqube.server.services.auth;

// DTOs

import net.jqube.server.dtos.requests.AssignRoleRequestDTO;
import net.jqube.server.dtos.auth.RoleDTO;
import net.jqube.server.dtos.auth.UserResponseDTO;

// Models
import net.jqube.server.models.auth.Role;

// Caching
import org.springframework.cache.annotation.Caching;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.CacheEvict;

import java.util.List;
import java.util.UUID; // Import UUID

public interface AdminService {

    @Cacheable(value = "admin-users", key = "'all'")
    List<UserResponseDTO> getAllUsers();

    @Cacheable(value = "admin-user", key = "#id")
    UserResponseDTO getUserById(UUID id); // Changed type to UUID

    @Caching(evict = {
            @CacheEvict(value = "admin-user", key = "#id"),
            @CacheEvict(value = "admin-users", key = "'all'")
    })
    void deleteUser(UUID id); // Changed type to UUID

    @Caching(evict = {
            @CacheEvict(value = "admin-user", key = "#userId"),
            @CacheEvict(value = "admin-users", key = "'all'")
    })
    UserResponseDTO assignRoles(UUID userId, AssignRoleRequestDTO assignRoleRequestDTO); // Changed type to UUID

    @CacheEvict(value = "admin-roles", key = "'all'")
    Role createRole(RoleDTO roleDTO);

    @Cacheable(value = "admin-roles", key = "'all'")
    List<Role> getAllRoles();
}
