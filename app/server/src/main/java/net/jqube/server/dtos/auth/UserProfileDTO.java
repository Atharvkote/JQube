package net.jqube.server.dtos.auth;

// Annotations
import lombok.Data;

// Utils
import java.util.Set;

@Data
public class UserProfileDTO {
    private Long id;
    private String username;
    private String email;
    private Set<String> roles;
}
