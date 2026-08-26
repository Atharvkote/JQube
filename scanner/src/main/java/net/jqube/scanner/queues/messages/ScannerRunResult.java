package net.jqube.scanner.queues.messages;

import java.util.List;

public record ScannerRunResult(
        String scanner,
        List<ScanFinding> findings,
        long durationMs
) {
}
