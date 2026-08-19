package net.jqube.server.dtos.qube;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record ImportRepoRequestDTO(

        @NotBlank(message = "Repository identifier is required")
        @Size(min = 3, max = 200, message = "Repository identifier must be between 3 and 200 characters")
        @Pattern(
                regexp = "^[a-zA-Z0-9_.-]+/[a-zA-Z0-9_.-]+$",
                message = "Repository identifier must be in the format 'owner/repo'"
        )
        String repositoryIdentifier,

        @NotBlank(message = "Qube name is required")
        String name,

        String targetBranch,

        Boolean webhookEnabled,

        Boolean autoScanEnabled,

        Boolean aiRemediationEnabled
) {
}
