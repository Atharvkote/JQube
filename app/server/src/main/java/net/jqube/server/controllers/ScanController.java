package net.jqube.server.controllers;

import net.jqube.server.dtos.requests.ScanRequestDTO;
import net.jqube.server.dtos.responses.ScanJobResponseDTO;
import net.jqube.server.responses.ErrorResponse;
import net.jqube.server.responses.Response;
import net.jqube.server.services.scan.ScanService;

// Swagger Documentation
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
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

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/qubes")
@RequiredArgsConstructor
@Tag(name = "Scan", description = "Scan job lifecycle operations")
@SecurityRequirement(name = "bearerAuth")
public class ScanController {

    private final ScanService scanService;

    @Operation(
            summary = "Start a new scan for a Qube",
            description = "Creates a scan job for the specified Qube. The authenticated user must be an active member "
                    + "of the Qube and have the START_SCAN permission. Returns 202 Accepted with the created job details."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "202", description = "Scan job created successfully",
                    content = @Content(schema = @Schema(implementation = ScanJobResponseDTO.class))),
            @ApiResponse(responseCode = "400", description = "Invalid request",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "401", description = "Missing, invalid or expired JWT",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "403", description = "Insufficient permissions or not a Qube member",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "404", description = "Qube not found or has been deleted",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    @PostMapping("/{qubeId}/scans")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<Response<ScanJobResponseDTO>> startScan(
            @Parameter(description = "Qube ID", example = "a1b2c3d4-e5f6-7890-1234-567890abcdef")
            @PathVariable UUID qubeId,
            @Parameter(description = "Scan request containing commit SHA and optional scan type")
            @Valid @RequestBody ScanRequestDTO request) {

        ScanJobResponseDTO result = scanService.startScan(qubeId, request);
        return ResponseEntity.status(HttpStatus.ACCEPTED)
                .body(
                        Response.<ScanJobResponseDTO>builder()
                                .success(true)
                                .status(HttpStatus.ACCEPTED.value())
                                .data(result)
                                .message("Scan job created successfully!")
                                .build()
                );
    }

    @Operation(
            summary = "Get scan job details",
            description = "Returns the details of a scan job. The authenticated user must be an active member of the Qube associated with the job."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Scan job retrieved successfully",
                    content = @Content(schema = @Schema(implementation = ScanJobResponseDTO.class))),
            @ApiResponse(responseCode = "401", description = "Missing, invalid or expired JWT",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "403", description = "User is not an active member of this Qube",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "404", description = "Scan job not found",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    @GetMapping("/scans/{jobId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER', 'VIEWER')")
    public ResponseEntity<Response<ScanJobResponseDTO>> getScanJob(
            @Parameter(description = "Scan Job ID", example = "b2c3d4e5-f6a7-7890-1234-567890abcdef")
            @PathVariable UUID jobId) {

        ScanJobResponseDTO result = scanService.getScanJob(jobId);
        return ResponseEntity.ok(
                Response.<ScanJobResponseDTO>builder()
                        .success(true)
                        .status(HttpStatus.OK.value())
                        .data(result)
                        .message("Scan job fetched successfully!")
                        .build()
        );
    }
}
