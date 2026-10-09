package net.jqube.scanner.controllers;

import net.jqube.scanner.controllers.models.*;
import net.jqube.scanner.enums.ScanType;
import net.jqube.scanner.enums.TriggerType;
import net.jqube.scanner.models.scan.Scan;
import net.jqube.scanner.models.scan.ScanFinding;
import net.jqube.scanner.models.scan.ScanToolRun;
import net.jqube.scanner.queues.messages.ScanRequestedMessage;
import net.jqube.scanner.repositories.ScanFindingRepository;
import net.jqube.scanner.repositories.ScanRepository;
import net.jqube.scanner.repositories.ScanToolRunRepository;
import net.jqube.scanner.services.scan.ScanPersistenceService;
import net.jqube.scanner.services.scan.ScanService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

@RestController
@RequestMapping("/api/scans")
public class ScanController {

    private final ScanPersistenceService scanPersistenceService;
    private final ScanService scanService;
    private final ScanRepository scanRepository;
    private final ScanToolRunRepository scanToolRunRepository;
    private final ScanFindingRepository scanFindingRepository;
    private final ExecutorService executorService;

    public ScanController(
            ScanPersistenceService scanPersistenceService, 
            ScanService scanService,
            ScanRepository scanRepository,
            ScanToolRunRepository scanToolRunRepository,
            ScanFindingRepository scanFindingRepository
    ) {
        this.scanPersistenceService = scanPersistenceService;
        this.scanService = scanService;
        this.scanRepository = scanRepository;
        this.scanToolRunRepository = scanToolRunRepository;
        this.scanFindingRepository = scanFindingRepository;
        this.executorService = Executors.newCachedThreadPool();
    }

    @PostMapping
    public ResponseEntity<ScanQueuedResponse> createScan(@RequestBody ScanRequest request) {
        UUID jobId = UUID.randomUUID();
        UUID qubeId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();
        Long repositoryId = 1L; // Dummy for now
        
        String commitSha = request.getCommit() != null ? request.getCommit() : "HEAD";
        String branch = request.getBranch() != null ? request.getBranch() : "main";

        Scan scan = scanPersistenceService.createScan(
                jobId,
                qubeId,
                repositoryId,
                request.getRepositoryUrl(),
                branch,
                commitSha,
                ScanType.ALL, // Assuming ALL scan
                TriggerType.MANUAL,
                userId
        );

        ScanRequestedMessage message = new ScanRequestedMessage(
                UUID.randomUUID(),
                jobId,
                qubeId,
                userId,
                repositoryId,
                request.getRepositoryUrl(),
                branch,
                commitSha,
                ScanType.ALL,
                TriggerType.MANUAL,
                Instant.now()
        );

        // Run asynchronously
        executorService.submit(() -> {
            scanService.execute(message);
        });

        return ResponseEntity.ok(ScanQueuedResponse.builder()
                .scanId(scan.getId().toString())
                .status("QUEUED")
                .build());
    }

    @GetMapping("/{scanId}")
    public ResponseEntity<ScanResponse> getScan(@PathVariable UUID scanId) {
        return scanRepository.findById(scanId)
                .map(scan -> {
                    List<ScanToolRun> toolRuns = scanToolRunRepository.findAllByScanId(scan.getId());
                    
                    List<ScanResponse.ScanToolResponse> tools = toolRuns.stream()
                            .map(tr -> ScanResponse.ScanToolResponse.builder()
                                    .tool(tr.getScannerType().name())
                                    .status(tr.getStatus().name())
                                    .findings(tr.getFindingCount())
                                    .build())
                            .toList();

                    return ResponseEntity.ok(ScanResponse.builder()
                            .scanId(scan.getId().toString())
                            .status(scan.getStatus().name())
                            .repository(ScanResponse.RepositoryInfo.builder()
                                    .url(scan.getRepositoryUrl())
                                    .branch(scan.getBranch())
                                    .commitSha(scan.getCommitSha())
                                    .build())
                            .summary(ScanResponse.ScanSummary.builder()
                                    .total(scan.getTotalFindings())
                                    .critical(scan.getCriticalCount())
                                    .high(scan.getHighCount())
                                    .medium(scan.getMediumCount())
                                    .low(scan.getLowCount())
                                    .info(0)
                                    .build())
                            .tools(tools)
                            .build());
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{scanId}/findings")
    public ResponseEntity<FindingsPageResponse> getFindings(@PathVariable UUID scanId) {
        return scanRepository.findById(scanId)
                .map(scan -> {
                    List<ScanToolRun> toolRuns = scanToolRunRepository.findAllByScanId(scan.getId());
                    List<FindingsPageResponse.FindingResponse> findings = new ArrayList<>();

                    for (ScanToolRun tr : toolRuns) {
                        List<ScanFinding> runFindings = scanFindingRepository.findAllByToolRunId(tr.getId());
                        findings.addAll(runFindings.stream()
                                .map(f -> FindingsPageResponse.FindingResponse.builder()
                                        .id(f.getId().toString())
                                        .fingerprint(f.getFingerprint())
                                        .scanner(tr.getScannerType().name())
                                        .severity(f.getSeverity().name())
                                        .ruleId(f.getRuleId())
                                        .title(f.getTitle())
                                        .file(f.getFilePath())
                                        .line(f.getLineStart())
                                        .description(f.getMessage())
                                        .build())
                                .toList());
                    }

                    return ResponseEntity.ok(FindingsPageResponse.builder()
                            .scanId(scan.getId().toString())
                            .total(findings.size())
                            .findings(findings)
                            .build());
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{scanId}/findings/{findingId}")
    public ResponseEntity<FindingsPageResponse.FindingResponse> getFinding(
            @PathVariable UUID scanId,
            @PathVariable UUID findingId) {
        return scanFindingRepository.findById(findingId)
                .map(f -> ResponseEntity.ok(FindingsPageResponse.FindingResponse.builder()
                        .id(f.getId().toString())
                        .fingerprint(f.getFingerprint())
                        .scanner(f.getToolRun().getScannerType().name())
                        .severity(f.getSeverity().name())
                        .ruleId(f.getRuleId())
                        .title(f.getTitle())
                        .file(f.getFilePath())
                        .line(f.getLineStart())
                        .description(f.getMessage())
                        .build()))
                .orElse(ResponseEntity.notFound().build());
    }
}
