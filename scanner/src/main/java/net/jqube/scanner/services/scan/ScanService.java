package net.jqube.scanner.services.scan;

import net.jqube.scanner.queues.messages.ScanRequestedMessage;

public interface ScanService {

    void execute(ScanRequestedMessage message);
}
