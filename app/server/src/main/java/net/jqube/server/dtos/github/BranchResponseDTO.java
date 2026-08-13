package net.jqube.server.dtos.github;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;

@Builder
public record BranchResponseDTO(

        String name,

        BranchCommitDTO commit,

        @JsonProperty("protected")
        Boolean isProtected

) {
}