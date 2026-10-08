package net.jqube.scanner.services.scan.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.jqube.scanner.enums.*;
import net.jqube.scanner.models.scan.*;
import net.jqube.scanner.repositories.*;
import net.jqube.scanner.services.fingerprint.FindingFingerprintService;
import net.jqube.scanner.services.scan.ScanPersistenceService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class ScanPersistenceServiceImpl implements ScanPersistenceService {

    private final ScanRepository scanRepository;
    private final ScanToolRunRepository scanToolRunRepository;
    private final ScanFindingRepository scanFindingRepository;
    private final FindingFingerprintService fingerprintService;

    @Override
    @Transactional
    public Scan createScan(
            UUID jobId,
            UUID qubeId,
            Long repositoryId,
            String repositoryUrl,
            String branch,
            String commitSha,
            ScanType scanType,
            TriggerType triggerType,
            UUID userId
    ) {
        Scan scan = Scan.builder()
                .jobId(jobId)
                .qubeId(qubeId)
                .repositoryId(repositoryId)
                .repositoryUrl(repositoryUrl)
                .branch(branch)
                .commitSha(commitSha)
                .scanType(scanType)
                .triggerType(triggerType)
                .status(ScanStatus.QUEUED)
                .totalFindings(0)
                .criticalCount(0)
                .highCount(0)
                .mediumCount(0)
                .lowCount(0)
                .build();

        scan.setCreatedBy(userId);
        scan.setUpdatedBy(userId);

        return scanRepository.save(scan);
    }

    @Override
    @Transactional
    public void updateScanStatus(UUID scanId, ScanStatus status, UUID userId) {
        Scan scan = scanRepository.findById(scanId)
                .orElseThrow(() -> new IllegalArgumentException("Scan not found: " + scanId));

        scan.setStatus(status);
        scan.setUpdatedBy(userId);

        if (status == ScanStatus.SCANNING && scan.getStartedAt() == null) {
            scan.setStartedAt(java.time.Instant.now());
        }

        if (status == ScanStatus.COMPLETED
                || status == ScanStatus.COMPLETED_WITH_ERRORS
                || status == ScanStatus.FAILED) {
            scan.setCompletedAt(java.time.Instant.now());
        }

        scanRepository.save(scan);
    }

    @Override
    @Transactional
    public ScanToolRun createToolRun(Scan scan, ScannerType scannerType, UUID userId) {
        ScanToolRun toolRun = ScanToolRun.builder()
                .scan(scan)
                .scannerType(scannerType)
                .status(ScanToolStatus.QUEUED)
                .findingCount(0)
                .build();

        toolRun.setCreatedBy(userId);
        toolRun.setUpdatedBy(userId);

        return scanToolRunRepository.save(toolRun);
    }

    @Override
    @Transactional
    public void updateToolRunStatus(ScanToolRun toolRun, ScanToolStatus status, UUID userId) {
        toolRun.setStatus(status);
        toolRun.setUpdatedBy(userId);

        if (status == ScanToolStatus.RUNNING && toolRun.getStartedAt() == null) {
            toolRun.setStartedAt(java.time.Instant.now());
        }

        if (status == ScanToolStatus.COMPLETED
                || status == ScanToolStatus.FAILED
                || status == ScanToolStatus.TIMEOUT) {
            toolRun.setCompletedAt(java.time.Instant.now());
        }

        scanToolRunRepository.save(toolRun);
    }

    @Override
    @Transactional
    public void saveFinding(ScanToolRun toolRun, ScanFinding finding, UUID userId) {
        finding.setToolRun(toolRun);
        finding.setCreatedBy(userId);
        finding.setUpdatedBy(userId);

        String fingerprint = fingerprintService.generateFingerprint(
                toolRun.getScannerType(),
                finding.getRuleId(),
                finding.getFilePath(),
                finding.getLineStart(),
                finding.getTitle()
        );
        finding.setFingerprint(fingerprint);

        scanFindingRepository.save(finding);
    }

    @Override
    @Transactional
    public void completeToolRun(
            ScanToolRun toolRun,
            int findingCount,
            long durationMs,
            Integer exitCode,
            String rawResultPath,
            UUID userId
    ) {
        toolRun.setStatus(ScanToolStatus.COMPLETED);
        toolRun.setCompletedAt(java.time.Instant.now());
        toolRun.setFindingCount(findingCount);
        toolRun.setDurationMs(durationMs);
        toolRun.setExitCode(exitCode);
        toolRun.setRawResultPath(rawResultPath);
        toolRun.setUpdatedBy(userId);

        scanToolRunRepository.save(toolRun);
    }

    @Override
    @Transactional
    public void failToolRun(ScanToolRun toolRun, String errorMessage, UUID userId) {
        toolRun.setStatus(ScanToolStatus.FAILED);
        toolRun.setCompletedAt(java.time.Instant.now());
        toolRun.setErrorMessage(errorMessage);
        toolRun.setUpdatedBy(userId);

        scanToolRunRepository.save(toolRun);
    }

    @Override
    @Transactional
    public void completeScan(Scan scan, UUID userId) {
        completeScan(scan, ScanStatus.COMPLETED, userId);
    }

    @Override
    @Transactional
    public void completeScan(Scan scan, ScanStatus status, UUID userId) {
        recalculateCounts(scan);

        scan.setStatus(status);
        scan.setCompletedAt(java.time.Instant.now());
        scan.setUpdatedBy(userId);

        scanRepository.save(scan);
    }

    @Override
    @Transactional
    public void failScan(Scan scan, String errorMessage, UUID userId) {
        scan.setStatus(ScanStatus.FAILED);
        scan.setCompletedAt(java.time.Instant.now());
        scan.setErrorMessage(errorMessage);
        scan.setUpdatedBy(userId);

        scanRepository.save(scan);
    }

    private void recalculateCounts(Scan scan) {
        List<ScanToolRun> toolRuns = scanToolRunRepository.findAllByScanId(scan.getId());

        int totalFindings = 0;
        int criticalCount = 0;
        int highCount = 0;
        int mediumCount = 0;
        int lowCount = 0;

        for (ScanToolRun toolRun : toolRuns) {
            List<ScanFinding> findings = scanFindingRepository.findAllByToolRunId(toolRun.getId());

            for (ScanFinding finding : findings) {
                totalFindings++;

                switch (finding.getSeverity()) {
                    case CRITICAL -> criticalCount++;
                    case HIGH -> highCount++;
                    case MEDIUM -> mediumCount++;
                    case LOW -> lowCount++;
                    default -> {
                    }
                }
            }
        }

        scan.setTotalFindings(totalFindings);
        scan.setCriticalCount(criticalCount);
        scan.setHighCount(highCount);
        scan.setMediumCount(mediumCount);
        scan.setLowCount(lowCount);
    }
}
