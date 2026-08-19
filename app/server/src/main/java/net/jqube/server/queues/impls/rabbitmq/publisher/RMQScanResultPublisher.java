package net.jqube.server.queues.impls.rabbitmq.publisher;

import lombok.RequiredArgsConstructor;
import net.jqube.server.configs.properties.RabbitMQProperties;
import net.jqube.server.queues.publishers.ScanResultPublisher;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class RMQScanResultPublisher implements ScanResultPublisher {

    private final RabbitTemplate rabbitTemplate;
    private final RabbitMQProperties rabbitMQProperties;

    @Override
    public void publishResult(Object message) {
        rabbitTemplate.convertAndSend(
                rabbitMQProperties.getScanResultExchange(),
                rabbitMQProperties.getScanCompletedRoutingKey(),
                message
        );
    }
}
