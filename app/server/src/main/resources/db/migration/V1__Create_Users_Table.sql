CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE users (

                       id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

                       username VARCHAR(50) NOT NULL UNIQUE,
                       email VARCHAR(150) NOT NULL UNIQUE,
                       password VARCHAR(255) NOT NULL,

                       verification_code VARCHAR(10),
                       verification_expires_at TIMESTAMP,

                       enabled BOOLEAN NOT NULL DEFAULT FALSE,

                       account_locked BOOLEAN NOT NULL DEFAULT FALSE,
                       locked_until TIMESTAMP,

                       last_login_at TIMESTAMP,

                       failed_login_attempts INTEGER NOT NULL DEFAULT 0,

                       created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                       updated_at TIMESTAMP,

                       created_by UUID,
                       updated_by UUID,

                       deleted_at TIMESTAMP,
                       deleted_by UUID,

                       is_deleted BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);