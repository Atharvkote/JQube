package net.jqube.scanner.queues.publishers;

import net.jqube.scanner.queues.messages.ScanCompletedMessage;

public interface ScanResultPublisher {

    void publish(ScanCompletedMessage message);
}
