package net.jqube.server.dtos.qube;

import net.jqube.server.enums.QubeRoles;

import java.util.UUID;

public record QubeDTO(

        UUID id,

        String name,

        String slug,

        String description,

        Long githubRepositoryId,

        String githubNodeId,

        String repositoryOwner,

        String repositoryName,

        String repositoryFullName,

        String defaultBranch,

        String targetBranch,

        String cloneUrl,

        String htmlUrl,

        Boolean privateRepository,

        Boolean webhookEnabled,

        Boolean autoScanEnabled,

        Boolean aiRemediationEnabled,

        Boolean archived,

        QubeRoles currentUserRole
) {
}