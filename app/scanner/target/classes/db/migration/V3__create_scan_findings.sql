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
