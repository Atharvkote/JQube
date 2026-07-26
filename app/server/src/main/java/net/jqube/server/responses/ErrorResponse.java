package net.jqube.server.responses;

// Annotations
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

// Utils
import java.time.Instant;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ErrorResponse {

    private boolean success;
    private String message;
    private int status;
    @Builder.Default
    private Instant timestamp = Instant.now();

    public static ErrorResponse of(String message, int status) {
        return ErrorResponse.builder()
                .success(false)
                .message(message)
                .status(status)
                .build();
    }
}