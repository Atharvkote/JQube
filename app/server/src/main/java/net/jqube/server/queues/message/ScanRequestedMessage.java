package net.jqube.server.queues.message;

import java.time.Instant;
import java.util.UUID;
import net.jqube.server.enums.TriggerType;
import net.jqube.server.enums.ScanType;

public record ScanRequestedMessage(
        UUID eventId,
        UUID jobId,
        UUID qubeId,
        Long repositoryId,
        String repositoryUrl,
        String branch,
        String commitSha,
        ScanType scanType,
        TriggerType triggerType,
        Instant requestedAt
) {
}
