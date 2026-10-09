package net.jqube.server.controllers;

import lombok.RequiredArgsConstructor;
import net.jqube.server.services.scan.SseLogService;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;
import org.springframework.web.bind.annotation.CrossOrigin;

import java.util.UUID;

@RestController
@RequestMapping("/api/scans")
@RequiredArgsConstructor
public class ScanStreamController {

    private final SseLogService sseLogService;

    @GetMapping(path = "/stream/{qubeId}", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    @CrossOrigin(origins = "*") // Allow frontend to connect without CORS issues
    public SseEmitter streamLogs(@PathVariable UUID qubeId) {
        return sseLogService.createEmitter(qubeId);
    }
}
