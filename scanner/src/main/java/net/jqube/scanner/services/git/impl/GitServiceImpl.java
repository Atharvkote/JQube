package net.jqube.scanner.services.git.impl;

import lombok.extern.slf4j.Slf4j;
import net.jqube.scanner.configs.properties.ScannerProperties;
import net.jqube.scanner.exceptions.GitCheckoutException;
import net.jqube.scanner.exceptions.GitCloneException;
import net.jqube.scanner.exceptions.WorkspaceException;
import net.jqube.scanner.services.git.GitService;
import net.jqube.scanner.process.ProcessExecutor;
import net.jqube.scanner.process.ProcessResult;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Duration;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
public class GitServiceImpl implements GitService {

    private final ScannerProperties scannerProperties;
    private final ProcessExecutor processExecutor;

    public GitServiceImpl(ScannerProperties scannerProperties, ProcessExecutor processExecutor) {
        this.scannerProperties = scannerProperties;
        this.processExecutor = processExecutor;
    }

    @Override
    public Path cloneRepository(String repositoryUrl, String commitSha, UUID jobId) {
        String workspaceRoot = scannerProperties.getWorkspace().getRoot();
        Path workspace = Path.of(workspaceRoot, jobId.toString());

        try {
            Files.createDirectories(workspace);
        } catch (IOException e) {
            throw new WorkspaceException(
                    "Failed to create workspace: " + workspace,
                    e
            );
        }

        Path repositoryDir = workspace.resolve("repository");

        try {
            log.info(
                    "Cloning repository jobId={}, url={}, workspace={}",
                    jobId,
                    repositoryUrl,
                    workspace
            );

            Duration gitTimeout = scannerProperties.getTimeout().getGitDuration();

            ProcessResult cloneResult = processExecutor.execute(
                    List.of(
                            scannerProperties.getTools().getGit(),
                            "clone",
                            repositoryUrl,
                            repositoryDir.toString()
                    ),
                    workspace,
                    gitTimeout
            );

            if (cloneResult.exitCode() != 0) {
                throw new GitCloneException(
                        "Git clone failed for jobId=" + jobId +
                                ", exitCode=" + cloneResult.exitCode() +
                                ", stderr=" + cloneResult.stderr()
                );
            }

            if (commitSha != null && !commitSha.trim().isEmpty() && !commitSha.equals("0000000000000000000000000000000000000000")) {
                log.info(
                        "Checking out commit jobId={}, commitSha={}",
                        jobId,
                        commitSha
                );

                ProcessResult checkoutResult = processExecutor.execute(
                        List.of(
                                scannerProperties.getTools().getGit(),
                                "-C",
                                repositoryDir.toString(),
                                "checkout",
                                commitSha
                        ),
                        workspace,
                        gitTimeout
                );

                if (checkoutResult.exitCode() != 0) {
                    throw new GitCheckoutException(
                            "Git checkout failed for jobId=" + jobId +
                                    ", commitSha=" + commitSha +
                                    ", exitCode=" + checkoutResult.exitCode() +
                                    ", stderr=" + checkoutResult.stderr()
                    );
                }
            } else {
                log.info("Skipping checkout for jobId={}, commitSha is empty or zero", jobId);
            }

            log.info(
                    "Repository checkout completed jobId={}, workspace={}",
                    jobId,
                    repositoryDir
            );

            return repositoryDir;

        } catch (GitCloneException | GitCheckoutException e) {
            cleanup(workspace);
            throw e;
        } catch (Exception e) {
            cleanup(workspace);
            throw new GitCloneException(
                    "Unexpected error during git operations for jobId=" + jobId,
                    e
            );
        }
    }

    @Override
    public void cleanup(Path workspace) {
        if (workspace == null) {
            return;
        }

        try {
            deleteRecursively(workspace);
            log.info("Cleaning workspace jobId={}, path={}", workspace, workspace);
        } catch (IOException e) {
            log.warn(
                    "Failed to cleanup workspace: {}",
                    workspace,
                    e
            );
        }
    }

    private void deleteRecursively(Path path) throws IOException {
        if (!Files.exists(path)) {
            return;
        }

        java.nio.file.Files.walk(path)
                .sorted((a, b) -> -a.compareTo(b))
                .forEach(p -> {
                    try {
                        Files.delete(p);
                    } catch (IOException e) {
                        log.warn("Failed to delete: {}", p, e);
                    }
                });
    }
}
