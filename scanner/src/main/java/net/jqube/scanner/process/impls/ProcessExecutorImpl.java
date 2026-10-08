package net.jqube.scanner.process.impls;

import lombok.extern.slf4j.Slf4j;
import net.jqube.scanner.exceptions.ScannerExecutionException;
import net.jqube.scanner.exceptions.ScannerTimeoutException;
import net.jqube.scanner.process.ProcessExecutor;
import net.jqube.scanner.process.ProcessResult;
import org.springframework.stereotype.Component;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.nio.file.Path;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.TimeUnit;

@Slf4j
@Component
public class ProcessExecutorImpl implements ProcessExecutor {

    @Override
    public ProcessResult execute(
            List<String> command,
            Path workingDirectory,
            Duration timeout
    ) {
        if (command == null || command.isEmpty()) {
            throw new ScannerExecutionException("Command list is empty");
        }

        List<String> safeCommand = new ArrayList<>(command);
        ProcessBuilder processBuilder = new ProcessBuilder(safeCommand);
        processBuilder.directory(workingDirectory.toFile());
        processBuilder.redirectErrorStream(false);

        Process process;
        try {
            process = processBuilder.start();
        } catch (IOException e) {
            throw new ScannerExecutionException(
                    "Failed to start process: " + String.join(" ", safeCommand),
                    e
            );
        }

        StringBuilder stdoutBuilder = new StringBuilder();
        StringBuilder stderrBuilder = new StringBuilder();

        StreamGobbler stdoutGobbler = new StreamGobbler(
                process.getInputStream(),
                stdoutBuilder
        );
        StreamGobbler stderrGobbler = new StreamGobbler(
                process.getErrorStream(),
                stderrBuilder
        );

        Thread stdoutThread = new Thread(stdoutGobbler);
        Thread stderrThread = new Thread(stderrGobbler);
        stdoutThread.start();
        stderrThread.start();

        boolean finished;
        try {
            finished = process.waitFor(
                    timeout.toMillis(),
                    TimeUnit.MILLISECONDS
            );
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            destroyProcessTree(process);
            throw new ScannerExecutionException("Process interrupted", e);
        }

        if (!finished) {
            destroyProcessTree(process);
            throw new ScannerTimeoutException(
                    "Process timed out after " + timeout.toMillis() + "ms: " +
                            String.join(" ", safeCommand)
            );
        }

        try {
            stdoutThread.join(1000);
            stderrThread.join(1000);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }

        int exitCode = process.exitValue();
        String stdout = stdoutBuilder.toString();
        String stderr = stderrBuilder.toString();

        if (exitCode != 0) {
            log.warn(
                    "Process exited with non-zero code: command={}, exitCode={}, stderr={}",
                    String.join(" ", safeCommand),
                    exitCode,
                    stderr
            );
        }

        return new ProcessResult(exitCode, stdout, stderr);
    }

    private void destroyProcessTree(Process process) {
        ProcessHandle handle = process.toHandle();
        handle.descendants().forEach(descendant -> {
            descendant.destroy();
        });
        process.destroyForcibly();
    }

    private static class StreamGobbler implements Runnable {

        private final java.io.InputStream inputStream;
        private final StringBuilder output;

        StreamGobbler(java.io.InputStream inputStream, StringBuilder output) {
            this.inputStream = inputStream;
            this.output = output;
        }

        @Override
        public void run() {
            try (BufferedReader reader = new BufferedReader(
                    new InputStreamReader(inputStream, StandardCharsets.UTF_8))) {
                String line;
                while ((line = reader.readLine()) != null) {
                    output.append(line).append(System.lineSeparator());
                }
            } catch (IOException e) {
                log.debug("Error reading process stream", e);
            }
        }
    }
}
