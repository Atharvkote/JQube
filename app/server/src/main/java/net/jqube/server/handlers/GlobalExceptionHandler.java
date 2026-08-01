package net.jqube.server.handlers;

// Exceptions
import io.jsonwebtoken.ExpiredJwtException; // Added this import
import io.jsonwebtoken.MalformedJwtException; // Added this import
import io.jsonwebtoken.security.SignatureException; // Added this import

// Error Response Model
import net.jqube.server.exceptions.auth.*;
import net.jqube.server.exceptions.shared.UserNotFoundException;
import net.jqube.server.responses.ErrorResponse;

// Deps
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.security.authentication.BadCredentialsException;

// Annotations
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.resource.NoResourceFoundException;

// Utils
import java.util.Objects;

@Slf4j
@RestControllerAdvice
@SuppressWarnings("unused")  // As handlers are invoked by spring they remain unused in the codebase
public class GlobalExceptionHandler {

    @ExceptionHandler(UserAlreadyExistsException.class)
    public ResponseEntity<ErrorResponse> handleUserAlreadyExists(
            UserAlreadyExistsException ex) {
        log.warn("User already exists: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ErrorResponse.of(
                        ex.getMessage(),
                        HttpStatus.BAD_REQUEST.value()
                ));
    }

    @ExceptionHandler(GithubAuthenticationException.class)
    public ResponseEntity<ErrorResponse> handleGithubAuthException(GithubAuthenticationException ex) {
        log.warn("GitHub OAuth error: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ErrorResponse.of(ex.getMessage(), HttpStatus.BAD_REQUEST.value()));
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ErrorResponse> handleInvalidJson(
            HttpMessageNotReadableException ex) {

        ErrorResponse error = ErrorResponse.builder()
                .status(HttpStatus.BAD_REQUEST.value())
                .message("Invalid JSON format.")
                .build();

        return ResponseEntity.badRequest().body(error);
    }

    @ExceptionHandler(NoResourceFoundException.class)
    public ResponseEntity<ErrorResponse> handleNoResourceFound(
            NoResourceFoundException ex) {

        ErrorResponse error = ErrorResponse.builder()
                .success(false)
                .status(HttpStatus.NOT_FOUND.value())
                .message("Route not found.")
                .build();

        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
    }

    @ExceptionHandler(UserNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleUserNotFound(
            UserNotFoundException ex) {
        log.warn("User not found: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ErrorResponse.of(
                        ex.getMessage(),
                        HttpStatus.NOT_FOUND.value()
                ));
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ErrorResponse> handleBadCredentials(
            BadCredentialsException ex) {
        log.warn("Invalid login attempt: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(ErrorResponse.of(
                        ex.getMessage(),
                        HttpStatus.UNAUTHORIZED.value()
                ));
    }

    @ExceptionHandler(UserNotVerifiedException.class)
    public ResponseEntity<ErrorResponse> handleUserNotVerified(
            UserNotVerifiedException ex) {
        log.warn("Unverified user attempted access: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(ErrorResponse.of(
                        ex.getMessage(),
                        HttpStatus.FORBIDDEN.value()
                ));
    }

    @ExceptionHandler(InvalidVerificationCodeException.class)
    public ResponseEntity<ErrorResponse> handleVerificationCode(
            InvalidVerificationCodeException ex) {
        log.warn("Invalid verification code: {}", ex.getMessage());
        return ResponseEntity.badRequest()
                .body(ErrorResponse.of(
                        ex.getMessage(),
                        HttpStatus.BAD_REQUEST.value()
                ));
    }

    @ExceptionHandler(TokenExpiredException.class)
    public ResponseEntity<ErrorResponse> handleTokenExpired(
            TokenExpiredException ex) {
        log.warn("Expired token used: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(ErrorResponse.of(
                        ex.getMessage(),
                        HttpStatus.UNAUTHORIZED.value()
                ));
    }

    @ExceptionHandler(ExpiredJwtException.class) // Added handler for ExpiredJwtException
    public ResponseEntity<ErrorResponse> handleExpiredJwtException(ExpiredJwtException ex) {
        log.warn("Expired JWT token: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(ErrorResponse.of(
                        "JWT token has expired",
                        HttpStatus.UNAUTHORIZED.value()
                ));
    }

    @ExceptionHandler(MalformedJwtException.class) // Added handler for MalformedJwtException
    public ResponseEntity<ErrorResponse> handleMalformedJwtException(MalformedJwtException ex) {
        log.warn("Malformed JWT token: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(ErrorResponse.of(
                        "Malformed JWT token",
                        HttpStatus.UNAUTHORIZED.value()
                ));
    }

    @ExceptionHandler(SignatureException.class) // Added handler for SignatureException
    public ResponseEntity<ErrorResponse> handleSignatureException(SignatureException ex) {
        log.warn("Invalid JWT signature: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(ErrorResponse.of(
                        "Invalid JWT signature",
                        HttpStatus.UNAUTHORIZED.value()
                ));
    }

    @ExceptionHandler(RoleNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleRoleNotFound(
            RoleNotFoundException ex) {
        log.warn("Role not found: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ErrorResponse.of(
                        ex.getMessage(),
                        HttpStatus.NOT_FOUND.value()
                ));
    }

    @ExceptionHandler(DuplicateRoleException.class)
    public ResponseEntity<ErrorResponse> handleDuplicateRole(
            DuplicateRoleException ex) {
        log.warn("Duplicate role: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ErrorResponse.of(
                        ex.getMessage(),
                        HttpStatus.BAD_REQUEST.value()
                ));
    }

    @ExceptionHandler(InvalidRoleAssignmentException.class)
    public ResponseEntity<ErrorResponse> handleInvalidRoleAssignment(
            InvalidRoleAssignmentException ex) {
        log.warn("Invalid role assignment: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ErrorResponse.of(
                        ex.getMessage(),
                        HttpStatus.BAD_REQUEST.value()
                ));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidation(
            MethodArgumentNotValidException ex) {
        String message = Objects.requireNonNull(ex.getBindingResult()
                        .getFieldError())
                .getDefaultMessage();
        log.warn("Validation failed: {}", message);
        return ResponseEntity.badRequest()
                .body(ErrorResponse.of(
                        message,
                        HttpStatus.BAD_REQUEST.value()
                ));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleUnknown(Exception ex) {
        log.error("Unhandled exception occurred", ex);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ErrorResponse.of(
                        "Something went wrong.",
                        HttpStatus.INTERNAL_SERVER_ERROR.value()
                ));
    }
}