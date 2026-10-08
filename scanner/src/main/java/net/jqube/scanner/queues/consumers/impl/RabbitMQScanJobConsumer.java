package net.jqube.scanner.queues.consumers.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.jqube.scanner.queues.consumers.ScanJobConsumer;
import net.jqube.scanner.queues.messages.ScanRequestedMessage;
import net.jqube.scanner.services.scan.ScanService;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class RabbitMQScanJobConsumer implements ScanJobConsumer {

    private final ScanService scanService;

    @RabbitListener(
            queues = "${jqube.rabbitmq.scan-job-queue}",
            containerFactory = "rabbitListenerContainerFactory"
    )
    @Override
    public void consume(ScanRequestedMessage message) {
        log.info(
                "Received scan job jobId={}, qubeId={}, userId={}, commitSha={}, scanType={}",
                message.jobId(),
                message.qubeId(),
                message.userId(),
                message.commitSha(),
                message.scanType()
        );

        scanService.execute(message);
    }
}
