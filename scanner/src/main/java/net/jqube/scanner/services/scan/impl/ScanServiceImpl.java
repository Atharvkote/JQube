package net.jqube.scanner.services.scan.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.jqube.scanner.configs.properties.ScannerProperties;
import net.jqube.scanner.enums.FindingSeverity;
import net.jqube.scanner.enums.ScannerType;
import net.jqube.scanner.enums.ScanStatus;
import net.jqube.scanner.enums.ScanToolStatus;
import net.jqube.scanner.services.git.GitService;
import net.jqube.scanner.models.scan.Scan;
import net.jqube.scanner.models.scan.ScanFinding;
import net.jqube.scanner.models.scan.ScanToolRun;
import net.jqube.scanner.queues.messages.ScanCompletedMessage;
import net.jqube.scanner.queues.messages.ScanRequestedMessage;
import net.jqube.scanner.queues.messages.ScanResult;
import net.jqube.scanner.queues.messages.ScannerRunResult;
import net.jqube.scanner.queues.publishers.ScanResultPublisher;
import net.jqube.scanner.scanners.ScannerOrchestrator;
import net.jqube.scanner.services.scan.ScanService;
import net.jqube.scanner.services.scan.ScanPersistenceService;
import org.springframework.stereotype.Service;

import java.nio.file.Path;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class ScanServiceImpl implements ScanService {

    private final GitService gitService;
    private final ScannerOrchestrator scannerOrchestrator;
    private final ScanResultPublisher scanResultPublisher;
    private final ScannerProperties scannerProperties;
    private final ScanPersistenceService scanPersistenceService;

    @Override
    public void execute(ScanRequestedMessage message) {
        UUID userId = message.userId();
        UUID jobId = message.jobId();
        UUID qubeId = message.qubeId();
        Long repositoryId = message.repositoryId();
        String commitSha = message.commitSha();

        log.info(
                "Starting scan jobId={}, qubeId={}, userId={}, repositoryId={}, commitSha={}, scanType={}",
                jobId,
                qubeId,
                userId,
                repositoryId,
                commitSha,
                message.scanType()
        );

        Scan scan = scanPersistenceService.createScan(
                jobId,
                qubeId,
                repositoryId,
                message.repositoryUrl(),
                message.branch(),
                commitSha,
                message.scanType(),
                message.triggerType(),
                userId
        );

        Path workspace = null;

        try {
            scanPersistenceService.updateScanStatus(scan.getId(), ScanStatus.CLONING, userId);

            workspace = gitService.cloneRepository(
                    message.repositoryUrl(),
                    commitSha,
                    jobId
            );

            scanPersistenceService.updateScanStatus(scan.getId(), ScanStatus.SCANNING, userId);

            List<ScannerRunResult> runResults = scannerOrchestrator.scan(
                    workspace,
                    message.scanType()
            );

            for (ScannerRunResult runResult : runResults) {
                ScannerType scannerType = mapScannerType(runResult.scanner());
                ScanToolRun toolRun = scanPersistenceService.createToolRun(scan, scannerType, userId);

                scanPersistenceService.updateToolRunStatus(toolRun, ScanToolStatus.RUNNING, userId);

                for (net.jqube.scanner.queues.messages.ScanFinding messageFinding : runResult.findings()) {
                    ScanFinding entityFinding = mapToEntity(messageFinding);
                    scanPersistenceService.saveFinding(toolRun, entityFinding, userId);
                }

                scanPersistenceService.completeToolRun(
                        toolRun,
                        runResult.findings().size(),
                        runResult.durationMs(),
                        runResult.exitCode(),
                        runResult.rawResultPath(),
                        userId
                );
            }

            scanPersistenceService.completeScan(scan, userId);

            List<net.jqube.scanner.queues.messages.ScanFinding> allFindings = runResults.stream()
                    .flatMap(r -> r.findings().stream())
                    .toList();

            ScanResult scanResult = new ScanResult(allFindings);

            ScanCompletedMessage completedMessage = new ScanCompletedMessage(
                    message.eventId(),
                    jobId,
                    qubeId,
                    userId,
                    repositoryId,
                    commitSha,
                    "COMPLETED",
                    scanResult.criticalCount(),
                    scanResult.highCount(),
                    scanResult.mediumCount(),
                    scanResult.lowCount(),
                    null,
                    Instant.now(),
                    null
            );

            scanResultPublisher.publish(completedMessage);

            log.info(
                    "Scan completed jobId={}, critical={}, high={}, medium={}, low={}",
                    jobId,
                    completedMessage.critical(),
                    completedMessage.high(),
                    completedMessage.medium(),
                    completedMessage.low()
            );

        } catch (Exception e) {
            log.error(
                    "Scan failed jobId={}, qubeId={}, userId={}, repositoryId={}, commitSha={}, error={}",
                    jobId,
                    qubeId,
                    userId,
                    repositoryId,
                    commitSha,
                    e.getMessage(),
                    e
            );

            try {
                scanPersistenceService.failScan(scan, e.getMessage(), userId);
            } catch (Exception persistenceError) {
                log.error("Failed to mark scan as failed jobId={}", jobId, persistenceError);
            }

            ScanCompletedMessage failedMessage = new ScanCompletedMessage(
                    message.eventId(),
                    jobId,
                    qubeId,
                    userId,
                    repositoryId,
                    commitSha,
                    "FAILED",
                    0,
                    0,
                    0,
                    0,
                    null,
                    Instant.now(),
                    e.getMessage()
            );

            scanResultPublisher.publish(failedMessage);

        } finally {
            if (workspace != null) {
                gitService.cleanup(workspace);
                log.info("Cleaning workspace jobId={}", jobId);
            }
        }
    }

    private ScannerType mapScannerType(String scannerName) {
        return switch (scannerName) {
            case "Semgrep" -> ScannerType.SEMGREP;
            case "Trivy" -> ScannerType.TRIVY;
            case "Gitleaks" -> ScannerType.GIT_LEAKS;
            default -> throw new IllegalArgumentException("Unknown scanner: " + scannerName);
        };
    }

    private ScanFinding mapToEntity(net.jqube.scanner.queues.messages.ScanFinding messageFinding) {
        return ScanFinding.builder()
                .ruleId(messageFinding.ruleId())
                .severity(FindingSeverity.valueOf(messageFinding.severity()))
                .title(messageFinding.title())
                .message(messageFinding.message())
                .filePath(messageFinding.filePath())
                .lineStart(messageFinding.lineStart())
                .lineEnd(messageFinding.lineEnd())
                .columnStart(null)
                .columnEnd(null)
                .codeSnippet(messageFinding.code())
                .fingerprint(messageFinding.fingerprint())
                .build();
    }
}
