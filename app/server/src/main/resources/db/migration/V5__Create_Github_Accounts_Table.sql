CREATE TABLE github_accounts (

                                 id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

                                 user_id UUID NOT NULL UNIQUE,

                                 github_id BIGINT NOT NULL UNIQUE,

                                 username VARCHAR(100) NOT NULL,

                                 name VARCHAR(255),

                                 email VARCHAR(150),

                                 avatar_url VARCHAR(1000),

                                 profile_url VARCHAR(1000),

                                 bio VARCHAR(1000),

                                 company VARCHAR(255),

                                 blog VARCHAR(1000),

                                 location VARCHAR(255),

                                 public_repos INTEGER,

                                 followers INTEGER,

                                 following INTEGER,

                                 encrypted_access_token VARCHAR(5000) NOT NULL,

                                 encrypted_refresh_token VARCHAR(5000),

                                 token_type VARCHAR(50),

                                 scope VARCHAR(1000),

                                 access_token_expires_at TIMESTAMP,

                                 refresh_token_expires_at TIMESTAMP,

                                 last_synced_at TIMESTAMP,

                                 created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                                 updated_at TIMESTAMP,

                                 created_by UUID,
                                 updated_by UUID,

                                 deleted_at TIMESTAMP,
                                 deleted_by UUID,

                                 is_deleted BOOLEAN NOT NULL DEFAULT FALSE,

                                 CONSTRAINT fk_github_account_user
                                     FOREIGN KEY(user_id)
                                         REFERENCES users(id)
                                         ON DELETE CASCADE,

                                 CONSTRAINT fk_github_created_by
                                     FOREIGN KEY(created_by)
                                         REFERENCES users(id),

                                 CONSTRAINT fk_github_updated_by
                                     FOREIGN KEY(updated_by)
                                         REFERENCES users(id),

                                 CONSTRAINT fk_github_deleted_by
                                     FOREIGN KEY(deleted_by)
                                         REFERENCES users(id)
);

CREATE INDEX idx_github_username
    ON github_accounts(username);

CREATE INDEX idx_github_id
    ON github_accounts(github_id);