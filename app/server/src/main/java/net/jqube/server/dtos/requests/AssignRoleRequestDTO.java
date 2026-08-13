package net.jqube.server.dtos.requests;

// Annotations

import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

// Utils
import java.util.Set;

@Data
public final class AssignRoleRequestDTO {
    @NotEmpty(message = "At least one role must be specified")
    private Set<String> roles;
}
