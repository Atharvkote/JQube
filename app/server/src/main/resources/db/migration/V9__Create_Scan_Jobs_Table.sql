CREATE TABLE scan_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    qube_id UUID NOT NULL,

    repository_id BIGINT NOT NULL,

    commit_sha VARCHAR(255) NOT NULL,

    status VARCHAR(30) NOT NULL,

    attempt INTEGER NOT NULL DEFAULT 0,

    started_at TIMESTAMP,

    completed_at TIMESTAMP,

    error_message TEXT,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP,

    created_by UUID,

    updated_by UUID,

    deleted_at TIMESTAMP,

    deleted_by UUID,

    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,

    CONSTRAINT fk_scan_job_qube
        FOREIGN KEY (qube_id)
            REFERENCES qubes(id)
            ON DELETE CASCADE,

    CONSTRAINT fk_scan_job_created_by
        FOREIGN KEY (created_by)
            REFERENCES users(id),

    CONSTRAINT fk_scan_job_updated_by
        FOREIGN KEY (updated_by)
            REFERENCES users(id),

    CONSTRAINT fk_scan_job_deleted_by
        FOREIGN KEY (deleted_by)
            REFERENCES users(id)
);

CREATE INDEX idx_scan_jobs_qube
    ON scan_jobs(qube_id);

CREATE INDEX idx_scan_jobs_status
    ON scan_jobs(status);
