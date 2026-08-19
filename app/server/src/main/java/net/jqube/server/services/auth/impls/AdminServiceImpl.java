package net.jqube.server.services.auth.impls;

// DTOs

import lombok.extern.slf4j.Slf4j;
import net.jqube.server.dtos.requests.AssignRoleRequestDTO;
import net.jqube.server.dtos.auth.RoleDTO;
import net.jqube.server.dtos.auth.UserResponseDTO;
import net.jqube.server.enums.SystemRoles;

// Exceptions
import net.jqube.server.exceptions.auth.DuplicateRoleException;
import net.jqube.server.exceptions.auth.InvalidRoleAssignmentException;
import net.jqube.server.exceptions.auth.RoleNotFoundException;
import net.jqube.server.exceptions.shared.UserNotFoundException;

// Models
import net.jqube.server.models.auth.Role;
import net.jqube.server.models.auth.User;

// Repositories
import net.jqube.server.repositories.RoleRepository;
import net.jqube.server.repositories.UserRepository;

// Annotations
import lombok.RequiredArgsConstructor;
import net.jqube.server.services.auth.AdminService;
import net.jqube.server.mappers.UserMapper;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.cache.CacheManager;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

// Utils
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdminServiceImpl implements AdminService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final UserMapper userMapper;
    private final CacheManager cacheManager;

    @Override
    @Cacheable(value = "admin-users", key = "'all'")
    public List<UserResponseDTO> getAllUsers() {
        return userRepository.findAll().stream()
                .map(userMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Cacheable(value = "admin-user", key = "#id")
    public UserResponseDTO getUserById(UUID id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException("User not found"));
        return userMapper.toResponseDTO(user);
    }

    @Override
    @Transactional
    @Caching(evict = {
            @CacheEvict(value = "admin-user", key = "#id"),
            @CacheEvict(value = "admin-users", key = "'all'")
    })
    public void deleteUser(UUID id) {
        if (!userRepository.existsById(id)) {
            throw new UserNotFoundException("User not found");
        }
        userRepository.deleteById(id);
        evictUserProfileCache(id);
    }

    @Override
    @Transactional
    @Caching(evict = {
            @CacheEvict(value = "admin-user", key = "#userId"),
            @CacheEvict(value = "admin-users", key = "'all'")
    })
    public UserResponseDTO assignRoles(UUID userId, AssignRoleRequestDTO assignRoleRequestDTO) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        Set<Role> roles = assignRoleRequestDTO.getRoles().stream()
                .map(roleName -> {
                    try {
                        return roleRepository.findByName(SystemRoles.valueOf(roleName))
                                .orElseThrow(() -> new RoleNotFoundException(roleName + " not found"));
                    } catch (IllegalArgumentException e) {
                        throw new InvalidRoleAssignmentException(roleName + " is not a valid role");
                    }
                })
                .collect(Collectors.toSet());

        user.setRoles(roles);
        userRepository.save(user);
        evictUserProfileCache(userId);
        return userMapper.toResponseDTO(user);
    }

    @Override
    @Transactional
    @CacheEvict(value = "admin-roles", key = "'all'")
    public Role createRole(RoleDTO roleDTO) {
        try {
            SystemRoles systemRoles = SystemRoles.valueOf(roleDTO.getName());
            if (roleRepository.existsByName(systemRoles)) {
                throw new DuplicateRoleException("Role " + roleDTO.getName() + " already exists");
            }
            Role role = Role.builder()
                    .name(systemRoles)
                    .description(roleDTO.getDescription())
                    .build();
            return roleRepository.save(role);
        } catch (IllegalArgumentException e) {
            throw new InvalidRoleAssignmentException(roleDTO.getName() + " is not a valid role name");
        }
    }

    @Override
    @Cacheable(value = "admin-roles", key = "'all'")
    public List<Role> getAllRoles() {
        return roleRepository.findAll();
    }

    private void evictUserProfileCache(UUID userId) {
        userRepository.findById(userId).ifPresent(user -> {
            cacheManager.getCache("user-profiles").evict(user.getUsername());
        });
    }
}
