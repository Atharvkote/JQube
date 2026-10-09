package net.jqube.scanner.scanners;

import net.jqube.scanner.queues.messages.ScanFinding;
import java.util.List;

public record ScannerOutput(
        List<ScanFinding> findings,
        String rawResultPath,
        Integer exitCode
) {}
