# JQube Scanner Service

The JQube Scanner is an asynchronous, event-driven worker service responsible for cloning code repositories and running security analysis tools. It is built with **Spring Boot 3** and communicates with the main JQUBE Server via **RabbitMQ**.

## Architecture & Workflow

1. **Job Queuing**: The main JQube server publishes a `ScanRequestedMessage` to the RabbitMQ queue (`jqube.scan.jobs`).
2. **Consumption**: The `ScannerConsumer` (in `queues/consumers/`) picks up the message.
3. **Database Setup**: `ScanPersistenceService` creates a new `Scan` record in the `jqube_scanner` PostgreSQL database.
4. **Git Clone**: `GitService` performs a shallow clone of the target repository into the temporary workspace (`/tmp/jqube/scans`).
5. **Orchestration**: `ScannerOrchestrator` triggers the installed security tools concurrently or sequentially.
6. **Execution & Parsing**:
   - `SemgrepScanner`: Runs `semgrep scan --json` and maps output to `ScanFinding`.
   - `TrivyScanner`: Runs `trivy fs --format json` for dependency/vulnerability scanning.
   - `GitLeaksScanner`: Runs `gitleaks detect --report-format json` to find secrets.
7. **Publish Results**: Upon completion (or failure), a `ScanCompletedMessage` containing the unified array of `ScanFinding` objects is published back to the `jqube.scan.result` RabbitMQ exchange. The main server consumes this to update the UI via SSE.
8. **Cleanup**: The cloned git repository is deleted from the temporary workspace.

## Supported Tools

The scanner Docker image comes pre-packaged with the following CLI tools:
* **[Semgrep](https://semgrep.dev/)**: Static Application Security Testing (SAST).
* **[Trivy](https://trivy.dev/)**: Vulnerability scanning for dependencies and file systems.
* **[Gitleaks](https://github.com/gitleaks/gitleaks)**: Hardcoded secrets and credential detection.

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `SPRING_DATASOURCE_URL` | PostgreSQL connection string | `jdbc:postgresql://localhost:5432/jqube_scanner` |
| `SPRING_DATASOURCE_USERNAME` | PostgreSQL username | `postgres` |
| `SPRING_DATASOURCE_PASSWORD` | PostgreSQL password | `atharva` |
| `RABBITMQ_HOST` | RabbitMQ Hostname | `localhost` |
| `RABBITMQ_PORT` | RabbitMQ Port | `5672` |
| `RABBITMQ_USERNAME` | RabbitMQ Username | `jqube` |
| `RABBITMQ_PASSWORD` | RabbitMQ Password | `jqube_dev_password` |
| `SCANNER_WORKSPACE_ROOT`| Temporary clone directory | `/tmp/jqube/scans` |

## Running Locally vs. Docker

### 1. Docker (Recommended for end-to-end testing)
To successfully run actual scans, the service requires Python, Semgrep, Trivy, and Gitleaks to be installed. The easiest way to achieve this is via Docker:

```bash
# Build the image
docker build -t jqube-scanner:latest .

# Run the container (Ensure it's attached to the same network as your RabbitMQ & Postgres)
docker run --env-file .env --network jqube-network jqube-scanner:latest
```

### 2. Local Windows Environment
If you run `mvn spring-boot:run` on Windows, the application will boot and successfully consume jobs from RabbitMQ. However, when it reaches the scanning phase, it will crash with a `ScannerExecutionException` unless you have manually installed `semgrep`, `trivy`, and `gitleaks.exe` and added them to your system's PATH.

## Database Migrations (Flyway)
The scanner manages its own schema (`scan_findings`, `scan_tool_runs`, `scans`) using Flyway (`src/main/resources/db/migration`). Ensure it points to the `jqube_scanner` database to prevent Flyway checksum conflicts with the main `jqube_db` used by the server.
