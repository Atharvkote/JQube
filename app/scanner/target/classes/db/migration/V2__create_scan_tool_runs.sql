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
