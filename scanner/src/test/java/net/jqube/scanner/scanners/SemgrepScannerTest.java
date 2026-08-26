package net.jqube.scanner.scanners;

import com.fasterxml.jackson.databind.ObjectMapper;
import net.jqube.scanner.configs.properties.ScannerProperties;
import net.jqube.scanner.exceptions.ScannerExecutionException;
import net.jqube.scanner.exceptions.ScannerTimeoutException;
import net.jqube.scanner.queues.messages.ScanFinding;
import net.jqube.scanner.process.ProcessExecutor;
import net.jqube.scanner.process.ProcessResult;
import net.jqube.scanner.scanners.impl.SemgrepScanner;
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

class SemgrepScannerTest {

    @Test
    void validResult() throws Exception {
        ProcessExecutor processExecutor = mock(ProcessExecutor.class);
        ScannerProperties properties = createScannerProperties();
        ObjectMapper objectMapper = new ObjectMapper();

        SemgrepScanner scanner = new SemgrepScanner(properties, processExecutor, objectMapper);

        String json = """
                {
                  "results": [
                    {
                      "check_id": "sql-injection",
                      "extra": {
                        "severity": "ERROR",
                        "message": "Possible SQL injection",
                        "lines": "String query = request.getParameter(\\"q\\");",
                        "metadata": {
                          "title": "SQL Injection",
                          "fingerprint": "abc123"
                        }
                      },
                      "path": "src/main/java/App.java",
                      "start": {"line": 10},
                      "end": {"line": 12}
                    }
                  ]
                }
                """;

        when(processExecutor.execute(anyList(), any(Path.class), any(Duration.class)))
                .thenReturn(new ProcessResult(0, json, ""));

        Path workspace = Files.createTempDirectory("workspace");
        List<ScanFinding> findings = scanner.scan(workspace);

        assertEquals(1, findings.size());
        ScanFinding finding = findings.get(0);
        assertEquals("Semgrep", finding.scanner());
        assertEquals("sql-injection", finding.ruleId());
        assertEquals("HIGH", finding.severity());
        assertEquals("SQL Injection", finding.title());
        assertEquals("src/main/java/App.java", finding.filePath());
        assertEquals(10, finding.lineStart());
        assertEquals(12, finding.lineEnd());
    }

    @Test
    void emptyResult() throws Exception {
        ProcessExecutor processExecutor = mock(ProcessExecutor.class);
        ScannerProperties properties = createScannerProperties();
        ObjectMapper objectMapper = new ObjectMapper();

        SemgrepScanner scanner = new SemgrepScanner(properties, processExecutor, objectMapper);

        when(processExecutor.execute(anyList(), any(Path.class), any(Duration.class)))
                .thenReturn(new ProcessResult(0, "{}", ""));

        Path workspace = Files.createTempDirectory("workspace");
        List<ScanFinding> findings = scanner.scan(workspace);

        assertTrue(findings.isEmpty());
    }

    @Test
    void missingOptionalFields() throws Exception {
        ProcessExecutor processExecutor = mock(ProcessExecutor.class);
        ScannerProperties properties = createScannerProperties();
        ObjectMapper objectMapper = new ObjectMapper();

        SemgrepScanner scanner = new SemgrepScanner(properties, processExecutor, objectMapper);

        String json = """
                {
                  "results": [
                    {
                      "check_id": "rule-1",
                      "extra": {
                        "message": "test"
                      },
                      "path": "src/Test.java"
                    }
                  ]
                }
                """;

        when(processExecutor.execute(anyList(), any(Path.class), any(Duration.class)))
                .thenReturn(new ProcessResult(0, json, ""));

        Path workspace = Files.createTempDirectory("workspace");
        List<ScanFinding> findings = scanner.scan(workspace);

        assertEquals(1, findings.size());
        assertEquals("MEDIUM", findings.get(0).severity());
        assertNull(findings.get(0).lineStart());
        assertNull(findings.get(0).lineEnd());
    }

    @Test
    void nonZeroExitCodeThrows() throws Exception {
        ProcessExecutor processExecutor = mock(ProcessExecutor.class);
        ScannerProperties properties = createScannerProperties();
        ObjectMapper objectMapper = new ObjectMapper();

        SemgrepScanner scanner = new SemgrepScanner(properties, processExecutor, objectMapper);

        when(processExecutor.execute(anyList(), any(Path.class), any(Duration.class)))
                .thenReturn(new ProcessResult(2, "", "error"));

        Path workspace = Files.createTempDirectory("workspace");

        assertThrows(
                ScannerExecutionException.class,
                () -> scanner.scan(workspace)
        );
    }

    @Test
    void timeoutThrows() throws Exception {
        ProcessExecutor processExecutor = mock(ProcessExecutor.class);
        ScannerProperties properties = createScannerProperties();
        ObjectMapper objectMapper = new ObjectMapper();

        SemgrepScanner scanner = new SemgrepScanner(properties, processExecutor, objectMapper);

        when(processExecutor.execute(anyList(), any(Path.class), any(Duration.class)))
                .thenThrow(new ScannerTimeoutException("timeout"));

        Path workspace = Files.createTempDirectory("workspace");

        assertThrows(
                ScannerTimeoutException.class,
                () -> scanner.scan(workspace)
        );
    }

    private ScannerProperties createScannerProperties() throws Exception {
        ScannerProperties properties = new ScannerProperties();
        Field timeoutField = ScannerProperties.class.getDeclaredField("timeout");
        timeoutField.setAccessible(true);
        ScannerProperties.Timeout timeout = new ScannerProperties.Timeout();
        timeout.setSemgrep("10m");
        timeoutField.set(properties, timeout);

        Field toolsField = ScannerProperties.class.getDeclaredField("tools");
        toolsField.setAccessible(true);
        ScannerProperties.Tools tools = new ScannerProperties.Tools();
        tools.setSemgrep("semgrep");
        toolsField.set(properties, tools);

        return properties;
    }
}
