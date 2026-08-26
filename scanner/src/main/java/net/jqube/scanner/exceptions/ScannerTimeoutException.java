package net.jqube.scanner.exceptions;

public class ScannerTimeoutException extends RuntimeException {

    public ScannerTimeoutException(String message) {
        super(message);
    }

    public ScannerTimeoutException(String message, Throwable cause) {
        super(message, cause);
    }
}
