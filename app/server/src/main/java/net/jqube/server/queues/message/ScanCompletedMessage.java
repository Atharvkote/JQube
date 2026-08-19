package net.jqube.server.queues.message;

import java.time.Instant;
import java.util.UUID;

public record ScanCompletedMessage(
        UUID eventId,
        UUID jobId,
        UUID qubeId,
        Long repositoryId,
        String commitSha,
        String status,
        int critical,
        int high,
        int medium,
        int low,
        String resultLocation,
        Instant completedAt,
        String errorMessage
) {
}
