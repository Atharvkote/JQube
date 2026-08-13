package net.jqube.server.limiter.policies;

import net.jqube.server.enums.limiter.AlgorithmType;
import net.jqube.server.enums.limiter.ClientType;
import net.jqube.server.configs.properties.RateLimiterProperties;

import java.time.Duration;

public record RateLimitPolicy(
        int limit,
        Duration window,
        AlgorithmType algorithm,
        ClientType clientType
) {
    public static RateLimitPolicy from(RateLimiterProperties.PolicyConfig config) {
        return new RateLimitPolicy(
                config.getLimit(),
                config.getWindow(),
                config.getAlgorithm(),
                config.getClientType()
        );
    }
}