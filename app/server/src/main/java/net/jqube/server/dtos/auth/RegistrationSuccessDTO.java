package net.jqube.server.dtos.auth;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class RegistrationSuccessDTO {
    private String email;
    private String username;
}