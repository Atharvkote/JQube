package net.jqube.server.queues.publishers;

public interface ScanResultPublisher {

    void publishResult(Object message);
}
