package net.jqube.scanner.process;

import java.nio.file.Path;
import java.time.Duration;
import java.util.List;

public interface ProcessExecutor {

    ProcessResult execute(
            List<String> command,
            Path workingDirectory,
            Duration timeout
    );
}
