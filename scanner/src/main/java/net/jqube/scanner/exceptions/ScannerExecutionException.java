package net.jqube.scanner.exceptions;

public class ScannerExecutionException extends RuntimeException {

    public ScannerExecutionException(String message) {
        super(message);
    }

    public ScannerExecutionException(String message, Throwable cause) {
        super(message, cause);
    }
}
