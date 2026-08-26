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
class ScanRepositoryTest {

    @Autowired
    private ScanRepository scanRepository;

    @Autowired
    private ScanToolRunRepository scanToolRunRepository;

    @Test
    void createsScan() {
        UUID jobId = UUID.randomUUID();

        Scan scan = Scan.builder()
                .jobId(jobId)
                .qubeId(UUID.randomUUID())
                .repositoryId(1L)
                .branch("main")
                .commitSha("abc123")
                .scanType(ScanType.ALL)
                .triggerType(TriggerType.MANUAL)
                .status(ScanStatus.QUEUED)
                .build();

        Scan saved = scanRepository.save(scan);

        assertThat(saved.getId()).isNotNull();
        assertThat(saved.getCreatedAt()).isNotNull();
        assertThat(saved.getUpdatedAt()).isNotNull();
    }

    @Test
    void findByJobId() {
        UUID jobId = UUID.randomUUID();

        Scan scan = Scan.builder()
                .jobId(jobId)
                .qubeId(UUID.randomUUID())
                .repositoryId(1L)
                .branch("main")
                .commitSha("abc123")
                .scanType(ScanType.SEMGREP)
                .triggerType(TriggerType.WEBHOOK)
                .status(ScanStatus.QUEUED)
                .build();

        scanRepository.save(scan);

        Optional<Scan> found = scanRepository.findByJobId(jobId);

        assertThat(found).isPresent();
        assertThat(found.get().getScanType()).isEqualTo(ScanType.SEMGREP);
    }

    @Test
    void existsByJobId() {
        UUID jobId = UUID.randomUUID();

        Scan scan = Scan.builder()
                .jobId(jobId)
                .qubeId(UUID.randomUUID())
                .repositoryId(1L)
                .branch("main")
                .commitSha("abc123")
                .scanType(ScanType.ALL)
                .triggerType(TriggerType.MANUAL)
                .status(ScanStatus.QUEUED)
                .build();

        scanRepository.save(scan);

        assertThat(scanRepository.existsByJobId(jobId)).isTrue();
        assertThat(scanRepository.existsByJobId(UUID.randomUUID())).isFalse();
    }

    @Test
    void cascadeDeletesToolRuns() {
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

        scanRepository.delete(savedScan);

        assertThat(scanRepository.findById(savedScan.getId())).isEmpty();
        assertThat(scanToolRunRepository.findById(toolRun.getId())).isEmpty();
    }
}
