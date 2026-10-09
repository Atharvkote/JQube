package net.jqube.server.dtos.github;

import lombok.Builder;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Builder
@JsonIgnoreProperties(ignoreUnknown = true)
public record RepoPermissionsDTO(

        Boolean admin,

        Boolean maintain,

        Boolean push,

        Boolean triage,

        Boolean pull

) {
}