package net.jqube.server.configs.properties;

// Annotations
import lombok.Getter;
import lombok.Builder;
import lombok.AllArgsConstructor;
import lombok.Setter;
import org.springframework.stereotype.Component;
import org.springframework.boot.context.properties.ConfigurationProperties;

@Getter
@Setter
@Component
@ConfigurationProperties(prefix = "mail")
public class EmailProperties {
    String username;
    String password;
}