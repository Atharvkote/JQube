package net.jqube.server.limiter.records;

import net.jqube.server.enums.limiter.ClientType;

public record ClientContext(
        String clientId,
        ClientType clientType,
        String ipAddress,
        String userId,
        String httpMethod,
        String requestPath) {
}