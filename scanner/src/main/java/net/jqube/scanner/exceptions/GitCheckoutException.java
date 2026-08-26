package net.jqube.scanner.exceptions;

public class GitCheckoutException extends RuntimeException {

    public GitCheckoutException(String message) {
        super(message);
    }

    public GitCheckoutException(String message, Throwable cause) {
        super(message, cause);
    }
}
