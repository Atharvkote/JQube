package net.jqube.server.limiter.records;

public record RateLimitResult(
        boolean allowed,
        long limit,
        long remaining,
        long retryAfterSeconds,
        long resetAfterSeconds) {
}