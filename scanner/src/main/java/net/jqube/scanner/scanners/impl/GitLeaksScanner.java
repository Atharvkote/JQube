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
public class GitLeaksScanner implements SecurityScanner {

    private final ScannerProperties scannerProperties;
    private final ProcessExecutor processExecutor;
    private final ObjectMapper objectMapper;

    public GitLeaksScanner(ScannerProperties scannerProperties, ProcessExecutor processExecutor, ObjectMapper objectMapper) {
        this.scannerProperties = scannerProperties;
        this.processExecutor = processExecutor;
        this.objectMapper = objectMapper;
    }

    @Override
    public String getName() {
        return "Gitleaks";
    }

    @Override
    public List<ScanFinding> scan(Path workspace) {
        List<String> command = List.of(
                scannerProperties.getTools().getGitleaks(),
                "detect",
                "--source",
                workspace.toString(),
                "--report-format",
                "json",
                "--no-git"
        );

        Duration timeout = scannerProperties.getTimeout().getGitleaksDuration();

        ProcessResult result = processExecutor.execute(command, workspace, timeout);

        if (result.exitCode() != 0 && result.exitCode() != 1) {
            throw new ScannerExecutionException(
                    "Gitleaks execution failed with exit code " + result.exitCode() +
                            ": " + result.stderr()
            );
        }

        if (result.stdout() == null || result.stdout().isBlank()) {
            log.info("Gitleaks completed with no findings");
            return List.of();
        }

        try {
            JsonNode root = objectMapper.readTree(result.stdout());

            if (!root.isArray()) {
                return List.of();
            }

            List<ScanFinding> findings = new ArrayList<>();

            for (JsonNode node : root) {
                ScanFinding finding = mapFinding(node);
                if (finding != null) {
                    findings.add(finding);
                }
            }

            return findings;

        } catch (Exception e) {
            throw new ScannerOutputParseException(
                    "Failed to parse Gitleaks JSON output",
                    e
            );
        }
    }

    private ScanFinding mapFinding(JsonNode node) {
        try {
            String description = node.path("Description").asText(null);
            String filePath = node.path("File").asText(null);
            Integer lineStart = node.path("StartLine").isInt()
                    ? node.path("StartLine").asInt()
                    : null;
            Integer lineEnd = node.path("EndLine").isInt()
                    ? node.path("EndLine").asInt()
                    : lineStart;

            String ruleId = node.path("RuleID").asText(null);
            if (ruleId == null || ruleId.isBlank()) {
                ruleId = node.path("id").asText(null);
            }

            String severity = mapSeverity(node.path("Severity").asText(null));
            if (severity == null || severity.isBlank()) {
                severity = "HIGH";
            }

            String secret = node.path("Secret").asText(null);
            String message;
            if (secret != null && !secret.isBlank()) {
                message = description + " [REDACTED]";
            } else {
                message = description;
            }

            String fingerprint = node.path("Fingerprint").asText(null);
            if (fingerprint == null || fingerprint.isBlank()) {
                fingerprint = ruleId + "|" + filePath + "|" + lineStart;
            }

            log.info(
                    "Gitleaks finding detected in file={}, ruleId={}, severity={}",
                    filePath,
                    ruleId,
                    severity
            );

            return new ScanFinding(
                    "Gitleaks",
                    ruleId,
                    severity,
                    description,
                    message,
                    filePath,
                    lineStart,
                    lineEnd,
                    null,
                    fingerprint
            );

        } catch (Exception e) {
            log.warn("Failed to map Gitleaks finding", e);
            return null;
        }
    }

    private String mapSeverity(String gitleaksSeverity) {
        if (gitleaksSeverity == null || gitleaksSeverity.isBlank()) {
            return "HIGH";
        }

        return switch (gitleaksSeverity.toUpperCase()) {
            case "CRITICAL", "HIGH", "MEDIUM", "LOW" -> gitleaksSeverity.toUpperCase();
            default -> "HIGH";
        };
    }
}
