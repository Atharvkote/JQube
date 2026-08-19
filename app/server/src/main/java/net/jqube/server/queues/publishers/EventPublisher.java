package net.jqube.server.queues.publishers;

public interface EventPublisher {

    void publish(
            String exchange,
            String routingKey,
            Object message
    );
}