package net.jqube.scanner.scanners;

import com.fasterxml.jackson.databind.ObjectMapper;
import net.jqube.scanner.configs.properties.ScannerProperties;
import net.jqube.scanner.exceptions.ScannerExecutionException;
import net.jqube.scanner.queues.messages.ScanFinding;
import net.jqube.scanner.process.ScannerContainerExecutor;
import net.jqube.scanner.process.ContainerExecutionResult;
import net.jqube.scanner.scanners.impl.TrivyScanner;
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

class TrivyScannerTest {

    @Test
    void validResult() throws Exception {
        ScannerContainerExecutor containerExecutor = mock(ScannerContainerExecutor.class);
        ScannerProperties properties = createScannerProperties();
        ObjectMapper objectMapper = new ObjectMapper();

        TrivyScanner scanner = new TrivyScanner(properties, containerExecutor, objectMapper);

        String json = """
                {
                  "Results": [
                    {
                      "Target": "app/pom.xml",
                      "Vulnerabilities": [
                        {
                          "VulnerabilityID": "CVE-2023-1234",
                          "Severity": "CRITICAL",
                          "Title": "Test Vulnerability",
                          "Description": "Test description",
                          "PkgName": "test-pkg",
                          "InstalledVersion": "1.0.0",
                          "FixedVersion": "1.0.1"
                        }
                      ]
                    }
                  ]
                }
                """;

        when(containerExecutor.execute(anyString(), anyList(), any(Path.class), any(Duration.class)))
                .thenAnswer(invocation -> {
                    Path workspace = invocation.getArgument(2);
                    Path rawPath = workspace.getParent().resolve("raw-results").resolve("trivy.json");
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
        assertEquals("Trivy", finding.scanner());
        assertEquals("CVE-2023-1234", finding.ruleId());
        assertEquals("CRITICAL", finding.severity());
        assertEquals("app/pom.xml", finding.filePath());
    }

    @Test
    void emptyResult() throws Exception {
        ScannerContainerExecutor containerExecutor = mock(ScannerContainerExecutor.class);
        ScannerProperties properties = createScannerProperties();
        ObjectMapper objectMapper = new ObjectMapper();

        TrivyScanner scanner = new TrivyScanner(properties, containerExecutor, objectMapper);

        when(containerExecutor.execute(anyString(), anyList(), any(Path.class), any(Duration.class)))
                .thenAnswer(invocation -> {
                    Path workspace = invocation.getArgument(2);
                    Path rawPath = workspace.getParent().resolve("raw-results").resolve("trivy.json");
                    Files.createDirectories(rawPath.getParent());
                    Files.writeString(rawPath, "[]");
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

        TrivyScanner scanner = new TrivyScanner(properties, containerExecutor, objectMapper);

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
        timeout.setTrivy("10m");
        timeoutField.set(properties, timeout);

        Field toolsField = ScannerProperties.class.getDeclaredField("tools");
        toolsField.setAccessible(true);
        ScannerProperties.Tools tools = new ScannerProperties.Tools();
        tools.setTrivyImage("aquasec/trivy:0.48.3");
        toolsField.set(properties, tools);

        return properties;
    }
}
