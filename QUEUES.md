# QUEUES.md — RabbitMQ Messaging Architecture

## Overview

JQUBE-server uses **RabbitMQ** with the **Spring AMQP** framework to decouple scan job creation from scan execution. The messaging layer implements the **Outbox Pattern** to guarantee that scan requests are reliably delivered even if the message broker is temporarily unavailable.

---

## RabbitMQ Setup

### Connection

Configured in `application.yml` under `spring.rabbitmq`:

```yaml
spring:
  rabbitmq:
    host: ${RABBITMQ_HOST:localhost}
    port: ${RABBITMQ_PORT:5672}
    username: ${RABBITMQ_USERNAME:jqube}
    password: ${RABBITMQ_PASSWORD:jqube_dev_password}
    virtual-host: ${RABBITMQ_VHOST:/}

    publisher-confirm-type: correlated
    publisher-returns: true

    listener:
      simple:
        acknowledge-mode: manual
        prefetch: 1
        concurrency: 2
        max-concurrency: 10
```

| Property | Default | Description |
|----------|---------|-------------|
| `host` | `localhost` | RabbitMQ broker host |
| `port` | `5672` | AMQP protocol port |
| `username` / `password` | `jqube` / `jqube_dev_password` | Broker credentials |
| `virtual-host` | `/` | RabbitMQ vhost |
| `publisher-confirm-type` | `correlated` | Enables publisher confirms |
| `acknowledge-mode` | `manual` | Consumers manually ACK/NACK messages |
| `prefetch` | `1` | Each consumer processes one message at a time |
| `concurrency` | `2` | Minimum concurrent consumers |
| `max-concurrency` | `10` | Maximum concurrent consumers |

### Docker Compose

Defined in `docker/deps.compose.yml`:

```yaml
rabbitmq:
  image: rabbitmq:4-management
  container_name: jqube-rabbitmq
  ports:
    - "5672:5672"
    - "15672:15672"
  volumes:
    - rabbitmq_data:/var/lib/rabbitmq
```

The management UI is available at `http://localhost:15672`.

---

## Topology: Exchanges, Queues, and Bindings

All topology is declared in `RabbitMQConfiguration.java` and parameterized via `RabbitMQProperties`.

### Defaults

Defined in `RabbitMQProperties` (`jqube.rabbitmq.*`):

| Name | Default Value |
|------|---------------|
| `scan-command-exchange` | `jqube.scan.command` |
| `scan-result-exchange` | `jqube.scan.result` |
| `scan-job-queue` | `jqube.scan.jobs` |
| `scan-result-queue` | `jqube.scan.results` |
| `scan-dead-letter-exchange` | `jqube.scan.dlx` |
| `scan-dead-letter-queue` | `jqube.scan.dead` |
| `scan-requested-routing-key` | `scan.requested` |
| `scan-completed-routing-key` | `scan.completed` |
| `scan-dead-letter-routing-key` | `scan.dead` |

### Exchanges

| Exchange | Type | Durable | Purpose |
|----------|------|---------|---------|
| `jqube.scan.command` | **Topic** | Yes | Receives scan job requests from the API server |
| `jqube.scan.result` | **Topic** | Yes | Receives scan completion results from the worker |
| `jqube.scan.dlx` | **Direct** | Yes | Dead-letter exchange for failed messages |

### Queues

| Queue | Type | Durable | DLX | Purpose |
|-------|------|---------|-----|---------|
| `jqube.scan.jobs` | **Quorum** | Yes | `jqube.scan.dlx` | Holds scan job requests for the worker |
| `jqube.scan.results` | **Quorum** | Yes | `jqube.scan.dlx` | Holds scan completion results for the API server |
| `jqube.scan.dead` | **Quorum** | Yes | — | Stores messages that failed processing |

### Bindings

| Queue | Exchange | Routing Key |
|-------|----------|-------------|
| `jqube.scan.jobs` | `jqube.scan.command` | `scan.requested` |
| `jqube.scan.results` | `jqube.scan.result` | `scan.completed` |
| `jqube.scan.dead` | `jqube.scan.dlx` | `scan.dead` |

### Message Serialization

All messages are serialized as **JSON** using `Jackson2JsonMessageConverter`.

---

## Messages

### ScanRequestedMessage

Sent when a new scan job is requested (via website or webhook). Contains all data the worker needs to clone the repository and run the scan.

```java
public record ScanRequestedMessage(
        UUID eventId,          // Unique event identifier
        UUID jobId,            // Scan job ID (from DB)
        UUID qubeId,           // Qube ID
        Long repositoryId,     // GitHub repository ID
        String repositoryUrl,  // Repository clone URL
        String branch,         // Target branch
        String commitSha,      // Commit SHA to scan
        ScanType scanType,     // ALL, SEMGREP, TRIVY, GIT_LEAKS
        TriggerType triggerType, // MANUAL or WEBHOOK
        Instant requestedAt    // When the scan was requested
) {
}
```

### ScanCompletedMessage

Sent by the scan worker when a scan finishes (successfully or with failure).

```java
public record ScanCompletedMessage(
        UUID eventId,          // Unique event identifier
        UUID jobId,            // Scan job ID
        UUID qubeId,           // Qube ID
        Long repositoryId,     // GitHub repository ID
        String commitSha,      // Commit SHA that was scanned
        String status,         // COMPLETED or FAILED
        int critical,          // Critical findings count
        int high,              // High findings count
        int medium,            // Medium findings count
        int low,               // Low findings count
        String resultLocation, // URL or path to scan results
        Instant completedAt,   // When the scan completed
        String errorMessage    // Error details if failed
) {
}
```

---

## Publishers: How Data is Sent

The application sends messages to RabbitMQ through two paths:

### 1. Outbox Pattern (Reliable Publishing)

Used for `ScanRequestedMessage`. This is the **primary and recommended** way to publish messages.

**Flow:**

```
API Request → ScanServiceImpl
              → Creates ScanJob (DB)
              → Creates OutboxEvent (DB, status=PENDING)
              → Returns 202 Accepted to client

Every 5 seconds → OutboxPublisherScheduler
                  → OutboxPublisherImpl
                  → Reads PENDING events
                  → Publishes to RabbitMQ
                  → Updates status to PUBLISHED or FAILED
```

**Key files:**

| File | Role |
|------|------|
| `ScanServiceImpl` | Creates `OutboxEvent` with `ScanRequestedMessage` JSON payload |
| `OutboxEvent` | JPA entity stored in `outbox_events` table |
| `OutboxPublisherScheduler` | `@Scheduled(fixedDelay = 5000)` — triggers every 5 seconds |
| `OutboxPublisherImpl` | Reads up to 100 PENDING events, publishes each via `EventPublisher` |
| `RMQEventPublisher` | Generic publisher that calls `rabbitTemplate.convertAndSend()` |

**Why the Outbox Pattern?**

The API server and RabbitMQ run in the same process. If RabbitMQ is down, the API cannot accept scan requests. By persisting events to the database first, the application:
- Accepts scan requests even if RabbitMQ is temporarily unavailable
- Retries failed publishes automatically
- Guarantees exactly-once delivery semantics (no lost scan requests)

**OutboxEvent lifecycle:**

| Status | Meaning |
|--------|---------|
| `PENDING` | Event created, waiting for scheduler to publish |
| `PUBLISHED` | Successfully sent to RabbitMQ |
| `FAILED` | Publish failed after retry (will not be retried automatically) |

### 2. Direct Publishing

Used for `ScanCompletedMessage`. The application directly publishes results to RabbitMQ without the outbox pattern.

**Publisher:** `RMQScanResultPublisher`

```java
public void publishResult(Object message) {
    rabbitTemplate.convertAndSend(
            rabbitMQProperties.getScanResultExchange(),  // jqube.scan.result
            rabbitMQProperties.getScanCompletedRoutingKey(), // scan.completed
            message
    );
}
```

This is used when the application needs to publish scan results (typically by an external worker calling back into the API).

---

## Consumers: What is Received

### RMQScanJobConsumer

Listens on the `jqube.scan.results` queue and processes `ScanCompletedMessage`.

```java
@RabbitListener(
        queues = "jqube.scan.results",
        containerFactory = "rabbitListenerContainerFactory"
)
public void handleScanCompleted(ScanCompletedMessage message) {
    // 1. Find the ScanJob by jobId
    // 2. Update status, completedAt, errorMessage
    // 3. Save to database
}
```

**Listener configuration:**

| Setting | Value | Description |
|---------|-------|-------------|
| `acknowledge-mode` | `manual` | Consumer manually ACKs after processing |
| `prefetch-count` | `1` | One message per consumer at a time |
| `concurrency` | `2` | Minimum 2 concurrent consumers |
| `max-concurrency` | `10` | Scale up to 10 consumers under load |

---

## Complete Data Flow

```
┌─────────────┐     POST /api/v1/qubes/{id}/scans      ┌──────────────┐
│   Client    │ ──────────────────────────────────────> │ API Server   │
│ (Website /  │                                         │ (ScanService)│
│  Webhook)   │                                         └──────┬───────┘
└─────────────┘                                                │
                                                               │ 1. Create ScanJob (DB)
                                                               │ 2. Create OutboxEvent (DB, PENDING)
                                                               │ 3. Return 202 Accepted
                                                               │
                                                      ┌──────────▼──────────┐
                                                      │ OutboxPublisher     │
                                                      │ Scheduler (every 5s)│
                                                      └──────────┬──────────┘
                                                               │ 4. Read PENDING events
                                                               │ 5. Publish to RabbitMQ
                                                               │ 6. Update status → PUBLISHED
                                                               │
                                            ┌──────────────────▼────────────────────┐
                                            │         RabbitMQ Broker              │
                                            │                                       │
                                            │  Exchange: jqube.scan.command         │
                                            │    Routing Key: scan.requested        │
                                            │         │                             │
                                            │         ▼                             │
                                            │  Queue: jqube.scan.jobs               │
                                            │  (quorum, DLX enabled)                │
                                            └──────────────────┬────────────────────┘
                                                               │
                                                               │ 7. Worker consumes ScanRequestedMessage
                                                               │
                                                      ┌──────────▼──────────┐
                                                      │ Scan Worker         │
                                                      │ (external service)  │
                                                      └──────────┬──────────┘
                                                               │ 8. Clone repo, run scanners
                                                               │ 9. Publish ScanCompletedMessage
                                                               │
                                            ┌──────────────────▼────────────────────┐
                                            │         RabbitMQ Broker              │
                                            │                                       │
                                            │  Exchange: jqube.scan.result          │
                                            │    Routing Key: scan.completed        │
                                            │         │                             │
                                            │         ▼                             │
                                            │  Queue: jqube.scan.results            │
                                            │  (quorum, DLX enabled)                │
                                            └──────────────────┬────────────────────┘
                                                               │
                                                               │ 10. API server consumes result
                                                      ┌──────────▼──────────┐
                                                      │ RMQScanJobConsumer  │
                                                      │ (Update ScanJob DB) │
                                                      └─────────────────────┘
```

---

## Dead Letter Handling

Both `jqube.scan.jobs` and `jqube.scan.results` queues are configured with a dead-letter exchange (`jqube.scan.dlx`). If a consumer rejects a message (or it NACKs with `requeue=false`), it is routed to the `jqube.scan.dead` queue for manual inspection or reprocessing.

---

## Summary

| Component | Purpose |
|-----------|---------|
| `jqube.scan.command` exchange | Receives scan job requests |
| `jqube.scan.result` exchange | Receives scan completion results |
| `jqube.scan.dlx` exchange | Dead-letter routing for failed messages |
| `jqube.scan.jobs` queue | Holds scan requests for the worker |
| `jqube.scan.results` queue | Holds scan results for the API server |
| `jqube.scan.dead` queue | Holds poison messages |
| `OutboxEvent` entity | Persists messages before sending (reliability) |
| `OutboxPublisherScheduler` | Periodic task that flushes outbox events |
| `RMQScanJobConsumer` | Consumes scan results and updates the database |
