# ============================================================
# Stage 1 — Build
# ============================================================
FROM maven:3.9.11-eclipse-temurin-21 AS builder

WORKDIR /build

# Copy dependency files first for better Docker layer caching
COPY pom.xml .

# Download dependencies
RUN mvn dependency:go-offline -B

# Copy source
COPY src ./src

# Build application
RUN mvn clean package -DskipTests -B


# ============================================================
# Stage 2 — Extract Spring Boot layers
# ============================================================
FROM builder AS extractor

WORKDIR /build

RUN java -Djarmode=tools \
    -jar target/*.jar \
    extract \
    --layers \
    --launcher


# ============================================================
# Stage 3 — Production Runtime
# ============================================================
FROM eclipse-temurin:21-jre-jammy AS runtime

# Create non-root application user
RUN groupadd --system spring && \
    useradd --system --gid spring --create-home spring

WORKDIR /app

# Copy Spring Boot layered application
COPY --from=extractor --chown=spring:spring /build/dependencies/ ./
COPY --from=extractor --chown=spring:spring /build/spring-boot-loader/ ./
COPY --from=extractor --chown=spring:spring /build/snapshot-dependencies/ ./
COPY --from=extractor --chown=spring:spring /build/application/ ./

# Run as non-root
USER spring:spring

# Spring Boot default port
EXPOSE 8080

# JVM configuration
ENV JAVA_TOOL_OPTIONS="-XX:+UseContainerSupport \
-XX:MaxRAMPercentage=75.0 \
-XX:InitialRAMPercentage=25.0 \
-XX:+ExitOnOutOfMemoryError"

# Start Spring Boot
ENTRYPOINT ["java", "org.springframework.boot.loader.launch.JarLauncher"]