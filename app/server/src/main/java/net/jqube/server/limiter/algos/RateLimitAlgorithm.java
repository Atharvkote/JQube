package net.jqube.server.limiter.algos;

import net.jqube.server.limiter.policies.RateLimitPolicy;
import net.jqube.server.limiter.records.RateLimitResult;

public interface RateLimitAlgorithm {
    RateLimitResult check(String key, RateLimitPolicy policy);
}
