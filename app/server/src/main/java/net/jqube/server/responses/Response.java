package net.jqube.server.responses;

// Annotations
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

// Utils
import java.time.Instant;

@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class Response<T> {

    private boolean success;
    private String message;
    private int status;
    private T data;

    @Builder.Default
    private Instant timestamp = Instant.now();

    public static <T> Response<T> of(String message, int status, T data, boolean success) {
        return Response.<T>builder()
                .success(success)
                .message(message)
                .status(status)
                .data(data)
                .build();
    }
}