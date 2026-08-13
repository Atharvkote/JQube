package net.jqube.server.dtos.github;

import lombok.Builder;

@Builder
public record RepoPermissionsDTO(

        Boolean admin,

        Boolean maintain,

        Boolean push,

        Boolean triage,

        Boolean pull

) {
}