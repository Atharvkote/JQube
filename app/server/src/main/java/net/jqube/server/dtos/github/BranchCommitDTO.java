package net.jqube.server.dtos.github;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Builder
@JsonIgnoreProperties(ignoreUnknown = true)
public record BranchCommitDTO(

        String sha,

        @JsonProperty("url")
        String apiUrl

) {
}