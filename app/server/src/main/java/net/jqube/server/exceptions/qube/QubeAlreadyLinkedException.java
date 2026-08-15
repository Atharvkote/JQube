package net.jqube.server.exceptions.qube;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.CONFLICT)
public class QubeAlreadyLinkedException extends RuntimeException {
    public QubeAlreadyLinkedException(String message) {
        super(message);
    }
}
