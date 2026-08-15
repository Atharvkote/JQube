package net.jqube.server.controllers;

// DTOs

import net.jqube.server.dtos.auth.LoginDTO;
import net.jqube.server.dtos.auth.RegisterDTO;
import net.jqube.server.dtos.auth.VerifyUserDTO;
import net.jqube.server.dtos.auth.RegistrationSuccessDTO;
import net.jqube.server.dtos.auth.ResendCodeDTO;

// Models
import net.jqube.server.models.auth.User;

// Response Models
import net.jqube.server.responses.ErrorResponse;
import net.jqube.server.responses.Response;
import net.jqube.server.responses.dataDTOs.LoginResponse;

// Services
import net.jqube.server.services.auth.AuthService;
import net.jqube.server.services.auth.JWTService;

// Deps
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import jakarta.validation.Valid;

// OpenAPI
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;

// Annotations
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;


@RestController
@RequestMapping("/api/v1/auth")
@Tag(name = "Auth", description = "Registration, email verification and login")
public class AuthAPIController {

    private final JWTService jwtService;
    private final AuthService authService;

    public AuthAPIController(JWTService jwtService, AuthService authService) {
        this.jwtService = jwtService;
        this.authService = authService;
    }

    @Operation(
            summary = "Register a new user",
            description = "Creates a new, disabled user account with the default ROLE_USER role, " +
                    "generates a 6-digit verification code (valid for 15 minutes) and emails it to the user. " +
                    "The account cannot log in until it is verified via /verify."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Registration accepted, verification email sent",
                    content = @Content(mediaType = MediaType.APPLICATION_JSON_VALUE,
                            schema = @Schema(implementation = RegistrationSuccessDTO.class))),
            @ApiResponse(responseCode = "400", description = "Validation failed (weak password, invalid email, etc.)",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "409", description = "An account with this email already exists",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    @PostMapping("/register")
    public ResponseEntity<Response<RegistrationSuccessDTO>> register(
            @Valid @RequestBody RegisterDTO registerDTO) {

        User user = authService.register(registerDTO);

        RegistrationSuccessDTO registrationSuccessDTO = RegistrationSuccessDTO.builder()
                .email(user.getEmail())
                .username(user.getUsername())
                .build();

        Response<RegistrationSuccessDTO> response = Response.<RegistrationSuccessDTO>builder()
                .success(true)
                .status(HttpStatus.OK.value())
                .message("User registered successfully! Please verify your email (" +
                        user.getEmail() +
                        ") to activate your account.")
                .data(registrationSuccessDTO)
                .build();

        return ResponseEntity.ok(response);
    }

    @Operation(
            summary = "Log in with email and password",
            description = "Authenticates the user against the stored (bcrypt-hashed) password and, " +
                    "on success, issues a signed JWT to be sent as 'Authorization: Bearer <token>' " +
                    "on subsequent requests."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Login successful, JWT issued",
                    content = @Content(schema = @Schema(implementation = LoginResponse.class))),
            @ApiResponse(responseCode = "401", description = "Invalid credentials",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "403", description = "Account exists but has not been verified yet",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "404", description = "No account found for this email",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    @PostMapping("/login")
    public ResponseEntity<Response<LoginResponse>> login(
            @Valid @RequestBody LoginDTO loginDTO) {

        User authenticatedUser = authService.login(loginDTO);
        String token = jwtService.generateToken(authenticatedUser);

        long expiresIn =
                (jwtService.extractExpiration(token).getTime() - System.currentTimeMillis()) / 1000;

        return ResponseEntity.ok(
                Response.<LoginResponse>builder()
                        .success(true)
                        .status(HttpStatus.OK.value())
                        .message("User logged in successfully!")
                        .data(
                                LoginResponse.builder()
                                        .username(authenticatedUser.getUsername())
                                        .email(authenticatedUser.getEmail())
                                        .token(token)
                                        .expiresIn(expiresIn)
                                        .build())
                        .build());
    }

    @Operation(
            summary = "Verify a registered email address",
            description = "Activates the account (enabled = true) if the supplied 6-digit code matches " +
                    "the one on file and has not expired (15 minute TTL)."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Account verified successfully"),
            @ApiResponse(responseCode = "400", description = "Verification code is incorrect",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "401", description = "Verification code has expired",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "404", description = "No account found for this email",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    @PostMapping("/verify")
    public ResponseEntity<Response<Void>> verifyUser(@Valid @RequestBody VerifyUserDTO verifyUserDTO) {
        authService.verifyUser(verifyUserDTO);
        return ResponseEntity.ok(
                Response
                        .<Void>builder()
                        .success(true).message("User verified successfully!")
                        .status(HttpStatus.OK.value())
                        .build()
        );
    }

    @Operation(
            summary = "Resend the email verification code",
            description = "Generates a fresh 6-digit code with a new 15 minute expiry and re-sends the " +
                    "verification email. Fails if the account is already verified."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Verification code resent"),
            @ApiResponse(responseCode = "400", description = "User is already verified",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "404", description = "No account found for this email",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    @PostMapping("/resend-code")
    public ResponseEntity<Response<Void>> resendCode(@Valid @RequestBody ResendCodeDTO resendCodeDTO) {
        authService.resendVerificationCode(resendCodeDTO.getEmail());
        return ResponseEntity.ok(
                Response
                        .<Void>builder()
                        .success(true)
                        .status(HttpStatus.OK.value())
                        .message("Verification code resent successfully!")
                        .build()
        );
    }
}