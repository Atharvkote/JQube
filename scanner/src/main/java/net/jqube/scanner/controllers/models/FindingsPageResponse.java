package net.jqube.scanner.controllers.models;

import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class FindingsPageResponse {
    private String scanId;
    private int total;
    private List<FindingResponse> findings;

    @Data
    @Builder
    public static class FindingResponse {
        private String id;
        private String fingerprint;
        private String scanner;
        private String severity;
        private String ruleId;
        private String title;
        private String file;
        private Integer line;
        private String description;
    }
}
