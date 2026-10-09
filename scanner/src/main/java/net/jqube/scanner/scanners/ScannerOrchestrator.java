package net.jqube.scanner.scanners;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.jqube.scanner.configs.properties.ScannerProperties;
import net.jqube.scanner.enums.ScanType;
import net.jqube.scanner.exceptions.ScannerExecutionException;
import net.jqube.scanner.exceptions.ScannerTimeoutException;
import net.jqube.scanner.queues.messages.ScanFinding;
import net.jqube.scanner.queues.messages.ScannerRunResult;
import net.jqube.scanner.process.ProcessExecutor;
import net.jqube.scanner.queues.publishers.ScanLogPublisher;
import org.springframework.stereotype.Component;

import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Slf4j
@Component
@RequiredArgsConstructor
public class ScannerOrchestrator {

    private final List<SecurityScanner> scanners;
    private final ScannerProperties scannerProperties;
    private final ProcessExecutor processExecutor;
    private final ScanLogPublisher scanLogPublisher;

    public List<ScannerRunResult> scan(Path workspace, ScanType scanType, UUID qubeId) {
        List<ScannerRunResult> results = new ArrayList<>();

        List<SecurityScanner> scannersToRun = selectScanners(scanType);

        for (SecurityScanner scanner : scannersToRun) {
            String scannerName = scanner.getName();
            log.info("Running {} job={}", scannerName, workspace);
            scanLogPublisher.publishLog(qubeId, "[INFO] Running " + scannerName + " security analysis...");

            long startTime = System.currentTimeMillis();

            ScannerOutput output;
            try {
                output = scanner.scan(workspace);
            } catch (ScannerExecutionException | ScannerTimeoutException e) {
                log.error("Scanner {} failed: {}", scannerName, e.getMessage(), e);
                scanLogPublisher.publishLog(qubeId, "[ERROR] " + scannerName + " execution failed: " + e.getMessage());
                throw e;
            }

            long durationMs = System.currentTimeMillis() - startTime;
            int findingCount = output.findings() != null ? output.findings().size() : 0;

            log.info(
                    "{} completed job={} findings={} duration={}ms",
                    scannerName,
                    workspace,
                    findingCount,
                    durationMs
            );
            
            if (findingCount > 0) {
                scanLogPublisher.publishLog(qubeId, "[WARN] " + scannerName + " found " + findingCount + " security issues.");
            } else {
                scanLogPublisher.publishLog(qubeId, "[INFO] " + scannerName + " found 0 security issues.");
            }

            results.add(new ScannerRunResult(
                    scannerName,
                    output.findings() != null ? output.findings() : List.of(),
                    durationMs,
                    output.rawResultPath(),
                    output.exitCode()
            ));
        }

        return results;
    }

    private List<SecurityScanner> selectScanners(ScanType scanType) {
        List<SecurityScanner> selected = new ArrayList<>();

        if (scanType == null) {
            return selected;
        }

        for (SecurityScanner scanner : scanners) {
            if (matchesScanType(scanner, scanType)) {
                selected.add(scanner);
            }
        }

        return selected;
    }

    private boolean matchesScanType(SecurityScanner scanner, ScanType scanType) {
        String name = scanner.getName();

        if (scanType == ScanType.ALL) {
            return true;
        }

        return switch (scanType) {
            case SEMGREP -> "Semgrep".equals(name);
            case TRIVY -> "Trivy".equals(name);
            case GIT_LEAKS -> "Gitleaks".equals(name);
            default -> false;
        };
    }
}
