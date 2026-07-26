package net.jqube.server.controllers;

// Response Model
import net.jqube.server.responses.Response;
import net.jqube.server.responses.dataDTOs.HealthResponse;

// Deps
import org.springframework.http.ResponseEntity;

// Annotations
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.lang.management.ManagementFactory;

@RestController
public class HealthCheck{

    @GetMapping("/health")
    public ResponseEntity<Response<HealthResponse>> healthCheck() {

        Runtime runtime = Runtime.getRuntime();

        HealthResponse health = HealthResponse.builder()
                .status("UP")
                .availableProcessors(runtime.availableProcessors())
                .freeMemory(runtime.freeMemory())
                .totalMemory(runtime.totalMemory())
                .maxMemory(runtime.maxMemory())
                .javaVersion(System.getProperty("java.version"))
                .osName(System.getProperty("os.name"))
                .uptime(
                        ManagementFactory.getRuntimeMXBean().getUptime()
                )
                .build();

        return ResponseEntity.ok(
                Response.<HealthResponse>builder()
                        .message("Server is running.")
                        .data(health)
                        .success(true)
                        .build()
        );
    }
}