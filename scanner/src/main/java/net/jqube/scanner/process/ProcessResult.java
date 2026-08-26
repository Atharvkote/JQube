package net.jqube.scanner.process;

public record ProcessResult(
        int exitCode,
        String stdout,
        String stderr
) {
}
