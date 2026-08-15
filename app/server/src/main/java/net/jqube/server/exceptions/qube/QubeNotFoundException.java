package net.jqube.server.exceptions.qube;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.NOT_FOUND)
public class QubeNotFoundException extends RuntimeException {
    public QubeNotFoundException(String message) {
        super(message);
    }
}
