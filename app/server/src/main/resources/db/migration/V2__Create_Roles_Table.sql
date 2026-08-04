CREATE TABLE roles (

                       id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

                       name VARCHAR(50) NOT NULL UNIQUE,

                       description VARCHAR(255) NOT NULL,

                       created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                       updated_at TIMESTAMP,
                       deleted_at TIMESTAMP,

                       is_deleted BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE INDEX idx_roles_name
    ON roles(name);