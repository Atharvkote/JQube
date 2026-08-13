# JQUBE Server

![Java](https://img.shields.io/badge/Java-17-blue)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.2-green)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue)
![Flyway](https://img.shields.io/badge/Flyway-Migrations-red)
![License](https://img.shields.io/badge/License-MIT-lightgrey)

**JQUBE Server** is a Spring Boot 3.2 / Java 17 REST API backend providing JWT-based authentication, email-verified user registration, role-based access control (RBAC), GitHub account linking via a hand-rolled OAuth2 authorization-code flow, and a Qube (security-scan workspace) domain model. The project is stateless by design, using PostgreSQL for persistence and Flyway for schema migrations.

---

## Table of Contents

- [Project Structure](#project-structure)
- [Technology Stack](#technology-stack)
- [Architecture Overview](#architecture-overview)
- [Request Lifecycle](#request-lifecycle)
- [Authentication & Authorization](#authentication--authorization)
- [Database Schema](#database-schema)
- [API Surface](#api-surface)
- [Getting Started](#getting-started)
- [Configuration](#configuration)
- [Testing](#testing)
- [Deployment](#deployment)
- [Contributing](#contributing)

---

## Project Structure

```
C:\Project\JQUBE-server
├── app/
│   └── server/                        # Main Spring Boot application module
│       ├── src/
│       │   ├── main/
│       │   │   ├── java/net/jqube/server/
│       │   │   │   ├── JQubeServer.java          # Application entry point
│       │   │   │   ├── configs/                  # Spring configuration classes
│       │   │   │   ├── controllers/              # REST controllers
│       │   │   │   ├── dtos/                     # Request/response DTOs
│       │   │   │   ├── enums/                    # Role and authority enums
│       │   │   │   ├── exceptions/               # Custom exceptions
│       │   │   │   ├── filters/                  # Servlet filters
│       │   │   │   ├── handlers/                 # Global exception handler
│       │   │   │   ├── models/                   # JPA entities
│       │   │   │   ├── repositories/             # Spring Data JPA repositories
│       │   │   │   ├── responses/                # API envelope wrappers
│       │   │   │   └── services/                 # Business logic (interfaces + impls)
│       │   │   └── resources/
│       │   │       ├── application.yml           # Main configuration
│       │   │       ├── db/migration/             # Flyway SQL migrations (V1–V8)
│       │   │       ├── templates/                # Thymeleaf email templates
│       │   │       └── static/                   # Static assets
│       │   └── test/                             # Unit and integration tests
│       │       └── integration_tests/            # Security integration tests
│       ├── pom.xml                              # Maven build definition
│       ├── Dockerfile                           # Container image definition
│       ├── .env.example                         # Environment variable template
│       └── README.md                            # Detailed architecture docs
├── README.md                                    # This file
├── API.md                                       # Endpoint reference
├── ARCHITECTURE.md                              # C4 model and deep-dive architecture
└── DEVELOPMENT.md                               # Setup, build, and contribution guide
```

---

## Technology Stack

| Layer | Technology |
|---|---|
| **Language** | Java 17 |
| **Framework** | Spring Boot 3.2.0 (Web, Security, Data JPA, Validation, Mail, Thymeleaf) |
| **Database** | PostgreSQL 15+ |
| **Migrations** | Flyway Core + Flyway PostgreSQL |
| **Security** | Spring Security + JJWT 0.11.5 (HS256 JWT) |
| **Encryption** | AES-256-GCM (custom service) |
| **API Docs** | springdoc-openapi 2.2.0 (Swagger UI) |
| **Mail** | Spring Mail (Gmail SMTP:465 SSL) + Thymeleaf templates |
| **Env Mgmt** | spring-dotenv 4.0.0 (`.env` file loading) |
| **HTTP Client** | Spring `RestClient` (GitHub API integration) |
| **Build** | Maven 3.9+ |
| **Boilerplate** | Lombok 1.18.30 |
| **Testing** | JUnit 5, Spring Security Test, Testcontainers (PostgreSQL), AssertJ, Mockito |

---

## Architecture Overview

JQUBE Server follows a **Layered (N-Tier) Architecture** with strict one-way dependencies. Every business capability is exposed as a service interface, implemented separately, so controllers never depend on a concrete class.

### High-Level Dependency Flow

```mermaid
graph TD
    A[Client] --> B[RequestLoggingFilter]
    B --> C[Spring Security Filter Chain]
    C --> D[AuthenticationFilter]
    D --> E[Controller]
    E --> F[Service Interface]
    F --> G[Service Implementation]
    G --> H[Repository]
    H --> I[(PostgreSQL)]
    G --> J[Response<T> / ErrorResponse]
    J --> A
```

**Dependency direction (strictly one-way):**

```mermaid
graph LR
    CT[Controller] --> SI[Service Interface]
    SI --> IM[Service Implementation]
    IM --> RP[JPA Repository]
    RP --> DB[(PostgreSQL)]
```

### Package Structure

```mermaid
graph TD
    subgraph "net.jqube.server"
        direction LR
        C[controllers]
        S[services]
        R[repositories]
        M[models]
        D[dtos]
        RS[responses]
        CF[configs]
        CO[constants]
        E[enums]
        EX[exceptions]
        F[filters]
        H[handlers]
    end
    S --> SA[auth]
    S --> SG[github]
    S --> SI2[impls]
    SI2 --> SIA[auth]
    SI2 --> SIG[github]
    SI2 --> SIS[security]
    SI2 --> SISH[shared]
    M --> MA[auth]
    M --> MG[github]
    M --> MQ[qube]
    M --> MB[base]
    CF --> CP[properties]
```

---

## Request Lifecycle

Every HTTP request flows through the following pipeline:

```mermaid
sequenceDiagram
    participant C as Client
    participant T as Embedded Tomcat
    participant F1 as RequestLoggingFilter
    participant F2 as Spring Security
    participant F3 as AuthenticationFilter
    participant A as authorizeHttpRequests
    participant CT as Controller
    participant S as Service
    participant RP as Repository
    participant DB as PostgreSQL
    participant EH as GlobalExceptionHandler

    C->>T: HTTP Request
    T->>F1: Filter Chain
    F1->>F2: Log IP, method, URI, body
    F2->>F3: CORS → Session (STATELESS)
    F3->>F3: Extract Bearer JWT
    F3->>F3: Validate token → SecurityContext
    F3->>A: Authorization check
    A->>A: Path + verb + @PreAuthorize
    A->>CT: Route to controller
    CT->>CT: @Valid Bean Validation
    CT->>S: Call service interface
    S->>RP: Data access
    RP->>DB: SQL query
    DB-->>RP: Result
    RP-->>S: Entity
    S-->>CT: DTO / Response<T>
    CT-->>C: JSON Response

    Note over F3,EH: If any exception occurs...
    F3->>EH: Exception caught
    EH-->>C: ErrorResponse JSON
```

---

## Authentication & Authorization

### Registration & Email Verification Flow

```mermaid
sequenceDiagram
    participant C as Client
    participant A as AuthController
    participant S as AuthServiceImpl
    participant DB as PostgreSQL
    participant M as EmailService
    participant U as User

    C->>A: POST /api/v1/auth/register
    A->>S: register(RegisterDTO)
    S->>DB: Check if email exists
    alt Email exists & not verified
        S->>S: Regenerate 6-digit code (15 min TTL)
        S->>DB: Save user
        S->>M: Send verification email
        M->>U: Email with code
    else Email exists & verified
        S-->>A: Throw UserAlreadyExistsException
        A-->>C: 409 Conflict
    else New email
        S->>DB: Create disabled User + ROLE_USER
        S->>S: Generate 6-digit code
        S->>DB: Save user
        S->>M: Send verification email
        M->>U: Email with code
    end
    S-->>A: Return User
    A-->>C: 200 RegistrationSuccessDTO

    C->>A: POST /api/v1/auth/verify {code}
    A->>S: verifyUser(VerifyUserDTO)
    S->>DB: Find user by email
    S->>S: Validate code + expiry
    S->>DB: Set enabled = true, clear code
    S-->>A: void
    A-->>C: 200 OK

    C->>A: POST /api/v1/auth/login {email, password}
    A->>S: login(LoginDTO)
    S->>DB: Find user by email
    S->>S: Check enabled
    S->>S: BCrypt authenticate
    S-->>A: Return User
    A->>A: Generate JWT (24h expiry)
    A-->>C: 200 LoginResponse {token, expiresIn}
```

### JWT Validation on Subsequent Requests

```mermaid
flowchart TD
    A[Incoming Request with Authorization Header] --> B{Header starts with Bearer?}
    B -->|No| C[Pass through unauthenticated]
    B -->|Yes| D[Extract JWT token]
    D --> E[Extract username from JWT]
    E --> F{SecurityContext already authenticated?}
    F -->|Yes| C
    F -->|No| G[Load User from DB with roles]
    G --> H{JWTService.isTokenValid?}
    H -->|No| C
    H -->|Yes| I[Populate SecurityContext]
    I --> J[Proceed to authorizeHttpRequests]
    C --> K[Request proceeds unauthenticated]
    J --> K
```

### GitHub OAuth2 Flow (Hand-Rolled)

```mermaid
sequenceDiagram
    participant C as Client (Browser)
    participant S as JQUBE Server
    participant GH as GitHub OAuth
    participant DB as PostgreSQL
    participant E as EmailService

    Note over C,S: Step 1: Initiate Connection
    C->>S: GET /api/v1/github/connect (with JWT)
    S->>S: Resolve user from SecurityContext
    S->>S: Generate signed state JWT (10 min TTL, contains userId + purpose)
    S->>S: Build GitHub authorization URL
    S-->>C: Return authorization URL in response body

    Note over C,GH: Step 2: GitHub Authorization
    C->>GH: Redirect browser to GitHub authorization URL
    GH->>C: User grants/denies access
    GH->>S: GET /api/v1/github/callback?code=...&state=...

    Note over S,DB: Step 3: Token Exchange & Profile Fetch
    S->>S: Validate state JWT (signature + purpose + expiry)
    S->>GH: POST /login/oauth/access_token {code, client_id, client_secret}
    GH-->>S: {access_token, refresh_token, expires_in}
    S->>GH: GET /user (Authorization: Bearer access_token)
    GH-->>S: GitHub profile data
    S->>S: AES-256-GCM encrypt tokens
    S->>DB: Save/update GithubAccount

    alt First connection
        S->>E: Send welcome email
        E->>C: Welcome email
    end

    S-->>C: HTML: "Connection Successful" + postMessage
```

### Authorization Model

```mermaid
flowchart TD
    A[Incoming Request] --> B{Public endpoint?}
    B -->|Yes| C[Allow]
    B -->|No| D{Has Bearer JWT?}
    D -->|No| E[401 Unauthorized]
    D -->|Yes| F{Token valid?}
    F -->|No| E
    F -->|Yes| G{HTTP Method?}

    G -->|GET| H{Has ADMIN, USER, or VIEWER?}
    G -->|POST/PUT| I{Has ADMIN or USER?}
    G -->|PATCH/DELETE| J{Has ADMIN?}

    H -->|Yes| K{@PreAuthorize check?}
    H -->|No| E
    I -->|Yes| K
    I -->|No| E
    J -->|Yes| K
    J -->|No| E

    K -->|Pass| C
    K -->|Fail| E

    C --> L[Controller method executes]
```

---

## Database Schema

```mermaid
erDiagram
    users ||--o{ user_roles : has
    users ||--o| github_accounts : has
    roles ||--o{ user_roles : assigned_to
    qubes ||--o{ qube_members : contains
    qubes ||--o| qube_metrics : has
    users ||--o{ qube_members : member_of
    users ||--o{ qube_members : invited_by

    users {
        uuid id PK
        varchar username UK
        varchar email UK
        varchar password
        varchar verification_code
        timestamp verification_expires_at
        boolean enabled
        boolean account_locked
        instant locked_until
        instant last_login_at
        integer failed_login_attempts
        timestamp created_at
        timestamp updated_at
        uuid created_by
        uuid updated_by
        timestamp deleted_at
        uuid deleted_by
        boolean is_deleted
    }

    roles {
        uuid id PK
        varchar name UK
        varchar description
        timestamp created_at
        timestamp updated_at
        uuid created_by
        uuid updated_by
        timestamp deleted_at
        uuid deleted_by
        boolean is_deleted
    }

    user_roles {
        uuid user_id PK,FK
        uuid role_id PK,FK
    }

    github_accounts {
        uuid id PK
        uuid user_id UK,FK
        bigint github_id UK
        varchar username
        varchar name
        varchar email
        varchar avatar_url
        varchar profile_url
        varchar bio
        varchar company
        varchar blog
        varchar location
        integer public_repos
        integer followers
        integer following
        varchar encrypted_access_token
        varchar encrypted_refresh_token
        varchar token_type
        varchar scope
        timestamp access_token_expires_at
        timestamp refresh_token_expires_at
        timestamp last_synced_at
        timestamp created_at
        timestamp updated_at
        uuid created_by
        uuid updated_by
        timestamp deleted_at
        uuid deleted_by
        boolean is_deleted
    }

    qubes {
        uuid id PK
        varchar name
        varchar slug UK
        text description
        bigint github_repository_id
        varchar github_node_id
        varchar repository_owner
        varchar repository_name
        varchar repository_full_name
        varchar default_branch
        varchar target_branch
        varchar clone_url
        varchar html_url
        boolean private_repository
        varchar workspace_path
        boolean webhook_enabled
        boolean auto_scan_enabled
        boolean ai_remediation_enabled
        boolean archived
        timestamp created_at
        timestamp updated_at
        uuid created_by
        uuid updated_by
        timestamp deleted_at
        uuid deleted_by
        boolean is_deleted
    }

    qube_members {
        uuid id PK
        uuid qube_id FK
        uuid user_id FK
        varchar role
        boolean invitation_accepted
        boolean active
        timestamp invited_at
        timestamp joined_at
        uuid invited_by
        timestamp created_at
        timestamp updated_at
        uuid created_by
        uuid updated_by
        timestamp deleted_at
        uuid deleted_by
        boolean is_deleted
    }

    qube_metrics {
        uuid id PK
        uuid qube_id UK,FK
        uuid latest_scan_id
        bigint total_scans
        bigint successful_scans
        bigint failed_scans
        bigint cancelled_scans
        bigint queued_scans
        bigint total_findings
        bigint open_findings
        bigint resolved_findings
        bigint suppressed_findings
        bigint critical_findings
        bigint high_findings
        bigint medium_findings
        bigint low_findings
        bigint info_findings
        bigint ai_remediations_generated
        bigint pull_requests_created
        bigint merged_pull_requests
        bigint average_scan_duration_ms
        bigint fastest_scan_duration_ms
        bigint slowest_scan_duration_ms
        double precision security_score
        double precision risk_score
        timestamp created_at
        timestamp updated_at
        uuid created_by
        uuid updated_by
        timestamp deleted_at
        uuid deleted_by
        boolean is_deleted
    }
```

---

## API Surface

All endpoints return a consistent `Response<T>` envelope:

```json
{
  "success": true,
  "status": 200,
  "message": "...",
  "data": { ... }
}
```

### Auth Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/api/v1/auth/register` | Public | Register new user |
| `POST` | `/api/v1/auth/login` | Public | Login with credentials |
| `POST` | `/api/v1/auth/verify` | Public | Verify email with 6-digit code |
| `POST` | `/api/v1/auth/resend-code` | Public | Resend verification code |

### User Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/api/v1/user/me` | ADMIN, USER, VIEWER | Get current user profile |

### Admin Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/api/v1/admin/users` | ADMIN | List all users |
| `GET` | `/api/v1/admin/users/{id}` | ADMIN | Get user by ID |
| `DELETE` | `/api/v1/admin/users/{id}` | ADMIN | Delete user |
| `PUT` | `/api/v1/admin/users/{id}/roles` | ADMIN | Replace user roles |
| `POST` | `/api/v1/admin/roles` | ADMIN | Create new role |
| `GET` | `/api/v1/admin/roles` | ADMIN | List all roles |

### GitHub Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/api/v1/github/connect` | USER | Get GitHub authorization URL |
| `GET` | `/api/v1/github/callback` | Public | GitHub OAuth callback |
| `GET` | `/api/v1/github/profile` | USER | Get linked GitHub profile |
| `DELETE` | `/api/v1/github/disconnect` | USER | Disconnect GitHub account |

### Health & Docs

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/health` | Public | Server health check |
| `GET` | `/v3/api-docs/**` | Public | OpenAPI JSON |
| `GET` | `/swagger-ui.html` | Public | Swagger UI |

---

## Getting Started

### Prerequisites

- Java 17+
- Maven 3.9+
- PostgreSQL 15+
- A Gmail account (for email verification)

### Local Setup

```bash
# 1. Clone the repository
git clone https://github.com/your-org/JQUBE-server.git
cd JQUBE-server/app/server

# 2. Copy environment template
cp .env.example .env

# 3. Edit .env with your values
#    Required: SPRING_DATASOURCE_URL, SPRING_DATASOURCE_USERNAME, SPRING_DATASOURCE_PASSWORD,
#              SUPPORT_EMAIL, APP_PASSWORD, JWT_SECRET_KEY, GITHUB_OAUTH_*

# 4. Build and run
./mvnw spring-boot:run
```

The server starts on port `8080` by default. Swagger UI is available at `http://localhost:8080/swagger-ui.html`.

### Build

```bash
cd app/server
./mvnw clean package
java -jar target/server-0.0.1-SNAPSHOT.jar
```

---

## Configuration

Configuration is loaded from `application.yml` and `.env` (via `spring-dotenv`).

```mermaid
flowchart LR
    A[application.yml] --> B[Spring Environment]
    C[.env file] --> B
    D[System Environment Variables] --> B
    B --> E[@Value injection]
    B --> F[@ConfigurationProperties]
    E --> G[Beans / Services]
    F --> G
```

Key configuration groups:

| Group | Prefix | Purpose |
|---|---|---|
| Server | `server.*` | Port, servlet config |
| DataSource | `spring.datasource.*` | PostgreSQL connection |
| JPA | `spring.jpa.*` | Hibernate DDL mode |
| Flyway | `spring.flyway.*` | Migration locations |
| Mail | `spring.mail.*` | Gmail SMTP settings |
| GitHub OAuth | `github.oauth.*` | Client ID, secret, redirect URI |
| JWT | `security.jwt.*` | Secret key, expiry time |
| Encryption | `security.encryption.*` | AES-256 key |
| Client | `client.url` | Frontend URL for redirects |
| OpenAPI | `springdoc.*` | Swagger UI settings |

---

## Testing

```bash
cd app/server

# Run all tests (unit + integration with Testcontainers)
./mvnw test

# Run only unit tests
./mvnw test -Dtest="*Test"

# Run integration tests
./mvnw test -Dtest="*IntegrationTest"
```

The project uses **Testcontainers** for integration tests, spinning up an ephemeral PostgreSQL container automatically. No local database is required for tests.

---

## Deployment

### Docker (Planned)

The `app/server/Dockerfile` is a placeholder. To containerize:

```dockerfile
FROM eclipse-temurin:17-jdk-alpine
COPY target/server-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app.jar"]
```

### Environment Variables (Production)

| Variable | Required | Description |
|---|---|---|
| `SERVER_PORT` | No | HTTP port (default: 8080) |
| `SPRING_DATASOURCE_URL` | Yes | JDBC URL |
| `SPRING_DATASOURCE_USERNAME` | Yes | DB username |
| `SPRING_DATASOURCE_PASSWORD` | Yes | DB password |
| `SUPPORT_EMAIL` | Yes | Gmail sender address |
| `APP_PASSWORD` | Yes | Gmail app password |
| `JWT_SECRET_KEY` | Yes | Base64-encoded HS256 secret |
| `GITHUB_OAUTH_CLIENT_ID` | Yes | GitHub OAuth app ID |
| `GITHUB_OAUTH_CLIENT_SECRET` | Yes | GitHub OAuth app secret |
| `GITHUB_REDIRECT_URI` | Yes | OAuth callback URL |
| `CLIENT_URL` | Yes | Frontend application URL |
| `AES_ENCRYPTION_KEY` | Yes | AES-256 encryption key |

---

## Contributing

See [DEVELOPMENT.md](DEVELOPMENT.md) for setup instructions, code conventions, and contribution guidelines.

---

## License

MIT
