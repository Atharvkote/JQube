CREATE TABLE outbox_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    aggregate_type VARCHAR(50) NOT NULL,

    aggregate_id UUID NOT NULL,

    event_type VARCHAR(50) NOT NULL,

    payload TEXT NOT NULL,

    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',

    attempts INTEGER NOT NULL DEFAULT 0,

    last_error VARCHAR(1000),

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    published_at TIMESTAMP
);

CREATE INDEX idx_outbox_events_status_created
    ON outbox_events(status, created_at);
