package net.jqube.scanner.queues.messages;

public record ScanFinding(
        String scanner,
        String ruleId,
        String severity,
        String title,
        String message,
        String filePath,
        Integer lineStart,
        Integer lineEnd,
        String code,
        String fingerprint
) {
}
