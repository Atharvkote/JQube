package net.jqube.scanner.repositories;

import net.jqube.scanner.enums.*;
import net.jqube.scanner.models.scan.*;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
class ScanFindingRepositoryTest {

    @Autowired
    private ScanRepository scanRepository;

    @Autowired
    private ScanToolRunRepository scanToolRunRepository;

    @Autowired
    private ScanFindingRepository scanFindingRepository;

    @Test
    void findAllByToolRunId() {
        Scan scan = Scan.builder()
                .jobId(UUID.randomUUID())
                .qubeId(UUID.randomUUID())
                .repositoryId(1L)
                .branch("main")
                .commitSha("abc123")
                .scanType(ScanType.ALL)
                .triggerType(TriggerType.MANUAL)
                .status(ScanStatus.QUEUED)
                .build();

        Scan savedScan = scanRepository.save(scan);

        ScanToolRun toolRun = ScanToolRun.builder()
                .scan(savedScan)
                .scannerType(ScannerType.SEMGREP)
                .status(ScanToolStatus.QUEUED)
                .build();

        ScanToolRun savedToolRun = scanToolRunRepository.save(toolRun);

        ScanFinding finding1 = ScanFinding.builder()
                .toolRun(savedToolRun)
                .ruleId("rule1")
                .severity(FindingSeverity.HIGH)
                .title("Title 1")
                .message("Message 1")
                .filePath("file1.java")
                .lineStart(10)
                .lineEnd(10)
                .fingerprint("fp1")
                .build();

        ScanFinding finding2 = ScanFinding.builder()
                .toolRun(savedToolRun)
                .ruleId("rule2")
                .severity(FindingSeverity.MEDIUM)
                .title("Title 2")
                .message("Message 2")
                .filePath("file2.java")
                .lineStart(20)
                .lineEnd(20)
                .fingerprint("fp2")
                .build();

        scanFindingRepository.save(finding1);
        scanFindingRepository.save(finding2);

        List<ScanFinding> findings = scanFindingRepository.findAllByToolRunId(savedToolRun.getId());

        assertThat(findings).hasSize(2);
    }

    @Test
    void countByToolRunId() {
        Scan scan = Scan.builder()
                .jobId(UUID.randomUUID())
                .qubeId(UUID.randomUUID())
                .repositoryId(1L)
                .branch("main")
                .commitSha("abc123")
                .scanType(ScanType.ALL)
                .triggerType(TriggerType.MANUAL)
                .status(ScanStatus.QUEUED)
                .build();

        Scan savedScan = scanRepository.save(scan);

        ScanToolRun toolRun = ScanToolRun.builder()
                .scan(savedScan)
                .scannerType(ScannerType.SEMGREP)
                .status(ScanToolStatus.QUEUED)
                .build();

        ScanToolRun savedToolRun = scanToolRunRepository.save(toolRun);

        scanFindingRepository.save(ScanFinding.builder()
                .toolRun(savedToolRun)
                .ruleId("rule1")
                .severity(FindingSeverity.HIGH)
                .title("Title 1")
                .message("Message 1")
                .filePath("file1.java")
                .lineStart(10)
                .fingerprint("fp1")
                .build());

        scanFindingRepository.save(ScanFinding.builder()
                .toolRun(savedToolRun)
                .ruleId("rule2")
                .severity(FindingSeverity.MEDIUM)
                .title("Title 2")
                .message("Message 2")
                .filePath("file2.java")
                .lineStart(20)
                .fingerprint("fp2")
                .build());

        long count = scanFindingRepository.countByToolRunId(savedToolRun.getId());

        assertThat(count).isEqualTo(2);
    }
}
