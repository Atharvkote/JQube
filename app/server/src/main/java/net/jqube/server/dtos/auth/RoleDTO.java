package net.jqube.server.dtos.auth;

// Annotations
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class RoleDTO {
    @NotBlank(message = "Role name is required")
    private String name;
    private String description;
}
