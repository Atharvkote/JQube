package net.jqube.scanner.controllers.models;

import lombok.Data;
import java.util.List;

@Data
public class ScanRequest {
    private String repositoryUrl;
    private String branch;
    private String commit;
    private List<String> enabledScanners;
}
