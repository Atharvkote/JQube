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
import net.jqube.server.models.auth.User;

// Response Models
import net.jqube.server.responses.ErrorResponse;
import net.jqube.server.responses.Response;

// Services
import net.jqube.server.services.github.GithubAuthService;

// Deps
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

// Annotations
import lombok.RequiredArgsConstructor;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;

@RestController
@RequestMapping("/api/v1/github")
@RequiredArgsConstructor
@Tag(name = "GitHub", description = "Link and manage a GitHub account via OAuth2")
@SecurityRequirement(name = "bearerAuth")
public class GithubController {

        private final GithubAuthService githubAuthService;
        private final net.jqube.server.repositories.UserRepository userRepository;

        private User getAuthenticatedUser() {
                String username = SecurityContextHolder.getContext().getAuthentication().getName();
                return userRepository.findByUsername(username)
                                .orElseThrow(() -> new net.jqube.server.exceptions.shared.UserNotFoundException(
                                                "User not found."));
        }

        @Operation(summary = "Start the GitHub OAuth2 connect flow", description = "Builds the GitHub authorization URL for the current user and returns it for the "
                        +
                        "client to redirect the browser to. NOTE: currently returned in the response 'message' " +
                        "field; consider returning it as structured data (e.g. { authorizationUrl }) instead.")
        @ApiResponses({
                        @ApiResponse(responseCode = "200", description = "Authorization URL generated"),
                        @ApiResponse(responseCode = "401", description = "Missing, invalid or expired JWT", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
        })
        @GetMapping("/connect")
        @PreAuthorize("hasRole('USER')")
        public ResponseEntity<Response<Void>> connect() {
                User user = getAuthenticatedUser();
                return ResponseEntity.ok(
                                Response.<Void>builder()
                                                .success(true)
                                                .status(HttpStatus.OK.value())
                                                .message(githubAuthService.generateAuthorizationUrl(user.getId()))
                                                .build());
        }

        @Operation(summary = "GitHub OAuth2 callback", description = "Endpoint GitHub redirects back to after the user grants (or denies) access. "
                        +
                        "Exchanges the authorization code for a token and stores the linked GitHub profile. " +
                        "See the security note on this class regarding the 'state' parameter before relying " +
                        "on this endpoint in production.")
        @ApiResponses({
                        @ApiResponse(responseCode = "200", description = "GitHub account linked successfully"),
                        @ApiResponse(responseCode = "400", description = "Invalid or expired authorization code", content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
                        @ApiResponse(responseCode = "404", description = "No user found for the supplied state", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
        })
        @GetMapping(value = "/callback", produces = "text/html")
        public ResponseEntity<String> callback(
                        @Parameter(description = "Authorization code issued by GitHub") @RequestParam String code,
                        @Parameter(description = "Opaque, single-use state token issued by /connect and resolved server-side to a user") @RequestParam String state) {
                try {
                        githubAuthService.connect(state, code);
                        String html = """
                                <!DOCTYPE html>
                                <html>
                                <head>
                                    <title>Connection Successful</title>
                                    <script>
                                        if (window.opener) {
                                            window.opener.postMessage({ type: 'GITHUB_CONNECTED', success: true }, '*');
                                            setTimeout(function() { window.close(); }, 500);
                                        } else {
                                            window.close();
                                        }
                                    </script>
                                </head>
                                <body style="background: #0D0606; color: #FFFFFF; font-family: 'JetBrains Mono', sans-serif; text-align: center; padding-top: 100px;">
                                    <h2 style="color: #FF3B3B;">Connection Successful!</h2>
                                    <p>Your GitHub account has been connected. This window will close automatically.</p>
                                </body>
                                </html>
                                """;
                        return ResponseEntity.ok(html);
                } catch (Exception e) {
                        String html = String.format("""
                                <!DOCTYPE html>
                                <html>
                                <head>
                                    <title>Connection Failed</title>
                                    <script>
                                        if (window.opener) {
                                            window.opener.postMessage({ type: 'GITHUB_CONNECTED', success: false, error: '%s' }, '*');
                                            setTimeout(function() { window.close(); }, 500);
                                        } else {
                                            window.close();
                                        }
                                    </script>
                                </head>
                                <body style="background: #0D0606; color: #FFFFFF; font-family: 'JetBrains Mono', sans-serif; text-align: center; padding-top: 100px;">
                                    <h2 style="color: #FF3B3B;">Connection Failed</h2>
                                    <p>%s</p>
                                </body>
                                </html>
                                """, e.getMessage(), e.getMessage());
                        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(html);
                }
        }

        @Operation(summary = "Get the linked GitHub profile details", description = "Retrieves profile details of the linked GitHub account for the authenticated user.")
        @ApiResponses({
                        @ApiResponse(responseCode = "200", description = "Profile details retrieved successfully"),
                        @ApiResponse(responseCode = "401", description = "Missing, invalid or expired JWT"),
                        @ApiResponse(responseCode = "404", description = "No GitHub account connected for this user")
        })
        @GetMapping("/profile")
        @PreAuthorize("hasRole('USER')")
        public ResponseEntity<Response<net.jqube.server.responses.dataDTOs.GithubProfileResponse>> getProfile() {
                User user = getAuthenticatedUser();
                return ResponseEntity.ok(
                                Response.<net.jqube.server.responses.dataDTOs.GithubProfileResponse>builder()
                                                .success(true)
                                                .status(HttpStatus.OK.value())
                                                .data(githubAuthService.getGithubProfile(user.getId()))
                                                .message("GitHub profile retrieved successfully!")
                                                .build());
        }

        @Operation(summary = "Disconnect the linked GitHub account", description = "Deletes the linked GitHub account configuration for the current user.")
        @ApiResponses({
                        @ApiResponse(responseCode = "200", description = "GitHub account disconnected successfully"),
                        @ApiResponse(responseCode = "401", description = "Missing, invalid or expired JWT"),
                        @ApiResponse(responseCode = "404", description = "No GitHub account connected for this user")
        })
        @DeleteMapping("/disconnect")
        @PreAuthorize("hasRole('USER')")
        public ResponseEntity<Response<Void>> disconnect() {
                User user = getAuthenticatedUser();
                githubAuthService.disconnect(user.getId());
                return ResponseEntity.ok(
                                Response.<Void>builder()
                                                .success(true)
                                                .status(HttpStatus.OK.value())
                                                .message("GitHub account disconnected successfully!")
                                                .build());
        }
}