package net.jqube.scanner.process;

public record ContainerExecutionResult(
        int exitCode,
        String stdout,
        String stderr,
        long duration,
        boolean timedOut,
        long startedAt,
        long finishedAt
) {
}
