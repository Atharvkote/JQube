package net.jqube.server.queues.impls.rabbitmq.publisher;

import lombok.RequiredArgsConstructor;
import net.jqube.server.queues.publishers.EventPublisher;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class RMQEventPublisher implements EventPublisher {

    private final RabbitTemplate rabbitTemplate;

    @Override
    public void publish(
            String exchange,
            String routingKey,
            Object message
    ) {

        rabbitTemplate.convertAndSend(
                exchange,
                routingKey,
                message
        );
    }
}