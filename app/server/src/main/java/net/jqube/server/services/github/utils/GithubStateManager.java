package net.jqube.server.services.github.utils;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import net.jqube.server.configs.properties.JWTProperties;
import net.jqube.server.exceptions.auth.GithubAuthenticationException;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.util.Date;
import java.util.UUID; // Import UUID

// Signed, short-lived "state" tokens for the GitHub OAuth flow.
// Prevents the CSRF/account-hijack hole that exists when the raw
// user id is used as the OAuth "state" value.

@Service
public class GithubStateManager {

    private static final String PURPOSE_CLAIM = "purpose";
    private static final String PURPOSE_VALUE = "github_oauth_state";
    private static final long STATE_TTL_MILLIS = 10 * 60 * 1000; // 10 minutes

    private final JWTProperties jwtProperties;

    public GithubStateManager(JWTProperties jwtProperties) {
        this.jwtProperties = jwtProperties;
    }

    public String generate(UUID userId) { // Changed to UUID
        return Jwts.builder()
                .setSubject(userId.toString()) // Changed to use toString()
                .claim(PURPOSE_CLAIM, PURPOSE_VALUE)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + STATE_TTL_MILLIS))
                .signWith(signKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    public UUID validateAndExtractUserId(String state) { // Changed to return UUID
        try {
            Claims claims = Jwts.parserBuilder()
                    .setSigningKey(signKey())
                    .build()
                    .parseClaimsJws(state)
                    .getBody();

            if (!PURPOSE_VALUE.equals(claims.get(PURPOSE_CLAIM, String.class))) {
                throw new GithubAuthenticationException("Invalid GitHub OAuth state token.");
            }
            return UUID.fromString(claims.getSubject()); // Changed to parse UUID
        } catch (GithubAuthenticationException ex) {
            throw ex;
        } catch (Exception ex) {
            throw new GithubAuthenticationException("GitHub OAuth state token is invalid or has expired.");
        }
    }

    private Key signKey() {
        byte[] keyBytes = Decoders.BASE64.decode(jwtProperties.getSecretKey());
        return Keys.hmacShaKeyFor(keyBytes);
    }
}