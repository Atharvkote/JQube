# JQUBE Server — Application Properties Reference

## Table of Contents

1. [Configuration Overview](#configuration-overview)
2. [Loading Mechanism](#loading-mechanism)
3. [Server Configuration](#server-configuration)
4. [Spring Configuration](#spring-configuration)
5. [DataSource Configuration](#datasource-configuration)
6. [JPA Configuration](#jpa-configuration)
7. [Flyway Configuration](#flyway-configuration)
8. [Mail Configuration](#mail-configuration)
9. [GitHub OAuth Configuration](#github-oauth-configuration)
10. [Security Configuration](#security-configuration)
11. [OpenAPI Configuration](#openapi-configuration)
12. [Client Configuration](#client-configuration)
13. [Environment Variables Reference](#environment-variables-reference)
14. [Configuration Best Practices](#configuration-best-practices)

---

## Configuration Overview

JQUBE Server uses a layered configuration approach combining:
- `application.yml` — Primary configuration file
- `.env` file — Environment-specific overrides via `spring-dotenv`
- Environment variables — System-level overrides
- `@ConfigurationProperties` — Type-safe configuration binding
- `@Value` — Direct property injection

### Configuration Hierarchy (highest to lowest precedence)

```mermaid
flowchart TD
    A[1. System Environment Variables] --> B[2. .env file]
    B --> C[3. application.yml]
    C --> D[4. application.properties]
    D --> E[5. Default values]

    E --> F[Spring Environment]
    F --> G[@Value injection]
    F --> H[@ConfigurationProperties]
    G --> I[Beans / Services]
    H --> I
```

---

## Loading Mechanism

### spring-dotenv Integration

The project uses `spring-dotenv` 4.0.0 to load `.env` files:

```yaml
spring:
  config:
    import: optional:file:.env[.properties]
```

This loads `.env` as a property source, making all variables available via `${VARIABLE_NAME}` syntax in `application.yml`.

### Configuration Properties Scanning

```java
@SpringBootApplication
@ConfigurationPropertiesScan
public class JQubeServer {
    // Scans for @ConfigurationProperties annotated classes
}
```

This enables automatic binding of configuration properties to Java classes in `configs/properties/`.

---

## Server Configuration

### Properties

| Property | Type | Default | Description |
|---|---|---|---|
| `server.port` | Integer | `8080` | HTTP server port |
| `server.address` | String | — | Bind address (unset = all interfaces) |

### Source: `application.yml`

```yaml
server:
  port: ${SERVER_PORT:8080}
```

---

## Spring Configuration

### Properties

| Property | Type | Default | Description |
|---|---|---|---|
| `spring.application.name` | String | `JQube API Server` | Application name for logging/monitoring |
| `spring.config.import` | String | `optional:file:.env[.properties]` | Additional config sources |
| `spring.thymeleaf.prefix` | String | `classpath:/templates/` | Email template location |
| `spring.thymeleaf.suffix` | String | `.html` | Template file extension |
| `spring.thymeleaf.cache` | Boolean | `false` | Template caching (disable in dev) |

### Source: `application.yml`

```yaml
spring:
  application:
    name: JQube API Server
  config:
    import: optional:file:.env[.properties]
  thymeleaf:
    prefix: classpath:/templates/
    suffix: .html
    cache: false
```

---

## DataSource Configuration

### Properties

| Property | Type | Default | Description |
|---|---|---|---|
| `spring.datasource.url` | String | — | JDBC connection URL (required) |
| `spring.datasource.username` | String | — | Database username (required) |
| `spring.datasource.password` | String | — | Database password (required) |
| `spring.datasource.driver-class-name` | String | `org.postgresql.Driver` | JDBC driver class |

### Source: `application.yml`

```yaml
spring:
  datasource:
    url: ${SPRING_DATASOURCE_URL}
    username: ${SPRING_DATASOURCE_USERNAME}
    password: ${SPRING_DATASOURCE_PASSWORD}
```

### Example URL

```
jdbc:postgresql://localhost:5432/jqube_db?sslmode=require
```

---

## JPA Configuration

### Properties

| Property | Type | Default | Description |
|---|---|---|---|
| `spring.jpa.hibernate.ddl-auto` | String | `validate` | Hibernate DDL mode |
| `spring.jpa.show-sql` | Boolean | `false` | Log SQL statements |
| `spring.jpa.properties.hibernate.dialect` | String | — | Hibernate dialect |

### Source: `application.yml`

```yaml
spring:
  jpa:
    hibernate:
      ddl-auto: validate
```

### DDL Auto Modes

| Mode | Description | When to Use |
|---|---|---|
| `validate` | Validates schema against entities | Production (Flyway manages schema) |
| `update` | Auto-updates schema | Development only |
| `create` | Drops and recreates schema | Testing only |
| `create-drop` | Drops on shutdown | Testing only |
| `none` | No action | Never recommended |

---

## Flyway Configuration

### Properties

| Property | Type | Default | Description |
|---|---|---|---|
| `spring.flyway.enabled` | Boolean | `true` | Enable Flyway migrations |
| `spring.flyway.locations` | String | `classpath:db/migration` | Migration script locations |
| `spring.flyway.baseline-on-migrate` | Boolean | `true` | Baseline existing DBs |
| `spring.flyway.clean-disabled` | Boolean | `true` | Prevent `clean` in production |

### Source: `application.yml`

```yaml
spring:
  flyway:
    enabled: true
    locations: classpath:db/migration
    baseline-on-migrate: true
```

### Migration Files

```
src/main/resources/db/migration/
├── V1__Create_Users_Table.sql
├── V2__Create_Roles_Table.sql
├── V3__Create_User_Roles_Table.sql
├── V4__Insert_Default_Roles.sql
├── V5__Create_Github_Accounts_Table.sql
├── V6__Create_Qubes_Table.sql
├── V7__Create_Qube_Members_Table.sql
└── V8__Create_Qube_Metrics_Table.sql
```

---

## Mail Configuration

### Properties

| Property | Type | Default | Description |
|---|---|---|---|
| `spring.mail.host` | String | `smtp.gmail.com` | SMTP server host |
| `spring.mail.port` | Integer | `465` | SMTP server port (SSL) |
| `spring.mail.username` | String | — | SMTP authentication username |
| `spring.mail.password` | String | — | SMTP authentication password |
| `spring.mail.properties.mail.smtp.auth` | Boolean | `true` | Enable SMTP authentication |
| `spring.mail.properties.mail.smtp.ssl.enable` | Boolean | `true` | Enable SSL/TLS |

### Source: `application.yml`

```yaml
spring:
  mail:
    host: smtp.gmail.com
    port: 465
    username: ${SUPPORT_EMAIL}
    password: ${APP_PASSWORD}
    properties:
      mail:
        smtp:
          auth: true
          ssl:
            enable: true
```

### Configuration Properties Class

```java
@ConfigurationProperties(prefix = "mail")
@Data
public class EmailProperties {
    private String host;
    private Integer port;
    private String username;
    private String password;
}
```

**Note:** `EmailProperties` is declared but **not injected** — `EmailServiceImpl` uses `@Value("${spring.mail.username}")` instead.

---

## GitHub OAuth Configuration

### Properties

| Property | Type | Description |
|---|---|---|
| `github.oauth.client-id` | String | GitHub OAuth app client ID |
| `github.oauth.client-secret` | String | GitHub OAuth app client secret |
| `github.oauth.redirect-uri` | String | OAuth callback URL |

### Source: `application.yml`

```yaml
github:
  oauth:
    client-id: ${GITHUB_OAUTH_CLIENT_ID}
    client-secret: ${GITHUB_OAUTH_CLIENT_SECRET}
    redirect-uri: ${GITHUB_REDIRECT_URI}
```

### Configuration Properties Class

```java
@ConfigurationProperties(prefix = "github.oauth")
@Data
public class GithubProperties {
    private String clientId;
    private String clientSecret;
    private String redirectUri;
}
```

### GitHub OAuth App Setup

1. Create OAuth App at https://github.com/settings/developers
2. Set **Authorization callback URL** to `${GITHUB_REDIRECT_URI}`
3. Copy **Client ID** and **Client Secret** to environment variables

---

## Security Configuration

### JWT Properties

| Property | Type | Default | Description |
|---|---|---|---|
| `security.jwt.secret-key` | String | — | Base64-encoded HS256 signing key (required) |
| `security.jwt.expiration-time` | Long | `86400000` | JWT expiry in milliseconds (24 hours) |

### Source: `application.yml`

```yaml
security:
  jwt:
    secret-key: ${JWT_SECRET_KEY}
    expiration-time: 86400000
```

### Configuration Properties Class

```java
@ConfigurationProperties(prefix = "security.jwt")
@Data
public class JWTProperties {
    private String secretKey;
    private long expirationTime;
}
```

### Encryption Properties

| Property | Type | Description |
|---|---|---|
| `security.encryption.key` | String | AES-256 encryption key for GitHub tokens |

### Source: `application.yml`

```yaml
security:
  encryption:
    key: ${AES_ENCRYPTION_KEY}
```

**Note:** There is no `@ConfigurationProperties` class for encryption — it's injected via `@Value`.

---

## OpenAPI Configuration

### Properties

| Property | Type | Default | Description |
|---|---|---|---|
| `springdoc.api-docs.enabled` | Boolean | `true` | Enable OpenAPI docs |
| `springdoc.api-docs.path` | String | `/v3/api-docs` | API docs endpoint path |
| `springdoc.swagger-ui.enabled` | Boolean | `true` | Enable Swagger UI |
| `springdoc.swagger-ui.path` | String | `/swagger-ui.html` | Swagger UI path |
| `springdoc.swagger-ui.operations-sorter` | String | `method` | Sort operations by HTTP method |
| `springdoc.swagger-ui.tags-sorter` | String | `alpha` | Sort tags alphabetically |
| `springdoc.swagger-ui.display-request-duration` | Boolean | `true` | Show request duration |
| `springdoc.swagger-ui.try-it-out-enabled` | Boolean | `true` | Enable "Try it out" |
| `springdoc.swagger-ui.doc-expansion` | String | `none` | Initial expansion level |
| `springdoc.packages-to-scan` | String | `net.jqube.server.controllers` | Controllers to document |
| `springdoc.paths-to-match` | List | `/api/**` | URL patterns to document |

### Source: `application.yml`

```yaml
springdoc:
  api-docs:
    enabled: true
    path: /v3/api-docs

  swagger-ui:
    enabled: true
    path: /swagger-ui.html
    operations-sorter: method
    tags-sorter: alpha
    display-request-duration: true
    try-it-out-enabled: true
    doc-expansion: none

  packages-to-scan: net.jqube.server.controllers
  paths-to-match:
    - /api/**
```

### Configuration Class

```java
@Configuration
public class OpenAPIConfiguration {

    @Bean
    public OpenAPI customOpenAPI(
            @Value("${spring.application.name}") String appName) {
        return new OpenAPI()
                .info(new Info().title(appName)
                        .description("JQUBE API Server")
                        .version("v1")
                        .contact(new Contact().name("JQUBE Team")));
    }
}
```

---

## Client Configuration

### Properties

| Property | Type | Description |
|---|---|---|
| `client.url` | String | Frontend application URL for redirects |

### Source: `application.yml`

```yaml
client:
    url: ${CLIENT_URL}
```

### Usage

Used in `GithubAuthServiceImpl` for the welcome email redirect:
```java
this.dashboardUrl = clientUrl + "/dashboard";
```

---

## Environment Variables Reference

### Complete `.env.example`

```env
# Application
APPLICATION_NAME=JQuBe
SERVER_PORT=8080

# Database
SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/jqube_db
SPRING_DATASOURCE_USERNAME=postgres
SPRING_DATASOURCE_PASSWORD=<SECRET_4bc53d1a>assword

# Email (Gmail SMTP)
SUPPORT_EMAIL=your-email@gmail.com
APP_PASSWORD=<SECRET_3123ed32>word

# JWT Security
JWT_SECRET_KEY=<base64-encoded-256-bit-key>

# GitHub OAuth
GITHUB_OAUTH_CLIENT_ID=<your-client-id>
GITHUB_OAUTH_CLIENT_SECRET=<your-client-secret>
GITHUB_REDIRECT_URI=http://localhost:8080/api/v1/github/callback

# Encryption
AES_ENCRYPTION_KEY=<base64-encoded-256-bit-key>

# Frontend
CLIENT_URL=http://localhost:3000

# Docker (optional)
DOCKERHUB_USERNAME=<your-dockerhub-username>
DOCKERHUB_ACCESS_TOKEN=<your-dockerhub-token>
```

### Generating Secure Keys

```bash
# Generate JWT secret key (256-bit)
openssl rand -base64 32

# Generate AES encryption key (256-bit)
openssl rand -base64 32

# Generate Gmail app password
# Visit: https://myaccount.google.com/apppasswords
```

---

## Configuration Best Practices

### 1. Never Commit Secrets

```gitignore
# .gitignore
.env
.env.local
.env.production
*.jks
*.p12
*.pem
```

### 2. Use Environment-Specific Profiles

```yaml
# application-dev.yml
spring:
  jpa:
    hibernate:
      ddl-auto: update
  thymeleaf:
    cache: false

---
# application-prod.yml
spring:
  jpa:
    hibernate:
      ddl-auto: validate
  thymeleaf:
    cache: true
```

### 3. Validate Required Properties

```java
@Component
@RequiredArgsConstructor
public class ConfigValidator implements ApplicationRunner {

    private final Environment env;

    @Override
    public void run(ApplicationArguments args) {
        List<String> required = List.of(
                "SPRING_DATASOURCE_URL",
                "JWT_SECRET_KEY",
                "AES_ENCRYPTION_KEY"
        );

        required.forEach(key -> {
            if (!env.containsProperty(key)) {
                throw new IllegalStateException(
                        "Required configuration missing: " + key);
            }
        });
    }
}
```

### 4. Use Configuration Properties Over @Value

```java
// Preferred: Type-safe configuration properties
@ConfigurationProperties(prefix = "security.jwt")
@Data
public class JWTProperties {
    private String secretKey;
    private long expirationTime;
}

// Less preferred: Direct @Value injection
@Value("${security.jwt.secret-key}")
private String secretKey;
```

### 5. Document All Properties

Every new configuration property should be documented in:
1. `application.yml` with comments
2. `.env.example` with placeholder values
3. This reference document

---

## Configuration Diagram

```mermaid
flowchart TD
    A[.env file] --> B[Spring Environment]
    C[application.yml] --> B
    D[System Env Vars] --> B
    B --> E[@ConfigurationProperties]
    B --> F[@Value]
    E --> G[JWTProperties]
    E --> H[GithubProperties]
    E --> I[EmailProperties]
    F --> J[EmailServiceImpl]
    F --> K[OpenAPIConfiguration]
    F --> L[GithubAuthServiceImpl]

    G --> M[JWTServiceImpl]
    H --> N[GithubAuthServiceImpl]
    I --> O[Unused]

    style O fill:#ff6b6b
    style M fill:#51cf66
    style N fill:#51cf66
    style J fill:#a9e34b
    style K fill:#a9e34b
    style L fill:#a9e34b
```

---

## Quick Reference

### All Configuration Keys

| Key | Type | Required | Source |
|---|---|---|---|
| `server.port` | int | No | `application.yml` |
| `spring.datasource.url` | string | Yes | `.env` |
| `spring.datasource.username` | string | Yes | `.env` |
| `spring.datasource.password` | string | Yes | `.env` |
| `spring.mail.host` | string | No | `application.yml` |
| `spring.mail.port` | int | No | `application.yml` |
| `spring.mail.username` | string | Yes | `.env` |
| `spring.mail.password` | string | Yes | `.env` |
| `security.jwt.secret-key` | string | Yes | `.env` |
| `security.jwt.expiration-time` | long | No | `application.yml` |
| `security.encryption.key` | string | Yes | `.env` |
| `github.oauth.client-id` | string | Yes | `.env` |
| `github.oauth.client-secret` | string | Yes | `.env` |
| `github.oauth.redirect-uri` | string | Yes | `.env` |
| `client.url` | string | Yes | `.env` |
