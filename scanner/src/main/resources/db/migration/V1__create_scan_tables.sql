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

CREATE TABLE scan_tool_runs (
    id UUID PRIMARY KEY,

    scan_id UUID NOT NULL,

    scanner_type VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL,

    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,

    duration_ms BIGINT,

    finding_count INTEGER NOT NULL DEFAULT 0,

    exit_code INTEGER,

    error_message TEXT,

    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL,

    CONSTRAINT fk_scan_tool_runs_scan
        FOREIGN KEY (scan_id)
        REFERENCES scans(id)
        ON DELETE CASCADE,

    CONSTRAINT uk_scan_tool_runs_scan_scanner
        UNIQUE (scan_id, scanner_type)
);

CREATE INDEX idx_scan_tool_runs_scan_id
    ON scan_tool_runs(scan_id);

CREATE INDEX idx_scan_tool_runs_scanner_type
    ON scan_tool_runs(scanner_type);

CREATE INDEX idx_scan_tool_runs_status
    ON scan_tool_runs(status);

CREATE TABLE scan_findings (
    id UUID PRIMARY KEY,

    tool_run_id UUID NOT NULL,

    rule_id VARCHAR(255),

    severity VARCHAR(20) NOT NULL,

    title VARCHAR(500) NOT NULL,

    message TEXT,

    file_path VARCHAR(1000),

    line_start INTEGER,
    line_end INTEGER,

    column_start INTEGER,
    column_end INTEGER,

    code_snippet TEXT,

    fingerprint VARCHAR(128),

    created_at TIMESTAMPTZ NOT NULL,

    CONSTRAINT fk_scan_findings_tool_run
        FOREIGN KEY (tool_run_id)
        REFERENCES scan_tool_runs(id)
        ON DELETE CASCADE
);

CREATE INDEX idx_scan_findings_tool_run
    ON scan_findings(tool_run_id);

CREATE INDEX idx_scan_findings_fingerprint
    ON scan_findings(fingerprint);

CREATE INDEX idx_scan_findings_severity
    ON scan_findings(severity);

CREATE INDEX idx_scan_findings_file_path
    ON scan_findings(file_path);
