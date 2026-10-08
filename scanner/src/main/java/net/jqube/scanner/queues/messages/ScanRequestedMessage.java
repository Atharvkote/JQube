package net.jqube.scanner.queues.messages;

import net.jqube.scanner.enums.ScanType;
import net.jqube.scanner.enums.TriggerType;

import java.time.Instant;
import java.util.UUID;

public record ScanRequestedMessage(
        UUID eventId,
        UUID jobId,
        UUID qubeId,
        UUID userId,
        Long repositoryId,
        String repositoryUrl,
        String branch,
        String commitSha,
        ScanType scanType,
        TriggerType triggerType,
        Instant requestedAt
) {
}
