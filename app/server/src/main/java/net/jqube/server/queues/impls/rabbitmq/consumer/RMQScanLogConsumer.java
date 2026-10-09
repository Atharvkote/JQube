package net.jqube.server.queues.impls.rabbitmq.consumer;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.jqube.server.configs.properties.RabbitMQProperties;
import net.jqube.server.queues.message.ScanLogMessage;
import net.jqube.server.services.scan.SseLogService;
import org.springframework.amqp.rabbit.annotation.Exchange;
import org.springframework.amqp.rabbit.annotation.Queue;
import org.springframework.amqp.rabbit.annotation.QueueBinding;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class RMQScanLogConsumer {

    private final SseLogService sseLogService;

    // We can define the queue binding directly here so it creates it automatically
    @RabbitListener(bindings = @QueueBinding(
            value = @Queue(value = "jqube.scan.logs.queue", durable = "true"),
            exchange = @Exchange(value = "jqube.scan.result", type = "topic", durable = "true"),
            key = "scan.log"
    ), ackMode = "AUTO")
    public void consumeLog(ScanLogMessage message) {
        if (message != null && message.qubeId() != null) {
            sseLogService.emitLog(message.qubeId(), message.log());
        }
    }
}
