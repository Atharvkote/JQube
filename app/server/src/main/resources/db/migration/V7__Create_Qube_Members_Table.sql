CREATE TABLE qube_members (
                              id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

                              qube_id UUID NOT NULL,

                              user_id UUID NOT NULL,

                              role VARCHAR(50) NOT NULL,

                              invitation_accepted BOOLEAN NOT NULL DEFAULT FALSE,

                              active BOOLEAN NOT NULL DEFAULT TRUE,

                              invited_at TIMESTAMP,

                              joined_at TIMESTAMP,

                              invited_by UUID,

                              created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                              updated_at TIMESTAMP,

                              created_by UUID,
                              updated_by UUID,

                              deleted_at TIMESTAMP,
                              deleted_by UUID,

                              is_deleted BOOLEAN NOT NULL DEFAULT FALSE,

                              CONSTRAINT uk_qube_member
                                  UNIQUE (qube_id, user_id),

                              CONSTRAINT fk_qube_member_qube
                                  FOREIGN KEY (qube_id)
                                      REFERENCES qubes(id)
                                      ON DELETE CASCADE,

                              CONSTRAINT fk_qube_member_user
                                  FOREIGN KEY (user_id)
                                      REFERENCES users(id)
                                      ON DELETE CASCADE,

                              CONSTRAINT fk_qube_member_invited_by
                                  FOREIGN KEY (invited_by)
                                      REFERENCES users(id),

                              CONSTRAINT fk_qube_member_created_by
                                  FOREIGN KEY (created_by)
                                      REFERENCES users(id),

                              CONSTRAINT fk_qube_member_updated_by
                                  FOREIGN KEY (updated_by)
                                      REFERENCES users(id),

                              CONSTRAINT fk_qube_member_deleted_by
                                  FOREIGN KEY (deleted_by)
                                      REFERENCES users(id)
);

CREATE INDEX idx_qube_member_qube
    ON qube_members(qube_id);

CREATE INDEX idx_qube_member_user
    ON qube_members(user_id);

CREATE INDEX idx_qube_member_role
    ON qube_members(role);