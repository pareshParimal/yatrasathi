# 🙏 YatraSathi — Travel Companion for Elderly Indians

> *A smart, AI-powered travel planning and cultural discovery backend for elderly travellers in India.*

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Architecture](#2-architecture)
3. [Technology Stack](#3-technology-stack)
4. [Module Breakdown](#4-module-breakdown)
5. [API Design](#5-api-design)
6. [Database Schema](#6-database-schema)
7. [External Service Integrations](#7-external-service-integrations)
8. [Caching Strategy (Redis)](#8-caching-strategy-redis)
9. [Notification & Messaging](#9-notification--messaging)
10. [Security](#10-security)
11. [Prerequisites](#11-prerequisites)
12. [Project Setup Steps](#12-project-setup-steps)
13. [Configuration & Environment Variables](#13-configuration--environment-variables)
14. [Development Roadmap](#14-development-roadmap)
15. [Future Features (Post-MVP)](#15-future-features-post-mvp)
16. [Folder Structure](#16-folder-structure)

---

## 1. Project Overview

**YatraSathi** is a backend application designed to serve as a comprehensive travel companion for elderly users in India. It provides:

- **Travel Planning** — Configure boarding/deboarding times, travel duration, medium of transport, hotel proximity, budget, and food preferences.
- **Place Discovery** — Rich historical, cultural, political, and geographical information about destinations presented in a storytelling format.
- **AI-Powered Chat** — An intelligent assistant (powered by Google Gemini) that answers questions about places, empires, and travel logistics.
- **Live Location Sharing** — Share real-time location with pre-configured emergency contacts via Telegram Bot.
- **Climate-Based Recommendations** — Weather forecasts and clothing suggestions tailored to the destination.
- **Train Food Information** — Curated information about food ordering platforms on Indian railways with redirect links.
- **Notifications** — Multi-channel notifications via Email, Push, and Telegram.

### Target Audience
- Elderly travellers (60+) in India
- Families planning travel for elderly members
- Travel agencies specialising in senior citizen tours

### Language Support
- **MVP**: English + Hindi
- **Future**: Regional languages (Tamil, Telugu, Bengali, Marathi, etc.)

---

## 2. Architecture

### 2.1 Architectural Style: Modular Monolith

The application follows a **Modular Monolith** pattern — a single deployable Spring Boot application with clearly separated internal modules. Each module has:
- Its own package namespace
- Defined public APIs (interfaces/DTOs)
- Internal implementation hidden from other modules
- Its own set of database tables (logical separation)

This allows **easy extraction into microservices** in the future without premature complexity.

```
┌─────────────────────────────────────────────────────────────┐
│                    YatraSathi Application                    │
│                                                             │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐   │
│  │  Auth    │ │  Travel  │ │  Place   │ │  AI Chat     │   │
│  │  Module  │ │  Planning│ │  Info    │ │  Module      │   │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └──────┬───────┘   │
│       │            │            │               │           │
│  ┌────┴─────┐ ┌────┴─────┐ ┌───┴──────┐ ┌──────┴───────┐   │
│  │  Location│ │  Climate │ │  Train   │ │  Notification│   │
│  │  Sharing │ │  & Weather│ │  Food   │ │  Service     │   │
│  └────┬─────┘ └────┬─────┘ └───┬──────┘ └──────┬───────┘   │
│       │            │            │               │           │
│  ┌────┴─────┐ ┌────┴──────────┴───────────────┴────────┐   │
│  │  Admin   │ │           Shared / Common               │   │
│  │  Module  │ │  (Security, Caching, Exceptions, DTOs)  │   │
│  └──────────┘ └─────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              Infrastructure Layer                    │    │
│  │  PostgreSQL │ Redis │ Gemini │ Maps │ Weather │ TG   │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Layered Architecture (within each module)

```
Controller (REST API)  →  Service (Business Logic)  →  Repository (Data Access)
      ↕                        ↕                            ↕
    DTOs                  Domain Models              Entity / PostgreSQL
```

### 2.3 Key Architectural Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Architecture | Modular Monolith | Simpler ops, easy to split later |
| Communication | In-process method calls | No network overhead between modules |
| Event Handling | Spring Application Events | Loose coupling between modules |
| API Style | REST + JSON | Universal client compatibility |
| Async Processing | Spring `@Async` + `@Scheduled` | Background tasks without message broker overhead |
| Extensibility | Strategy + Plugin pattern | New features (elderly care) plug in easily |

---

## 3. Technology Stack

### 3.1 Core

| Component | Technology | Version |
|-----------|-----------|---------|
| Language | Java | 21 (LTS) |
| Framework | Spring Boot | 3.3.x |
| Build Tool | Gradle (Kotlin DSL) | 8.x |
| API Documentation | SpringDoc OpenAPI (Swagger) | 2.x |

### 3.2 Data & Caching

| Component | Technology | Free Tier |
|-----------|-----------|-----------|
| Primary Database | PostgreSQL | AWS RDS Free Tier (750 hrs/month, 20 GB) |
| Caching | Redis | AWS ElastiCache Free Tier (750 hrs/month, t3.micro) |
| Database Migration | Flyway | Open source |

### 3.3 External APIs

| Service | Provider | Free Tier |
|---------|----------|-----------|
| AI / LLM | Google Gemini API | 15 RPM, 1M tokens/day free |
| Maps & Geocoding | Google Maps Platform | ₹18,500/month credit (~$200) |
| Weather & Climate | OpenWeatherMap API | 1,000 calls/day |
| Messaging | Telegram Bot API | Completely free, unlimited |

### 3.4 Authentication

| Method | Provider |
|--------|----------|
| OAuth 2.0 | Google, Facebook (via Spring Security OAuth2 Client) |
| OTP Login | Custom implementation (SMS via free-tier provider or Telegram OTP) |

### 3.5 Infrastructure (AWS Free Tier)

| Service | AWS Component | Free Tier Limits |
|---------|---------------|------------------|
| Compute | EC2 (t2.micro / t3.micro) | 750 hrs/month for 12 months |
| Database | RDS PostgreSQL | 750 hrs/month, 20 GB storage |
| Cache | ElastiCache Redis | 750 hrs/month, t3.micro |
| Object Storage | S3 | 5 GB, for media/content assets |
| Email | SES | 62,000 emails/month (from EC2) |

### 3.6 Why PostgreSQL?

| Requirement | PostgreSQL Capability |
|------------|----------------------|
| User data, bookings, preferences | Strong relational model with ACID |
| Historical content, place info | Native JSONB columns for semi-structured data |
| Geospatial queries (hotel proximity) | PostGIS extension for geo queries |
| Full-text search (place search) | Built-in `tsvector` full-text search |
| Future scalability | Partitioning, read replicas, connection pooling |

---

## 4. Module Breakdown

### 4.1 Auth Module (`com.yatrasathi.auth`)
- OAuth 2.0 login with Google & Facebook
- OTP-based login (mobile number)
- JWT token generation & validation
- Role-based access (USER, ADMIN)
- Session management with Redis

### 4.2 Travel Planning Module (`com.yatrasathi.travel`)
- Create/update travel plans
- Configure: boarding time, deboarding time, travel duration
- Select medium of travel (train, bus, flight, car)
- Set hotel preferences: max distance from site, budget range (min-max)
- Food preference: Veg / Non-Veg / Jain / Vegan
- Generate itinerary suggestions (with AI assistance)

### 4.3 Place Information Module (`com.yatrasathi.place`)
- **Historical Content** — Dynasties, rulers, architectural works, timelines
- **Cultural Content** — Traditions, festivals, art forms, dance, music
- **Political History** — Pre-independence & post-independence facts and events
- **Local Highlights** — Unique food, handicrafts, Geographical Indicators (GI tags)
- **Administrative Info** — Governance, notable personalities
- Content stored as pre-curated data (admin-managed) with AI-generated fallback
- Storytelling format: structured JSON with chapters/sections for frontend animation

### 4.4 AI Chat Module (`com.yatrasathi.chat`)
- Google Gemini integration for place-related Q&A
- Contextual chat: conversations scoped to a specific place/empire
- Chat history persistence
- Rate limiting & token budget management
- Prompt engineering templates for Indian historical context
- **Future-ready**: Architecture supports swapping to audio interaction

### 4.5 Live Location Sharing Module (`com.yatrasathi.location`)
- Telegram Bot integration for location sharing
- Pre-configured contact list management
- Configurable sharing interval (e.g., every 30 min, 1 hr)
- Permission-based: per-contact opt-in/opt-out
- Location received via device GPS (client sends to backend, backend forwards to Telegram)
- Geofencing alerts (optional): notify contacts when user leaves a defined area

### 4.6 Climate & Weather Module (`com.yatrasathi.weather`)
- Current weather for destination (OpenWeatherMap)
- 5-day weather forecast
- Clothing recommendations based on:
  - Temperature & humidity
  - Season (monsoon, summer, winter)
  - Region-specific advice (hill stations vs coastal vs desert)
- Best time to visit suggestions
- Redis caching (weather data cached for 3 hours)

### 4.7 Train Food Information Module (`com.yatrasathi.trainfood`)
- Curated directory of train food ordering platforms:
  - IRCTC eCatering
  - Zoop (RailRestro)
  - Travelkhana
- Information includes: platform name, supported stations, ordering URL, cuisine types, veg/non-veg availability, ratings
- Station-based food availability lookup
- Redirect links (no deep integration in MVP)
- Admin-managed content

### 4.8 Notification Module (`com.yatrasathi.notification`)
- Multi-channel notification dispatch:
  - **Email** — via AWS SES
  - **Push Notifications** — via Firebase Cloud Messaging (FCM)
  - **Telegram** — via Telegram Bot API
- Notification types: travel reminders, weather alerts, location sharing confirmations
- Template-based notifications (supports i18n: English + Hindi)
- Notification preferences per user
- Async processing using Spring `@Async`

### 4.9 Admin Module (`com.yatrasathi.admin`)
- CRUD APIs for Places (create, update, delete, list)
- CRUD APIs for Historical/Cultural/Political content
- Manage Train Food platform directory
- Content moderation & publishing workflow (draft → review → published)
- Bulk content import (CSV/JSON)
- Dashboard statistics APIs

### 4.10 Common / Shared Module (`com.yatrasathi.common`)
- Global exception handling (`@ControllerAdvice`)
- Common DTOs (pagination, API response wrapper, error responses)
- Audit logging (created_by, updated_by, timestamps)
- Redis cache utilities
- Rate limiting configuration
- Health check endpoints
- Internationalization (i18n) support

---

## 5. API Design

### 5.1 API Conventions

| Aspect | Convention |
|--------|-----------|
| Base Path | `/api/v1/` |
| Format | JSON |
| Naming | kebab-case for URLs, camelCase for JSON fields |
| Pagination | `?page=0&size=20&sort=name,asc` |
| Versioning | URL-based (`/api/v1/`, `/api/v2/`) |
| Auth | Bearer JWT token in `Authorization` header |
| Response Wrapper | `{ "success": true, "data": {...}, "error": null, "timestamp": "..." }` |

### 5.2 API Endpoints Overview

#### Auth APIs
```
POST   /api/v1/auth/login/oauth          # OAuth login (Google/Facebook)
POST   /api/v1/auth/login/otp/request     # Request OTP
POST   /api/v1/auth/login/otp/verify      # Verify OTP and get JWT
POST   /api/v1/auth/refresh               # Refresh JWT token
POST   /api/v1/auth/logout                # Logout (invalidate token)
GET    /api/v1/auth/me                    # Get current user info
```

#### Travel Planning APIs
```
POST   /api/v1/travel-plans               # Create a travel plan
GET    /api/v1/travel-plans               # List user's travel plans
GET    /api/v1/travel-plans/{id}          # Get travel plan details
PUT    /api/v1/travel-plans/{id}          # Update travel plan
DELETE /api/v1/travel-plans/{id}          # Delete travel plan
POST   /api/v1/travel-plans/{id}/itinerary/generate  # AI-generate itinerary
GET    /api/v1/travel-plans/{id}/hotels   # Get nearby hotels (via Maps)
```

#### Place Information APIs
```
GET    /api/v1/places                     # Search/list places
GET    /api/v1/places/{id}                # Get place overview
GET    /api/v1/places/{id}/history        # Historical content (storytelling format)
GET    /api/v1/places/{id}/culture        # Cultural details
GET    /api/v1/places/{id}/politics       # Political history (pre & post independence)
GET    /api/v1/places/{id}/local-highlights  # Food, handicrafts, GI tags
GET    /api/v1/places/{id}/weather        # Current weather & forecast
GET    /api/v1/places/{id}/clothing-advice   # Climate-based clothing recommendation
GET    /api/v1/places/nearby?lat=x&lng=y&radius=50  # Nearby places
```

#### AI Chat APIs
```
POST   /api/v1/chat/sessions              # Start a new chat session (scoped to a place)
GET    /api/v1/chat/sessions              # List user's chat sessions
GET    /api/v1/chat/sessions/{id}         # Get chat history
POST   /api/v1/chat/sessions/{id}/messages  # Send a message, get AI response
DELETE /api/v1/chat/sessions/{id}         # Delete chat session
```

#### Live Location Sharing APIs
```
GET    /api/v1/location/contacts          # List configured sharing contacts
POST   /api/v1/location/contacts          # Add a sharing contact (Telegram)
PUT    /api/v1/location/contacts/{id}     # Update contact (permissions, interval)
DELETE /api/v1/location/contacts/{id}     # Remove a sharing contact
POST   /api/v1/location/share/start       # Start location sharing
POST   /api/v1/location/share/stop        # Stop location sharing
POST   /api/v1/location/update            # Client sends current GPS coordinates
GET    /api/v1/location/sharing-status    # Get current sharing status
```

#### Weather & Climate APIs
```
GET    /api/v1/weather/{placeId}/current     # Current weather
GET    /api/v1/weather/{placeId}/forecast    # 5-day forecast
GET    /api/v1/weather/{placeId}/clothing    # Clothing recommendations
GET    /api/v1/weather/{placeId}/best-time   # Best time to visit
```

#### Train Food APIs
```
GET    /api/v1/train-food/platforms          # List all food ordering platforms
GET    /api/v1/train-food/stations/{code}    # Food availability at a station
GET    /api/v1/train-food/search?query=...   # Search food platforms by station/cuisine
```

#### Notification APIs
```
GET    /api/v1/notifications                 # List user's notifications
PUT    /api/v1/notifications/{id}/read       # Mark notification as read
GET    /api/v1/notifications/preferences     # Get notification preferences
PUT    /api/v1/notifications/preferences     # Update notification preferences
```

#### Admin APIs
```
POST   /api/v1/admin/places                  # Create a place
PUT    /api/v1/admin/places/{id}             # Update place
DELETE /api/v1/admin/places/{id}             # Delete place
POST   /api/v1/admin/places/{id}/content     # Add content to a place
PUT    /api/v1/admin/content/{id}            # Update content
PUT    /api/v1/admin/content/{id}/publish    # Publish content
POST   /api/v1/admin/train-food/platforms    # Add food platform
PUT    /api/v1/admin/train-food/platforms/{id}  # Update food platform
POST   /api/v1/admin/import/places           # Bulk import places (CSV/JSON)
GET    /api/v1/admin/dashboard/stats         # Dashboard statistics
```

---

## 6. Database Schema

### 6.1 Entity Relationship Overview

```
┌──────────────┐     ┌──────────────────┐     ┌──────────────────┐
│    users     │────<│   travel_plans   │────<│  plan_itinerary  │
│              │     │                  │     │    _items         │
└──────┬───────┘     └────────┬─────────┘     └──────────────────┘
       │                      │
       │              ┌───────┴────────┐
       │              │                │
       │         ┌────┴────┐    ┌──────┴──────┐
       │         │  places │───<│place_content│
       │         └────┬────┘    └─────────────┘
       │              │
       │         ┌────┴──────────────┐
       │         │                   │
  ┌────┴────┐  ┌─┴──────────┐  ┌────┴────────┐
  │  chat   │  │ train_food │  │  place      │
  │sessions │  │ _platforms │  │ _highlights │
  └────┬────┘  └────────────┘  └─────────────┘
       │
  ┌────┴────┐    ┌─────────────────┐    ┌──────────────┐
  │  chat   │    │ location_sharing│    │ notifications│
  │messages │    │ _contacts       │    │              │
  └─────────┘    └─────────────────┘    └──────────────┘
```

### 6.2 Core Tables

#### `users`
```sql
CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
```

#### `places`
```sql
CREATE TABLE places (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(255) NOT NULL,
    name_hi         VARCHAR(255),                -- Hindi name
    state           VARCHAR(100) NOT NULL,
    city            VARCHAR(100),
    latitude        DOUBLE PRECISION NOT NULL,
    longitude       DOUBLE PRECISION NOT NULL,
    description     TEXT,
    description_hi  TEXT,                         -- Hindi description
    image_urls      JSONB DEFAULT '[]',
    tags            JSONB DEFAULT '[]',           -- ["heritage", "temple", "coastal"]
    best_season     VARCHAR(50),                  -- "October-March"
    status          VARCHAR(20) DEFAULT 'DRAFT',  -- DRAFT, PUBLISHED
    created_by      UUID REFERENCES users(id),
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- PostGIS index for geospatial queries
CREATE INDEX idx_places_location ON places USING GIST (
    ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)
);

-- Full-text search index
CREATE INDEX idx_places_search ON places USING GIN (
    to_tsvector('english', name || ' ' || COALESCE(description, ''))
);
```

#### `place_content`
```sql
CREATE TABLE place_content (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    place_id        UUID NOT NULL REFERENCES places(id) ON DELETE CASCADE,
    content_type    VARCHAR(30) NOT NULL,         -- HISTORICAL, CULTURAL, POLITICAL, ADMINISTRATIVE
    title           VARCHAR(500) NOT NULL,
    title_hi        VARCHAR(500),
    content         JSONB NOT NULL,               -- Structured storytelling content (see below)
    content_hi      JSONB,                        -- Hindi version
    sort_order      INTEGER DEFAULT 0,
    source          VARCHAR(20) DEFAULT 'CURATED', -- CURATED, AI_GENERATED
    status          VARCHAR(20) DEFAULT 'DRAFT',
    created_by      UUID REFERENCES users(id),
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Storytelling content JSONB structure** (for frontend animation):
```json
{
  "chapters": [
    {
      "chapterTitle": "The Pallava Dynasty",
      "sections": [
        {
          "heading": "Mahendravarman I (600-630 CE)",
          "narrative": "Known as the pioneer of rock-cut architecture...",
          "keyFacts": ["Built Mandagapattu cave temple", "Patron of arts"],
          "imageUrl": "/assets/mahendravarman.jpg",
          "timeline": { "startYear": 600, "endYear": 630 }
        }
      ]
    }
  ],
  "funFacts": ["The Shore Temple withstood the 2004 tsunami"],
  "battles": [
    {
      "name": "Battle of Vatapi",
      "year": 642,
      "description": "Narasimhavarman I defeated the Chalukya king Pulakeshin II",
      "hero": "Narasimhavarman I"
    }
  ]
}
```

#### `place_highlights`
```sql
CREATE TABLE place_highlights (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    place_id        UUID NOT NULL REFERENCES places(id) ON DELETE CASCADE,
    highlight_type  VARCHAR(30) NOT NULL,         -- FOOD, HANDICRAFT, GI_TAG, GEOGRAPHY
    title           VARCHAR(255) NOT NULL,
    title_hi        VARCHAR(255),
    description     TEXT,
    description_hi  TEXT,
    image_url       VARCHAR(500),
    gi_tag_number   VARCHAR(50),                  -- For GI tagged items
    metadata        JSONB DEFAULT '{}',           -- Flexible additional data
    sort_order      INTEGER DEFAULT 0,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### `travel_plans`
```sql
CREATE TABLE travel_plans (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL REFERENCES users(id),
    title               VARCHAR(255) NOT NULL,
    destination_id      UUID REFERENCES places(id),
    travel_medium       VARCHAR(30) NOT NULL,     -- TRAIN, BUS, FLIGHT, CAR, MIXED
    boarding_time_pref  TIME,                     -- Preferred boarding time
    deboarding_time_pref TIME,                    -- Preferred deboarding time
    travel_duration_pref INTERVAL,                -- e.g., '8 hours', '2 days'
    hotel_max_distance_km NUMERIC(5,2),           -- Max hotel distance from site (km)
    budget_min          NUMERIC(10,2),            -- Budget range minimum (INR)
    budget_max          NUMERIC(10,2),            -- Budget range maximum (INR)
    food_preference     VARCHAR(20),              -- VEG, NON_VEG, JAIN, VEGAN
    start_date          DATE,
    end_date            DATE,
    num_travellers      INTEGER DEFAULT 1,
    special_requirements TEXT,                     -- Wheelchair, medical needs, etc.
    status              VARCHAR(20) DEFAULT 'DRAFT', -- DRAFT, PLANNED, ONGOING, COMPLETED
    created_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### `plan_itinerary_items`
```sql
CREATE TABLE plan_itinerary_items (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_id         UUID NOT NULL REFERENCES travel_plans(id) ON DELETE CASCADE,
    day_number      INTEGER NOT NULL,
    time_slot       TIME,
    activity        VARCHAR(500) NOT NULL,
    place_id        UUID REFERENCES places(id),
    location_name   VARCHAR(255),
    notes           TEXT,
    sort_order      INTEGER DEFAULT 0,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### `chat_sessions` & `chat_messages`
```sql
CREATE TABLE chat_sessions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id),
    place_id        UUID REFERENCES places(id),   -- Context: which place is this about
    title           VARCHAR(255),
    is_active       BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE chat_messages (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id      UUID NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
    role            VARCHAR(10) NOT NULL,          -- USER, ASSISTANT
    content         TEXT NOT NULL,
    tokens_used     INTEGER,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### `location_sharing_contacts`
```sql
CREATE TABLE location_sharing_contacts (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL REFERENCES users(id),
    contact_name        VARCHAR(255) NOT NULL,
    telegram_chat_id    VARCHAR(50) NOT NULL,      -- Telegram chat ID for sending location
    sharing_interval_min INTEGER DEFAULT 30,       -- Interval in minutes
    is_active           BOOLEAN DEFAULT TRUE,
    permission_granted  BOOLEAN DEFAULT FALSE,     -- Contact must grant permission
    created_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE location_sharing_sessions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id),
    is_active       BOOLEAN DEFAULT TRUE,
    last_latitude   DOUBLE PRECISION,
    last_longitude  DOUBLE PRECISION,
    last_updated_at TIMESTAMP WITH TIME ZONE,
    started_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    stopped_at      TIMESTAMP WITH TIME ZONE
);
```

#### `train_food_platforms`
```sql
CREATE TABLE train_food_platforms (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(255) NOT NULL,
    description     TEXT,
    website_url     VARCHAR(500),
    app_url         VARCHAR(500),                 -- Deep link to mobile app
    ordering_url    VARCHAR(500),                 -- Direct ordering link
    supported_stations JSONB DEFAULT '[]',        -- List of station codes
    cuisine_types   JSONB DEFAULT '[]',           -- ["North Indian", "South Indian", "Chinese"]
    has_veg         BOOLEAN DEFAULT TRUE,
    has_non_veg     BOOLEAN DEFAULT TRUE,
    has_jain        BOOLEAN DEFAULT FALSE,
    avg_rating      NUMERIC(2,1),
    logo_url        VARCHAR(500),
    is_active       BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### `notifications`
```sql
CREATE TABLE notifications (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id),
    channel         VARCHAR(20) NOT NULL,         -- EMAIL, PUSH, TELEGRAM
    type            VARCHAR(50) NOT NULL,         -- TRAVEL_REMINDER, WEATHER_ALERT, LOCATION_SHARE
    title           VARCHAR(255) NOT NULL,
    body            TEXT NOT NULL,
    metadata        JSONB DEFAULT '{}',
    is_read         BOOLEAN DEFAULT FALSE,
    sent_at         TIMESTAMP WITH TIME ZONE,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE notification_preferences (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) UNIQUE,
    email_enabled   BOOLEAN DEFAULT TRUE,
    push_enabled    BOOLEAN DEFAULT TRUE,
    telegram_enabled BOOLEAN DEFAULT TRUE,
    quiet_hours_start TIME DEFAULT '22:00',
    quiet_hours_end   TIME DEFAULT '07:00',
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

## 7. External Service Integrations

### 7.1 Google Gemini API (AI Chat)
- **Endpoint**: `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent`
- **Free Tier**: 15 requests/minute, 1,500 requests/day, 1M tokens/day
- **Usage**: Place-specific Q&A, itinerary generation, historical narrative generation
- **Implementation**: Spring `WebClient` with retry logic, rate limiting via Redis
- **Prompt Templates**: Pre-built prompts with Indian historical context injected

### 7.2 Google Maps Platform
- **APIs Used**:
  - Geocoding API — Convert place names to coordinates
  - Places API (Nearby Search) — Find hotels near a location
  - Distance Matrix API — Calculate distances
  - Directions API — Travel routes and duration
- **Free Credit**: ₹18,500/month (~$200), covers ~28,000 geocoding calls or ~40,000 distance calculations
- **Caching**: Geocoding results cached in Redis (24-hour TTL)

### 7.3 OpenWeatherMap API
- **Endpoints**:
  - Current Weather: `/data/2.5/weather`
  - 5-Day Forecast: `/data/2.5/forecast`
- **Free Tier**: 1,000 API calls/day
- **Caching**: Weather cached in Redis (3-hour TTL), forecasts (6-hour TTL)

### 7.4 Telegram Bot API
- **Usage**: Location sharing with contacts, notifications, OTP delivery
- **Setup**: Create bot via @BotFather, get bot token
- **Key Methods**:
  - `sendLocation` — Send GPS coordinates
  - `sendMessage` — Send text notifications
  - `getUpdates` / Webhook — Receive contact interactions
- **Cost**: Completely free, no rate limits for reasonable usage

### 7.5 AWS SES (Email)
- **Usage**: Email notifications, travel plan summaries, password reset
- **Free Tier**: 62,000 emails/month when sent from EC2
- **Setup**: Verify domain/email, request production access

---

## 8. Caching Strategy (Redis)

### 8.1 What to Cache

| Data | Cache Key Pattern | TTL | Rationale |
|------|-------------------|-----|-----------|
| Place details | `place:{id}` | 24 hrs | Rarely changes |
| Place content | `place:{id}:content:{type}` | 24 hrs | Curated content |
| Weather data | `weather:{placeId}:current` | 3 hrs | Changes moderately |
| Weather forecast | `weather:{placeId}:forecast` | 6 hrs | Less volatile |
| Geocoding results | `geo:{placeName}` | 7 days | Coordinates don't change |
| User sessions | `session:{userId}` | 24 hrs | Auth sessions |
| Chat rate limits | `ratelimit:chat:{userId}` | 1 min | Rate limiting |
| Train food platforms | `trainfood:platforms` | 12 hrs | Rarely changes |
| AI-generated content | `ai:content:{placeId}:{hash}` | 48 hrs | Expensive to regenerate |

### 8.2 Cache Invalidation
- **Admin content updates** → Invalidate related place cache keys
- **Event-driven**: Spring Application Events trigger cache eviction
- **Manual**: Admin API endpoint to flush specific caches

---

## 9. Notification & Messaging

### 9.1 Internal Event System (Spring Application Events)

Instead of introducing a message broker (Kafka/RabbitMQ) in MVP, we use **Spring Application Events** for loose coupling between modules:

```
Travel Plan Created  →  TravelPlanCreatedEvent  →  NotificationModule (sends confirmation)
Location Updated     →  LocationUpdatedEvent     →  LocationModule (forwards to Telegram)
Content Published    →  ContentPublishedEvent     →  CacheModule (invalidates cache)
Weather Alert        →  WeatherAlertEvent         →  NotificationModule (sends alert)
```

### 9.2 Async Processing
- `@Async` for non-blocking operations (sending emails, Telegram messages)
- `@Scheduled` for periodic tasks:
  - Location sharing (per configured interval)
  - Weather data refresh
  - Stale session cleanup

### 9.3 Future: Message Queue Migration
When scaling beyond the monolith, events can be migrated to:
- **Amazon SQS** (free tier: 1M requests/month) for task queues
- **Amazon SNS** for pub/sub notifications
- Architecture is designed so Spring Events can be swapped for queue-based messaging with minimal code changes

---

## 10. Security

### 10.1 Authentication Flow

```
┌────────┐     ┌──────────┐     ┌──────────────┐     ┌───────────┐
│ Client │────>│ OAuth /  │────>│ Auth Module  │────>│ JWT Token │
│        │     │ OTP      │     │ (validate)   │     │ (issued)  │
└────────┘     └──────────┘     └──────────────┘     └───────────┘
                                       │
                                  ┌────┴────┐
                                  │  Redis  │  (session + token blacklist)
                                  └─────────┘
```

### 10.2 Security Measures
- JWT tokens with short expiry (15 min access, 7 day refresh)
- Token blacklist in Redis for logout
- Spring Security filter chain for route protection
- Rate limiting on all APIs (Redis-based)
- Input validation & sanitization (Bean Validation)
- CORS configuration for allowed origins
- API key rotation for external service credentials
- SQL injection prevention (JPA parameterized queries)
- Audit logging for all admin actions

---

## 11. Prerequisites

Before setting up the project, ensure you have the following:

### 11.1 Development Tools
- [ ] **Java 21** (JDK) — [Download from Adoptium](https://adoptium.net/)
- [ ] **Gradle 8.x** — (Bundled via Gradle Wrapper, no manual install needed)
- [ ] **Git** — Version control
- [ ] **Docker & Docker Compose** — For local PostgreSQL & Redis
- [ ] **IDE** — IntelliJ IDEA (recommended) or VS Code with Java extensions
- [ ] **Postman or Bruno** — For API testing

### 11.2 Accounts & API Keys
- [ ] **Google Cloud Console** account — For Gemini API key and Maps API key
  - Enable: Generative Language API, Maps JavaScript API, Geocoding API, Places API, Distance Matrix API
- [ ] **OpenWeatherMap** account — [Sign up for free API key](https://openweathermap.org/api)
- [ ] **Telegram Bot** — Create via [@BotFather](https://t.me/BotFather), get bot token
- [ ] **AWS Account** — For deployment (EC2, RDS, ElastiCache, SES, S3)
  - Free tier eligible for 12 months
- [ ] **Google OAuth Credentials** — Client ID & Secret from Google Cloud Console
- [ ] **Facebook OAuth Credentials** — App ID & Secret from Meta Developer Portal

### 11.3 Local Development Services
- [ ] **PostgreSQL 16** — (via Docker or local install)
- [ ] **Redis 7** — (via Docker or local install)

---

## 12. Project Setup Steps

### Step 1: Initialize the Spring Boot Project

```bash
# Option A: Use Spring Initializr (recommended)
# Generate from https://start.spring.io with:
#   - Project: Gradle - Kotlin DSL
#   - Language: Java
#   - Spring Boot: 3.3.x
#   - Java: 21
#   - Dependencies: See Step 2

# Option B: We will generate the build.gradle.kts manually (done in code phase)
```

### Step 2: Add Dependencies

Core dependencies to include in `build.gradle.kts`:

| Category | Dependency |
|----------|-----------|
| Web | `spring-boot-starter-web` |
| Security | `spring-boot-starter-security`, `spring-boot-starter-oauth2-client` |
| Data | `spring-boot-starter-data-jpa` |
| Cache | `spring-boot-starter-data-redis` |
| Validation | `spring-boot-starter-validation` |
| Database | `org.postgresql:postgresql` |
| Migration | `org.flywaydb:flyway-core`, `org.flywaydb:flyway-database-postgresql` |
| JWT | `io.jsonwebtoken:jjwt-api`, `jjwt-impl`, `jjwt-jackson` |
| API Docs | `org.springdoc:springdoc-openapi-starter-webmvc-ui` |
| HTTP Client | `spring-boot-starter-webflux` (for WebClient to call external APIs) |
| Lombok | `org.projectlombok:lombok` |
| Testing | `spring-boot-starter-test`, `com.h2database:h2` (for tests) |

### Step 3: Set Up Local Development Environment

```bash
# Create docker-compose.yml for local services
# This will start PostgreSQL and Redis locally

docker-compose up -d

# Verify services are running
docker ps
```

### Step 4: Configure Application Properties

Create `application.yml` with profiles:
- `application.yml` — Common config
- `application-dev.yml` — Local development (Docker PostgreSQL/Redis)
- `application-prod.yml` — Production (AWS RDS/ElastiCache)

### Step 5: Create Database Schema

```bash
# Flyway migrations will auto-run on application start
# Migration files go in: src/main/resources/db/migration/
# Naming: V1__create_users_table.sql, V2__create_places_table.sql, etc.
```

### Step 6: Implement Modules (in order)

| Order | Module | Depends On |
|-------|--------|-----------|
| 1 | Common (exception handling, DTOs, config) | — |
| 2 | Auth Module | Common |
| 3 | Place Information Module | Common, Auth |
| 4 | AI Chat Module | Common, Auth, Place |
| 5 | Travel Planning Module | Common, Auth, Place |
| 6 | Weather & Climate Module | Common, Auth, Place |
| 7 | Train Food Information Module | Common, Auth |
| 8 | Notification Module | Common, Auth |
| 9 | Location Sharing Module | Common, Auth, Notification |
| 10 | Admin Module | Common, Auth, Place, TrainFood |

### Step 7: API Documentation

```bash
# After starting the app, Swagger UI is available at:
# http://localhost:8080/swagger-ui.html
#
# OpenAPI spec at:
# http://localhost:8080/v3/api-docs
```

### Step 8: Testing

```bash
# Run all tests
./gradlew test

# Run specific module tests
./gradlew test --tests "com.yatrasathi.travel.*"

# Generate test coverage report
./gradlew jacocoTestReport
```

### Step 9: Build & Deploy

```bash
# Build the JAR
./gradlew bootJar

# Run locally
java -jar build/libs/yatrasathi-0.0.1-SNAPSHOT.jar --spring.profiles.active=dev

# Deploy to AWS EC2
# (Detailed deployment guide will be in DEPLOYMENT.md)
```

---

## 13. Configuration & Environment Variables

```yaml
# ─── Application ──────────────────────────────────
YATRASATHI_PORT=8080

# ─── Database (PostgreSQL) ────────────────────────
YATRASATHI_DB_URL=jdbc:postgresql://localhost:5432/yatrasathi
YATRASATHI_DB_USERNAME=yatrasathi
YATRASATHI_DB_PASSWORD=<your-password>

# ─── Redis ────────────────────────────────────────
YATRASATHI_REDIS_HOST=localhost
YATRASATHI_REDIS_PORT=6379
YATRASATHI_REDIS_PASSWORD=<your-password>

# ─── JWT ──────────────────────────────────────────
YATRASATHI_JWT_SECRET=<256-bit-secret-key>
YATRASATHI_JWT_ACCESS_EXPIRY=900000       # 15 minutes in ms
YATRASATHI_JWT_REFRESH_EXPIRY=604800000   # 7 days in ms

# ─── Google OAuth ─────────────────────────────────
GOOGLE_CLIENT_ID=<your-google-client-id>
GOOGLE_CLIENT_SECRET=<your-google-client-secret>

# ─── Facebook OAuth ──────────────────────────────
FACEBOOK_CLIENT_ID=<your-facebook-app-id>
FACEBOOK_CLIENT_SECRET=<your-facebook-app-secret>

# ─── Google Gemini API ───────────────────────────
GEMINI_API_KEY=<your-gemini-api-key>

# ─── Google Maps ─────────────────────────────────
GOOGLE_MAPS_API_KEY=<your-maps-api-key>

# ─── OpenWeatherMap ──────────────────────────────
OPENWEATHER_API_KEY=<your-openweather-api-key>

# ─── Telegram Bot ────────────────────────────────
TELEGRAM_BOT_TOKEN=<your-telegram-bot-token>
TELEGRAM_BOT_USERNAME=YatraSathiBot

# ─── AWS SES (Email) ────────────────────────────
AWS_SES_REGION=ap-south-1
AWS_SES_FROM_EMAIL=noreply@yatrasathi.in
```

---

## 14. Development Roadmap

### Phase 1: Foundation (Week 1-2)
- [x] Requirements gathering & architecture design ← **You are here**
- [ ] Project initialization (Spring Boot + Gradle)
- [ ] Docker Compose for local dev (PostgreSQL + Redis)
- [ ] Common module (exception handling, response wrapper, audit)
- [ ] Auth module (OAuth + OTP + JWT)
- [ ] Flyway database migrations (all core tables)
- [ ] Basic health check & Swagger setup

### Phase 2: Core Features (Week 3-4)
- [ ] Place Information module (CRUD + content APIs)
- [ ] Admin module (place & content management)
- [ ] AI Chat module (Gemini integration)
- [ ] Seed database with 10-15 popular Indian destinations
- [ ] Pre-curate historical content for top 5 places

### Phase 3: Travel & Climate (Week 5-6)
- [ ] Travel Planning module (CRUD + itinerary generation)
- [ ] Weather & Climate module (OpenWeatherMap integration)
- [ ] Clothing recommendation engine
- [ ] Google Maps integration (hotel search, distance calculation)

### Phase 4: Communication (Week 7-8)
- [ ] Telegram Bot setup & integration
- [ ] Location Sharing module
- [ ] Notification module (Email + Telegram)
- [ ] Train Food Information module

### Phase 5: Polish & Deploy (Week 9-10)
- [ ] Comprehensive testing (unit + integration)
- [ ] Redis caching implementation across all modules
- [ ] Rate limiting & security hardening
- [ ] AWS deployment (EC2 + RDS + ElastiCache)
- [ ] API documentation finalization
- [ ] Performance testing & optimization

---

## 15. Future Features (Post-MVP)

The modular architecture is designed to support these future additions with minimal refactoring:

| Feature | Module | Approach |
|---------|--------|----------|
| **User Profile & Preferences** | `com.yatrasathi.profile` | New module with preference persistence |
| **Elderly Care (Fall Prevention)** | `com.yatrasathi.elderlycare` | New module, integrates with device sensors via API |
| **EyeAgle-like Monitoring** | `com.yatrasathi.monitoring` | Real-time health monitoring integration |
| **Audio Chat Interaction** | `com.yatrasathi.chat` | Extend chat module with speech-to-text & text-to-speech |
| **Payment Processing** | `com.yatrasathi.payment` | Razorpay/UPI integration |
| **Hotel Booking Integration** | `com.yatrasathi.booking` | MakeMyTrip/Goibibo API integration |
| **Regional Language Support** | `com.yatrasathi.i18n` | Expand i18n to 10+ Indian languages |
| **Offline Mode** | Client-side | Pre-download place content for offline access |
| **Community Reviews** | `com.yatrasathi.community` | User reviews, ratings, travel tips |
| **Accessibility Features** | Cross-cutting | Large fonts, high contrast, screen reader support |
| **WhatsApp Integration** | `com.yatrasathi.location` | Migrate from Telegram to WhatsApp Business API |
| **IRCTC Deep Integration** | `com.yatrasathi.trainfood` | Direct food ordering via IRCTC eCatering API |
| **AR Historical Experience** | `com.yatrasathi.ar` | Augmented reality overlays at heritage sites |

### Extensibility Pattern

New features follow a **plugin-like pattern**:

```java
// 1. Define a feature interface
public interface ElderlyFeature {
    String getFeatureName();
    boolean isEnabled(User user);
    void initialize();
}

// 2. Implement the feature
@Component
public class FallPreventionFeature implements ElderlyFeature {
    // Implementation
}

// 3. Auto-discovered by Spring's component scan
// No changes needed in existing modules
```

---

## 16. Folder Structure

```
yatrasathi/
├── build.gradle.kts
├── settings.gradle.kts
├── gradle/
│   └── wrapper/
├── docker-compose.yml                    # Local dev services
├── Dockerfile                            # Production Docker build
├── README.md
├── DEPLOYMENT.md
│
└── src/
    ├── main/
    │   ├── java/com/yatrasathi/
    │   │   ├── YatraSathiApplication.java
    │   │   │
    │   │   ├── common/                   # ── Shared Module ──
    │   │   │   ├── config/               # App-wide configs (Redis, Security, CORS, Async)
    │   │   │   ├── dto/                  # ApiResponse, PagedResponse, ErrorResponse
    │   │   │   ├── exception/            # GlobalExceptionHandler, custom exceptions
    │   │   │   ├── audit/                # BaseAuditEntity, AuditListener
    │   │   │   ├── util/                 # DateUtils, SlugUtils, etc.
    │   │   │   └── i18n/                 # Internationalization support
    │   │   │
    │   │   ├── auth/                     # ── Auth Module ──
    │   │   │   ├── controller/           # AuthController
    │   │   │   ├── service/              # AuthService, OtpService, JwtService
    │   │   │   ├── entity/               # User entity
    │   │   │   ├── repository/           # UserRepository
    │   │   │   ├── dto/                  # LoginRequest, TokenResponse, etc.
    │   │   │   ├── security/             # JwtFilter, OAuth2SuccessHandler
    │   │   │   └── config/               # SecurityConfig
    │   │   │
    │   │   ├── place/                    # ── Place Info Module ──
    │   │   │   ├── controller/           # PlaceController
    │   │   │   ├── service/              # PlaceService, ContentService
    │   │   │   ├── entity/               # Place, PlaceContent, PlaceHighlight
    │   │   │   ├── repository/           # PlaceRepository, ContentRepository
    │   │   │   └── dto/                  # PlaceResponse, ContentResponse, etc.
    │   │   │
    │   │   ├── chat/                     # ── AI Chat Module ──
    │   │   │   ├── controller/           # ChatController
    │   │   │   ├── service/              # ChatService, GeminiService
    │   │   │   ├── entity/               # ChatSession, ChatMessage
    │   │   │   ├── repository/           # ChatSessionRepository, ChatMessageRepository
    │   │   │   ├── dto/                  # ChatRequest, ChatResponse
    │   │   │   └── prompt/               # PromptTemplates (pre-built prompts)
    │   │   │
    │   │   ├── travel/                   # ── Travel Planning Module ──
    │   │   │   ├── controller/           # TravelPlanController
    │   │   │   ├── service/              # TravelPlanService, ItineraryService
    │   │   │   ├── entity/               # TravelPlan, PlanItineraryItem
    │   │   │   ├── repository/           # TravelPlanRepository
    │   │   │   └── dto/                  # TravelPlanRequest, ItineraryResponse
    │   │   │
    │   │   ├── weather/                  # ── Weather & Climate Module ──
    │   │   │   ├── controller/           # WeatherController
    │   │   │   ├── service/              # WeatherService, ClothingAdvisor
    │   │   │   ├── client/               # OpenWeatherMapClient
    │   │   │   └── dto/                  # WeatherResponse, ClothingAdvice
    │   │   │
    │   │   ├── location/                 # ── Live Location Sharing Module ──
    │   │   │   ├── controller/           # LocationController
    │   │   │   ├── service/              # LocationSharingService
    │   │   │   ├── entity/               # LocationSharingContact, LocationSharingSession
    │   │   │   ├── repository/           # LocationContactRepository
    │   │   │   ├── telegram/             # TelegramBotService
    │   │   │   └── dto/                  # LocationUpdateRequest, ContactResponse
    │   │   │
    │   │   ├── trainfood/                # ── Train Food Module ──
    │   │   │   ├── controller/           # TrainFoodController
    │   │   │   ├── service/              # TrainFoodService
    │   │   │   ├── entity/               # TrainFoodPlatform
    │   │   │   ├── repository/           # TrainFoodPlatformRepository
    │   │   │   └── dto/                  # PlatformResponse
    │   │   │
    │   │   ├── notification/             # ── Notification Module ──
    │   │   │   ├── controller/           # NotificationController
    │   │   │   ├── service/              # NotificationService, EmailService, PushService
    │   │   │   ├── entity/               # Notification, NotificationPreference
    │   │   │   ├── repository/           # NotificationRepository
    │   │   │   ├── event/                # NotificationEvent, EventListeners
    │   │   │   ├── template/             # NotificationTemplates
    │   │   │   └── dto/                  # NotificationResponse, PreferenceRequest
    │   │   │
    │   │   └── admin/                    # ── Admin Module ──
    │   │       ├── controller/           # AdminPlaceController, AdminContentController
    │   │       ├── service/              # AdminService, ContentModerationService
    │   │       └── dto/                  # AdminPlaceRequest, ImportRequest
    │   │
    │   └── resources/
    │       ├── application.yml
    │       ├── application-dev.yml
    │       ├── application-prod.yml
    │       ├── db/migration/             # Flyway SQL migrations
    │       │   ├── V1__create_users_table.sql
    │       │   ├── V2__create_places_tables.sql
    │       │   ├── V3__create_travel_plans_tables.sql
    │       │   ├── V4__create_chat_tables.sql
    │       │   ├── V5__create_location_tables.sql
    │       │   ├── V6__create_train_food_tables.sql
    │       │   ├── V7__create_notification_tables.sql
    │       │   └── V8__seed_initial_data.sql
    │       ├── messages/                 # i18n message bundles
    │       │   ├── messages.properties        # English (default)
    │       │   └── messages_hi.properties     # Hindi
    │       └── prompts/                  # AI prompt templates
    │           ├── historical_narrative.txt
    │           ├── itinerary_generation.txt
    │           └── place_qa.txt
    │
    └── test/
        └── java/com/yatrasathi/
            ├── auth/                     # Auth module tests
            ├── place/                    # Place module tests
            ├── chat/                     # Chat module tests
            ├── travel/                   # Travel module tests
            ├── weather/                  # Weather module tests
            ├── location/                 # Location module tests
            ├── trainfood/                # Train food module tests
            ├── notification/             # Notification module tests
            ├── admin/                    # Admin module tests
            └── integration/              # End-to-end integration tests
```

---

## Quick Reference: Train Food Ordering Ideas

Since train food ordering is information-only (redirect-based) in MVP, here are the curated platforms to include:

| Platform | Description | URL |
|----------|-------------|-----|
| **IRCTC eCatering** | Official IRCTC food ordering service | https://www.ecatering.irctc.co.in |
| **Zoop (RailRestro)** | Popular train food delivery, 500+ stations | https://www.zoopindia.com |
| **Travelkhana** | Budget-friendly meal delivery on trains | https://www.travelkhana.com |
| **RailRecipe** | Regional cuisine delivery on Indian trains | https://www.railrecipe.com |
| **Gofoodieonline** | Restaurant food delivery to train seats | https://www.gofoodieonline.com |

**Data points to store per platform**:
- Supported station codes & names
- Available cuisines (with veg/non-veg/Jain filter)
- Price range
- Average delivery time
- Customer rating
- Minimum order amount
- Deep link / ordering URL with station pre-fill capability

---

> **Next Step**: Once you approve this README, we will proceed to generate the Spring Boot project with all configurations, Flyway migrations, and module-by-module implementation as per the development roadmap.
