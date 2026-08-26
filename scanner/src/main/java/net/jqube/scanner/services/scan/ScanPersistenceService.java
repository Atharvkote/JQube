package net.jqube.scanner.services.scan;

import net.jqube.scanner.enums.*;
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
            TriggerType triggerType,
            UUID userId
    );

    void updateScanStatus(
            UUID scanId,
            ScanStatus status,
            UUID userId
    );

    ScanToolRun createToolRun(
            Scan scan,
            ScannerType scannerType,
            UUID userId
    );

    void updateToolRunStatus(
            ScanToolRun toolRun,
            ScanToolStatus status,
            UUID userId
    );

    void saveFinding(
            ScanToolRun toolRun,
            ScanFinding finding,
            UUID userId
    );

    void completeToolRun(
            ScanToolRun toolRun,
            int findingCount,
            long durationMs,
            Integer exitCode,
            UUID userId
    );

    void failToolRun(
            ScanToolRun toolRun,
            String errorMessage,
            UUID userId
    );

    void completeScan(
            Scan scan,
            UUID userId
    );

    void completeScan(
            Scan scan,
            ScanStatus status,
            UUID userId
    );

    void failScan(
            Scan scan,
            String errorMessage,
            UUID userId
    );
}
