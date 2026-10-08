package net.jqube.scanner.repositories;

import net.jqube.scanner.enums.*;
import net.jqube.scanner.models.scan.*;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
class ScanToolRunRepositoryTest {

    @Autowired
    private ScanRepository scanRepository;

    @Autowired
    private ScanToolRunRepository scanToolRunRepository;

    @Test
    void findByScanIdAndScannerType() {
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

        scanToolRunRepository.save(toolRun);

        Optional<ScanToolRun> found = scanToolRunRepository.findByScanIdAndScannerType(
                savedScan.getId(),
                ScannerType.SEMGREP
        );

        assertThat(found).isPresent();
        assertThat(found.get().getScannerType()).isEqualTo(ScannerType.SEMGREP);
    }

    @Test
    void uniqueConstraintPreventsDuplicateScanner() {
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

        ScanToolRun toolRun1 = ScanToolRun.builder()
                .scan(savedScan)
                .scannerType(ScannerType.SEMGREP)
                .status(ScanToolStatus.QUEUED)
                .build();

        scanToolRunRepository.save(toolRun1);

        ScanToolRun toolRun2 = ScanToolRun.builder()
                .scan(savedScan)
                .scannerType(ScannerType.SEMGREP)
                .status(ScanToolStatus.QUEUED)
                .build();

        try {
            scanToolRunRepository.save(toolRun2);
            assertThat(false).as("Should have thrown constraint violation").isTrue();
        } catch (Exception e) {
            assertThat(e).isInstanceOf(Exception.class);
        }
    }
}
