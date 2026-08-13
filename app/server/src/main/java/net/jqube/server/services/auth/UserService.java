package net.jqube.server.services.auth;

// DTOs
import net.jqube.server.dtos.auth.UserProfileDTO;

// Models
import net.jqube.server.models.auth.User;

// Utils
import java.util.List;

public interface UserService {

    List<User> fetchAll();

    UserProfileDTO getCurrentUserProfile();
}