package net.jqube.scanner.controllers.models;

import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class ScanResponse {
    private String scanId;
    private String status;
    private RepositoryInfo repository;
    private ScanSummary summary;
    private List<ScanToolResponse> tools;

    @Data
    @Builder
    public static class RepositoryInfo {
        private String url;
        private String branch;
        private String commitSha;
    }

    @Data
    @Builder
    public static class ScanSummary {
        private int total;
        private int critical;
        private int high;
        private int medium;
        private int low;
        private int info;
    }

    @Data
    @Builder
    public static class ScanToolResponse {
        private String tool;
        private String status;
        private int findings;
    }
}
