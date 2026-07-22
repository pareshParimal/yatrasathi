CREATE TABLE location_sharing_contacts (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id             UUID NOT NULL REFERENCES users(id),
    contact_name        VARCHAR(255) NOT NULL,
    telegram_chat_id    VARCHAR(50) NOT NULL,
    sharing_interval_min INTEGER DEFAULT 30,
    is_active           BOOLEAN DEFAULT TRUE,
    permission_granted  BOOLEAN DEFAULT FALSE,
    created_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE location_sharing_sessions (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID NOT NULL REFERENCES users(id),
    is_active       BOOLEAN DEFAULT TRUE,
    last_latitude   DOUBLE PRECISION,
    last_longitude  DOUBLE PRECISION,
    last_updated_at TIMESTAMP WITH TIME ZONE,
    started_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    stopped_at      TIMESTAMP WITH TIME ZONE
);
