INSERT INTO roles (name, description)
VALUES
    ('ROLE_ADMIN', 'Administrator role with full access'),
    ('ROLE_USER', 'Standard user role'),
    ('ROLE_VIEWER', 'Read-only user role')
    ON CONFLICT(name)
DO NOTHING;