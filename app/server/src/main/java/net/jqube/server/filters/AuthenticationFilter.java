package net.jqube.server.filters;

// Deps
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.lang.NonNull;
import org.springframework.security.core.Authentication;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.servlet.HandlerExceptionResolver;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.context.SecurityContextHolder;
import net.jqube.server.models.auth.User;
import net.jqube.server.repositories.UserRepository;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;

// Services
import net.jqube.server.services.auth.JWTService;

// Annotations
import org.springframework.stereotype.Component;

// Utils
import java.io.IOException;

@Component
public class AuthenticationFilter extends OncePerRequestFilter {

    private final HandlerExceptionResolver handlerExceptionResolver;
    private final JWTService jwtService;
    private final UserRepository userRepository;

    public AuthenticationFilter(
            HandlerExceptionResolver handlerExceptionResolver,
            JWTService jwtService,
            UserRepository userRepository)
    {
        this.handlerExceptionResolver = handlerExceptionResolver;
        this.jwtService = jwtService;
        this.userRepository = userRepository;
    }

    @Override
    public void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain)
            throws ServletException, IOException {

        try {

            final String authHeader = request.getHeader("Authorization");
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                filterChain.doFilter(request, response);
                return;
            }

            String token = authHeader.substring(7);
            String username = jwtService.extractUsername(token);
            Authentication authentication =
                    SecurityContextHolder.getContext().getAuthentication();

            if (username != null && authentication == null) {
                User user =
                        userRepository.findByUsernameWithRoles(username)
                                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
                UserDetails userDetails = user;
                System.out.println("Authorities: " + userDetails.getAuthorities());

                if (jwtService.isTokenValid(token, userDetails)) {
                    UsernamePasswordAuthenticationToken authToken =
                            new UsernamePasswordAuthenticationToken(
                                    userDetails,
                                    null,
                                    userDetails.getAuthorities());
                    authToken.setDetails(
                            new WebAuthenticationDetailsSource()
                                    .buildDetails(request));
                    SecurityContextHolder.getContext()
                            .setAuthentication(authToken);
                }
            }
            filterChain.doFilter(request, response);
        } catch (Exception ex) {
            handlerExceptionResolver.resolveException(
                    request,
                    response,
                    null,
                    ex);
        }
    }
}