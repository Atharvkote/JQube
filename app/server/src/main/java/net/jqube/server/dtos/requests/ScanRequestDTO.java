package net.jqube.server.dtos.requests;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import net.jqube.server.enums.ScanType;

public record ScanRequestDTO(
        @NotBlank(message = "commitSha is required")
        @Size(min = 40, max = 64, message = "commitSha must be between 40 and 64 characters")
        String commitSha,

        ScanType scanType
) {
}
