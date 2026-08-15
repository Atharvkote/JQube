package net.jqube.server.exceptions.qube;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.BAD_REQUEST)
public class InvalidRepoIdentifierException extends RuntimeException {
    public InvalidRepoIdentifierException(String message) {
        super(message);
    }
}
