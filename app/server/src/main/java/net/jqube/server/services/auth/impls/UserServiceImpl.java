package net.jqube.server.services.auth.impls;

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
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.security.core.context.SecurityContextHolder;

// Annotation
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

// Utils
import java.util.List;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {
    private final UserRepository userRepository;
    private final UserMapper userMapper;

    @Cacheable(
            value = "user-profiles",
            key = "T(org.springframework.security.core.context.SecurityContextHolder).getContext().getAuthentication().getName()"
    )
    public UserProfileDTO getCurrentUserProfile() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsernameWithRoles(username)
                .orElseThrow(() -> new UserNotFoundException("User not found"));
        return userMapper.toProfileDTO(user);
    }

    @Cacheable(value = "users", key = "'all'")
    public List<User> fetchAll() {
        return (List<User>) userRepository.findAll();
    }
}
