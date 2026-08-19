package net.jqube.server.services.scan.impls;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import net.jqube.server.dtos.requests.ScanRequestDTO;
import net.jqube.server.dtos.responses.ScanJobResponseDTO;
import net.jqube.server.enums.OutboxStatus;
import net.jqube.server.enums.ScanStatus;
import net.jqube.server.enums.QubeAuthorities;
import net.jqube.server.enums.TriggerType;
import net.jqube.server.enums.ScanType;
import net.jqube.server.exceptions.qube.AccessDeniedException;
import net.jqube.server.exceptions.qube.QubeNotFoundException;
import net.jqube.server.mappers.ScanMapper;
import net.jqube.server.models.auth.User;
import net.jqube.server.models.qube.Qube;
import net.jqube.server.models.qube.QubeMember;
import net.jqube.server.models.scans.OutboxEvent;
import net.jqube.server.models.scans.ScanJob;

import net.jqube.server.repositories.QubeRepository;
import net.jqube.server.repositories.QubeMemberRepository;
import net.jqube.server.repositories.OutboxEventRepository;
import net.jqube.server.repositories.ScanJobRepository;
import net.jqube.server.repositories.UserRepository;
import net.jqube.server.security.qube.QubeAuthorizationService;
import net.jqube.server.services.scan.ScanService;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.time.Instant;
import java.util.UUID;

@Slf4j
@Service
@Transactional
@RequiredArgsConstructor
public class ScanServiceImpl implements ScanService {

    private final ObjectMapper objectMapper;
    private final QubeRepository qubeRepository;
    private final UserRepository userRepository;
    private final ScanJobRepository scanJobRepository;
    private final QubeMemberRepository qubeMemberRepository;
    private final OutboxEventRepository outboxEventRepository;
    private final ScanMapper scanMapper;
    private final QubeAuthorizationService qubeAuthorizationService;

    @Override
    public ScanJobResponseDTO startScan(UUID qubeId, ScanRequestDTO request) {
        log.info("Starting scan for qube: id={}, commit={}", qubeId, request.commitSha());

        User currentUser = getCurrentUser();

        Qube qube = qubeRepository.findById(qubeId)
                .filter(q -> !q.getIsDeleted())
                .orElseThrow(() ->
                        new QubeNotFoundException("Qube not found or has been deleted: " + qubeId)
                );

        QubeMember member = qubeMemberRepository
                .findByQubeIdAndUserIdAndActiveTrue(qubeId, currentUser.getId())
                .orElseThrow(() ->
                        new AccessDeniedException("You are not an active member of this Qube")
                );

        qubeAuthorizationService.requirePermission(member, QubeAuthorities.START_SCAN);

        ScanJob scanJob = ScanJob.builder()
                .qubeId(qube.getId())
                .repositoryId(qube.getGithubRepositoryId())
                .commitSha(request.commitSha())
                .status(ScanStatus.QUEUED)
                .attempt(0)
                .build();

        scanJob.setCreatedBy(currentUser.getId());

        ScanJob savedScanJob = scanJobRepository.save(scanJob);

        ScanType scanType = request.scanType() != null ? request.scanType() : ScanType.ALL;

        net.jqube.server.queues.message.ScanRequestedMessage message = new net.jqube.server.queues.message.ScanRequestedMessage(
                UUID.randomUUID(),
                savedScanJob.getId(),
                qube.getId(),
                qube.getGithubRepositoryId(),
                qube.getCloneUrl(),
                qube.getTargetBranch(),
                request.commitSha(),
                scanType,
                TriggerType.MANUAL,
                Instant.now()
        );

        try {
            String payload = objectMapper.writeValueAsString(message);

            OutboxEvent outboxEvent = OutboxEvent.builder()
                    .aggregateType("ScanJob")
                    .aggregateId(savedScanJob.getId())
                    .eventType("ScanRequested")
                    .payload(payload)
                    .status(OutboxStatus.PENDING)
                    .attempts(0)
                    .build();

            outboxEventRepository.save(outboxEvent);

            log.info("Scan queued successfully: jobId={}, qubeId={}", savedScanJob.getId(), qubeId);
        } catch (JsonProcessingException e) {
            log.error("Failed to serialize scan request message: jobId={}", savedScanJob.getId(), e);
            throw new RuntimeException("Failed to queue scan request", e);
        }

        return scanMapper.toResponseDTO(savedScanJob);
    }

    @Override
    @Transactional(readOnly = true)
    public ScanJobResponseDTO getScanJob(UUID jobId) {
        log.debug("Fetching scan job: id={}", jobId);

        ScanJob scanJob = scanJobRepository.findById(jobId)
                .orElseThrow(() ->
                        new QubeNotFoundException("Scan job not found: " + jobId)
                );

        User currentUser = getCurrentUser();

        qubeMemberRepository
                .findByQubeIdAndUserIdAndActiveTrue(scanJob.getQubeId(), currentUser.getId())
                .orElseThrow(() ->
                        new AccessDeniedException("You are not an active member of this Qube")
                );

        return scanMapper.toResponseDTO(scanJob);
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder
                .getContext()
                .getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            throw new SecurityException("User is not authenticated");
        }

        String principal = authentication.getName();

        return userRepository.findByUsername(principal)
                .orElseThrow(() ->
                        new QubeNotFoundException("Authenticated user not found: " + principal)
                );
    }
}
