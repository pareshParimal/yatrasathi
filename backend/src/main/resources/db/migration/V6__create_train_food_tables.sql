CREATE TABLE train_food_platforms (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name            VARCHAR(255) NOT NULL,
    description     TEXT,
    website_url     VARCHAR(500),
    app_url         VARCHAR(500),
    ordering_url    VARCHAR(500),
    supported_stations JSONB DEFAULT '[]',
    cuisine_types   JSONB DEFAULT '[]',
    has_veg         BOOLEAN DEFAULT TRUE,
    has_non_veg     BOOLEAN DEFAULT TRUE,
    has_jain        BOOLEAN DEFAULT FALSE,
    avg_rating      NUMERIC(2,1),
    logo_url        VARCHAR(500),
    is_active       BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
