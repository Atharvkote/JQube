CREATE TABLE qube_metrics (

                              id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

                              qube_id UUID NOT NULL UNIQUE,

                              latest_scan_id UUID,

                              total_scans BIGINT NOT NULL DEFAULT 0,

                              successful_scans BIGINT NOT NULL DEFAULT 0,

                              failed_scans BIGINT NOT NULL DEFAULT 0,

                              cancelled_scans BIGINT NOT NULL DEFAULT 0,

                              queued_scans BIGINT NOT NULL DEFAULT 0,

                              total_findings BIGINT NOT NULL DEFAULT 0,

                              open_findings BIGINT NOT NULL DEFAULT 0,

                              resolved_findings BIGINT NOT NULL DEFAULT 0,

                              suppressed_findings BIGINT NOT NULL DEFAULT 0,

                              critical_findings BIGINT NOT NULL DEFAULT 0,

                              high_findings BIGINT NOT NULL DEFAULT 0,

                              medium_findings BIGINT NOT NULL DEFAULT 0,

                              low_findings BIGINT NOT NULL DEFAULT 0,

                              info_findings BIGINT NOT NULL DEFAULT 0,

                              ai_remediations_generated BIGINT NOT NULL DEFAULT 0,

                              pull_requests_created BIGINT NOT NULL DEFAULT 0,

                              merged_pull_requests BIGINT NOT NULL DEFAULT 0,

                              average_scan_duration_ms BIGINT NOT NULL DEFAULT 0,

                              fastest_scan_duration_ms BIGINT NOT NULL DEFAULT 0,

                              slowest_scan_duration_ms BIGINT NOT NULL DEFAULT 0,

                              security_score DOUBLE PRECISION NOT NULL DEFAULT 100,

                              risk_score DOUBLE PRECISION NOT NULL DEFAULT 0,

                              created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                              updated_at TIMESTAMP,

                              created_by UUID,
                              updated_by UUID,

                              deleted_at TIMESTAMP,
                              deleted_by UUID,

                              is_deleted BOOLEAN NOT NULL DEFAULT FALSE,

                              CONSTRAINT fk_qube_metrics_qube
                                  FOREIGN KEY (qube_id)
                                      REFERENCES qubes(id)
                                      ON DELETE CASCADE,

                              CONSTRAINT fk_qube_metrics_created_by
                                  FOREIGN KEY (created_by)
                                      REFERENCES users(id),

                              CONSTRAINT fk_qube_metrics_updated_by
                                  FOREIGN KEY (updated_by)
                                      REFERENCES users(id),

                              CONSTRAINT fk_qube_metrics_deleted_by
                                  FOREIGN KEY (deleted_by)
                                      REFERENCES users(id)
);

CREATE UNIQUE INDEX idx_qube_metrics_qube
    ON qube_metrics(qube_id);