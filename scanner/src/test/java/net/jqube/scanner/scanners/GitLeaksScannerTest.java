package net.jqube.scanner.scanners;

import com.fasterxml.jackson.databind.ObjectMapper;
import net.jqube.scanner.configs.properties.ScannerProperties;
import net.jqube.scanner.exceptions.ScannerExecutionException;
import net.jqube.scanner.queues.messages.ScanFinding;
import net.jqube.scanner.process.ProcessExecutor;
import net.jqube.scanner.process.ProcessResult;
import net.jqube.scanner.scanners.impl.GitLeaksScanner;
import org.junit.jupiter.api.Test;

import java.lang.reflect.Field;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Duration;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.*;

class GitLeaksScannerTest {

    @Test
    void validResult() throws Exception {
        ProcessExecutor processExecutor = mock(ProcessExecutor.class);
        ScannerProperties properties = createScannerProperties();
        ObjectMapper objectMapper = new ObjectMapper();

        GitLeaksScanner scanner = new GitLeaksScanner(properties, processExecutor, objectMapper);

        String json = """
                [
                  {
                    "RuleID": "aws-access-key-id",
                    "Description": "AWS Access Key",
                    "File": "src/config/aws.yml",
                    "StartLine": 5,
                    "EndLine": 5,
                    "Secret": "AKIAIOSFODNN7EXAMPLE",
                    "Severity": "HIGH",
                    "Fingerprint": "fingerprint123"
                  }
                ]
                """;

        when(processExecutor.execute(anyList(), any(Path.class), any(Duration.class)))
                .thenReturn(new ProcessResult(0, json, ""));

        Path workspace = Files.createTempDirectory("workspace");
        ScannerOutput output = scanner.scan(workspace);

        assertNotNull(output);
        assertNotNull(output.findings());
        assertEquals(1, output.findings().size());
        ScanFinding finding = output.findings().get(0);
        assertEquals("Gitleaks", finding.scanner());
        assertEquals("aws-access-key-id", finding.ruleId());
        assertEquals("HIGH", finding.severity());
        assertEquals("src/config/aws.yml", finding.filePath());
        assertEquals(5, finding.lineStart());
        assertTrue(finding.message().contains("[REDACTED]"));
        assertFalse(finding.message().contains("AKIAIOSFODNN7EXAMPLE"));
    }

    @Test
    void emptyResult() throws Exception {
        ProcessExecutor processExecutor = mock(ProcessExecutor.class);
        ScannerProperties properties = createScannerProperties();
        ObjectMapper objectMapper = new ObjectMapper();

        GitLeaksScanner scanner = new GitLeaksScanner(properties, processExecutor, objectMapper);

        when(processExecutor.execute(anyList(), any(Path.class), any(Duration.class)))
                .thenReturn(new ProcessResult(0, "", ""));

        Path workspace = Files.createTempDirectory("workspace");
        ScannerOutput output = scanner.scan(workspace);

        assertNotNull(output);
        assertTrue(output.findings().isEmpty());
    }

    @Test
    void nonZeroExitCodeThrows() throws Exception {
        ProcessExecutor processExecutor = mock(ProcessExecutor.class);
        ScannerProperties properties = createScannerProperties();
        ObjectMapper objectMapper = new ObjectMapper();

        GitLeaksScanner scanner = new GitLeaksScanner(properties, processExecutor, objectMapper);

        when(processExecutor.execute(anyList(), any(Path.class), any(Duration.class)))
                .thenReturn(new ProcessResult(2, "", "error"));

        Path workspace = Files.createTempDirectory("workspace");

        assertThrows(
                ScannerExecutionException.class,
                () -> scanner.scan(workspace)
        );
    }

    private ScannerProperties createScannerProperties() throws Exception {
        ScannerProperties properties = new ScannerProperties();
        Field timeoutField = ScannerProperties.class.getDeclaredField("timeout");
        timeoutField.setAccessible(true);
        ScannerProperties.Timeout timeout = new ScannerProperties.Timeout();
        timeout.setGitleaks("10m");
        timeoutField.set(properties, timeout);

        Field toolsField = ScannerProperties.class.getDeclaredField("tools");
        toolsField.setAccessible(true);
        ScannerProperties.Tools tools = new ScannerProperties.Tools();
        tools.setGitleaks("gitleaks");
        toolsField.set(properties, tools);

        return properties;
    }
}
