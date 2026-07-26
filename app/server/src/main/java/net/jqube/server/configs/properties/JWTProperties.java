package net.jqube.server.configs.properties;

// Annotations
import lombok.*;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Getter
@Component
@Setter
@ConfigurationProperties(prefix = "security.jwt")
public class JWTProperties {
    String secretKey;
    Long expirationTime;
}