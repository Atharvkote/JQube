# JQUBE API Server — Architecture Documentation

## Project Overview

JQUBE API Server is a Spring Boot 4.0.7 / Java 17 backend providing JWT-based authentication, email-verified user registration, role-based access control (RBAC), and GitHub account linking via a hand-rolled OAuth2 authorization-code flow. This document describes **how the system is built**, not a feature list — every claim below is derived directly from the source code in `src/main/java/net/jqube/server`.

## Architectural Goals

Inferred from the code structure and choices actually made:

- **Statelessness** — no server-side session; every request carries its own JWT.
- **Separation of contract from implementation** — every business capability is exposed as a service *interface*, implemented separately, so controllers never depend on a concrete class.
- **Centralized, typed error handling** — a single `@RestControllerAdvice` maps ~15 distinct exception types to a consistent `ErrorResponse` envelope.
- **Defense against a specific, named threat** — the GitHub OAuth "state" parameter is a signed JWT rather than a raw user ID, explicitly to prevent account-hijack via state tampering (this is documented in the source code itself, not inferred).

## Architecture Style

**Layered (N-Tier) Architecture.** The dependency direction is strictly one-way:

```
Controller → Service Interface → Service Implementation → Repository → Database
```

This is **not** Hexagonal/Clean Architecture: the `User` JPA entity directly implements Spring Security's `UserDetails`, coupling the persistence model to the security framework. For a single-bounded-context authentication/authorization service, this is an appropriate and low-friction choice. It would need to be unwound only if the domain model must ever become framework-independent (e.g., to support a second persistence technology or a non-Spring consumer of the domain logic).

## High-Level System Diagram

```
                          Client
                             │
                             ▼
                  RequestLoggingFilter
              (logs IP, method, URI, body)
                             │
                             ▼
                  Spring Security Filter Chain
                 (CORS → CSRF disabled → ...)
                             │
                             ▼
                    AuthenticationFilter
             (Bearer JWT → SecurityContext)
                             │
                             ▼
                 authorizeHttpRequests
        (path rules + HTTP-verb role rules + @PreAuthorize)
                             │
                             ▼
                        Controller
                   (@Valid triggers validation)
                             │
                             ▼
                     Service Interface
                             │
                             ▼
                  Service Implementation
              (business logic, @Transactional)
                             │
                             ▼
                Repository (Spring Data JPA)
                             │
                             ▼
                        PostgreSQL
                             │
                             ▼
                  Response<T> / ErrorResponse
                             │
                             ▼
                        JSON Response
```

## Authentication Flow

```
POST /api/v1/auth/login  (public)
      │
      ▼
AuthServiceImpl.login()
      │  1. Look up User by email
      │  2. Reject if user.enabled == false  → UserNotVerifiedException
      │  3. Delegate credentials to AuthenticationManager
      │        → DaoAuthenticationProvider → BCryptPasswordEncoder
      ▼
AuthController generates JWT via JWTServiceImpl
      │  - Claims: roles (from GrantedAuthority)
      │  - Signed HS256, secret from security.jwt.secret-key
      │  - Expiry: security.jwt.expiration-time (24h)
      ▼
Response<LoginResponse> { username, email, token, expiresIn }
```

Every subsequent request presents `Authorization: Bearer <token>`, validated by `AuthenticationFilter`:

```
Authorization header present?
   │ no  → filter chain continues unauthenticated
   │ yes → extract username from JWT
           → load UserDetails (UserRepository.findByUsername)
           → JWTService.isTokenValid()?
                 │ yes → populate SecurityContextHolder
                 │ no  → request proceeds unauthenticated
                          (rejected downstream by authorizeHttpRequests)
```

**Registration / email verification:**

```
POST /register → create disabled User, ROLE_USER assigned,
                 6-digit code generated (15 min TTL),
                 Thymeleaf template rendered, emailed via Gmail SMTP
POST /verify   → code matches + not expired → enabled = true
POST /resend-code → new code + new 15 min TTL (rejects already-verified users)
```

## Dependency Flow

```
Controller
   │ constructor-injected, depends on interface only
   ▼
Service Interface        (services/auth/*, services/github/*)
   │ implemented by
   ▼
Service Implementation   (services/impls/auth/*, services/impls/github/*)
   │ constructor-injected
   ▼
Repository               (JpaRepository<Entity, ID>)
   │
   ▼
Database (PostgreSQL)
```

This direction is enforced by Dependency Inversion: high-level modules (controllers) depend on abstractions (interfaces), and low-level modules (JPA repositories) are hidden behind services. The one exception found in the code: `GithubServiceImpl` depends directly on the **concrete class** `GithubStateService`, which has no interface — a genuine, verified inconsistency with the pattern used everywhere else.

## Package Structure

```
net.jqube.server
├── controllers/        REST endpoints (Admin, Auth, GitHub, Health, User)
├── services/
│   ├── auth/            interfaces: AdminService, AuthService, EmailService, JWTService, UserService
│   ├── github/           interface: GithubService  (+ GithubStateService, no interface — see note)
│   └── impls/
│       ├── auth/         AdminServiceImpl, AuthServiceImpl, EmailServiceImpl, JWTServiceImpl, UserServiceImpl
│       └── github/       GithubServiceImpl
├── repositories/        UserRepository, RoleRepository, GitHubAccountRepository
├── models/              User (implements UserDetails), Role, GithubAccount
├── dtos/
│   ├── auth/             LoginDTO, RegisterDTO, VerifyUserDTO, ResendCodeDTO, RoleDTO,
│   │                     UserProfileDTO, UserResponseDTO, RegistrationSuccessDTO
│   └── requests/         AssignRoleRequestDTO
├── responses/           Response<T>, ErrorResponse
│   └── dataDTOs/         LoginResponse, HealthResponse, GithubProfileResponse,
│                         GithubTokenResponse, GithubUserResponse
├── configs/             AppConfiguration, CORSConfiguration, OpenAPIConfiguration,
│                        RestClientConfiguration, SecurityConfiguration
│   └── properties/       EmailProperties (unused — see Strengths/Improvements),
│                         GithubProperties, JWTProperties
├── constants/           GithubConstants (OAuth URLs, headers, scope)
├── enums/               RoleName (ROLE_ADMIN, ROLE_USER, ROLE_VIEWER)
├── exceptions/          10 custom RuntimeException subclasses
├── filters/             AuthenticationFilter, RequestLoggingFilter
├── handlers/            GlobalExceptionHandler (@RestControllerAdvice)
└── utils/               RoleSeeder (CommandLineRunner — seeds the 3 roles on boot)
```

> **Note on `services/github`:** `GithubStateService.java` is physically located under `services/impls/github/` but its `package` declaration places it in `services.github`, and it has no interface. This is a verified inconsistency in the current source, not a hypothetical one.

## Data Flow

```
Entity  (User / Role / GithubAccount)
   ↕ mapped manually (no dedicated mapper class)
DTO     (request: validated input | response: dataDTOs / dtos.auth output shapes)
```

- `User ↔ Role`: many-to-many, join table `user_roles`.
- `User ↔ GithubAccount`: one-to-one, unique on both `user_id` and `github_id`.
- Entity-to-DTO mapping is hand-written in each service (`convertToUserResponseDTO`, `convertToUserProfileDTO`) — the two are near-duplicates of each other.
- `AdminController`'s role endpoints return the `Role` **entity** directly rather than a DTO — the one place in the API where an entity crosses the controller boundary unwrapped.

## Security Flow

- **Password storage**: BCrypt (`BCryptPasswordEncoder`).
- **Session policy**: `STATELESS` (`SessionCreationPolicy.STATELESS`).
- **CSRF**: disabled — appropriate given stateless, header-based (non-cookie) JWT auth.
- **CORS**: currently permissive — `allowedOrigins("*")`, `allowedMethods("*")`, `allowedHeaders("*")`, `allowCredentials(false)`. A stricter, explicit-origin configuration exists in the source as commented-out code, not yet activated.
- **Authorization model** — a hybrid:
  - Explicit path rules: `/api/v1/auth/**`, `/health`, `/v3/api-docs/**`, `/swagger-ui/**`, `/swagger-ui.html`, and `GET /api/v1/github/callback` are public.
  - HTTP-verb-based role rules for everything else: `GET` → `ADMIN|USER|VIEWER`, `POST`/`PUT` → `ADMIN|USER`, `PATCH`/`DELETE` → `ADMIN` only.
  - Method-level `@PreAuthorize` further restricts specific controllers (`AdminController` → `ADMIN` only; `GithubController` → `USER`; `UserController.getCurrentUser` → any of the three roles).
- **GitHub OAuth "state" protection** — `GithubStateService` issues a short-lived (10-minute), purpose-tagged, HS256-signed JWT as the OAuth `state` value, and validates both signature and purpose claim on callback. This is an explicit mitigation against using a guessable/raw user ID as OAuth state.

## Request Lifecycle

```
Client
  ↓
Embedded Tomcat
  ↓
RequestLoggingFilter — logs IP, method, URI, query string, and (after the chain
                        completes) the request body via ContentCachingRequestWrapper
  ↓
Spring Security Filter Chain
  ↓
AuthenticationFilter — Bearer token → SecurityContext (or passes through unauthenticated)
  ↓
authorizeHttpRequests — path + verb + @PreAuthorize checks
  ↓
Controller — @Valid triggers Jakarta Bean Validation on the request body
  ↓
Service → Repository → Hibernate → PostgreSQL
  ↓
Response<T> built and returned, or an exception is routed to GlobalExceptionHandler
```

`RequestLoggingFilter` is registered only as a `@Component`; it is not explicitly chained via `addFilterBefore/After` in `SecurityConfiguration`. Spring Boot auto-registers any `Filter` bean for all URL patterns by default, so it does run, but its position relative to the security chain is left implicit rather than declared.

## Configuration Architecture

| Mechanism | Where used |
|---|---|
| `@Configuration` + `@Bean` | `AppConfiguration`, `CORSConfiguration`, `OpenAPIConfiguration`, `RestClientConfiguration`, `SecurityConfiguration` |
| `@ConfigurationProperties` | `EmailProperties` (`mail`), `GithubProperties` (`github.oauth`), `JWTProperties` (`security.jwt`) — enabled via `@ConfigurationPropertiesScan` |
| Environment variables | Loaded from a local `.env` via `spring-dotenv` (`spring.config.import: optional:file:.env[.properties]`): `SERVER_PORT`, `SPRING_DATASOURCE_*`, `SUPPORT_EMAIL`, `APP_PASSWORD`, `GITHUB_OAUTH_*`, `GITHUB_REDIRECT_URI`, `JWT_SECRET_KEY`, `CLIENT_URL` |
| OpenAPI | `springdoc-openapi`, scanning only `net.jqube.server.controllers`, restricted to `/api/**` |
| CORS | Single `CorsConfigurationSource` bean, currently wide-open (see Security Flow) |
| RestClient | One shared `RestClient` bean, used exclusively for GitHub's token-exchange and profile-fetch calls |
| Mail | Gmail SMTP (`smtp.gmail.com:465`, SSL) via Spring Mail starter |

**Verified dead configuration:** `EmailProperties` is declared with `@ConfigurationProperties(prefix = "mail")` but is never injected anywhere in the codebase — `EmailServiceImpl` reads the mail username via a direct `@Value("${spring.mail.username}")` instead.

## Design Patterns Used

- **Dependency Injection** — constructor injection throughout (explicit or Lombok `@RequiredArgsConstructor`).
- **Repository Pattern** — `UserRepository`, `RoleRepository`, `GitHubAccountRepository`.
- **Service Layer Pattern** — interface + implementation for every business capability.
- **DTO Pattern** — request/response DTOs kept separate from entities (with the one `Role`-entity exception noted above).
- **Builder Pattern** — Lombok `@Builder` on `Response`, `ErrorResponse`, `GithubProfileResponse`, `HealthResponse`, `LoginResponse`, `RegistrationSuccessDTO`, `GithubAccount`.
- **Chain of Responsibility** — the servlet filter chain (`RequestLoggingFilter` → Spring Security filters → `AuthenticationFilter`).
- **Singleton** — default scope for all `@Service`/`@Component`/`@Configuration` beans.

Not present in this codebase: Factory pattern, Template Method, or a dedicated Mapper/Adapter layer (entity↔DTO mapping is hand-written per service).

## SOLID Principles

- **S**ingle Responsibility — respected in most classes; `AdminController` returning the `Role` entity directly is the one place mixing transport and persistence concerns.
- **O**pen/Closed — new exception types plug into `GlobalExceptionHandler` without touching existing handlers; new roles plug into `RoleName` + `RoleSeeder` without touching security rules, since authorization checks use role name strings.
- **L**iskov Substitution — no violations found; each service interface has exactly one implementation.
- **I**nterface Segregation — service interfaces are narrow (`EmailService` has a single method).
- **D**ependency Inversion — respected everywhere except `GithubServiceImpl → GithubStateService` (concrete-class dependency, no interface).

## Technology Stack

- **Language / Runtime**: Java 17
- **Framework**: Spring Boot 4.0.7 (Web, Security, Data JPA, Validation, Mail, Thymeleaf, OAuth2 Client dependency present but unused, DevTools)
- **Database**: PostgreSQL (`spring.jpa.hibernate.ddl-auto: update`)
- **Auth**: `io.jsonwebtoken` (jjwt) 0.11.5
- **API Docs**: springdoc-openapi (Swagger UI)
- **Env management**: spring-dotenv
- **Build**: Maven
- **Boilerplate reduction**: Lombok
- **Present in `pom.xml` but unused in source**: `spring-kafka` (no producer/consumer/listener anywhere), `spring-boot-starter-oauth2-client` (GitHub integration is a hand-rolled REST flow, not Spring's OAuth2 client). Redis and WebSocket are referenced only as marketing text in `banner.txt` — neither is a dependency nor has any supporting code.

## Future Scalability

| Concern | Current state |
|---|---|
| Containerization | No `Dockerfile` or compose file exists in the repository today; the stateless JAR is straightforward to containerize when needed. |
| Kubernetes | Not configured; feasible once containerized. |
| Microservices | The interface/impl service split is a reasonable seam for extracting a bounded context (e.g., the GitHub integration) later, but the project is currently a single Maven module. |
| Kafka | Dependency declared, zero implementation — purely aspirational at present. |
| Redis | No dependency, no code — aspirational text only. |
| AI-powered code analysis | Not present in this repository; the banner's "AI-Powered DevSecOps" description does not correspond to any code found here. |

## Architecture Decisions

- JWT over server-side sessions, to keep the API stateless and horizontally scalable.
- A signed, purpose-tagged JWT used as GitHub OAuth `state`, instead of a raw or opaque user identifier, closing a specific CSRF/account-hijack gap (documented directly in the source).
- HTTP-verb-based authorization for the general case, layered with explicit path exceptions and method-level `@PreAuthorize` for finer control — reduces the number of path rules that must be maintained as new endpoints are added, at the cost of being less immediately readable than one rule per path.

## Code Organization

Package naming is consistent and descriptive; sub-packaging by feature within technical layers (`services/auth`, `services/github`) is a reasonable hybrid. Class sizes are small and single-purpose — the largest, `GithubServiceImpl` (~140 lines), is proportionate to its responsibility. Two verified dead-code items reduce maintainability slightly:

1. `EmailProperties` — declared, never injected.
2. `net.jqube.server.exceptions.MethodArgumentNotValidException` — a custom exception class that is never thrown; `GlobalExceptionHandler` actually imports and handles Spring's own `org.springframework.web.bind.MethodArgumentNotValidException` of the same simple name, which is a real naming collision in the source.

## Strengths

- Consistent `Response<T>` / `ErrorResponse` envelope across (almost) every endpoint.
- Centralized exception handling covering a wide range of specific failure modes, including JWT-library exceptions (`ExpiredJwtException`, `MalformedJwtException`, `SignatureException`).
- A genuinely thoughtful, documented security fix for the GitHub OAuth state parameter.
- Clear interface/implementation separation for nearly every service.
- Idiomatic, minimal use of Lombok without obscuring business logic.

## Possible Improvements

- Introduce a mapper layer (MapStruct or dedicated classes) to remove the duplicated entity→DTO conversion logic in `AdminServiceImpl` and `UserServiceImpl`.
- Give `GithubStateService` an interface to align it with the rest of the service layer and fix the one Dependency Inversion gap.
- Explicitly register `RequestLoggingFilter` in `SecurityConfiguration` rather than relying on Spring Boot's default filter auto-registration.
- Remove the unused `EmailProperties` class, and rename or remove the custom `MethodArgumentNotValidException` to eliminate the naming collision with Spring's own exception.
- Add refresh-token support for the application's own JWTs (currently only GitHub's OAuth refresh token is modeled).
- Add rate limiting on `/auth/login`, `/auth/register`, and `/auth/resend-code` — none of which currently have any throttling, notable given the 6-digit verification code.
- Activate the already-drafted, stricter CORS configuration (specific origins, `allowCredentials(true)`) before any production exposure.
- Add caching for infrequently-changing reads such as `AdminController.getAllRoles()`.
- Confirm whether `@Transactional` on `AuthServiceImpl.login()` is intentional, since the method performs no writes.

## Development Guidelines

- New business capabilities should be added as a service interface (`services/...`) plus an implementation (`services/impls/...`), following the existing pattern — including for any component (like `GithubStateService`) that is currently an exception to it.
- New response payloads should go in `responses/dataDTOs` (or `dtos/auth` for user-facing profile-style DTOs) and never expose JPA entities directly through a controller.
- New exceptions should extend `RuntimeException`, live in `exceptions/`, and get a corresponding `@ExceptionHandler` in `GlobalExceptionHandler`.
- New configuration values should be added to `application.yml` with an environment-variable placeholder and, where more than one or two values are involved, a corresponding `@ConfigurationProperties` class under `configs/properties`.
- Role checks should continue to use `RoleName` + `@PreAuthorize`/`authorizeHttpRequests`, not hardcoded string literals scattered through business logic.
