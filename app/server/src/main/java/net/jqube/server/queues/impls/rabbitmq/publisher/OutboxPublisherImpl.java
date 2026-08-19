package net.jqube.server.queues.impls.rabbitmq.publisher;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.jqube.server.enums.OutboxStatus;
import net.jqube.server.models.scans.OutboxEvent;
import net.jqube.server.queues.publishers.EventPublisher;
import net.jqube.server.queues.publishers.OutboxPublisher;
import net.jqube.server.repositories.OutboxEventRepository;
import org.springframework.amqp.AmqpException;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Component
@Slf4j
@RequiredArgsConstructor
public class OutboxPublisherImpl implements OutboxPublisher {

    private final OutboxEventRepository outboxEventRepository;
    private final RabbitTemplate rabbitTemplate;
    private final EventPublisher eventPublisher;
    private final ObjectMapper objectMapper;

    @Override
    @Transactional
    public void publishPendingEvents() {
        List<OutboxEvent> pendingEvents = outboxEventRepository.findTop100ByStatusOrderByCreatedAtAsc(OutboxStatus.PENDING);

        for (OutboxEvent event : pendingEvents) {
            try {
                eventPublisher.publish(
                        "jqube.scan.command",
                        "scan.requested",
                        objectMapper.readValue(event.getPayload(), Object.class)
                );

                event.setStatus(OutboxStatus.PUBLISHED);
                event.setPublishedAt(java.time.Instant.now());
                event.setLastError(null);
                outboxEventRepository.save(event);

                log.info("Outbox event published successfully: id={}, eventType={}", event.getId(), event.getEventType());
            } catch (AmqpException e) {
                event.setAttempts(event.getAttempts() + 1);
                event.setLastError(e.getMessage());
                event.setStatus(OutboxStatus.FAILED);
                outboxEventRepository.save(event);

                log.error("Failed to publish outbox event: id={}, eventType={}, error={}", event.getId(), event.getEventType(), e.getMessage(), e);
            } catch (JsonProcessingException e) {
                event.setAttempts(event.getAttempts() + 1);
                event.setLastError("JSON parsing error: " + e.getMessage());
                event.setStatus(OutboxStatus.FAILED);
                outboxEventRepository.save(event);

                log.error("Failed to parse outbox event payload: id={}, error={}", event.getId(), e.getMessage(), e);
            }
        }
    }
}
