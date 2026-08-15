package net.jqube.server.controllers;

// DTOs

import net.jqube.server.dtos.auth.UserProfileDTO;

// Response Model
import net.jqube.server.responses.ErrorResponse;
import net.jqube.server.responses.Response;

// Services
import net.jqube.server.services.auth.UserService;

// OpenAPI
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;

// Deps
import org.springframework.http.ResponseEntity;

// Annotation
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/user")
@RequiredArgsConstructor
@Tag(name = "User", description = "Operations on the currently authenticated user")
@SecurityRequirement(name = "bearerAuth")
public class UserAPIController {

    private final UserService userService;

    @Operation(
            summary = "Get the current user's profile",
            description = "Resolves the authenticated principal from the security context (populated by " +
                    "AuthenticationFilter from the request's JWT) and returns their profile, including roles."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Profile retrieved successfully",
                    content = @Content(schema = @Schema(implementation = UserProfileDTO.class))),
            @ApiResponse(responseCode = "401", description = "Missing, invalid or expired JWT",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "403", description = "Authenticated but lacking any recognised role",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    @GetMapping("/me")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER', 'VIEWER')")
    public ResponseEntity<Response<UserProfileDTO>> getCurrentUser() {
        UserProfileDTO userProfile = userService.getCurrentUserProfile();
        return ResponseEntity.ok(Response.<UserProfileDTO>builder()
                .success(true)
                .status(200)
                .data(userProfile)
                .message("Current user fetched successfully!")
                .build());
    }
}