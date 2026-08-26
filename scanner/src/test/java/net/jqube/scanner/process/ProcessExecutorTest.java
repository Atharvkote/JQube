package net.jqube.scanner.process;

import net.jqube.scanner.process.impls.ProcessExecutorImpl;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

import java.nio.file.Path;
import java.time.Duration;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class ProcessExecutorTest {

    private final ProcessExecutorImpl processExecutor = new ProcessExecutorImpl();

    @Test
    void successfulCommand(@TempDir Path tempDir) {
        ProcessResult result = processExecutor.execute(
                List.of("cmd", "/c", "echo hello"),
                tempDir,
                Duration.ofSeconds(10)
        );

        assertEquals(0, result.exitCode());
        assertTrue(result.stdout().contains("hello"));
    }

    @Test
    void nonZeroExitCode(@TempDir Path tempDir) {
        ProcessResult result = processExecutor.execute(
                List.of("cmd", "/c", "exit 1"),
                tempDir,
                Duration.ofSeconds(10)
        );

        assertEquals(1, result.exitCode());
    }

    @Test
    void stderrCapture(@TempDir Path tempDir) {
        ProcessResult result = processExecutor.execute(
                List.of("cmd", "/c", "echo error >&2"),
                tempDir,
                Duration.ofSeconds(10)
        );

        assertEquals(0, result.exitCode());
        assertTrue(result.stderr().contains("error"));
    }

    @Test
    void timeoutThrowsException() {
        assertThrows(
                net.jqube.scanner.exceptions.ScannerTimeoutException.class,
                () -> processExecutor.execute(
                        List.of("cmd", "/c", "ping -n 6 127.0.0.1 >nul"),
                        Path.of("C:\\Windows\\Temp"),
                        Duration.ofMillis(500)
                )
        );
    }
}
