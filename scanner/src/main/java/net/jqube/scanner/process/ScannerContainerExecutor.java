package net.jqube.scanner.process;

import java.nio.file.Path;
import java.time.Duration;
import java.util.List;

public interface ScannerContainerExecutor {
    
    ContainerExecutionResult execute(
            String image,
            List<String> arguments,
            Path workspace,
            Duration timeout
    );
    
}
