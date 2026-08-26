FROM eclipse-temurin:21-jre-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
    git \
    curl \
    && rm -rf /var/lib/apt/lists/*

RUN useradd -m -u 1000 scanner && \
    mkdir -p /tmp/jqube/scans && \
    chown -R scanner:scanner /tmp/jqube

ENV SCANNER_WORKSPACE_ROOT=/tmp/jqube/scans
ENV RABBITMQ_HOST=rabbitmq
ENV RABBITMQ_PORT=5672
ENV RABBITMQ_USERNAME=jqube
ENV RABBITMQ_PASSWORD=jqube_dev_password
ENV RABBITMQ_VHOST=/

USER scanner

WORKDIR /app

COPY target/scanner-0.0.1-SNAPSHOT.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
