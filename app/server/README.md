# JQUBE API Server

## AI-Powered DevSecOps Platform for Automated Secure Code Analysis & Remediation

The JQUBE API Server is the backend component of the J-QUBE DevSecOps Platform. It provides a robust and secure API for managing users, handling authentication (including GitHub OAuth), processing webhooks, and integrating with various services for secure code analysis and remediation.

## Features

*   **RESTful API**: Comprehensive API endpoints for all platform functionalities.
*   **User Management**: Secure user registration, authentication, and authorization.
*   **JWT Security**: Token-based authentication for secure API access.
*   **GitHub OAuth**: Seamless integration for user authentication via GitHub.
*   **Webhooks**: Support for receiving and processing webhook events.
*   **Email Service**: For user verification, notifications, and password resets.
*   **PostgreSQL Database**: Persistent storage for application data.
*   **Redis**: (If used, mention its purpose, e.g., caching, session management).
*   **Kafka**: (If used, mention its purpose, e.g., message queuing, event streaming).
*   **OpenAPI (Swagger UI)**: Interactive API documentation for easy exploration and testing.
*   **Spring Boot**: Rapid application development and deployment.
*   **Spring Security**: Robust security features.
*   **Spring Data JPA**: Simplified data access with Hibernate.
*   **Thymeleaf**: Server-side templating (if used for any views).
*   **Dotenv Integration**: Environment variable management using `.env` files.

## Technologies Used

*   **Java 26.0.1**
*   **Spring Boot 4.0.7**
*   **Spring Security**
*   **Spring Data JPA (Hibernate)**
*   **PostgreSQL**
*   **Redis** (If applicable)
*   **Apache Kafka** (If applicable)
*   **JWT (JSON Web Tokens)**
*   **Maven** (Build Tool)
*   **Lombok**
*   **Springdoc OpenAPI**

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

Before you begin, ensure you have the following installed:

*   **Java Development Kit (JDK)**: Version 21 or higher.
*   **Apache Maven**: Version 3.6.0 or higher.
*   **PostgreSQL**: Database server.
*   **Git**: For cloning the repository.
*   **Docker / Docker Compose**: (Optional, for easier setup of PostgreSQL/Redis/Kafka)

### Environment Setup

The application uses environment variables for sensitive configurations (e.g., database credentials, API keys, email passwords). These are loaded from a `.env` file using `spring-dotenv`.

1.  **Create a `.env` file**: In the root directory of the `server` module (`C:/Project/JQUBE-server/app/server`), create a file named `.env`.

2.  **Populate `.env`**: Add the following variables to your `.env` file. Replace the placeholder values with your actual credentials.

    ```dotenv
    SERVER_PORT=8081

    # Database Configuration (PostgreSQL)
    SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/jqube_db
    SPRING_DATASOURCE_USERNAME=your_db_username
    SPRING_DATASOURCE_PASSWORD=your_db_password

    # Email Service Configuration (Gmail Example)
    SUPPORT_EMAIL=your_email@gmail.com
    APP_PASSWORD=your_gmail_app_password # IMPORTANT: Use an App Password, not your regular Gmail password.

    # GitHub OAuth Configuration
    GITHUB_OAUTH_CLIENT_ID=your_github_client_id
    GITHUB_OAUTH_CLIENT_SECRET=your_github_client_secret

    # JWT Secret Key
    JWT_SECRET_KEY=your_super_secret_jwt_key_at_least_256_bits_long
    ```

    **Note on `APP_PASSWORD`**: For Gmail, you need to generate an "App password" if you have 2-Step Verification enabled. You can do this from your Google Account security settings. Using your regular Gmail password directly is not recommended and might not work.

### Database Setup

1.  **Start PostgreSQL**: Ensure your PostgreSQL server is running.
2.  **Create Database**: Create a new database named `jqube_db` (or whatever you configured in `SPRING_DATASOURCE_URL`).
    ```sql
    CREATE DATABASE jqube_db;
    ```
3.  **Create User**: Create a user with appropriate permissions for `jqube_db` (matching `SPRING_DATASOURCE_USERNAME` and `SPRING_DATASOURCE_PASSWORD`).
    ```sql
    CREATE USER your_db_username WITH PASSWORD 'your_db_password';
    GRANT ALL PRIVILEGES ON DATABASE jqube_db TO your_db_username;
    ```
    The application will automatically create the necessary tables on startup (due to `spring.jpa.hibernate.ddl-auto: update`).

### Running the Application

1.  **Navigate to the project directory**:
    ```bash
    cd C:/Project/JQUBE-server/app/server
    ```
2.  **Build the project**:
    ```bash
    mvn clean install
    ```
3.  **Run the application**:
    ```bash
    mvn spring-boot:run
    ```
    The server will start on the port specified in `SERVER_PORT` (default: 8081).

## Configuration

The main configuration file is `src/main/resources/application.yml`. This file defines various Spring Boot settings and references environment variables for sensitive data.

*   **`spring.config.import: optional:file:.env[.properties]`**: This line is crucial for loading environment variables from the `.env` file.
*   **`spring.mail`**: Configures the email sending service. Ensure `SUPPORT_EMAIL` and `APP_PASSWORD` are correctly set in your `.env` file.
*   **`spring.security.oauth2.client.registration.github`**: Configures GitHub OAuth.
*   **`security.jwt`**: JWT token configuration.
*   **`springdoc`**: OpenAPI/Swagger UI configuration.

## API Endpoints

Once the application is running, you can access the interactive API documentation (Swagger UI) at:

`http://localhost:8081/swagger-ui.html`

This interface allows you to explore all available API endpoints, their request/response schemas, and even test them directly.

## Project Structure (High-Level)

*   `src/main/java/net/jqube/server/`: Main Java source code.
    *   `controllers/`: REST API controllers.
    *   `services/`: Business logic interfaces and implementations.
    *   `repositories/`: Spring Data JPA repositories for database interaction.
    *   `models/`: JPA entities and DTOs.
    *   `config/`: Spring configuration classes (e.g., SecurityConfig).
    *   `filters/`: Custom servlet filters (e.g., AuthenticationFilter, RequestLoggingFilter).
    *   `handlers/`: Global exception handlers.
    *   `utils/`: Utility classes.
*   `src/main/resources/`: Application resources.
    *   `application.yml`: Main Spring Boot configuration.
    *   `templates/`: Thymeleaf templates (if any).
    *   `static/`: Static web resources.
*   `pom.xml`: Maven project object model file.
*   `.env`: Environment variables file (local development).

## Contributing

(Add guidelines for contributing if this is an open-source project)

## License

(Specify the project's license)
