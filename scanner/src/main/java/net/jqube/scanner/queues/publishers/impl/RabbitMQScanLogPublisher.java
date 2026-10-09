package net.jqube.scanner.queues.publishers.impl;

import lombok.RequiredArgsConstructor;
import net.jqube.scanner.configs.properties.ScannerProperties;
import net.jqube.scanner.queues.messages.ScanLogMessage;
import net.jqube.scanner.queues.publishers.ScanLogPublisher;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class RabbitMQScanLogPublisher implements ScanLogPublisher {

    private final RabbitTemplate rabbitTemplate;
    
    @Value("${jqube.rabbitmq.result-exchange:jqube.scan.result}")
    private String resultExchange;
    private final DateTimeFormatter formatter = DateTimeFormatter.ofPattern("HH:mm:ss");

    @Override
    public void publishLog(UUID qubeId, String log) {
        String timeStr = LocalTime.now().format(formatter);
        String formattedLog = "[" + timeStr + "] " + log;
        rabbitTemplate.convertAndSend(
                resultExchange,
                "scan.log",
                new ScanLogMessage(qubeId, formattedLog)
        );
    }
}
