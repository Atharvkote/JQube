package net.jqube.server.configs;

// Filters
import net.jqube.server.filters.AuthenticationFilter;

// Deps
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

// Annotations
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;

// Utils
import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfiguration {

    final AuthenticationProvider authenticationProvider;
    final AuthenticationFilter authFilter;
    final CORSConfiguration corsConfiguration;

    public SecurityConfiguration(AuthenticationProvider authenticationProvider,
                                 AuthenticationFilter authFilter, CORSConfiguration corsConfiguration
    ){
        this.authenticationProvider = authenticationProvider;
        this.authFilter = authFilter;
        this.corsConfiguration = corsConfiguration;
    }

    @Bean
    public SecurityFilterChain  securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(
                        cors -> cors.configurationSource(
                                corsConfiguration.corsConfigurationSource()
                        )
                )
                .authorizeHttpRequests(authorize -> authorize
                        // Public endpoints that do not require authentication
                        .requestMatchers("/api/v1/auth/**").permitAll()
                        .requestMatchers("/health").permitAll()
                        .requestMatchers("/v3/api-docs/**", "/swagger-ui/**", "/swagger-ui.html").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/github/callback").permitAll()
                        // Role-based access for other endpoints
                        .requestMatchers(HttpMethod.GET).hasAnyRole("ADMIN", "USER", "VIEWER")
                        .requestMatchers(HttpMethod.POST).hasAnyRole("ADMIN", "USER")
                        .requestMatchers(HttpMethod.PUT).hasAnyRole("ADMIN", "USER")
                        .requestMatchers(HttpMethod.PATCH).hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE).hasRole("ADMIN")
                        // All other requests must be authenticated
                        .anyRequest().authenticated()
                )
                .sessionManagement(
                        session ->
                                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )
                .authenticationProvider(authenticationProvider)
                .addFilterBefore(authFilter , UsernamePasswordAuthenticationFilter.class)
        ;
        return http.build();
    }
}