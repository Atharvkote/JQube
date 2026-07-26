package net.jqube.server.services.impls.auth;

// DTOs
import net.jqube.server.dtos.requests.AssignRoleRequestDTO;
import net.jqube.server.dtos.auth.RoleDTO;
import net.jqube.server.dtos.auth.UserResponseDTO;
import net.jqube.server.enums.RoleName;

// Models
import net.jqube.server.exceptions.DuplicateRoleException;
import net.jqube.server.exceptions.InvalidRoleAssignmentException;
import net.jqube.server.exceptions.RoleNotFoundException;
import net.jqube.server.exceptions.UserNotFoundException;

// Models
import net.jqube.server.models.Role;
import net.jqube.server.models.User;

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

    public UserResponseDTO getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException("Admin6 not found"));
        return convertToUserResponseDTO(user);
    }

    @Transactional
    public void deleteUser(Long id) {
        if (!userRepository.existsById(id)) {
            throw new UserNotFoundException("User not found");
        }
        userRepository.deleteById(id);
    }

    @Transactional
    public UserResponseDTO assignRoles(Long userId, AssignRoleRequestDTO assignRoleRequestDTO) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        Set<Role> roles = assignRoleRequestDTO.getRoles().stream()
                .map(roleName -> {
                    try {
                        return roleRepository.findByName(RoleName.valueOf(roleName))
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
            RoleName roleName = RoleName.valueOf(roleDTO.getName());
            if (roleRepository.existsByName(roleName)) {
                throw new DuplicateRoleException("Role " + roleDTO.getName() + " already exists");
            }
            Role role = new Role(roleName, roleDTO.getDescription());
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
