package net.jqube.server.services.auth;

import net.jqube.server.dtos.auth.LoginDTO;
import net.jqube.server.dtos.auth.RegisterDTO;
import net.jqube.server.dtos.auth.VerifyUserDTO;
import net.jqube.server.models.auth.User;

public interface AuthService {

    boolean emailExists(String email);

    User register(RegisterDTO registerDTO);

    User login(LoginDTO loginDTO);

    void verifyUser(VerifyUserDTO verifyUserDTO);

    void resendVerificationCode(String email);
}