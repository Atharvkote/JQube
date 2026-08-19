CREATE TABLE scans (
    id UUID PRIMARY KEY,

    job_id UUID NOT NULL,
    qube_id UUID NOT NULL,
    repository_id BIGINT NOT NULL,

    branch VARCHAR(255) NOT NULL,
    commit_sha VARCHAR(64) NOT NULL,

    scan_type VARCHAR(50) NOT NULL,
    trigger_type VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL,

    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,

    total_findings INTEGER NOT NULL DEFAULT 0,
    critical_count INTEGER NOT NULL DEFAULT 0,
    high_count INTEGER NOT NULL DEFAULT 0,
    medium_count INTEGER NOT NULL DEFAULT 0,
    low_count INTEGER NOT NULL DEFAULT 0,

    error_message TEXT,

    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL,

    CONSTRAINT uk_scans_job_id
        UNIQUE (job_id)
);

CREATE INDEX idx_scans_qube_id
    ON scans(qube_id);

CREATE INDEX idx_scans_repository_id
    ON scans(repository_id);

CREATE INDEX idx_scans_commit_sha
    ON scans(commit_sha);

CREATE INDEX idx_scans_status
    ON scans(status);
