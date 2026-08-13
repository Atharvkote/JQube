package net.jqube.server.configs;


import net.jqube.server.enums.limiter.AlgorithmType;
import net.jqube.server.limiter.RateLimiter;
import net.jqube.server.limiter.algos.RateLimitAlgorithm;
import net.jqube.server.limiter.algos.impls.FixedWindowAlgorithm;
import net.jqube.server.limiter.algos.impls.SlidingWindowAlgorithm;
import net.jqube.server.limiter.algos.impls.TokenBucketAlgorithm;
import net.jqube.server.limiter.policies.RateLimitPolicy;
import net.jqube.server.configs.properties.RateLimiterProperties;
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
    public StringRedisTemplate redisTemplate(RedisConnectionFactory cf) {
        StringRedisTemplate template = new StringRedisTemplate();
        template.setConnectionFactory(cf);
        return template;
    }

    @Bean
    public RedisScript<Long> fixedWindowScript() {
        return RedisScript.of(new ClassPathResource("scripts/fixed-window.lua"), Long.class);
    }

    @Bean
    public RedisScript<Long> slidingWindowScript() {
        return RedisScript.of(new ClassPathResource("scripts/sliding-window.lua"), Long.class);
    }

    @Bean
    public RedisScript<Long> tokenBucketScript() {
        return RedisScript.of(new ClassPathResource("scripts/token-bucket.lua"), Long.class);
    }


    @Bean
    public Map<AlgorithmType, RateLimitAlgorithm> algorithmMap(
            FixedWindowAlgorithm fixed,
            SlidingWindowAlgorithm sliding,
            TokenBucketAlgorithm token
    ) {
        return Map.of(
                AlgorithmType.FIXED_WINDOW, fixed,
                AlgorithmType.SLIDING_WINDOW, sliding,
                AlgorithmType.TOKEN_BUCKET, token
        );
    }

    @Bean
    public RateLimiter generalRateLimiter(RateLimiterProperties props, Map<AlgorithmType, RateLimitAlgorithm> algos) {
        return new RateLimiter("general", RateLimitPolicy.from(props.getGeneral()), algos);
    }

    @Bean
    public RateLimiter authRateLimiter(RateLimiterProperties props, Map<AlgorithmType, RateLimitAlgorithm> algos) {
        return new RateLimiter("auth", RateLimitPolicy.from(props.getAuth()), algos);
    }

    @Bean
    public RateLimiter sensitiveRateLimiter(RateLimiterProperties props, Map<AlgorithmType, RateLimitAlgorithm> algos) {
        return new RateLimiter("sensitive", RateLimitPolicy.from(props.getSensitive()), algos);
    }

    @Bean
    public RateLimiter uploadRateLimiter(RateLimiterProperties props, Map<AlgorithmType, RateLimitAlgorithm> algos) {
        return new RateLimiter("upload", RateLimitPolicy.from(props.getUpload()), algos);
    }
}