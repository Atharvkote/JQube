package net.jqube.server.controllers;

import net.jqube.server.dtos.qube.ImportRepoRequestDTO;
import net.jqube.server.dtos.qube.ImportRepoResponseDTO;
import net.jqube.server.dtos.qube.NewQubeDTO;
import net.jqube.server.dtos.qube.QubeDTO;
import net.jqube.server.responses.ErrorResponse;
import net.jqube.server.responses.Response;
import net.jqube.server.services.qubes.QubeService;

// Swagger Documentation
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

// Annotations
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/qube")
@RequiredArgsConstructor
@Tag(name = "Qube", description = "Qube lifecycle and repository import operations")
@SecurityRequirement(name = "bearerAuth")
public class QubeAPIController {

    private final QubeService qubeService;

    @Operation(
            summary = "List all Qubes for the current user",
            description = "Returns every Qube where the authenticated user is an active member, ordered by most recently joined."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Qubes retrieved successfully",
                    content = @Content(array = @ArraySchema(schema = @Schema(implementation = QubeDTO.class)))),
            @ApiResponse(responseCode = "401", description = "Missing, invalid or expired JWT",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'USER', 'VIEWER')")
    public ResponseEntity<Response<List<QubeDTO>>> getAllQubes() {
        List<QubeDTO> qubes = qubeService.getAllQubes();
        return ResponseEntity.ok(
                Response.<List<QubeDTO>>builder()
                        .success(true)
                        .status(HttpStatus.OK.value())
                        .data(qubes)
                        .message("Qubes fetched successfully!")
                        .build()
        );
    }

    @Operation(
            summary = "Get a Qube by ID",
            description = "Returns the Qube details if the authenticated user is an active member of it."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Qube retrieved successfully",
                    content = @Content(schema = @Schema(implementation = QubeDTO.class))),
            @ApiResponse(responseCode = "401", description = "Missing, invalid or expired JWT",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "403", description = "User is not an active member of this Qube",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "404", description = "Qube not found or has been deleted",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER', 'VIEWER')")
    public ResponseEntity<Response<QubeDTO>> getQubeById(
            @Parameter(description = "Qube ID", example = "a1b2c3d4-e5f6-7890-1234-567890abcdef")
            @PathVariable UUID id) {

        QubeDTO qube = qubeService.getQube(id);
        return ResponseEntity.ok(
                Response.<QubeDTO>builder()
                        .success(true)
                        .status(HttpStatus.OK.value())
                        .data(qube)
                        .message("Qube fetched successfully!")
                        .build()
        );
    }

    @Operation(
            summary = "Get a Qube by slug",
            description = "Returns the Qube details identified by its unique slug. Requires active membership."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Qube retrieved successfully",
                    content = @Content(schema = @Schema(implementation = QubeDTO.class))),
            @ApiResponse(responseCode = "401", description = "Missing, invalid or expired JWT",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "403", description = "User is not an active member of this Qube",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "404", description = "Qube not found with the supplied slug",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    @GetMapping("/slug/{slug}")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER', 'VIEWER')")
    public ResponseEntity<Response<QubeDTO>> getQubeBySlug(
            @Parameter(description = "Qube slug", example = "my-awesome-project")
            @PathVariable String slug) {

        QubeDTO qube = qubeService.getQubeBySlug(slug);
        return ResponseEntity.ok(
                Response.<QubeDTO>builder()
                        .success(true)
                        .status(HttpStatus.OK.value())
                        .data(qube)
                        .message("Qube fetched successfully!")
                        .build()
        );
    }

    @Operation(
            summary = "Create a new Qube from a GitHub repository",
            description = "Creates a Qube by importing a GitHub repository using the identifier 'owner/repo'. "
                    + "The caller supplies the Qube name and optional configuration. Repository metadata and the default branch are resolved via the GitHub API using the caller's linked account. "
                    + "The caller becomes the OWNER. Fails if the repository is already imported as an active Qube."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Repository imported as Qube successfully",
                    content = @Content(schema = @Schema(implementation = ImportRepoResponseDTO.class))),
            @ApiResponse(responseCode = "400", description = "Invalid repository identifier format or GitHub API error",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "404", description = "Repository not found on GitHub",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "409", description = "Repository already linked to an active Qube",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "401", description = "Missing, invalid or expired JWT",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    @PostMapping("/import")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<Response<ImportRepoResponseDTO>> importRepo(
            @Parameter(description = "Repository import request containing 'owner/repo' identifier, Qube name, and optional configuration")
            @Valid @RequestBody ImportRepoRequestDTO request) {

        ImportRepoResponseDTO result = qubeService.importRepoFromGithubAndCreateQube(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(
                        Response.<ImportRepoResponseDTO>builder()
                                .success(true)
                                .status(HttpStatus.CREATED.value())
                                .data(result)
                                .message("Repository imported as Qube successfully!")
                                .build()
                );
    }

    @Operation(
            summary = "Update an existing Qube",
            description = "Updates mutable fields of a Qube. Only OWNER and MAINTAINER roles can update. "
                    + "Repository identity (githubRepositoryId, cloneUrl, etc.) cannot be changed through this endpoint."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Qube updated successfully",
                    content = @Content(schema = @Schema(implementation = QubeDTO.class))),
            @ApiResponse(responseCode = "400", description = "Validation failed",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "401", description = "Missing, invalid or expired JWT",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "403", description = "Insufficient permissions (requires OWNER or MAINTAINER)",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "404", description = "Qube not found or has been deleted",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<Response<QubeDTO>> updateQube(
            @Parameter(description = "Qube ID", example = "a1b2c3d4-e5f6-7890-1234-567890abcdef")
            @PathVariable UUID id,
            @Parameter(description = "Updated Qube fields")
            @Valid @RequestBody NewQubeDTO request) {

        QubeDTO qube = qubeService.updateQube(id, request);
        return ResponseEntity.ok(
                Response.<QubeDTO>builder()
                        .success(true)
                        .status(HttpStatus.OK.value())
                        .data(qube)
                        .message("Qube updated successfully!")
                        .build()
        );
    }

    @Operation(
            summary = "Delete a Qube",
            description = "Permanently deletes a Qube. Only the OWNER can delete. This action is irreversible."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Qube deleted successfully"),
            @ApiResponse(responseCode = "401", description = "Missing, invalid or expired JWT",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "403", description = "Only the Qube owner can delete",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "404", description = "Qube not found or has been deleted",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<Response<Void>> deleteQube(
            @Parameter(description = "Qube ID", example = "a1b2c3d4-e5f6-7890-1234-567890abcdef")
            @PathVariable UUID id) {

        qubeService.deleteQube(id);
        return ResponseEntity.ok(
                Response.<Void>builder()
                        .success(true)
                        .status(HttpStatus.OK.value())
                        .message("Qube deleted successfully!")
                        .build()
        );
    }

    @Operation(
            summary = "Archive a Qube",
            description = "Archives a Qube, marking it as inactive for scans while preserving its data. Only the OWNER can archive."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Qube archived successfully"),
            @ApiResponse(responseCode = "401", description = "Missing, invalid or expired JWT",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "403", description = "Only the Qube owner can archive",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "404", description = "Qube not found or has been deleted",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    @PostMapping("/{id}/archive")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<Response<Void>> archiveQube(
            @Parameter(description = "Qube ID", example = "a1b2c3d4-e5f6-7890-1234-567890abcdef")
            @PathVariable UUID id) {

        qubeService.archiveQube(id);
        return ResponseEntity.ok(
                Response.<Void>builder()
                        .success(true)
                        .status(HttpStatus.OK.value())
                        .message("Qube archived successfully!")
                        .build()
        );
    }
}
