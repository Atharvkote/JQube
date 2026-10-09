package net.jqube.scanner.queues.publishers;

import java.util.UUID;

public interface ScanLogPublisher {
    void publishLog(UUID qubeId, String log);
}
