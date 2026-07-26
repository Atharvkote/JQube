package net.jqube.server.responses.dataDTOs;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class HealthResponse {

    private String status;
    private int availableProcessors;
    private long freeMemory;
    private long totalMemory;
    private long maxMemory;
    private String javaVersion;
    private String osName;
    private long uptime;
}