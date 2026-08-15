package net.jqube.server.dtos.qube;

public record NewQubeDTO(
        String name,

        String description,

        String defaultBranch,

        String targetBranch,

        String workspacePath,

        Boolean webhookEnabled,

        Boolean autoScanEnabled,

        Boolean aiRemediationEnabled
) {
}
