package net.jqube.scanner.services.git;

import java.nio.file.Path;
import java.util.UUID;

public interface GitService {

    Path cloneRepository(String repositoryUrl, String commitSha, UUID jobId);

    void cleanup(Path workspace);
}
