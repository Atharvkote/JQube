# JQUBE Server — Security Documentation

## Table of Contents

1. [Overview](#overview)
2. [Security Architecture](#security-architecture)
3. [Authentication Flow](#authentication-flow)
4. [Authorization Model](#authorization-model)
5. [JWT Security](#jwt-security)
6. [Password Storage](#password-storage)
7. [GitHub OAuth State Protection](#github-oauth-state-protection)
8. [Token Encryption](#token-encryption)
9. [CORS Configuration](#cors-configuration)
10. [CSRF Protection](#csrf-protection)
11. [Session Management](#session-management)
12. [Email Verification Security](#email-verification-security)
13. [Account Lockout](#account-lockout)
14. [Security Headers](#security-headers)
15. [Threat Mitigations](#threat-mitigations)
16. [Security Checklist](#security-checklist)

---

## Overview

JQUBE Server implements a defense-in-depth security model covering authentication, authorization, data protection, and transport security. The security layer is built on Spring Security with custom JWT handling, AES-256-GCM encryption for sensitive tokens, and a hand-rolled but security-hardened GitHub OAuth2 flow.

### Security Principles

- **Stateless by design** — No server-side sessions; every request is self-contained.
- **Least privilege** — Role-based access control with granular permissions.
- **Defense in depth** — Multiple layers of validation (path rules, verb rules, method-level annotations).
- **Secure defaults** — CORS disabled by default, CSRF disabled for stateless API, strict password encoding.

---

## Security Architecture

```mermaid
flowchart TD
    A[Incoming Request] --> B[RequestLoggingFilter]
    B --> C[Spring Security Filter Chain]
    C --> D[CORS Check]
    D --> E[CSRF Disabled]
    E --> F[Session: STATELESS]
    F --> G[AuthenticationFilter]
    G --> H[JWT Extraction & Validation]
    H --> I[authorizeHttpRequests]
    I --> J{Authorization Decision}
    J -->|Allow| K[Controller]
    J -->|Deny| L[403 Forbidden]
    K --> M[GlobalExceptionHandler]
    M --> N[ErrorResponse JSON]
    L --> N
```

### Security Layers

```mermaid
flowchart LR
    subgraph "Layer 1: Transport"
        T1[HTTPS/TLS]
        T2[CORS Policy]
    end

    subgraph "Layer 2: Authentication"
        A1[JWT Token]
        A2[Bearer Header]
        A3[Token Validation]
    end

    subgraph "Layer 3: Authorization"
        Z1[Path Rules]
        Z2[Verb Rules]
        Z3[@PreAuthorize]
    end

    subgraph "Layer 4: Input Validation"
        I1[@Valid Annotations]
        I2[Bean Validation]
        I3[Type Safety]
    end

    subgraph "Layer 5: Data Protection"
        D1[AES-256-GCM]
        D2[BCrypt Passwords]
        D3[Soft Deletes]
    end

    T1 --> A1
    T2 --> A1
    A1 --> Z1
    A2 --> Z1
    A3 --> Z1
    Z1 --> Z3
    Z2 --> Z3
    Z3 --> I1
    I1 --> I3
    I2 --> I3
    I3 --> D1
    D1 --> D3
    D2 --> D3
```

---

## Authentication Flow

### Complete Authentication Sequence

```mermaid
sequenceDiagram
    participant C as Client
    participant AC as AuthController
    participant AS as AuthServiceImpl
    participant DB as PostgreSQL
    participant AM as AuthenticationManager
    participant DP as DaoAuthenticationProvider
    participant BC as BCryptPasswordEncoder
    participant JWT as JWTService

    Note over C,JWT: Registration & Verification (Public)
    C->>AC: POST /api/v1/auth/register
    AC->>AS: register(RegisterDTO)
    AS->>DB: Create disabled user + ROLE_USER
    AS->>DB: Generate 6-digit code (15 min TTL)
    AS-->>C: 200 RegistrationSuccessDTO

    C->>AC: POST /api/v1/auth/verify {email, code}
    AC->>AS: verifyUser(VerifyUserDTO)
    AS->>DB: Validate code + expiry
    AS->>DB: Set enabled = true
    AS-->>C: 200 OK

    Note over C,JWT: Login (Public)
    C->>AC: POST /api/v1/auth/login {email, password}
    AC->>AS: login(LoginDTO)
    AS->>DB: Find user by email
    AS->>AS: Check enabled = true
    AS->>AM: authenticate(username, password)
    AM->>DP: authenticate()
    DP->>BC: matches(rawPassword, encodedPassword)
    BC-->>DP: true
    DP-->>AM: Authentication success
    AM-->>AS: authenticated
    AS-->>AC: User object
    AC->>JWT: generateToken(user)
    JWT->>JWT: Build JWT with roles claim
    JWT->>JWT: Sign with HS256
    JWT-->>AC: JWT token string
    AC-->>C: 200 LoginResponse {token, expiresIn}

    Note over C,JWT: Authenticated Requests
    C->>C: Store JWT
    C->>AC: GET /api/v1/user/me<br/>Authorization: Bearer <token>
    AC->>AC: AuthenticationFilter extracts JWT
    AC->>JWT: validate token
    JWT-->>AC: Valid
    AC->>AS: getCurrentUserProfile()
    AS-->>AC: UserProfileDTO
    AC-->>C: 200 Response<UserProfileDTO>
```

---

## Authorization Model

### Multi-Layer Authorization

```mermaid
flowchart TD
    A[HTTP Request] --> B{Public Path?}
    B -->|Yes| C[Permit All]
    B -->|No| D{Has JWT?}
    D -->|No| E[401 Unauthorized]
    D -->|Yes| F{Token Valid?}
    F -->|No| E
    F -->|Yes| G{HTTP Method Check}

    G -->|GET| H{Has ADMIN, USER, or VIEWER?}
    G -->|POST| I{Has ADMIN or USER?}
    G -->|PUT| I
    G -->|PATCH| J{Has ADMIN?}
    G -->|DELETE| J

    H -->|Yes| K{@PreAuthorize Check}
    H -->|No| E
    I -->|Yes| K
    I -->|No| E
    J -->|Yes| K
    J -->|No| E

    K -->|Pass| L[Execute Controller]
    K -->|Fail| E

    C --> M[Response]
    L --> M

    style E fill:#ff6b6b
    style C fill:#51cf66
    style L fill:#51cf66
```

### Authorization Configuration

```mermaid
flowchart TD
    A[SecurityConfiguration] --> B[authorizeHttpRequests]
    B --> C[requestMatchers PUBLIC]
    C --> C1["/api/v1/auth/**"]
    C --> C2["/health"]
    C --> C3["/v3/api-docs/**"]
    C --> C4["/swagger-ui/**"]
    C --> C5["GET /api/v1/github/callback"]

    B --> D[requestMatchers by HTTP Method]
    D --> D1["GET → ADMIN, USER, VIEWER"]
    D --> D2["POST → ADMIN, USER"]
    D --> D3["PUT → ADMIN, USER"]
    D --> D4["PATCH → ADMIN"]
    D --> D5["DELETE → ADMIN"]

    B --> E[anyRequest]
    E --> E1[authenticated]

    F[Method-Level] --> G[@PreAuthorize]
    G --> G1["AdminController → hasRole('ADMIN')"]
    G --> G2["UserController.me → hasAnyRole('ADMIN','USER','VIEWER')"]
    G --> G3["GithubController → hasRole('USER')"]
```

---

## JWT Security

### JWT Structure & Claims

```mermaid
flowchart TD
    A[JWT Token] --> B[Header]
    A --> C[Payload]
    A --> D[Signature]

    B --> B1["alg: HS256"]
    B --> B2["typ: JWT"]

    C --> C1["sub: username"]
    C --> C2["roles: [ROLE_USER, ...]"]
    C --> C3["iat: issued at (epoch ms)"]
    C --> C4["exp: expiration (epoch ms)"]

    D --> D1["HMAC-SHA256"]
    D1 --> D2["Signing Key: JWT_SECRET_KEY"]

    style B1 fill:#74c0fc
    style B2 fill:#74c0fc
    style C1 fill:#a9e34b
    style C2 fill:#a9e34b
    style C3 fill:#a9e34b
    style C4 fill:#a9e34b
    style D1 fill:#ffd43b
    style D2 fill:#ffd43b
```

### JWT Generation & Validation Flow

```mermaid
sequenceDiagram
    participant AC as AuthController
    participant JWT as JWTService
    participant JS as JWTServiceImpl
    participant JP as JJWT Parser
    participant DB as UserRepository

    Note over AC,JS: Token Generation
    AC->>JWT: generateToken(userDetails)
    JWT->>JS: generateToken(UserDetails)
    JS->>JS: Build claims map
    JS->>JS: Extract roles from authorities
    JS->>JS: Set subject = username
    JS->>JS: Set issuedAt = now
    JS->>JS: Set expiration = now + 24h
    JS->>JS: Sign with HS256 + secret key
    JS-->>JWT: Compact JWT string
    JWT-->>AC: JWT token

    Note over AC,JP: Token Validation
    AC->>JWT: isTokenValid(token, userDetails)
    JWT->>JS: extractUsername(token)
    JS->>JP: parseClaimsJws(token)
    JP-->>JS: Claims body
    JS-->>JWT: username
    JWT->>JS: isTokenExpired(token)
    JS->>JP: parseClaimsJws(token)
    JP-->>JS: expiration claim
    JS->>JS: Check expiration vs now
    JS-->>JWT: not expired
    JWT->>JWT: Compare username with userDetails
    JWT-->>AC: true (valid)
```

### Token Expiration & Renewal

```mermaid
flowchart TD
    A[JWT Issued] --> B[exp = now + 86400000ms (24h)]
    B --> C[Token valid for 24 hours]
    C --> D{Request with expired token?}
    D -->|No| E[Token valid → proceed]
    D -->|Yes| F[ExpiredJwtException thrown]
    F --> G[GlobalExceptionHandler catches]
    G --> H[401 Unauthorized returned]
    E --> I[User must re-login]

    style H fill:#ff6b6b
    style E fill:#51cf66
```

---

## Password Storage

### BCrypt Hashing Flow

```mermaid
flowchart TD
    A[Registration: plaintext password] --> B[BCryptPasswordEncoder.encode]
    B --> C[Generate salt + hash]
    C --> D[Format: $2a$10$<salt><hash>]
    D --> E[Store in users.password]

    F[Login: plaintext password] --> G[Retrieve stored hash from DB]
    G --> H[BCryptPasswordEncoder.matches]
    H --> I{Matches?}
    I -->|Yes| J[Authentication success]
    I -->|No| K[BadCredentialsException → 401]

    style J fill:#51cf66
    style K fill:#ff6b6b
```

### Password Strength Requirements

| Requirement | Implementation | Location |
|---|---|---|
| Minimum length | Jakarta Validation `@Size(min = 8)` | `RegisterDTO` |
| Complexity | Not enforced server-side | — |
| Hashing algorithm | BCrypt (Spring Security default) | `SecurityConfiguration` |
| Salt | Automatic per-password salt | BCrypt internals |
| Work factor | Default (10 rounds) | Spring Security default |

---

## GitHub OAuth State Protection

### State JWT Mechanism

```mermaid
flowchart TD
    A[User initiates GitHub connect] --> B[GithubStateManager.generate userId]
    B --> C[Create JWT with claims]
    C --> C1["sub: userId"]
    C --> C2["purpose: github_oauth"]
    C --> C3["iat: issued at"]
    C --> C4["exp: 10 minutes"]
    C --> D[Sign with HS256 using JWT_SECRET_KEY]
    D --> E[Return signed state JWT]
    E --> F[Append to GitHub authorization URL]

    G[GitHub redirects back with state] --> H[GithubStateManager.validateAndExtractUserId]
    H --> I{Validate signature?}
    I -->|Invalid| J[Reject - possible CSRF attack]
    I -->|Valid| K{Validate purpose claim?}
    K -->|Invalid| J
    K -->|Valid| L{Validate expiry?}
    L -->|Expired| J
    L -->|Valid| M[Extract userId from sub claim]
    M --> N[Proceed with OAuth flow]

    J --> O[Return error to client]

    style J fill:#ff6b6b
    style O fill:#ff6b6b
    style N fill:#51cf66
```

### Why This Matters

Without this protection, a raw user ID or random string as OAuth `state` is vulnerable to:

1. **CSRF attacks** — Attacker tricks user into authorizing with attacker's state
2. **Account hijacking** — Attacker reuses a captured state value
3. **Session fixation** — State value reused across sessions

The signed JWT approach ensures:
- **Authenticity** — Only the server can create valid states
- **Integrity** — State cannot be tampered with
- **Time-bound** — States expire after 10 minutes
- **Purpose-bound** — State can only be used for GitHub OAuth

---

## Token Encryption

### AES-256-GCM Encryption Flow

```mermaid
flowchart TD
    subgraph "Encryption"
        A[Plaintext: GitHub access_token] --> B[Generate random 12-byte IV]
        B --> C[AES-256-GCM encrypt]
        C --> D[Produce: IV + ciphertext + auth tag]
        D --> E[Base64 encode]
        E --> F[Store in DB: encrypted_access_token]
    end

    subgraph "Decryption"
        G[Read from DB: encrypted_access_token] --> H[Base64 decode]
        H --> I[Extract IV + ciphertext + auth tag]
        I --> J[AES-256-GCM decrypt]
        J --> K{Auth tag valid?}
        K -->|Yes| L[Return plaintext token]
        K -->|No| M[Throw EncryptionException]
    end

    style L fill:#51cf66
    style M fill:#ff6b6b
```

### Encryption Properties

| Property | Value | Source |
|---|---|---|
| Algorithm | AES-256-GCM | `AESEncryptionServiceImpl` |
| Key Size | 256 bits | `security.encryption.key` env var |
| IV Size | 12 bytes | Random per encryption |
| Auth Tag | 128 bits | GCM default |
| Key Source | Environment variable | `AES_ENCRYPTION_KEY` |

---

## CORS Configuration

### Current Configuration

```mermaid
flowchart TD
    A[Incoming Request] --> B{Origin header present?}
    B -->|No| C[Simple request - allowed]
    B -->|Yes| D{Check allowed origins}
    D -->|Origin: *| E[Allow all origins]
    D -->|Origin matches| F[Add CORS headers]
    D -->|Origin mismatch| G[Block request]

    H[Allowed Methods] --> I["* (all methods)"]
    J[Allowed Headers] --> K["* (all headers)"]
    L[Allow Credentials] --> M[false]

    style E fill:#ffd43b
    style F fill:#51cf66
    style G fill:#ff6b6b
```

### CORS Headers Applied

| Header | Value | Purpose |
|---|---|---|
| `Access-Control-Allow-Origin` | `*` | Allows any origin |
| `Access-Control-Allow-Methods` | `*` | Allows any HTTP method |
| `Access-Control-Allow-Headers` | `*` | Allows any header |
| `Access-Control-Allow-Credentials` | `false` | Cookies not sent cross-origin |

### Recommended Production Configuration

```yaml
cors:
  allowed-origins:
    - https://jqube-app.com
    - https://admin.jqube-app.com
  allowed-methods:
    - GET
    - POST
    - PUT
    - DELETE
    - OPTIONS
  allowed-headers:
    - Authorization
    - Content-Type
    - X-Requested-With
  allow-credentials: true
  max-age: 3600
```

---

## CSRF Protection

### CSRF Status

```mermaid
flowchart TD
    A[CSRF Protection] --> B[Disabled globally]
    B --> C{Why disabled?}
    C --> D[Stateless JWT authentication]
    D --> E[No server-side sessions]
    E --> F[No cookies for auth]
    F --> G[CSRF not applicable]

    style B fill:#ffd43b
    style G fill:#51cf66
```

### Why CSRF is Disabled

| Factor | Explanation |
|---|---|
| Authentication method | Bearer token in `Authorization` header |
| Session policy | `STATELESS` — no server-side sessions |
| Cookies | Not used for authentication |
| CSRF attack vector | Not applicable — attacker cannot read/write custom headers |

**Note:** If cookie-based authentication is ever added, CSRF protection must be re-enabled.

---

## Session Management

### Session Configuration

```mermaid
flowchart TD
    A[Session Management] --> B[SessionCreationPolicy.STATELESS]
    B --> C[No HttpSession created]
    C --> D[No session cookies]
    D --> E[All state in JWT]

    F[SecurityContext] --> G[ThreadLocal storage]
    G --> H[Populated per request]
    H --> I[Cleared after request]

    style B fill:#51cf66
    style C fill:#51cf66
    style D fill:#51cf66
    style E fill:#51cf66
```

### Session Security Properties

| Property | Value | Impact |
|---|---|---|
| `sessionCreationPolicy` | `STATELESS` | No sessions created |
| `sessionFixation` | N/A | Not applicable |
| `maximumSessions` | N/A | Not applicable |
| `sessionCookie` | Not sent | No JSESSIONID cookie |

---

## Email Verification Security

### Verification Code Flow

```mermaid
flowchart TD
    A[User registers] --> B[Generate 6-digit code]
    B --> C[Set expiry: now + 15 minutes]
    C --> D[Store in users.verification_code]
    D --> E[Send email via Gmail SMTP:465 SSL]

    F[User submits code] --> G{Code matches?}
    G -->|No| H[InvalidVerificationCodeException → 400]
    G -->|Yes| I{Code expired?}
    I -->|Yes| J[TokenExpiredException → 401]
    I -->|No| K{User already verified?}
    K -->|Yes| L[InvalidVerificationCodeException → 400]
    K -->|No| M[Set enabled = true]
    M --> N[Clear verification_code & expires_at]
    N --> O[Account activated]

    style H fill:#ff6b6b
    style J fill:#ff6b6b
    style L fill:#ff6b6b
    style O fill:#51cf66
```

### Verification Security Properties

| Property | Value | Purpose |
|---|---|---|
| Code format | 6-digit numeric | Easy to type, hard to brute-force |
| Code TTL | 15 minutes | Limits window for brute-force |
| Storage | Plaintext in DB | Not a secret — single-use, time-limited |
| Resend limit | None enforced | Can request new code anytime |
| Email transport | Gmail SMTP:465 SSL | Encrypted in transit |

---

## Account Lockout

### Failed Login Tracking

```mermaid
flowchart TD
    A[Login attempt] --> B{Valid credentials?}
    B -->|Yes| C[Reset failed_login_attempts to 0]
    C --> D[Update last_login_at]
    D --> E[Authentication success]

    B -->|No| F[Increment failed_login_attempts]
    F --> G{failed_login_attempts >= threshold?}
    G -->|Yes| H[Set account_locked = true]
    H --> I[Set locked_until timestamp]
    I --> J[BadCredentialsException → 401]
    G -->|No| J

    K[Login attempt with locked account] --> L{locked_until passed?}
    L -->|No| M[Account locked → 403]
    L -->|Yes| N[Set account_locked = false]
    N --> A

    style E fill:#51cf66
    style J fill:#ff6b6b
    style M fill:#ff6b6b
```

### Lockout Configuration

| Field | Type | Purpose |
|---|---|---|
| `account_locked` | BOOLEAN | Lock status flag |
| `locked_until` | INSTANT | Lock expiry timestamp |
| `failed_login_attempts` | INTEGER | Consecutive failure counter |
| `last_login_at` | INSTANT | Last successful login |

---

## Security Headers

### Current Headers

The application does not explicitly set security headers (no `SecurityFilterChain` header configuration). Spring Boot's default behavior applies:

| Header | Default Value | Recommendation |
|---|---|---|
| `X-Content-Type-Options` | Not set | Add `nosniff` |
| `X-Frame-Options` | Not set | Add `DENY` |
| `X-XSS-Protection` | Not set | Add `1; mode=block` |
| `Strict-Transport-Security` | Not set | Add `max-age=31536000; includeSubDomains` |
| `Content-Security-Policy` | Not set | Configure based on needs |

### Recommended Header Configuration

```java
http.headers(headers -> headers
    .contentSecurityPolicy("default-src 'self'; frame-ancestors 'none';")
    .xssProtection(Customizer.withDefaults())
    .contentTypeOptions(Customizer.withDefaults())
    .httpStrictTransportSecurity(hsts -> hsts
        .includeSubdomains(true)
        .maxAgeInSeconds(31536000)
    )
    .frameOptions(Customizer.withDefaults())
);
```

---

## Threat Mitigations

### Mitigated Threats

| Threat | Mitigation | Implementation |
|---|---|---|
| **Credential stuffing** | BCrypt hashing + email verification | `BCryptPasswordEncoder`, `verification_code` |
| **Brute-force login** | Account lockout tracking | `failed_login_attempts`, `account_locked` |
| **JWT theft** | Short expiry (24h), HTTPS only | `expiration-time: 86400000` |
| **CSRF (GitHub OAuth)** | Signed state JWT | `GithubStateManager` |
| **Token replay** | Stateless + short expiry | No session storage |
| **GitHub token exposure** | AES-256-GCM encryption | `AESEncryptionServiceImpl` |
| **Email enumeration** | Generic error messages | Consistent `ErrorResponse` |
| **Mass assignment** | DTO pattern, no entity exposure | Separate request/response DTOs |
| **Injection attacks** | JPA parameterized queries | Spring Data JPA |
| **Man-in-the-middle** | TLS/HTTPS, SMTP SSL | Production HTTPS, Gmail SSL |

### Unmitigated Risks

| Risk | Current State | Recommendation |
|---|---|---|
| **Rate limiting** | None | Add on `/auth/*` endpoints |
| **Brute-force verification codes** | No rate limit | Add per-IP rate limiting |
| **CORS exposure** | Wide-open (`*`) | Restrict to known origins |
| **Security headers** | Minimal | Add HSTS, CSP, etc. |
| **Refresh tokens** | None for app JWT | Add refresh token mechanism |
| **IP blocking** | None | Add after repeated failures |

---

## Security Checklist

### Pre-Deployment Checklist

- [ ] `JWT_SECRET_KEY` is a strong, random 256-bit base64-encoded key
- [ ] `AES_ENCRYPTION_KEY` is a strong, random 256-bit base64-encoded key
- [ ] `SPRING_DATASOURCE_PASSWORD` is strong and unique
- [ ] `GITHUB_OAUTH_CLIENT_SECRET` is stored securely (not in code)
- [ ] `APP_PASSWORD` (Gmail app password) is stored securely
- [ ] HTTPS is enforced in production (reverse proxy / load balancer)
- [ ] CORS origins are restricted to known domains
- [ ] Security headers are configured (HSTS, CSP, etc.)
- [ ] Rate limiting is enabled on authentication endpoints
- [ ] Database connections use SSL/TLS
- [ ] Flyway migrations are run in CI/CD, not at runtime
- [ ] Logs do not contain sensitive data (tokens, passwords)
- [ ] `.env` file is excluded from version control
- [ ] Regular security audits of dependencies (`mvn dependency:tree`)

### Ongoing Security Practices

- Rotate `JWT_SECRET_KEY` periodically (requires user re-authentication)
- Monitor failed login attempts for brute-force detection
- Review and update CORS policies as frontend domains change
- Keep dependencies updated (`mvn versions:display-dependency-updates`)
- Audit GitHub OAuth scopes — request minimum required
- Monitor `qube_metrics` for unusual scan patterns
