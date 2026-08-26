package net.jqube.scanner.git;

import net.jqube.scanner.configs.properties.ScannerProperties;
import net.jqube.scanner.exceptions.GitCloneException;
import net.jqube.scanner.exceptions.GitCheckoutException;
import net.jqube.scanner.services.git.impl.GitServiceImpl;
import net.jqube.scanner.process.ProcessExecutor;
import net.jqube.scanner.process.ProcessResult;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

import java.lang.reflect.Field;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Duration;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.*;

class GitServiceImplTest {

    @Test
    void cloneSuccess(@TempDir Path tempDir) throws Exception {
        ProcessExecutor processExecutor = mock(ProcessExecutor.class);
        ScannerProperties properties = createScannerProperties();

        GitServiceImpl gitService = new GitServiceImpl(properties, processExecutor);

        when(processExecutor.execute(anyList(), any(Path.class), any(Duration.class)))
                .thenReturn(new ProcessResult(0, "", ""));

        UUID jobId = UUID.randomUUID();
        Path workspace = gitService.cloneRepository("https://github.com/test/repo.git", "abc123", jobId);

        assertNotNull(workspace);
        assertTrue(workspace.toString().contains(jobId.toString()));
        assertTrue(workspace.toString().contains("repository"));

        verify(processExecutor, times(2)).execute(anyList(), any(Path.class), any(Duration.class));
    }

    @Test
    void cloneFailure(@TempDir Path tempDir) throws Exception {
        ProcessExecutor processExecutor = mock(ProcessExecutor.class);
        ScannerProperties properties = createScannerProperties();

        GitServiceImpl gitService = new GitServiceImpl(properties, processExecutor);

        when(processExecutor.execute(anyList(), any(Path.class), any(Duration.class)))
                .thenReturn(new ProcessResult(1, "", "fatal: repository not found"));

        UUID jobId = UUID.randomUUID();

        GitCloneException exception = assertThrows(
                GitCloneException.class,
                () -> gitService.cloneRepository("https://github.com/test/repo.git", "abc123", jobId)
        );

        assertTrue(exception.getMessage().contains("Git clone failed"));
    }

    @Test
    void checkoutFailure(@TempDir Path tempDir) throws Exception {
        ProcessExecutor processExecutor = mock(ProcessExecutor.class);
        ScannerProperties properties = createScannerProperties();

        GitServiceImpl gitService = new GitServiceImpl(properties, processExecutor);

        when(processExecutor.execute(anyList(), any(Path.class), any(Duration.class)))
                .thenReturn(new ProcessResult(0, "", ""))
                .thenReturn(new ProcessResult(1, "", "fatal: reference is not a tree"));

        UUID jobId = UUID.randomUUID();

        GitCheckoutException exception = assertThrows(
                GitCheckoutException.class,
                () -> gitService.cloneRepository("https://github.com/test/repo.git", "abc123", jobId)
        );

        assertTrue(exception.getMessage().contains("Git checkout failed"));
    }

    @Test
    void cleanupRemovesWorkspace(@TempDir Path tempDir) throws Exception {
        ProcessExecutor processExecutor = mock(ProcessExecutor.class);
        ScannerProperties properties = createScannerProperties();

        GitServiceImpl gitService = new GitServiceImpl(properties, processExecutor);

        Path testDir = tempDir.resolve("test-workspace");
        Files.createDirectories(testDir);
        assertTrue(Files.exists(testDir));

        gitService.cleanup(testDir);
        assertFalse(Files.exists(testDir));
    }

    private ScannerProperties createScannerProperties() throws Exception {
        ScannerProperties properties = new ScannerProperties();
        Field workspaceField = ScannerProperties.class.getDeclaredField("workspace");
        workspaceField.setAccessible(true);
        ScannerProperties.Workspace workspace = new ScannerProperties.Workspace();
        workspace.setRoot("/tmp/jqube/scans");
        workspaceField.set(properties, workspace);

        Field timeoutField = ScannerProperties.class.getDeclaredField("timeout");
        timeoutField.setAccessible(true);
        ScannerProperties.Timeout timeout = new ScannerProperties.Timeout();
        timeout.setGit("5m");
        timeoutField.set(properties, timeout);

        Field toolsField = ScannerProperties.class.getDeclaredField("tools");
        toolsField.setAccessible(true);
        ScannerProperties.Tools tools = new ScannerProperties.Tools();
        tools.setGit("git");
        toolsField.set(properties, tools);

        return properties;
    }
}
