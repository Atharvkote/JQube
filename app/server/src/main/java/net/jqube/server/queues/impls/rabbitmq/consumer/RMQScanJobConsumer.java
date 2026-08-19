package net.jqube.server.queues.impls.rabbitmq.consumer;

import lombok.extern.slf4j.Slf4j;
import net.jqube.server.queues.consumers.ScanJobConsumer;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

import net.jqube.server.enums.ScanStatus;
import net.jqube.server.queues.message.ScanCompletedMessage;
import net.jqube.server.models.scans.ScanJob;
import net.jqube.server.repositories.ScanJobRepository;

@Slf4j
@Component
public class RMQScanJobConsumer implements ScanJobConsumer {

    private final ScanJobRepository scanJobRepository;

    public RMQScanJobConsumer(ScanJobRepository scanJobRepository) {
        this.scanJobRepository = scanJobRepository;
    }

    @Override
    @RabbitListener(
            queues = "jqube.scan.results",
            containerFactory = "rabbitListenerContainerFactory"
    )
    public void handleScanCompleted(ScanCompletedMessage message) {
        log.info("Received scan completed message: jobId={}, status={}", message.jobId(), message.status());

        ScanJob scanJob = scanJobRepository.findById(message.jobId())
                .orElseThrow(() ->
                        new IllegalArgumentException("Scan job not found: " + message.jobId())
                );

        scanJob.setStatus(ScanStatus.valueOf(message.status()));
        scanJob.setCompletedAt(message.completedAt());
        scanJob.setErrorMessage(message.errorMessage());

        scanJobRepository.save(scanJob);

        log.info("Scan job updated: jobId={}, status={}", message.jobId(), message.status());
    }
}
