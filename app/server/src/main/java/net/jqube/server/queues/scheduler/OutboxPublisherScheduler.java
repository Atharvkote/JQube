package net.jqube.server.queues.scheduler;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.jqube.server.queues.publishers.OutboxPublisher;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@Slf4j
@RequiredArgsConstructor
public class OutboxPublisherScheduler {

    private final OutboxPublisher outboxPublisher;

    @Scheduled(fixedDelay = 5000)
    public void publishPendingEvents() {
        try {
            outboxPublisher.publishPendingEvents();
        } catch (Exception e) {
            log.error("Failed to publish outbox events", e);
        }
    }
}
