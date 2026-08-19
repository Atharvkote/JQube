package net.jqube.scanner.services.scan;

import net.jqube.scanner.models.scan.*;

import java.util.UUID;

public interface ScanPersistenceService {

    Scan createScan(
            UUID jobId,
            UUID qubeId,
            Long repositoryId,
            String branch,
            String commitSha,
            ScanType scanType,
            TriggerType triggerType
    );

    void updateScanStatus(UUID scanId, ScanStatus status);

    ScanToolRun createToolRun(Scan scan, ScannerType scannerType);

    void updateToolRunStatus(ScanToolRun toolRun, ScanToolStatus status);

    void saveFinding(ScanToolRun toolRun, ScanFinding finding);

    void completeToolRun(
            ScanToolRun toolRun,
            int findingCount,
            long durationMs,
            Integer exitCode
    );

    void failToolRun(ScanToolRun toolRun, String errorMessage);

    void completeScan(Scan scan);

    void failScan(Scan scan, String errorMessage);
}
