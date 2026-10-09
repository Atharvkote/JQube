package net.jqube.server.dtos.github;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Builder
@JsonIgnoreProperties(ignoreUnknown = true)
public record RepoOwnerDTO(

        Long id,

        String login,

        @JsonProperty("avatar_url")
        String avatarUrl,

        @JsonProperty("html_url")
        String htmlUrl,

        String type

) {
}