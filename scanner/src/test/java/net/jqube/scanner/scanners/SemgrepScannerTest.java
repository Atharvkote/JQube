package net.jqube.scanner.scanners;

import com.fasterxml.jackson.databind.ObjectMapper;
import net.jqube.scanner.configs.properties.ScannerProperties;
import net.jqube.scanner.exceptions.ScannerExecutionException;
import net.jqube.scanner.exceptions.ScannerTimeoutException;
import net.jqube.scanner.queues.messages.ScanFinding;
import net.jqube.scanner.process.ScannerContainerExecutor;
import net.jqube.scanner.process.ContainerExecutionResult;
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
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

class SemgrepScannerTest {

    @Test
    void validResult() throws Exception {
        ScannerContainerExecutor containerExecutor = mock(ScannerContainerExecutor.class);
        ScannerProperties properties = createScannerProperties();
        ObjectMapper objectMapper = new ObjectMapper();

        SemgrepScanner scanner = new SemgrepScanner(properties, containerExecutor, objectMapper);

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

        when(containerExecutor.execute(anyString(), anyList(), any(Path.class), any(Duration.class)))
                .thenAnswer(invocation -> {
                    Path workspace = invocation.getArgument(2);
                    Path rawPath = workspace.getParent().resolve("raw-results").resolve("semgrep.json");
                    Files.createDirectories(rawPath.getParent());
                    Files.writeString(rawPath, json);
                    return new ContainerExecutionResult(0, "", "", 100, false, 0, 100);
                });

        Path workspace = Files.createTempDirectory("workspace").resolve("repository");
        ScannerOutput output = scanner.scan(workspace);

        assertNotNull(output);
        assertNotNull(output.findings());
        assertEquals(1, output.findings().size());
        ScanFinding finding = output.findings().get(0);
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
        ScannerContainerExecutor containerExecutor = mock(ScannerContainerExecutor.class);
        ScannerProperties properties = createScannerProperties();
        ObjectMapper objectMapper = new ObjectMapper();

        SemgrepScanner scanner = new SemgrepScanner(properties, containerExecutor, objectMapper);

        when(containerExecutor.execute(anyString(), anyList(), any(Path.class), any(Duration.class)))
                .thenAnswer(invocation -> {
                    Path workspace = invocation.getArgument(2);
                    Path rawPath = workspace.getParent().resolve("raw-results").resolve("semgrep.json");
                    Files.createDirectories(rawPath.getParent());
                    Files.writeString(rawPath, "{}");
                    return new ContainerExecutionResult(0, "", "", 100, false, 0, 100);
                });

        Path workspace = Files.createTempDirectory("workspace").resolve("repository");
        ScannerOutput output = scanner.scan(workspace);

        assertNotNull(output);
        assertTrue(output.findings().isEmpty());
    }

    @Test
    void nonZeroExitCodeThrows() throws Exception {
        ScannerContainerExecutor containerExecutor = mock(ScannerContainerExecutor.class);
        ScannerProperties properties = createScannerProperties();
        ObjectMapper objectMapper = new ObjectMapper();

        SemgrepScanner scanner = new SemgrepScanner(properties, containerExecutor, objectMapper);

        when(containerExecutor.execute(anyString(), anyList(), any(Path.class), any(Duration.class)))
                .thenReturn(new ContainerExecutionResult(2, "", "error", 100, false, 0, 100));

        Path workspace = Files.createTempDirectory("workspace").resolve("repository");

        assertThrows(
                ScannerExecutionException.class,
                () -> scanner.scan(workspace)
        );
    }

    @Test
    void timeoutThrows() throws Exception {
        ScannerContainerExecutor containerExecutor = mock(ScannerContainerExecutor.class);
        ScannerProperties properties = createScannerProperties();
        ObjectMapper objectMapper = new ObjectMapper();

        SemgrepScanner scanner = new SemgrepScanner(properties, containerExecutor, objectMapper);

        when(containerExecutor.execute(anyString(), anyList(), any(Path.class), any(Duration.class)))
                .thenReturn(new ContainerExecutionResult(-1, "", "timeout", 1000, true, 0, 1000));

        Path workspace = Files.createTempDirectory("workspace").resolve("repository");

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
        timeout.setSemgrep("10m");
        timeoutField.set(properties, timeout);

        Field toolsField = ScannerProperties.class.getDeclaredField("tools");
        toolsField.setAccessible(true);
        ScannerProperties.Tools tools = new ScannerProperties.Tools();
        tools.setSemgrepImage("semgrep/semgrep:1.80.0");
        toolsField.set(properties, tools);

        return properties;
    }
}
