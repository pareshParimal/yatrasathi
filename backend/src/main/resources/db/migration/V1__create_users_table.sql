CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email           VARCHAR(255) UNIQUE,
    phone           VARCHAR(15) UNIQUE,
    full_name       VARCHAR(255) NOT NULL,
    avatar_url      VARCHAR(500),
    auth_provider   VARCHAR(20) NOT NULL,        -- GOOGLE, FACEBOOK, OTP
    provider_id     VARCHAR(255),                -- OAuth provider user ID
    role            VARCHAR(20) DEFAULT 'USER',  -- USER, ADMIN
    language_pref   VARCHAR(10) DEFAULT 'en',    -- en, hi
    is_active       BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
