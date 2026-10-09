package net.jqube.scanner.controllers.models;

import lombok.Data;
import lombok.Builder;

@Data
@Builder
public class ScanQueuedResponse {
    private String scanId;
    private String status;
}
