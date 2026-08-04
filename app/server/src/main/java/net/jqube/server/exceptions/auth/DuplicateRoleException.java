package net.jqube.server.exceptions.auth;

// Deps
import org.springframework.http.HttpStatus;

// Annotations
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.CONFLICT)
public class DuplicateRoleException extends RuntimeException {
    public DuplicateRoleException(String message) {
        super(message);
    }
}
