package net.jqube.server.limiter;

import net.jqube.server.enums.limiter.AlgorithmType;
import net.jqube.server.limiter.algos.RateLimitAlgorithm;
import net.jqube.server.limiter.policies.RateLimitPolicy;
import net.jqube.server.limiter.records.ClientContext;
import net.jqube.server.limiter.records.RateLimitResult;

import lombok.extern.slf4j.Slf4j;

import java.util.Map;

@Slf4j
public class RateLimiter {

    private final String category;
    private final RateLimitPolicy policy;
    private final Map<AlgorithmType, RateLimitAlgorithm> algorithms;

    public RateLimiter(String category, RateLimitPolicy policy, Map<AlgorithmType, RateLimitAlgorithm> algorithms) {
        this.category = category;
        this.policy = policy;
        this.algorithms = algorithms;
    }

    public RateLimitResult check(ClientContext context) {
        String key = buildKey(context);
        RateLimitAlgorithm algorithm = algorithms.get(policy.algorithm());
        RateLimitResult result = algorithm.check(key, policy);

        log.info("Rate limit check category={} clientType={} clientId={} method={} path={} allowed={} remaining={}",
                category, context.clientType(), context.clientId(),
                context.httpMethod(), context.requestPath(),
                result.allowed(), result.remaining());

        return result;
    }

    public String getCategory() {
        return category;
    }

    public RateLimitPolicy getPolicy() {
        return policy;
    }

    private String buildKey(ClientContext context) {
        return "rl:" + category + ":"
                + policy.clientType().name().toLowerCase() + ":"
                + context.clientId();
    }
}