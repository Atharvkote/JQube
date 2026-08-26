package net.jqube.scanner.scanners.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import net.jqube.scanner.configs.properties.ScannerProperties;
import net.jqube.scanner.exceptions.ScannerExecutionException;
import net.jqube.scanner.exceptions.ScannerOutputParseException;
import net.jqube.scanner.queues.messages.ScanFinding;
import net.jqube.scanner.process.ProcessExecutor;
import net.jqube.scanner.process.ProcessResult;
import net.jqube.scanner.scanners.SecurityScanner;
import org.springframework.stereotype.Component;

import java.nio.file.Path;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Component
public class SemgrepScanner implements SecurityScanner {

    private final ScannerProperties scannerProperties;
    private final ProcessExecutor processExecutor;
    private final ObjectMapper objectMapper;

    public SemgrepScanner(ScannerProperties scannerProperties, ProcessExecutor processExecutor, ObjectMapper objectMapper) {
        this.scannerProperties = scannerProperties;
        this.processExecutor = processExecutor;
        this.objectMapper = objectMapper;
    }

    @Override
    public String getName() {
        return "Semgrep";
    }

    @Override
    public List<ScanFinding> scan(Path workspace) {
        List<String> command = List.of(
                scannerProperties.getTools().getSemgrep(),
                "scan",
                "--json",
                "--config",
                "auto",
                workspace.toString()
        );

        Duration timeout = scannerProperties.getTimeout().getSemgrepDuration();

        ProcessResult result = processExecutor.execute(command, workspace, timeout);

        if (result.exitCode() != 0 && result.exitCode() != 1) {
            throw new ScannerExecutionException(
                    "Semgrep execution failed with exit code " + result.exitCode() +
                            ": " + result.stderr()
            );
        }

        if (result.stdout() == null || result.stdout().isBlank()) {
            return List.of();
        }

        try {
            JsonNode root = objectMapper.readTree(result.stdout());
            JsonNode results = root.path("results");

            if (!results.isArray()) {
                return List.of();
            }

            List<ScanFinding> findings = new ArrayList<>();

            for (JsonNode node : results) {
                ScanFinding finding = mapFinding(node);
                if (finding != null) {
                    findings.add(finding);
                }
            }

            return findings;

        } catch (Exception e) {
            throw new ScannerOutputParseException(
                    "Failed to parse Semgrep JSON output",
                    e
            );
        }
    }

    private ScanFinding mapFinding(JsonNode node) {
        try {
            String ruleId = node.path("check_id").asText(null);
            if (ruleId == null || ruleId.isBlank()) {
                return null;
            }

            String severity = mapSeverity(node.path("extra").path("severity").asText(null));
            if (severity == null || severity.isBlank()) {
                severity = "MEDIUM";
            }

            String message = node.path("extra").path("message").asText(null);
            String title = node.path("extra").path("metadata").path("title").asText(null);
            if (title == null || title.isBlank()) {
                title = ruleId;
            }

            String filePath = node.path("path").asText(null);
            Integer lineStart = node.path("start").path("line").isInt()
                    ? node.path("start").path("line").asInt()
                    : null;
            Integer lineEnd = node.path("end").path("line").isInt()
                    ? node.path("end").path("line").asInt()
                    : null;

            String code = node.path("extra").path("lines").asText(null);

            String fingerprint = node.path("extra").path("metadata").path("fingerprint").asText(null);
            if (fingerprint == null || fingerprint.isBlank()) {
                fingerprint = ruleId + "|" + filePath + "|" + lineStart;
            }

            return new ScanFinding(
                    "Semgrep",
                    ruleId,
                    severity,
                    title,
                    message,
                    filePath,
                    lineStart,
                    lineEnd,
                    code,
                    fingerprint
            );

        } catch (Exception e) {
            log.warn("Failed to map Semgrep finding", e);
            return null;
        }
    }

    private String mapSeverity(String semgrepSeverity) {
        if (semgrepSeverity == null || semgrepSeverity.isBlank()) {
            return "MEDIUM";
        }

        return switch (semgrepSeverity.toUpperCase()) {
            case "CRITICAL", "HIGH", "MEDIUM", "LOW" -> semgrepSeverity.toUpperCase();
            case "ERROR" -> "HIGH";
            case "WARNING" -> "MEDIUM";
            case "INFO" -> "LOW";
            default -> "MEDIUM";
        };
    }
}
