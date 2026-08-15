package net.jqube.server.configs;

// Rate Limiter

import net.jqube.server.limiter.RateLimiter;
import net.jqube.server.limiter.algos.RateLimitAlgorithm;
import net.jqube.server.limiter.algos.impls.FixedWindowAlgorithm;
import net.jqube.server.limiter.algos.impls.SlidingWindowAlgorithm;
import net.jqube.server.limiter.algos.impls.TokenBucketAlgorithm;
import net.jqube.server.limiter.enums.AlgorithmType;
import net.jqube.server.limiter.policies.RateLimitPolicy;

// Configuration
import net.jqube.server.configs.properties.RateLimiterProperties;

// Spring
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.script.RedisScript;

import java.util.Map;

@Configuration
public class RateLimiterConfiguration {

    @Bean
    public StringRedisTemplate redisTemplate(RedisConnectionFactory connectionFactory) {
        StringRedisTemplate template = new StringRedisTemplate();
        template.setConnectionFactory(connectionFactory);
        return template;
    }

    @Bean
    public RedisScript<Long> fixedWindowScript() {
        return RedisScript.of(
                new ClassPathResource("scripts/fixed-window.lua"),
                Long.class
        );
    }

    @Bean
    public RedisScript<Long> slidingWindowScript() {
        return RedisScript.of(
                new ClassPathResource("scripts/sliding-window.lua"),
                Long.class
        );
    }

    @Bean
    public RedisScript<Long> tokenBucketScript() {
        return RedisScript.of(
                new ClassPathResource("scripts/token-bucket.lua"),
                Long.class
        );
    }

    @Bean
    public Map<AlgorithmType, RateLimitAlgorithm> algorithmMap(
            FixedWindowAlgorithm fixedWindow,
            SlidingWindowAlgorithm slidingWindow,
            TokenBucketAlgorithm tokenBucket
    ) {
        return Map.of(
                AlgorithmType.FIXED_WINDOW, fixedWindow,
                AlgorithmType.SLIDING_WINDOW, slidingWindow,
                AlgorithmType.TOKEN_BUCKET, tokenBucket
        );
    }

    @Bean
    public RateLimiter generalRateLimiter(
            RateLimiterProperties properties,
            Map<AlgorithmType, RateLimitAlgorithm> algorithms
    ) {
        return new RateLimiter(
                "general",
                RateLimitPolicy.from(properties.getGeneral()),
                algorithms
        );
    }

    @Bean
    public RateLimiter authRateLimiter(
            RateLimiterProperties properties,
            Map<AlgorithmType, RateLimitAlgorithm> algorithms
    ) {
        return new RateLimiter(
                "auth",
                RateLimitPolicy.from(properties.getAuth()),
                algorithms
        );
    }

    @Bean
    public RateLimiter sensitiveRateLimiter(
            RateLimiterProperties properties,
            Map<AlgorithmType, RateLimitAlgorithm> algorithms
    ) {
        return new RateLimiter(
                "sensitive",
                RateLimitPolicy.from(properties.getSensitive()),
                algorithms
        );
    }

    @Bean
    public RateLimiter uploadRateLimiter(
            RateLimiterProperties properties,
            Map<AlgorithmType, RateLimitAlgorithm> algorithms
    ) {
        return new RateLimiter(
                "upload",
                RateLimitPolicy.from(properties.getUpload()),
                algorithms
        );
    }
}