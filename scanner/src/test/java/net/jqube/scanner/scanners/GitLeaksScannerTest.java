package net.jqube.scanner.scanners;

import com.fasterxml.jackson.databind.ObjectMapper;
import net.jqube.scanner.configs.properties.ScannerProperties;
import net.jqube.scanner.exceptions.ScannerExecutionException;
import net.jqube.scanner.queues.messages.ScanFinding;
import net.jqube.scanner.process.ScannerContainerExecutor;
import net.jqube.scanner.process.ContainerExecutionResult;
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
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

class GitLeaksScannerTest {

    @Test
    void validResult() throws Exception {
        ScannerContainerExecutor containerExecutor = mock(ScannerContainerExecutor.class);
        ScannerProperties properties = createScannerProperties();
        ObjectMapper objectMapper = new ObjectMapper();

        GitLeaksScanner scanner = new GitLeaksScanner(properties, containerExecutor, objectMapper);

        String json = """
                [
                  {
                    "Description": "AWS Access Key",
                    "StartLine": 10,
                    "EndLine": 10,
                    "File": "config.yaml",
                    "RuleID": "aws-access-token",
                    "Secret": "AKIAIOSFODNN7EXAMPLE",
                    "Fingerprint": "abc12345"
                  }
                ]
                """;

        when(containerExecutor.execute(anyString(), anyList(), any(Path.class), any(Duration.class)))
                .thenAnswer(invocation -> {
                    Path workspace = invocation.getArgument(2);
                    Path rawPath = workspace.getParent().resolve("raw-results").resolve("gitleaks.json");
                    Files.createDirectories(rawPath.getParent());
                    Files.writeString(rawPath, json);
                    return new ContainerExecutionResult(1, "", "", 100, false, 0, 100);
                });

        Path workspace = Files.createTempDirectory("workspace").resolve("repository");
        ScannerOutput output = scanner.scan(workspace);

        assertNotNull(output);
        assertNotNull(output.findings());
        assertEquals(1, output.findings().size());
        ScanFinding finding = output.findings().get(0);
        assertNotNull(output);
        assertNotNull(output.findings());
        assertEquals(1, output.findings().size());
        ScanFinding finding = output.findings().get(0);
        assertEquals("Gitleaks", finding.scanner());
        assertEquals("aws-access-token", finding.ruleId());
        assertEquals("HIGH", finding.severity());
        assertEquals("config.yaml", finding.filePath());
        assertTrue(finding.message().contains("REDACTED"));
        assertFalse(finding.message().contains("AKIA"));
    }

    @Test
    void emptyResult() throws Exception {
        ScannerContainerExecutor containerExecutor = mock(ScannerContainerExecutor.class);
        ScannerProperties properties = createScannerProperties();
        ObjectMapper objectMapper = new ObjectMapper();

        GitLeaksScanner scanner = new GitLeaksScanner(properties, containerExecutor, objectMapper);

        when(containerExecutor.execute(anyString(), anyList(), any(Path.class), any(Duration.class)))
                .thenAnswer(invocation -> {
                    Path workspace = invocation.getArgument(2);
                    Path rawPath = workspace.getParent().resolve("raw-results").resolve("gitleaks.json");
                    Files.createDirectories(rawPath.getParent());
                    Files.writeString(rawPath, "[]");
                    return new ContainerExecutionResult(0, "", "", 100, false, 0, 100);
                });

        Path workspace = Files.createTempDirectory("workspace").resolve("repository");
        ScannerOutput output = scanner.scan(workspace);

        assertNotNull(output);
        assertTrue(output.findings().isEmpty());
        assertNotNull(output);
        assertTrue(output.findings().isEmpty());
    }

    @Test
    void nonZeroExitCodeThrows() throws Exception {
        ScannerContainerExecutor containerExecutor = mock(ScannerContainerExecutor.class);
        ScannerProperties properties = createScannerProperties();
        ObjectMapper objectMapper = new ObjectMapper();

        GitLeaksScanner scanner = new GitLeaksScanner(properties, containerExecutor, objectMapper);

        when(containerExecutor.execute(anyString(), anyList(), any(Path.class), any(Duration.class)))
                .thenReturn(new ContainerExecutionResult(2, "", "error", 100, false, 0, 100));

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
        timeout.setGitleaks("10m");
        timeoutField.set(properties, timeout);

        Field toolsField = ScannerProperties.class.getDeclaredField("tools");
        toolsField.setAccessible(true);
        ScannerProperties.Tools tools = new ScannerProperties.Tools();
        tools.setGitleaksImage("zricethezav/gitleaks:v8.18.1");
        toolsField.set(properties, tools);

        return properties;
    }
}
