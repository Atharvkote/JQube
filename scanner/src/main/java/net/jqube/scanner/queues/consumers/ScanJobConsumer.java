package net.jqube.scanner.queues.consumers;

import net.jqube.scanner.queues.messages.ScanRequestedMessage;

public interface ScanJobConsumer {

    void consume(ScanRequestedMessage message);
}
