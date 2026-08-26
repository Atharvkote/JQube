package net.jqube.scanner.exceptions;

public class ScannerOutputParseException extends RuntimeException {

    public ScannerOutputParseException(String message) {
        super(message);
    }

    public ScannerOutputParseException(String message, Throwable cause) {
        super(message, cause);
    }
}
