package net.jqube.server.responses.dataDTOs;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class LoginResponse {
    private String username;
    private String email;
    private String token;
    private Long expiresIn;
}
