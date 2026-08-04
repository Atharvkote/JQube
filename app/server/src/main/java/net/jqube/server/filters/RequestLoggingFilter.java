package net.jqube.server.filters;

// Deps
import lombok.NonNull;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.web.filter.OncePerRequestFilter;

// Services
import org.springframework.stereotype.Component;
import org.springframework.web.util.ContentCachingRequestWrapper;

// Utils
import java.io.IOException;

@Component
public class RequestLoggingFilter extends OncePerRequestFilter {

    private static final Logger logger =
            LoggerFactory.getLogger(RequestLoggingFilter.class);

    @Override
    public void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain)
            throws ServletException, IOException {

        ContentCachingRequestWrapper wrappedRequest =
                new ContentCachingRequestWrapper(request, 1024 * 1024);

        logger.info("IP      : {}", request.getRemoteAddr());
        logger.info("Method  : {}", request.getMethod());
        logger.info("URI     : {}", request.getRequestURI());
        logger.info("Query   : {}", request.getQueryString());

        filterChain.doFilter(wrappedRequest, response);

        String body = new String(
                wrappedRequest.getContentAsByteArray(),
                wrappedRequest.getCharacterEncoding()
        );

        logger.info("Body    : {}", body);
    }
}