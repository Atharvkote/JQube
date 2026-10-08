package net.jqube.scanner.queues.messages;

import java.util.List;

public record ScanResult(
        List<ScanFinding> findings
) {

    public int criticalCount() {
        return countBySeverity("CRITICAL");
    }

    public int highCount() {
        return countBySeverity("HIGH");
    }

    public int mediumCount() {
        return countBySeverity("MEDIUM");
    }

    public int lowCount() {
        return countBySeverity("LOW");
    }

    private int countBySeverity(String severity) {
        if (findings == null || findings.isEmpty()) {
            return 0;
        }
        return (int) findings.stream()
                .filter(f -> severity.equalsIgnoreCase(f.severity()))
                .count();
    }
}
