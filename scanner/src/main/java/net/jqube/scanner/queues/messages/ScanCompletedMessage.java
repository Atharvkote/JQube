package net.jqube.scanner.queues.messages;

import java.time.Instant;
import java.util.UUID;

public record ScanCompletedMessage(
        UUID eventId,
        UUID jobId,
        UUID qubeId,
        UUID userId,
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
