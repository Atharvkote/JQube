CREATE TABLE qubes (

                       id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

                       name VARCHAR(150) NOT NULL,

                       slug VARCHAR(180) NOT NULL UNIQUE,

                       description TEXT,

                       github_repository_id BIGINT NOT NULL,

                       github_node_id VARCHAR(255),

                       repository_owner VARCHAR(255) NOT NULL,

                       repository_name VARCHAR(255) NOT NULL,

                       repository_full_name VARCHAR(512) NOT NULL,

                       default_branch VARCHAR(100) NOT NULL,

                       target_branch VARCHAR(100) NOT NULL,

                       clone_url VARCHAR(1000) NOT NULL,

                       html_url VARCHAR(1000) NOT NULL,

                       private_repository BOOLEAN NOT NULL,

                       workspace_path VARCHAR(1000) NOT NULL,

                       webhook_enabled BOOLEAN NOT NULL DEFAULT TRUE,

                       auto_scan_enabled BOOLEAN NOT NULL DEFAULT FALSE,

                       ai_remediation_enabled BOOLEAN NOT NULL DEFAULT FALSE,

                       archived BOOLEAN NOT NULL DEFAULT FALSE,

                       created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                       updated_at TIMESTAMP,

                       created_by UUID,
                       updated_by UUID,

                       deleted_at TIMESTAMP,
                       deleted_by UUID,

                       is_deleted BOOLEAN NOT NULL DEFAULT FALSE,

                       CONSTRAINT fk_qube_created_by
                           FOREIGN KEY (created_by)
                               REFERENCES users(id),

                       CONSTRAINT fk_qube_updated_by
                           FOREIGN KEY (updated_by)
                               REFERENCES users(id),

                       CONSTRAINT fk_qube_deleted_by
                           FOREIGN KEY (deleted_by)
                               REFERENCES users(id)
);

CREATE INDEX idx_qube_slug
    ON qubes(slug);

CREATE INDEX idx_qube_repo
    ON qubes(github_repository_id);

CREATE INDEX idx_qube_full_name
    ON qubes(repository_full_name);