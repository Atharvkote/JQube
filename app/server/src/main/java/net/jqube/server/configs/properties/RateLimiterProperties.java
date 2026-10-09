package net.jqube.server.configs.properties;

import net.jqube.server.limiter.enums.AlgorithmType;
import net.jqube.server.limiter.enums.ClientType;
import net.jqube.server.limiter.enums.FailMode;
import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import java.time.Duration;

@Data
@Component
@ConfigurationProperties(prefix = "rate-limiter")
public class RateLimiterProperties {

    private boolean enabled = true;
    private FailMode failMode = FailMode.OPEN;
    private RateLimiterPolicy general = new RateLimiterPolicy();
    private RateLimiterPolicy auth = new RateLimiterPolicy();
    private RateLimiterPolicy sensitive = new RateLimiterPolicy();
    private RateLimiterPolicy upload = new RateLimiterPolicy();

    @Data
    public static class RateLimiterPolicy {
        private int limit;
        private Duration window = Duration.ofMinutes(1);
        private AlgorithmType algorithm = AlgorithmType.FIXED_WINDOW;
        private ClientType clientType = ClientType.IP;
    }
}