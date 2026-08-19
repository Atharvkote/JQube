package net.jqube.scanner.services.scan.impl;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.jqube.scanner.models.scan.*;
import net.jqube.scanner.repositories.*;
import net.jqube.scanner.services.scan.ScanPersistenceService;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class ScanPersistenceServiceImpl implements ScanPersistenceService {

    private final ScanRepository scanRepository;
    private final ScanToolRunRepository scanToolRunRepository;
    private final ScanFindingRepository scanFindingRepository;

    @PersistenceContext
    private EntityManager entityManager;

    @Override
    @Transactional
    public Scan createScan(
            UUID jobId,
            UUID qubeId,
            Long repositoryId,
            String branch,
            String commitSha,
            ScanType scanType,
            TriggerType triggerType
    ) {
        Scan scan = new Scan();
        scan.setJobId(jobId);
        scan.setQubeId(qubeId);
        scan.setRepositoryId(repositoryId);
        scan.setBranch(branch);
        scan.setCommitSha(commitSha);
        scan.setScanType(scanType);
        scan.setTriggerType(triggerType);
        scan.setStatus(ScanStatus.QUEUED);
        scan.setTotalFindings(0);
        scan.setCriticalCount(0);
        scan.setHighCount(0);
        scan.setMediumCount(0);
        scan.setLowCount(0);

        Scan saved = scanRepository.save(scan);
        entityManager.flush();
        entityManager.clear();

        log.info("Created scan id={} jobId={} qubeId={} repositoryId={} commitSha={} scanType={}",
                saved.getId(), jobId, qubeId, repositoryId, commitSha, scanType);

        return saved;
    }

    @Override
    @Transactional
    public void updateScanStatus(UUID scanId, ScanStatus status) {
        scanRepository.findById(scanId).ifPresent(scan -> {
            scan.setStatus(status);
            scanRepository.save(scan);
            entityManager.flush();
            entityManager.clear();
            log.info("Updated scan id={} status={}", scanId, status);
        });
    }

    @Override
    @Transactional
    public ScanToolRun createToolRun(Scan scan, ScannerType scannerType) {
        ScanToolRun toolRun = new ScanToolRun();
        toolRun.setScan(scan);
        toolRun.setScannerType(scannerType);
        toolRun.setStatus(ScanToolStatus.QUEUED);
        toolRun.setFindingCount(0);

        ScanToolRun saved = scanToolRunRepository.save(toolRun);
        entityManager.flush();
        entityManager.clear();

        log.info("Created toolRun id={} scanId={} scannerType={}", saved.getId(), scan.getId(), scannerType);
        return saved;
    }

    @Override
    @Transactional
    public void updateToolRunStatus(ScanToolRun toolRun, ScanToolStatus status) {
        scanToolRunRepository.findById(toolRun.getId()).ifPresent(run -> {
            run.setStatus(status);
            scanToolRunRepository.save(run);
            entityManager.flush();
            entityManager.clear();
            log.info("Updated toolRun id={} status={}", run.getId(), status);
        });
    }

    @Override
    @Transactional
    public void saveFinding(ScanToolRun toolRun, ScanFinding finding) {
        finding.setToolRun(toolRun);
        scanFindingRepository.save(finding);
        entityManager.flush();
        entityManager.clear();
    }

    @Override
    @Transactional
    public void completeToolRun(
            ScanToolRun toolRun,
            int findingCount,
            long durationMs,
            Integer exitCode
    ) {
        scanToolRunRepository.findById(toolRun.getId()).ifPresent(run -> {
            run.setStatus(ScanToolStatus.COMPLETED);
            run.setCompletedAt(Instant.now());
            run.setFindingCount(findingCount);
            run.setDurationMs(durationMs);
            run.setExitCode(exitCode);
            scanToolRunRepository.save(run);
            entityManager.flush();
            entityManager.clear();
            log.info("Completed toolRun id={} findings={} durationMs={} exitCode={}",
                    run.getId(), findingCount, durationMs, exitCode);
        });
    }

    @Override
    @Transactional
    public void failToolRun(ScanToolRun toolRun, String errorMessage) {
        scanToolRunRepository.findById(toolRun.getId()).ifPresent(run -> {
            run.setStatus(ScanToolStatus.FAILED);
            run.setCompletedAt(Instant.now());
            run.setErrorMessage(errorMessage);
            scanToolRunRepository.save(run);
            entityManager.flush();
            entityManager.clear();
            log.warn("ToolRun failed id={} error={}", run.getId(), errorMessage);
        });
    }

    @Override
    @Transactional
    public void completeScan(Scan scan) {
        scanRepository.findById(scan.getId()).ifPresent(s -> {
            s.setStatus(ScanStatus.COMPLETED);
            s.setCompletedAt(Instant.now());
            scanRepository.save(s);
            entityManager.flush();
            entityManager.clear();
            log.info("Scan completed id={} totalFindings={}", s.getId(), s.getTotalFindings());
        });
    }

    @Override
    @Transactional
    public void failScan(Scan scan, String errorMessage) {
        scanRepository.findById(scan.getId()).ifPresent(s -> {
            s.setStatus(ScanStatus.FAILED);
            s.setCompletedAt(Instant.now());
            s.setErrorMessage(errorMessage);
            scanRepository.save(s);
            entityManager.flush();
            entityManager.clear();
            log.warn("Scan failed id={} error={}", s.getId(), errorMessage);
        });
    }
}
