CREATE TABLE places (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name            VARCHAR(255) NOT NULL,
    name_hi         VARCHAR(255),
    state           VARCHAR(100) NOT NULL,
    city            VARCHAR(100),
    latitude        DOUBLE PRECISION NOT NULL,
    longitude       DOUBLE PRECISION NOT NULL,
    description     TEXT,
    description_hi  TEXT,
    image_urls      JSONB DEFAULT '[]',
    tags            JSONB DEFAULT '[]',
    best_season     VARCHAR(50),
    status          VARCHAR(20) DEFAULT 'DRAFT',
    created_by      UUID REFERENCES users(id),
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE place_content (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    place_id        UUID NOT NULL REFERENCES places(id) ON DELETE CASCADE,
    content_type    VARCHAR(30) NOT NULL,
    title           VARCHAR(500) NOT NULL,
    title_hi        VARCHAR(500),
    content         JSONB NOT NULL,
    content_hi      JSONB,
    sort_order      INTEGER DEFAULT 0,
    source          VARCHAR(20) DEFAULT 'CURATED',
    status          VARCHAR(20) DEFAULT 'DRAFT',
    created_by      UUID REFERENCES users(id),
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE place_highlights (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    place_id        UUID NOT NULL REFERENCES places(id) ON DELETE CASCADE,
    highlight_type  VARCHAR(30) NOT NULL,
    title           VARCHAR(255) NOT NULL,
    title_hi        VARCHAR(255),
    description     TEXT,
    description_hi  TEXT,
    image_url       VARCHAR(500),
    gi_tag_number   VARCHAR(50),
    metadata        JSONB DEFAULT '{}',
    sort_order      INTEGER DEFAULT 0,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
