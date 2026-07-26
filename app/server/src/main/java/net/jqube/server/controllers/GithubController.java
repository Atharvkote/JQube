package net.jqube.server.controllers;

// OpenAPI
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;

// Models
import net.jqube.server.models.User;

// Response Models
import net.jqube.server.responses.ErrorResponse;
import net.jqube.server.responses.Response;

// Services
import net.jqube.server.services.github.GithubService;

// Deps
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

// Annotations
import lombok.RequiredArgsConstructor;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;


@RestController
@RequestMapping("/api/v1/github")
@PreAuthorize("hasRole('USER')")
@RequiredArgsConstructor
@Tag(name = "GitHub", description = "Link and manage a GitHub account via OAuth2")
@SecurityRequirement(name = "bearerAuth")
public class GithubController {

    private final GithubService githubService;

    @Operation(
            summary = "Start the GitHub OAuth2 connect flow",
            description = "Builds the GitHub authorization URL for the current user and returns it for the " +
                    "client to redirect the browser to. NOTE: currently returned in the response 'message' " +
                    "field; consider returning it as structured data (e.g. { authorizationUrl }) instead."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Authorization URL generated"),
            @ApiResponse(responseCode = "401", description = "Missing, invalid or expired JWT",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    @GetMapping("/connect")
    public ResponseEntity<Response<Void>> connect(
            @AuthenticationPrincipal User user
    ) {
        return ResponseEntity.ok(
                Response.<Void>builder()
                        .success(true)
                        .status(HttpStatus.OK.value())
                        .message(githubService.generateAuthorizationUrl(user.getId()))
                        .build()
        );
    }

    @Operation(
            summary = "GitHub OAuth2 callback",
            description = "Endpoint GitHub redirects back to after the user grants (or denies) access. " +
                    "Exchanges the authorization code for a token and stores the linked GitHub profile. " +
                    "See the security note on this class regarding the 'state' parameter before relying " +
                    "on this endpoint in production."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "GitHub account linked successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid or expired authorization code",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "404", description = "No user found for the supplied state",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    @GetMapping("/callback")
    public ResponseEntity<Response<Void>> callback(
            @Parameter(description = "Authorization code issued by GitHub") @RequestParam String code,
            @Parameter(description = "Opaque, single-use state token issued by /connect and resolved server-side to a user")
            @RequestParam String state
    ) {
        githubService.connect(state, code);
        return ResponseEntity.ok(Response.<Void>builder()
                .success(true)
                .status(HttpStatus.OK.value())
                .message("User Connected to Github Successfully!")
                .build());
    }
}