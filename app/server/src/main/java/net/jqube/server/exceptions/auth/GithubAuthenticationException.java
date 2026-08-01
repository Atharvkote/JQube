package net.jqube.server.exceptions.auth;

public class GithubAuthenticationException extends RuntimeException {
    public GithubAuthenticationException(String message) {
        super(message);
    }
}
