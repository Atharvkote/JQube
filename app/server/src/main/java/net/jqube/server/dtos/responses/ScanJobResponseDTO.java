package net.jqube.server.dtos.responses;

import net.jqube.server.enums.ScanStatus;

import java.time.Instant;
import java.util.UUID;

public record ScanJobResponseDTO(
        UUID jobId,
        UUID qubeId,
        Long repositoryId,
        String commitSha,
        ScanStatus status,
        Integer attempt,
        Instant createdAt
) {
}
