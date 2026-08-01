package net.jqube.server.services.impls.auth;

// DTOs
import net.jqube.server.dtos.auth.UserProfileDTO;

// Exception
import net.jqube.server.exceptions.shared.UserNotFoundException;

// Models
import net.jqube.server.models.User;

// Repositories
import net.jqube.server.repositories.UserRepository;

// Services
import net.jqube.server.services.auth.UserService;

// Deps
import org.springframework.security.core.context.SecurityContextHolder;

// Annotation
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

// Utils
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {
    private final UserRepository userRepository;

    public List<User> fetchAll() {
        return (List<User>) userRepository.findAll();
    }

    public UserProfileDTO getCurrentUserProfile() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UserNotFoundException("User not found"));
        return convertToUserProfileDTO(user);
    }

    private UserProfileDTO convertToUserProfileDTO(User user) {
        UserProfileDTO userProfileDTO = new UserProfileDTO();
        userProfileDTO.setId(user.getId());
        userProfileDTO.setUsername(user.getUsername());
        userProfileDTO.setEmail(user.getEmail());
        userProfileDTO.setRoles(user.getRoles().stream()
                .map(role -> role.getName().name())
                .collect(Collectors.toSet()));
        return userProfileDTO;
    }
}
