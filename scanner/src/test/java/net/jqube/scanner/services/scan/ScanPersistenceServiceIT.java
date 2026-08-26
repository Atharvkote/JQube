package net.jqube.scanner.services.scan;

import net.jqube.scanner.enums.*;
import net.jqube.scanner.models.scan.*;
import net.jqube.scanner.repositories.*;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;

@SpringBootTest
@Transactional
class ScanPersistenceServiceIT {

    @Autowired
    private ScanPersistenceService scanPersistenceService;

    @Autowired
    private ScanRepository scanRepository;

    @Autowired
    private ScanToolRunRepository scanToolRunRepository;

    @Autowired
    private ScanFindingRepository scanFindingRepository;

    @Test
    void fullScanLifecycle() {
        UUID jobId = UUID.randomUUID();
        UUID qubeId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();

        Scan scan = scanPersistenceService.createScan(
                jobId,
                qubeId,
                42L,
                "main",
                "abc123def456",
                ScanType.ALL,
                TriggerType.MANUAL,
                userId
        );

        assertThat(scan.getId()).isNotNull();
        assertThat(scan.getStatus()).isEqualTo(ScanStatus.QUEUED);
        assertThat(scan.getTotalFindings()).isZero();
        assertThat(scan.getCreatedAt()).isNotNull();
        assertThat(scan.getCreatedBy()).isEqualTo(userId);

        scanPersistenceService.updateScanStatus(scan.getId(), ScanStatus.CLONING, userId);
        scanPersistenceService.updateScanStatus(scan.getId(), ScanStatus.SCANNING, userId);

        ScanToolRun semgrepRun = scanPersistenceService.createToolRun(scan, ScannerType.SEMGREP, userId);
        ScanToolRun trivyRun = scanPersistenceService.createToolRun(scan, ScannerType.TRIVY, userId);
        ScanToolRun gitleaksRun = scanPersistenceService.createToolRun(scan, ScannerType.GIT_LEAKS, userId);

        scanPersistenceService.updateToolRunStatus(semgrepRun, ScanToolStatus.RUNNING, userId);
        scanPersistenceService.updateToolRunStatus(trivyRun, ScanToolStatus.RUNNING, userId);
        scanPersistenceService.updateToolRunStatus(gitleaksRun, ScanToolStatus.RUNNING, userId);

        scanPersistenceService.saveFinding(semgrepRun, ScanFinding.builder()
                .ruleId("java.sql-injection")
                .severity(FindingSeverity.HIGH)
                .title("SQL Injection")
                .message("Possible SQL injection")
                .filePath("src/main/java/App.java")
                .lineStart(10)
                .lineEnd(10)
                .build(), userId);

        scanPersistenceService.saveFinding(semgrepRun, ScanFinding.builder()
                .ruleId("java.xss")
                .severity(FindingSeverity.MEDIUM)
                .title("XSS Vulnerability")
                .message("Possible XSS")
                .filePath("src/main/java/Web.java")
                .lineStart(25)
                .lineEnd(25)
                .build(), userId);

        scanPersistenceService.saveFinding(trivyRun, ScanFinding.builder()
                .ruleId("CVE-2024-1234")
                .severity(FindingSeverity.CRITICAL)
                .title("Critical CVE")
                .message("Critical vulnerability")
                .filePath("pom.xml")
                .lineStart(5)
                .lineEnd(5)
                .build(), userId);

        scanPersistenceService.saveFinding(trivyRun, ScanFinding.builder()
                .ruleId("CVE-2024-5678")
                .severity(FindingSeverity.HIGH)
                .title("High CVE")
                .message("High vulnerability")
                .filePath("pom.xml")
                .lineStart(10)
                .lineEnd(10)
                .build(), userId);

        scanPersistenceService.saveFinding(gitleaksRun, ScanFinding.builder()
                .ruleId("generic-api-key")
                .severity(FindingSeverity.HIGH)
                .title("API Key Detected")
                .message("Generic API key")
                .filePath("config.yml")
                .lineStart(1)
                .lineEnd(1)
                .build(), userId);

        scanPersistenceService.completeToolRun(semgrepRun, 2, 1500L, 0, userId);
        scanPersistenceService.completeToolRun(trivyRun, 2, 3000L, 0, userId);
        scanPersistenceService.completeToolRun(gitleaksRun, 1, 800L, 0, userId);

        scanPersistenceService.completeScan(scan, userId);

        Scan completedScan = scanRepository.findById(scan.getId()).orElseThrow();

        assertThat(completedScan.getStatus()).isEqualTo(ScanStatus.COMPLETED);
        assertThat(completedScan.getTotalFindings()).isEqualTo(5);
        assertThat(completedScan.getCriticalCount()).isEqualTo(1);
        assertThat(completedScan.getHighCount()).isEqualTo(3);
        assertThat(completedScan.getMediumCount()).isEqualTo(1);
        assertThat(completedScan.getLowCount()).isZero();

        List<ScanToolRun> toolRuns = scanToolRunRepository.findAllByScanId(scan.getId());
        assertThat(toolRuns).hasSize(3);

        for (ScanToolRun toolRun : toolRuns) {
            List<ScanFinding> findings = scanFindingRepository.findAllByToolRunId(toolRun.getId());
            assertThat(findings).isNotEmpty();

            for (ScanFinding finding : findings) {
                assertThat(finding.getFingerprint()).isNotNull();
                assertThat(finding.getFingerprint()).hasSize(128);
                assertThat(finding.getCreatedAt()).isNotNull();
                assertThat(finding.getCreatedBy()).isEqualTo(userId);
            }
        }
    }

    @Test
    void scanWithErrors() {
        UUID jobId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();

        Scan scan = scanPersistenceService.createScan(
                jobId,
                UUID.randomUUID(),
                1L,
                "main",
                "def456abc123",
                ScanType.ALL,
                TriggerType.WEBHOOK,
                userId
        );

        ScanToolRun semgrepRun = scanPersistenceService.createToolRun(scan, ScannerType.SEMGREP, userId);
        ScanToolRun trivyRun = scanPersistenceService.createToolRun(scan, ScannerType.TRIVY, userId);

        scanPersistenceService.updateToolRunStatus(semgrepRun, ScanToolStatus.RUNNING, userId);
        scanPersistenceService.updateToolRunStatus(trivyRun, ScanToolStatus.RUNNING, userId);

        scanPersistenceService.saveFinding(semgrepRun, ScanFinding.builder()
                .ruleId("rule1")
                .severity(FindingSeverity.HIGH)
                .title("Finding 1")
                .message("Message 1")
                .filePath("file.java")
                .lineStart(1)
                .fingerprint("fp1")
                .build(), userId);

        scanPersistenceService.completeToolRun(semgrepRun, 1, 1000L, 0, userId);
        scanPersistenceService.failToolRun(trivyRun, "Trivy execution failed", userId);

        scanPersistenceService.completeScan(scan, ScanStatus.COMPLETED_WITH_ERRORS, userId);

        Scan updated = scanRepository.findById(scan.getId()).orElseThrow();
        assertThat(updated.getStatus()).isEqualTo(ScanStatus.COMPLETED_WITH_ERRORS);
    }

    @Test
    void scanFailure() {
        UUID jobId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();

        Scan scan = scanPersistenceService.createScan(
                jobId,
                UUID.randomUUID(),
                1L,
                "main",
                "badcommit",
                ScanType.SEMGREP,
                TriggerType.MANUAL,
                userId
        );

        scanPersistenceService.failScan(scan, "Git clone failed", userId);

        Scan failed = scanRepository.findById(scan.getId()).orElseThrow();
        assertThat(failed.getStatus()).isEqualTo(ScanStatus.FAILED);
        assertThat(failed.getErrorMessage()).isEqualTo("Git clone failed");
        assertThat(failed.getCompletedAt()).isNotNull();
    }

    @Test
    void jobIdUniqueness() {
        UUID jobId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();

        Scan scan1 = scanPersistenceService.createScan(
                jobId,
                UUID.randomUUID(),
                1L,
                "main",
                "sha1",
                ScanType.ALL,
                TriggerType.MANUAL,
                userId
        );

        assertThrows(Exception.class, () -> {
            scanPersistenceService.createScan(
                    jobId,
                    UUID.randomUUID(),
                    2L,
                    "develop",
                    "sha2",
                    ScanType.SEMGREP,
                    TriggerType.WEBHOOK,
                    userId
            );
        });

        Scan found = scanRepository.findByJobId(jobId).orElseThrow();
        assertThat(found.getId()).isEqualTo(scan1.getId());
    }

    @Test
    void cascadeDeletion() {
        UUID userId = UUID.randomUUID();

        Scan scan = scanPersistenceService.createScan(
                UUID.randomUUID(),
                UUID.randomUUID(),
                1L,
                "main",
                "sha1",
                ScanType.ALL,
                TriggerType.MANUAL,
                userId
        );

        ScanToolRun toolRun = scanPersistenceService.createToolRun(scan, ScannerType.SEMGREP, userId);

        scanPersistenceService.saveFinding(toolRun, ScanFinding.builder()
                .ruleId("rule1")
                .severity(FindingSeverity.HIGH)
                .title("Finding 1")
                .message("Message 1")
                .filePath("file.java")
                .lineStart(1)
                .fingerprint("fp1")
                .build(), userId);

        scanRepository.delete(scan);

        assertThat(scanRepository.findById(scan.getId())).isEmpty();
        assertThat(scanToolRunRepository.findById(toolRun.getId())).isEmpty();
    }

    @Test
    void lazyLoadingWorks() {
        UUID userId = UUID.randomUUID();

        Scan scan = scanPersistenceService.createScan(
                UUID.randomUUID(),
                UUID.randomUUID(),
                1L,
                "main",
                "sha1",
                ScanType.ALL,
                TriggerType.MANUAL,
                userId
        );

        ScanToolRun toolRun = scanPersistenceService.createToolRun(scan, ScannerType.SEMGREP, userId);

        scanPersistenceService.saveFinding(toolRun, ScanFinding.builder()
                .ruleId("rule1")
                .severity(FindingSeverity.HIGH)
                .title("Finding 1")
                .message("Message 1")
                .filePath("file.java")
                .lineStart(1)
                .fingerprint("fp1")
                .build(), userId);

        scanRepository.flush();
        scanToolRunRepository.flush();
        scanFindingRepository.flush();

        Scan managedScan = scanRepository.findById(scan.getId()).orElseThrow();

        assertThat(managedScan.getToolRuns()).hasSize(1);
        assertThat(managedScan.getToolRuns().get(0).getScannerType()).isEqualTo(ScannerType.SEMGREP);
        assertThat(managedScan.getToolRuns().get(0).getFindings()).hasSize(1);
    }
}
