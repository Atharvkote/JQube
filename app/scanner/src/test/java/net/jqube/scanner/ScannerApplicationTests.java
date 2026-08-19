package net.jqube.scanner;

import net.jqube.scanner.models.scan.FindingSeverity;
import net.jqube.scanner.models.scan.Scan;
import net.jqube.scanner.models.scan.ScanFinding;
import net.jqube.scanner.models.scan.ScanStatus;
import net.jqube.scanner.models.scan.ScanToolRun;
import net.jqube.scanner.models.scan.ScanToolStatus;
import net.jqube.scanner.models.scan.ScanType;
import net.jqube.scanner.models.scan.ScannerType;
import net.jqube.scanner.models.scan.TriggerType;
import net.jqube.scanner.repositories.ScanFindingRepository;
import net.jqube.scanner.repositories.ScanRepository;
import net.jqube.scanner.repositories.ScanToolRunRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.amqp.RabbitAutoConfiguration;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(
        classes = ScannerApplication.class,
        excludeAutoConfiguration = RabbitAutoConfiguration.class
)
@ActiveProfiles("test")
class ScannerApplicationTests {

    @Autowired
    private ScanRepository scanRepository;

    @Autowired
    private ScanToolRunRepository scanToolRunRepository;

    @Autowired
    private ScanFindingRepository scanFindingRepository;

    @Test
    @Transactional
    void contextLoads() {
        assertThat(scanRepository).isNotNull();
        assertThat(scanToolRunRepository).isNotNull();
        assertThat(scanFindingRepository).isNotNull();
    }

    @Test
    @Transactional
    void persistenceLayerRoundTrip() {
        UUID jobId = UUID.randomUUID();

        Scan scan = new Scan();
        scan.setJobId(jobId);
        scan.setQubeId(UUID.randomUUID());
        scan.setRepositoryId(12345L);
        scan.setBranch("main");
        scan.setCommitSha("abc123");
        scan.setScanType(ScanType.SEMGREP);
        scan.setTriggerType(TriggerType.MANUAL);
        scan.setStatus(ScanStatus.QUEUED);
        scan.setTotalFindings(0);
        scan.setCriticalCount(0);
        scan.setHighCount(0);
        scan.setMediumCount(0);
        scan.setLowCount(0);

        Scan savedScan = scanRepository.save(scan);
        assertThat(savedScan.getId()).isNotNull();
        assertThat(savedScan.getCreatedAt()).isNotNull();
        assertThat(savedScan.getUpdatedAt()).isNotNull();

        ScanToolRun semgrepRun = new ScanToolRun();
        semgrepRun.setScan(savedScan);
        semgrepRun.setScannerType(ScannerType.SEMGREP);
        semgrepRun.setStatus(ScanToolStatus.QUEUED);
        semgrepRun.setFindingCount(0);

        ScanToolRun savedRun = scanToolRunRepository.save(semgrepRun);
        assertThat(savedRun.getId()).isNotNull();

        ScanFinding finding = new ScanFinding();
        finding.setToolRun(savedRun);
        finding.setRuleId("java.sql-injection");
        finding.setSeverity(FindingSeverity.HIGH);
        finding.setTitle("SQL Injection");
        finding.setMessage("Possible SQL injection");
        finding.setFilePath("src/main/java/App.java");
        finding.setLineStart(10);
        finding.setLineEnd(20);
        finding.setFingerprint("abc-fingerprint");

        scanFindingRepository.save(finding);

        List<ScanFinding> findings = scanFindingRepository.findAllByToolRunId(savedRun.getId());
        assertThat(findings).hasSize(1);

        Scan persistedScan = scanRepository.findById(savedScan.getId()).orElseThrow();
        assertThat(persistedScan.getToolRuns()).hasSize(1);
        assertThat(persistedScan.getToolRuns().get(0).getFindings()).hasSize(1);

        ScanFinding persistedFinding = persistedScan.getToolRuns().get(0).getFindings().get(0);
        assertThat(persistedFinding.getSeverity()).isEqualTo(FindingSeverity.HIGH);
        assertThat(persistedFinding.getRuleId()).isEqualTo("java.sql-injection");
    }

    @Test
    @Transactional
    void cascadeDeleteWorks() {
        Scan scan = new Scan();
        scan.setJobId(UUID.randomUUID());
        scan.setQubeId(UUID.randomUUID());
        scan.setRepositoryId(1L);
        scan.setBranch("main");
        scan.setCommitSha("def456");
        scan.setScanType(ScanType.TRIVY);
        scan.setTriggerType(TriggerType.WEBHOOK);
        scan.setStatus(ScanStatus.QUEUED);
        scan.setTotalFindings(0);
        scan.setCriticalCount(0);
        scan.setHighCount(0);
        scan.setMediumCount(0);
        scan.setLowCount(0);

        Scan savedScan = scanRepository.save(scan);

        ScanToolRun run = new ScanToolRun();
        run.setScan(savedScan);
        run.setScannerType(ScannerType.TRIVY);
        run.setStatus(ScanToolStatus.QUEUED);
        run.setFindingCount(0);

        ScanToolRun savedRun = scanToolRunRepository.save(run);

        ScanFinding finding = new ScanFinding();
        finding.setToolRun(savedRun);
        finding.setRuleId("CVE-123");
        finding.setSeverity(FindingSeverity.CRITICAL);
        finding.setTitle("Critical CVE");
        finding.setMessage("CVE description");
        finding.setFilePath("pom.xml");
        finding.setFingerprint("def-fingerprint");

        scanFindingRepository.save(finding);

        UUID scanId = savedScan.getId();

        scanRepository.delete(savedScan);
        scanRepository.flush();

        assertThat(scanRepository.findById(scanId)).isEmpty();
        assertThat(scanToolRunRepository.findById(savedRun.getId())).isEmpty();
        assertThat(scanFindingRepository.findAll()).isEmpty();
    }

    @Test
    @Transactional
    void uniqueConstraintOnJobId() {
        UUID jobId = UUID.randomUUID();

        Scan scan1 = new Scan();
        scan1.setJobId(jobId);
        scan1.setQubeId(UUID.randomUUID());
        scan1.setRepositoryId(1L);
        scan1.setBranch("main");
        scan1.setCommitSha("aaa");
        scan1.setScanType(ScanType.SEMGREP);
        scan1.setTriggerType(TriggerType.MANUAL);
        scan1.setStatus(ScanStatus.QUEUED);
        scan1.setTotalFindings(0);
        scan1.setCriticalCount(0);
        scan1.setHighCount(0);
        scan1.setMediumCount(0);
        scan1.setLowCount(0);

        scanRepository.save(scan1);

        Scan scan2 = new Scan();
        scan2.setJobId(jobId);
        scan2.setQubeId(UUID.randomUUID());
        scan2.setRepositoryId(2L);
        scan2.setBranch("main");
        scan2.setCommitSha("bbb");
        scan2.setScanType(ScanType.TRIVY);
        scan2.setTriggerType(TriggerType.MANUAL);
        scan2.setStatus(ScanStatus.QUEUED);
        scan2.setTotalFindings(0);
        scan2.setCriticalCount(0);
        scan2.setHighCount(0);
        scan2.setMediumCount(0);
        scan2.setLowCount(0);

        try {
            scanRepository.save(scan2);
            assertThat(false).as("Should have thrown a constraint violation").isTrue();
        } catch (Exception e) {
            assertThat(e).isInstanceOf(Exception.class);
        }
    }

    @Test
    @Transactional
    void uniqueConstraintOnScanAndScannerType() {
        Scan scan = new Scan();
        scan.setJobId(UUID.randomUUID());
        scan.setQubeId(UUID.randomUUID());
        scan.setRepositoryId(1L);
        scan.setBranch("main");
        scan.setCommitSha("ccc");
        scan.setScanType(ScanType.GIT_LEAKS);
        scan.setTriggerType(TriggerType.MANUAL);
        scan.setStatus(ScanStatus.QUEUED);
        scan.setTotalFindings(0);
        scan.setCriticalCount(0);
        scan.setHighCount(0);
        scan.setMediumCount(0);
        scan.setLowCount(0);

        Scan savedScan = scanRepository.save(scan);

        ScanToolRun run1 = new ScanToolRun();
        run1.setScan(savedScan);
        run1.setScannerType(ScannerType.SEMGREP);
        run1.setStatus(ScanToolStatus.QUEUED);
        run1.setFindingCount(0);

        scanToolRunRepository.save(run1);

        ScanToolRun run2 = new ScanToolRun();
        run2.setScan(savedScan);
        run2.setScannerType(ScannerType.SEMGREP);
        run2.setStatus(ScanToolStatus.QUEUED);
        run2.setFindingCount(0);

        try {
            scanToolRunRepository.save(run2);
            assertThat(false).as("Should have thrown a constraint violation").isTrue();
        } catch (Exception e) {
            assertThat(e).isInstanceOf(Exception.class);
        }
    }
}
