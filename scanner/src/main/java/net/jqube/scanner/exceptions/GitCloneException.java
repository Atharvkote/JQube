package net.jqube.scanner.exceptions;

public class GitCloneException extends RuntimeException {

    public GitCloneException(String message) {
        super(message);
    }

    public GitCloneException(String message, Throwable cause) {
        super(message, cause);
    }
}
