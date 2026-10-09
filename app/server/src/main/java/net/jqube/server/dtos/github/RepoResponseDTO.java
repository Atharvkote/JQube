package net.jqube.server.dtos.github;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Builder
@JsonIgnoreProperties(ignoreUnknown = true)
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
        Boolean privateRepository,

        @JsonProperty("updated_at")
        String updatedAt,

        @JsonProperty("stargazers_count")
        Integer stargazersCount,

        @JsonProperty("forks_count")
        Integer forksCount

) {
}