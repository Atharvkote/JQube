package net.jqube.server.services.impls.auth;

// DTOs

import net.jqube.server.dtos.requests.AssignRoleRequestDTO;
import net.jqube.server.dtos.auth.RoleDTO;
import net.jqube.server.dtos.auth.UserResponseDTO;
import net.jqube.server.enums.SystemRoles;

// Models
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
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

// Utils
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminServiceImpl implements AdminService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;

    public List<UserResponseDTO> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::convertToUserResponseDTO)
                .collect(Collectors.toList());
    }

    public UserResponseDTO getUserById(UUID id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException("User not found"));
        return convertToUserResponseDTO(user);
    }

    @Transactional
    public void deleteUser(UUID id) {
        if (!userRepository.existsById(id)) {
            throw new UserNotFoundException("User not found");
        }
        userRepository.deleteById(id);
    }

    @Transactional
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
        return convertToUserResponseDTO(user);
    }

    @Transactional
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

    public List<Role> getAllRoles() {
        return roleRepository.findAll();
    }

    private UserResponseDTO convertToUserResponseDTO(User user) {
        UserResponseDTO userResponseDTO = new UserResponseDTO();
        userResponseDTO.setId(user.getId());
        userResponseDTO.setUsername(user.getUsername());
        userResponseDTO.setEmail(user.getEmail());
        userResponseDTO.setRoles(user.getRoles().stream()
                .map(role -> role.getName().name())
                .collect(Collectors.toSet()));
        return userResponseDTO;
    }
}