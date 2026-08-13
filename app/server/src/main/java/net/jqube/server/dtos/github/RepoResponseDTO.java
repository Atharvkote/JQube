package net.jqube.server.dtos.github;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;

@Builder
public record RepoResponseDTO(

        Long id,

        @JsonProperty("node_id")
        String nodeId,

        String name,

        @JsonProperty("full_name")
        String fullName,

        RepoOwnerDTO owner,

        String description,

        @JsonProperty("default_branch")
        String defaultBranch,

        @JsonProperty("clone_url")
        String cloneUrl,

        @JsonProperty("html_url")
        String htmlUrl,

        String language,

        RepositoryLicenseDTO license,

        RepoPermissionsDTO permissions,

        Boolean fork,

        Boolean archived,

        @JsonProperty("private")
        Boolean privateRepository

) {
}