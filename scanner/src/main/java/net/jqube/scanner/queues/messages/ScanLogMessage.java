package net.jqube.scanner.queues.messages;

import java.util.UUID;

public record ScanLogMessage(
        UUID qubeId,
        String log
) {}
