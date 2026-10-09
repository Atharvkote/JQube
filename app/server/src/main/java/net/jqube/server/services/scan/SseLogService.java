package net.jqube.server.services.scan;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Service
public class SseLogService {

    private final ConcurrentHashMap<UUID, SseEmitter> emitters = new ConcurrentHashMap<>();

    public SseEmitter createEmitter(UUID qubeId) {
        // 5 minute timeout
        SseEmitter emitter = new SseEmitter(300000L);
        emitters.put(qubeId, emitter);

        emitter.onCompletion(() -> emitters.remove(qubeId));
        emitter.onTimeout(() -> {
            emitter.complete();
            emitters.remove(qubeId);
        });
        emitter.onError(e -> {
            emitter.completeWithError(e);
            emitters.remove(qubeId);
        });

        return emitter;
    }

    public void emitLog(UUID qubeId, String logMessage) {
        SseEmitter emitter = emitters.get(qubeId);
        if (emitter != null) {
            try {
                emitter.send(logMessage);
            } catch (IOException e) {
                emitter.completeWithError(e);
                emitters.remove(qubeId);
            }
        }
    }
    
    public void complete(UUID qubeId) {
        SseEmitter emitter = emitters.get(qubeId);
        if (emitter != null) {
            emitter.complete();
            emitters.remove(qubeId);
        }
    }
}
