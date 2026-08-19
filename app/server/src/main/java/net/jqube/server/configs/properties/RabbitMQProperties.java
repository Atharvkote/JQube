package net.jqube.server.configs.properties;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

@Getter
@Setter
@ConfigurationProperties(prefix = "jqube.rabbitmq")
public class RabbitMQProperties {

    private String scanCommandExchange = "jqube.scan.command";
    private String scanResultExchange = "jqube.scan.result";

    private String scanJobQueue = "jqube.scan.jobs";
    private String scanResultQueue = "jqube.scan.results";

    private String scanDeadLetterExchange = "jqube.scan.dlx";
    private String scanDeadLetterQueue = "jqube.scan.dead";

    private String scanRequestedRoutingKey = "scan.requested";
    private String scanCompletedRoutingKey = "scan.completed";
    private String scanDeadLetterRoutingKey = "scan.dead";
}