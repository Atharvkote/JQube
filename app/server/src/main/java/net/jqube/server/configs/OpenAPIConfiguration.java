package net.jqube.server.configs;

// Deps
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.ExternalDocumentation;

// Annotations
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenAPIConfiguration {

    @Bean
    public OpenAPI openAPI() {
        return new OpenAPI()
                .info(
                        new Info()
                                .title("JQUBE Authentication & Authorization API")
                                .version("1.0.0")
                                .description("""
                                        JQUBE Authentication & Authorization Service provides
                                        secure user authentication, role-based access control (RBAC),
                                        JWT-based authorization, email verification, GitHub OAuth2
                                        login, and administrative role management.

                                        Features:
                                        • User Registration
                                        • Email Verification
                                        • JWT Authentication
                                        • GitHub OAuth2 Login
                                        • Role-Based Access Control (RBAC)
                                        • User Profile Management
                                        • Admin Role Management
                                        """)
                                .contact(
                                        new Contact()
                                                .name("Atharva Kote")
                                                .email("your-email@example.com")
                                                .url("https://github.com/Atharvkote")
                                )
                                .license(
                                        new License()
                                                .name("MIT License")
                                                .url("https://opensource.org/licenses/MIT")
                                )
                )
                .externalDocs(
                        new ExternalDocumentation()
                                .description("Project Repository")
                                .url("https://github.com/Atharvkote/JQUBE")
                );
    }
}