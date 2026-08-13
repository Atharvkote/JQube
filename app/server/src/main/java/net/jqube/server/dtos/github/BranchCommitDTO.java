package net.jqube.server.dtos.github;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;

@Builder
public record BranchCommitDTO(

        String sha,

        @JsonProperty("url")
        String apiUrl

) {
}