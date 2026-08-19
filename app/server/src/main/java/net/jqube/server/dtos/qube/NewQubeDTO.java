package net.jqube.server.dtos.qube;

public record NewQubeDTO(
        String name,

        String description,

        String defaultBranch,

        String targetBranch,

        Boolean webhookEnabled,

        Boolean autoScanEnabled,

        Boolean aiRemediationEnabled
) {
}
