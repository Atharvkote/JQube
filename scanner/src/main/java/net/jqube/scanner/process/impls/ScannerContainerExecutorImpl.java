package net.jqube.scanner.process.impls;

import lombok.extern.slf4j.Slf4j;
import net.jqube.scanner.process.ContainerExecutionResult;
import net.jqube.scanner.process.ScannerContainerExecutor;
import org.springframework.stereotype.Component;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.file.Path;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

@Slf4j
@Component
public class ScannerContainerExecutorImpl implements ScannerContainerExecutor {

    @Override
    public ContainerExecutionResult execute(String image, List<String> arguments, Path workspace, Duration timeout) {
        long startedAt = System.currentTimeMillis();
        boolean timedOut = false;
        int exitCode = -1;
        String stdout = "";
        String stderr = "";

        List<String> command = new ArrayList<>();
        command.add("docker");
        command.add("run");
        command.add("--rm");

        // Mount repository read-only
        command.add("-v");
        // Convert to absolute path with forward slashes for cross-platform Docker mount compatibility
        String repoPath = workspace.toAbsolutePath().toString().replace('\\', '/');
        // Handle Windows C:/ issue when mounting to WSL/Docker Desktop
        // But Docker Desktop handles C:\ fine if formatted as C:/
        command.add(repoPath + ":/src:ro");

        // Mount results directory
        Path resultsDir = workspace.getParent().resolve("raw-results");
        String resultsPath = resultsDir.toAbsolutePath().toString().replace('\\', '/');
        command.add("-v");
        command.add(resultsPath + ":/results");

        // The image
        command.add(image);

        // The specific tools args
        command.addAll(arguments);

        ProcessBuilder pb = new ProcessBuilder(command);
        pb.directory(workspace.toFile());

        log.info("Executing Docker container: {} with args {}", image, arguments);

        try {
            Process process = pb.start();

            boolean finished = process.waitFor(timeout.toMillis(), TimeUnit.MILLISECONDS);

            try (BufferedReader outReader = new BufferedReader(new InputStreamReader(process.getInputStream()));
                 BufferedReader errReader = new BufferedReader(new InputStreamReader(process.getErrorStream()))) {
                stdout = outReader.lines().collect(Collectors.joining("\n"));
                stderr = errReader.lines().collect(Collectors.joining("\n"));
            }

            if (!finished) {
                timedOut = true;
                log.warn("Docker container execution timed out for image {}", image);
                process.destroyForcibly();
            } else {
                exitCode = process.exitValue();
            }

        } catch (InterruptedException e) {
            log.warn("Docker execution interrupted", e);
            Thread.currentThread().interrupt();
        } catch (Exception e) {
            log.error("Failed to execute Docker container", e);
            stderr += "\nException: " + e.getMessage();
        }

        long finishedAt = System.currentTimeMillis();
        return new ContainerExecutionResult(
                exitCode,
                stdout,
                stderr,
                finishedAt - startedAt,
                timedOut,
                startedAt,
                finishedAt
        );
    }
}
