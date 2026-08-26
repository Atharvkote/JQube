package net.jqube.scanner.queues.publishers.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.jqube.scanner.queues.publishers.ScanResultPublisher;
import net.jqube.scanner.queues.messages.ScanCompletedMessage;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class RabbitMQScanResultPublisher implements ScanResultPublisher {

    private final RabbitTemplate rabbitTemplate;

    @Override
    public void publish(ScanCompletedMessage message) {
        log.info(
                "Publishing scan completed jobId={}, status={}, critical={}, high={}, medium={}, low={}",
                message.jobId(),
                message.status(),
                message.critical(),
                message.high(),
                message.medium(),
                message.low()
        );

        rabbitTemplate.convertAndSend(
                "jqube.scan.result",
                "scan.completed",
                message
        );
    }
}
