package net.jqube.server.services.auth;

// Deps
import org.springframework.security.core.userdetails.UserDetails;

// Utils
import java.util.Date;
import java.util.Map;

public interface JWTService {

    String generateToken(UserDetails userDetails);

    String generateToken(Map<String, Object> extraClaims, UserDetails userDetails);

    String extractUsername(String token);

    Date extractExpiration(String token);

    <T> T extractClaim(String token, java.util.function.Function<io.jsonwebtoken.Claims, T> claimsResolver);

    boolean isTokenValid(String token, UserDetails userDetails);
}