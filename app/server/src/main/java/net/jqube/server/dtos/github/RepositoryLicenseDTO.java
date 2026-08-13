package net.jqube.server.dtos.github;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;

@Builder
public record RepositoryLicenseDTO(

        String key,

        String name,

        @JsonProperty("spdx_id")
        String spdxId

) {
}