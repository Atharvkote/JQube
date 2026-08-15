package net.jqube.server.services.impls.auth;

// DTOs

import net.jqube.server.dtos.auth.UserProfileDTO;

// Exception
import net.jqube.server.exceptions.shared.UserNotFoundException;

// Models
import net.jqube.server.models.auth.User;

// Repositories
import net.jqube.server.repositories.UserRepository;

import net.jqube.server.services.auth.UserService;
import net.jqube.server.mappers.UserMapper;

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
    private final UserMapper userMapper;

    public List<User> fetchAll() {
        return (List<User>) userRepository.findAll();
    }

    public UserProfileDTO getCurrentUserProfile() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsernameWithRoles(username)
                .orElseThrow(() -> new UserNotFoundException("User not found"));
        return userMapper.toProfileDTO(user);
    }
}
