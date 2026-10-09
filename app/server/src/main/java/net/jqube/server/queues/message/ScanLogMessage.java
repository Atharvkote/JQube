package net.jqube.server.queues.message;

import java.util.UUID;

public record ScanLogMessage(
        UUID qubeId,
        String log
) {}
