FROM eclipse-temurin:17-jre-jammy

RUN apt-get update && apt-get install -y --no-install-recommends \
    git \
    curl \
    docker.io \
    rabbitmq-server \
    && rm -rf /var/lib/apt/lists/*

RUN mkdir -p /tmp/jqube/scans

ENV SCANNER_WORKSPACE_ROOT=/tmp/jqube/scans
ENV RABBITMQ_HOST=localhost
ENV RABBITMQ_PORT=5672
ENV RABBITMQ_USERNAME=jqube
ENV RABBITMQ_PASSWORD=jqube_dev_password
ENV RABBITMQ_VHOST=/

WORKDIR /app

COPY target/scanner-0.0.1-SNAPSHOT.jar app.jar
COPY entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

EXPOSE 8080 5672

ENTRYPOINT ["/app/entrypoint.sh"]
