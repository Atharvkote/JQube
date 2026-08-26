package net.jqube.scanner.scanners;

import net.jqube.scanner.configs.properties.ScannerProperties;
import net.jqube.scanner.enums.ScanType;
import net.jqube.scanner.queues.messages.ScanFinding;
import net.jqube.scanner.queues.messages.ScannerRunResult;
import net.jqube.scanner.process.ProcessExecutor;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

import java.lang.reflect.Field;
import java.nio.file.Path;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class ScannerOrchestratorTest {

    @Test
    void scanAll(@TempDir Path tempDir) throws Exception {
        SecurityScanner semgrep = mock(SecurityScanner.class);
        SecurityScanner trivy = mock(SecurityScanner.class);
        SecurityScanner gitleaks = mock(SecurityScanner.class);

        when(semgrep.getName()).thenReturn("Semgrep");
        when(trivy.getName()).thenReturn("Trivy");
        when(gitleaks.getName()).thenReturn("Gitleaks");

        when(semgrep.scan(any(Path.class))).thenReturn(List.of(
                new ScanFinding("Semgrep", "rule1", "HIGH", "Title1", "Msg1", "file1.java", 1, 1, null, "fp1")
        ));
        when(trivy.scan(any(Path.class))).thenReturn(List.of(
                new ScanFinding("Trivy", "CVE-1", "CRITICAL", "Title2", "Msg2", "file2.java", 2, 2, null, "fp2")
        ));
        when(gitleaks.scan(any(Path.class))).thenReturn(List.of(
                new ScanFinding("Gitleaks", "rule3", "HIGH", "Title3", "Msg3", "file3.yml", 3, 3, null, "fp3")
        ));

        ScannerProperties properties = createScannerProperties();
        ProcessExecutor processExecutor = mock(ProcessExecutor.class);

        ScannerOrchestrator orchestrator = new ScannerOrchestrator(
                List.of(semgrep, trivy, gitleaks),
                properties,
                processExecutor
        );

        List<ScannerRunResult> results = orchestrator.scan(tempDir, ScanType.ALL);

        List<ScanFinding> allFindings = results.stream()
                .flatMap(r -> r.findings().stream())
                .toList();

        assertEquals(3, allFindings.size());
        assertEquals(1, allFindings.stream().filter(f -> "CRITICAL".equals(f.severity())).count());
        assertEquals(2, allFindings.stream().filter(f -> "HIGH".equals(f.severity())).count());
    }

    @Test
    void scanSemgrepOnly(@TempDir Path tempDir) throws Exception {
        SecurityScanner semgrep = mock(SecurityScanner.class);
        SecurityScanner trivy = mock(SecurityScanner.class);
        SecurityScanner gitleaks = mock(SecurityScanner.class);

        when(semgrep.getName()).thenReturn("Semgrep");
        when(trivy.getName()).thenReturn("Trivy");
        when(gitleaks.getName()).thenReturn("Gitleaks");

        when(semgrep.scan(any(Path.class))).thenReturn(List.of(
                new ScanFinding("Semgrep", "rule1", "MEDIUM", "Title1", "Msg1", "file1.java", 1, 1, null, "fp1")
        ));
        when(trivy.scan(any(Path.class))).thenReturn(List.of());
        when(gitleaks.scan(any(Path.class))).thenReturn(List.of());

        ScannerProperties properties = createScannerProperties();
        ProcessExecutor processExecutor = mock(ProcessExecutor.class);

        ScannerOrchestrator orchestrator = new ScannerOrchestrator(
                List.of(semgrep, trivy, gitleaks),
                properties,
                processExecutor
        );

        List<ScannerRunResult> results = orchestrator.scan(tempDir, ScanType.SEMGREP);

        assertEquals(1, results.size());
        assertEquals("Semgrep", results.get(0).scanner());
        assertEquals(1, results.get(0).findings().size());

        verify(semgrep).scan(any(Path.class));
        verify(trivy, never()).scan(any(Path.class));
        verify(gitleaks, never()).scan(any(Path.class));
    }

    @Test
    void scanTrivyOnly(@TempDir Path tempDir) throws Exception {
        SecurityScanner semgrep = mock(SecurityScanner.class);
        SecurityScanner trivy = mock(SecurityScanner.class);
        SecurityScanner gitleaks = mock(SecurityScanner.class);

        when(semgrep.getName()).thenReturn("Semgrep");
        when(trivy.getName()).thenReturn("Trivy");
        when(gitleaks.getName()).thenReturn("Gitleaks");

        when(semgrep.scan(any(Path.class))).thenReturn(List.of());
        when(trivy.scan(any(Path.class))).thenReturn(List.of(
                new ScanFinding("Trivy", "CVE-1", "HIGH", "Title", "Msg", "file.java", 1, 1, null, "fp")
        ));
        when(gitleaks.scan(any(Path.class))).thenReturn(List.of());

        ScannerProperties properties = createScannerProperties();
        ProcessExecutor processExecutor = mock(ProcessExecutor.class);

        ScannerOrchestrator orchestrator = new ScannerOrchestrator(
                List.of(semgrep, trivy, gitleaks),
                properties,
                processExecutor
        );

        List<ScannerRunResult> results = orchestrator.scan(tempDir, ScanType.TRIVY);

        assertEquals(1, results.size());
        assertEquals("Trivy", results.get(0).scanner());
        assertEquals(1, results.get(0).findings().size());

        verify(trivy).scan(any(Path.class));
        verify(semgrep, never()).scan(any(Path.class));
        verify(gitleaks, never()).scan(any(Path.class));
    }

    @Test
    void scanGitleaksOnly(@TempDir Path tempDir) throws Exception {
        SecurityScanner semgrep = mock(SecurityScanner.class);
        SecurityScanner trivy = mock(SecurityScanner.class);
        SecurityScanner gitleaks = mock(SecurityScanner.class);

        when(semgrep.getName()).thenReturn("Semgrep");
        when(trivy.getName()).thenReturn("Trivy");
        when(gitleaks.getName()).thenReturn("Gitleaks");

        when(semgrep.scan(any(Path.class))).thenReturn(List.of());
        when(trivy.scan(any(Path.class))).thenReturn(List.of());
        when(gitleaks.scan(any(Path.class))).thenReturn(List.of(
                new ScanFinding("Gitleaks", "rule1", "HIGH", "Title", "Msg", "file.yml", 1, 1, null, "fp")
        ));

        ScannerProperties properties = createScannerProperties();
        ProcessExecutor processExecutor = mock(ProcessExecutor.class);

        ScannerOrchestrator orchestrator = new ScannerOrchestrator(
                List.of(semgrep, trivy, gitleaks),
                properties,
                processExecutor
        );

        List<ScannerRunResult> results = orchestrator.scan(tempDir, ScanType.GIT_LEAKS);

        assertEquals(1, results.size());
        assertEquals("Gitleaks", results.get(0).scanner());
        assertEquals(1, results.get(0).findings().size());

        verify(gitleaks).scan(any(Path.class));
        verify(semgrep, never()).scan(any(Path.class));
        verify(trivy, never()).scan(any(Path.class));
    }

    private ScannerProperties createScannerProperties() throws Exception {
        ScannerProperties properties = new ScannerProperties();
        Field timeoutField = ScannerProperties.class.getDeclaredField("timeout");
        timeoutField.setAccessible(true);
        ScannerProperties.Timeout timeout = new ScannerProperties.Timeout();
        timeout.setSemgrep("10m");
        timeout.setTrivy("10m");
        timeout.setGitleaks("10m");
        timeoutField.set(properties, timeout);

        Field toolsField = ScannerProperties.class.getDeclaredField("tools");
        toolsField.setAccessible(true);
        ScannerProperties.Tools tools = new ScannerProperties.Tools();
        tools.setSemgrep("semgrep");
        tools.setTrivy("trivy");
        tools.setGitleaks("gitleaks");
        toolsField.set(properties, tools);

        return properties;
    }
}
