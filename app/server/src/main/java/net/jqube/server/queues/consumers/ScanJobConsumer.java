package net.jqube.server.queues.consumers;

import net.jqube.server.queues.message.ScanCompletedMessage;

public interface ScanJobConsumer {
    void handleScanCompleted(ScanCompletedMessage message);
}