package net.jqube.server.queues.publishers;

public interface OutboxPublisher {

    void publishPendingEvents();
}
