package net.jqube.server.dtos.auth;

// Annotations

import lombok.Data;

// Utils
import java.util.Set;
import java.util.UUID; // Import UUID

@Data
public class UserProfileDTO {
    private UUID id; // Changed from Long to UUID
    private String username;
    private String email;
    private Set<String> roles;
}