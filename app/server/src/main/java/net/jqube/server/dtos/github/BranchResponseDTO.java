package net.jqube.server.dtos.github;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Builder
@JsonIgnoreProperties(ignoreUnknown = true)
public record BranchResponseDTO(

        String name,

        BranchCommitDTO commit,

        @JsonProperty("protected")
        Boolean isProtected

) {
}