ALTER TABLE scans
    ADD COLUMN repository_url VARCHAR(1000);

ALTER TABLE scan_tool_runs
    ADD COLUMN raw_result_path VARCHAR(1000);
