package net.jqube.scanner.scanners.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import net.jqube.scanner.configs.properties.ScannerProperties;
import net.jqube.scanner.exceptions.ScannerExecutionException;
import net.jqube.scanner.exceptions.ScannerOutputParseException;
import net.jqube.scanner.queues.messages.ScanFinding;
import net.jqube.scanner.process.ScannerContainerExecutor;
import net.jqube.scanner.process.ContainerExecutionResult;
import net.jqube.scanner.scanners.SecurityScanner;
import net.jqube.scanner.scanners.ScannerOutput;
import org.springframework.stereotype.Component;

import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Component
public class TrivyScanner implements SecurityScanner {

    private final ScannerProperties scannerProperties;
    private final ScannerContainerExecutor containerExecutor;
    private final ObjectMapper objectMapper;

    public TrivyScanner(ScannerProperties scannerProperties, ScannerContainerExecutor containerExecutor, ObjectMapper objectMapper) {
        this.scannerProperties = scannerProperties;
        this.containerExecutor = containerExecutor;
        this.objectMapper = objectMapper;
    }

    @Override
    public String getName() {
        return "Trivy";
    }

    @Override
    public ScannerOutput scan(Path workspace) {
        Path rawDir = workspace.getParent().resolve("raw-results");
        try {
            Files.createDirectories(rawDir);
        } catch (Exception e) {
            log.error("Failed to create raw results directory", e);
        }
        Path rawPath = rawDir.resolve("trivy.json");

        List<String> command = List.of(
                "fs",
                "--format",
                "json",
                "--output",
                "/results/trivy.json",
                "--security-checks",
                "vuln,misconfig,secret",
                "/src"
        );

        Duration timeout = scannerProperties.getTimeout().getTrivyDuration();
        String image = scannerProperties.getTools().getTrivyImage();

        ContainerExecutionResult result = containerExecutor.execute(image, command, workspace, timeout);

        if (result.timedOut()) {
            throw new ScannerExecutionException("Trivy execution timed out after " + timeout);
        }

        if (result.exitCode() != 0 && result.exitCode() != 1) {
            throw new ScannerExecutionException(
                    "Trivy container failed with exit code " + result.exitCode() +
                            ": " + result.stderr()
            );
        }

        if (!Files.exists(rawPath)) {
            return new ScannerOutput(List.of(), null, result.exitCode());
        }

        try {
            JsonNode root = objectMapper.readTree(rawPath.toFile());
            List<ScanFinding> findings = new ArrayList<>();

            if (root.isArray()) {
                for (JsonNode resultNode : root) {
                    findings.addAll(mapResult(resultNode, workspace));
                }
            } else {
                findings.addAll(mapResult(root, workspace));
            }

            return new ScannerOutput(findings, rawPath.toString(), result.exitCode());

        } catch (Exception e) {
            throw new ScannerOutputParseException(
                    "Failed to parse Trivy JSON output",
                    e
            );
        }
    }

    private List<ScanFinding> mapResult(JsonNode resultNode, Path workspace) {
        List<ScanFinding> findings = new ArrayList<>();

        JsonNode results = resultNode.path("Results");
        if (!results.isArray()) {
            return findings;
        }

        for (JsonNode result : results) {
            String target = result.path("Target").asText(null);

            JsonNode vulnerabilities = result.path("Vulnerabilities");
            if (vulnerabilities.isArray()) {
                for (JsonNode vuln : vulnerabilities) {
                    ScanFinding finding = mapVulnerability(vuln, target);
                    if (finding != null) {
                        findings.add(finding);
                    }
                }
            }

            JsonNode misconfigurations = result.path("Misconfigurations");
            if (misconfigurations.isArray()) {
                for (JsonNode misconfig : misconfigurations) {
                    ScanFinding finding = mapMisconfiguration(misconfig, target);
                    if (finding != null) {
                        findings.add(finding);
                    }
                }
            }

            JsonNode secrets = result.path("Secrets");
            if (secrets.isArray()) {
                for (JsonNode secret : secrets) {
                    ScanFinding finding = mapSecret(secret, target);
                    if (finding != null) {
                        findings.add(finding);
                    }
                }
            }
        }

        return findings;
    }

    private ScanFinding mapVulnerability(JsonNode node, String target) {
        try {
            String vulnId = node.path("VulnerabilityID").asText(null);
            if (vulnId == null || vulnId.isBlank()) {
                return null;
            }

            String severity = mapSeverity(node.path("Severity").asText(null));
            String title = node.path("Title").asText(null);
            if (title == null || title.isBlank()) {
                title = vulnId;
            }

            String message = node.path("Description").asText(null);
            if (message == null || message.isBlank()) {
                message = title;
            }

            String pkgName = node.path("PkgName").asText(null);
            String installedVersion = node.path("InstalledVersion").asText(null);
            String fixedVersion = node.path("FixedVersion").asText(null);

            StringBuilder detail = new StringBuilder();
            if (pkgName != null) {
                detail.append("Package: ").append(pkgName).append(" ");
            }
            if (installedVersion != null) {
                detail.append("Installed: ").append(installedVersion).append(" ");
            }
            if (fixedVersion != null) {
                detail.append("Fixed: ").append(fixedVersion);
            }

            String fingerprint = vulnId + "|" + target + "|" + pkgName;

            return new ScanFinding(
                    "Trivy",
                    vulnId,
                    severity,
                    title,
                    message + " " + detail,
                    target,
                    null,
                    null,
                    null,
                    fingerprint
            );

        } catch (Exception e) {
            log.warn("Failed to map Trivy vulnerability", e);
            return null;
        }
    }

    private ScanFinding mapMisconfiguration(JsonNode node, String target) {
        try {
            String id = node.path("ID").asText(null);
            if (id == null || id.isBlank()) {
                return null;
            }

            String severity = mapSeverity(node.path("Severity").asText(null));
            String title = node.path("Title").asText(null);
            if (title == null || title.isBlank()) {
                title = id;
            }

            String message = node.path("Description").asText(null);
            if (message == null || message.isBlank()) {
                message = title;
            }

            String fingerprint = id + "|" + target;

            return new ScanFinding(
                    "Trivy",
                    id,
                    severity,
                    title,
                    message,
                    target,
                    null,
                    null,
                    null,
                    fingerprint
            );

        } catch (Exception e) {
            log.warn("Failed to map Trivy misconfiguration", e);
            return null;
        }
    }

    private ScanFinding mapSecret(JsonNode node, String target) {
        try {
            String ruleId = node.path("RuleID").asText(null);
            if (ruleId == null || ruleId.isBlank()) {
                ruleId = node.path("ID").asText(null);
            }
            if (ruleId == null || ruleId.isBlank()) {
                return null;
            }

            String severity = mapSeverity(node.path("Severity").asText(null));
            String title = node.path("Title").asText(null);
            if (title == null || title.isBlank()) {
                title = ruleId;
            }

            String message = node.path("Description").asText(null);
            if (message == null || message.isBlank()) {
                message = title;
            }

            String category = node.path("Category").asText(null);
            if (category != null && !category.isBlank()) {
                message = message + " [Category: " + category + "]";
            }

            String match = node.path("Match").asText(null);
            if (match != null && !match.isBlank()) {
                message = message + " [REDACTED]";
            }

            String fingerprint = ruleId + "|" + target;

            return new ScanFinding(
                    "Trivy",
                    ruleId,
                    severity,
                    title,
                    message,
                    target,
                    null,
                    null,
                    null,
                    fingerprint
            );

        } catch (Exception e) {
            log.warn("Failed to map Trivy secret", e);
            return null;
        }
    }

    private String mapSeverity(String trivySeverity) {
        if (trivySeverity == null || trivySeverity.isBlank()) {
            return "MEDIUM";
        }

        return switch (trivySeverity.toUpperCase()) {
            case "CRITICAL", "HIGH", "MEDIUM", "LOW", "INFO" -> trivySeverity.toUpperCase();
            default -> "MEDIUM";
        };
    }
}
