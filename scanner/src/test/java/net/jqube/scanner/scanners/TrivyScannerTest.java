package net.jqube.scanner.scanners;

import com.fasterxml.jackson.databind.ObjectMapper;
import net.jqube.scanner.configs.properties.ScannerProperties;
import net.jqube.scanner.exceptions.ScannerExecutionException;
import net.jqube.scanner.queues.messages.ScanFinding;
import net.jqube.scanner.process.ProcessExecutor;
import net.jqube.scanner.process.ProcessResult;
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
import static org.mockito.Mockito.*;

class TrivyScannerTest {

    @Test
    void validResult() throws Exception {
        ProcessExecutor processExecutor = mock(ProcessExecutor.class);
        ScannerProperties properties = createScannerProperties();
        ObjectMapper objectMapper = new ObjectMapper();

        TrivyScanner scanner = new TrivyScanner(properties, processExecutor, objectMapper);

        String json = """
                [
                  {
                    "Results": [
                      {
                        "Target": "src/main/java/App.java",
                        "Vulnerabilities": [
                          {
                            "VulnerabilityID": "CVE-2021-44228",
                            "Severity": "CRITICAL",
                            "Title": "Apache Log4j2 RCE",
                            "Description": "RCE via JNDI",
                            "PkgName": "log4j-core",
                            "InstalledVersion": "2.14.0",
                            "FixedVersion": "2.15.0"
                          }
                        ],
                        "Misconfigurations": [
                          {
                            "ID": "AVD-AWS-0001",
                            "Severity": "HIGH",
                            "Title": "S3 bucket is public",
                            "Description": "S3 bucket should not be public"
                          }
                        ],
                        "Secrets": [
                          {
                            "RuleID": "aws-access-key-id",
                            "Severity": "HIGH",
                            "Title": "AWS Access Key",
                            "Description": "AWS Access Key detected",
                            "Category": "aws",
                            "Match": "AKIAIOSFODNN7EXAMPLE"
                          }
                        ]
                      }
                    ]
                  }
                ]
                """;

        when(processExecutor.execute(anyList(), any(Path.class), any(Duration.class)))
                .thenReturn(new ProcessResult(0, json, ""));

        Path workspace = Files.createTempDirectory("workspace");
        ScannerOutput output = scanner.scan(workspace);

        assertNotNull(output);
        assertNotNull(output.findings());
        assertEquals(3, output.findings().size());

        ScanFinding vuln = output.findings().get(0);
        assertEquals("Trivy", vuln.scanner());
        assertEquals("CVE-2021-44228", vuln.ruleId());
        assertEquals("CRITICAL", vuln.severity());
        assertEquals("Apache Log4j2 RCE", vuln.title());

        ScanFinding misconfig = output.findings().get(1);
        assertEquals("AVD-AWS-0001", misconfig.ruleId());
        assertEquals("HIGH", misconfig.severity());

        ScanFinding secret = output.findings().get(2);
        assertEquals("aws-access-key-id", secret.ruleId());
        assertTrue(secret.message().contains("[REDACTED]"));
        assertFalse(secret.message().contains("AKIAIOSFODNN7EXAMPLE"));
    }

    @Test
    void emptyResult() throws Exception {
        ProcessExecutor processExecutor = mock(ProcessExecutor.class);
        ScannerProperties properties = createScannerProperties();
        ObjectMapper objectMapper = new ObjectMapper();

        TrivyScanner scanner = new TrivyScanner(properties, processExecutor, objectMapper);

        when(processExecutor.execute(anyList(), any(Path.class), any(Duration.class)))
                .thenReturn(new ProcessResult(0, "{}", ""));

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

        TrivyScanner scanner = new TrivyScanner(properties, processExecutor, objectMapper);

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
        timeout.setTrivy("10m");
        timeoutField.set(properties, timeout);

        Field toolsField = ScannerProperties.class.getDeclaredField("tools");
        toolsField.setAccessible(true);
        ScannerProperties.Tools tools = new ScannerProperties.Tools();
        tools.setTrivy("trivy");
        toolsField.set(properties, tools);

        return properties;
    }
}
