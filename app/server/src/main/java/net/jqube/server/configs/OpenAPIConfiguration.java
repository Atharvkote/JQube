package net.jqube.server.configs;

// OpenAPI

import io.swagger.v3.oas.models.ExternalDocumentation;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;

// Spring
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenAPIConfiguration {

    @Bean
    public OpenAPI openAPI() {
        return new OpenAPI()
                .info(
                        new Info()
                                .title("J-QUBE API")
                                .version("1.0.0")
                                .description("""
                                        J-QUBE is a DevSecOps security platform that helps developers
                                        discover, manage, and remediate security vulnerabilities in
                                        their software repositories.
                                        
                                        The platform integrates with GitHub repositories and provides
                                        repository management, automated security scanning, vulnerability
                                        analysis, and AI-assisted security remediation.
                                        
                                        Core capabilities:
                                        • GitHub Repository Integration
                                        • Repository and Qube Management
                                        • Automated Security Scanning
                                        • Vulnerability and Security Finding Management
                                        • Secret and Dependency Detection
                                        • AI-Assisted Vulnerability Remediation
                                        • Automated Remediation Workflows
                                        • Pull Request-Based Remediation
                                        • User Authentication and Authorization
                                        • Role-Based Access Control (RBAC)
                                        • Security and Audit Management
                                        """)
                                .contact(
                                        new Contact()
                                                .name("Atharva Kote")
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
                                .description("J-QUBE GitHub Repository")
                                .url("https://github.com/Atharvkote/JQUBE")
                );
    }
}