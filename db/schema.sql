CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TYPE user_role AS ENUM ('admin', 'umkm', 'worker');
CREATE TYPE worker_status AS ENUM ('active', 'inactive', 'blacklisted');
CREATE TYPE job_status AS ENUM ('draft', 'open', 'closed', 'cancelled');
CREATE TYPE application_status AS ENUM ('submitted', 'reviewed', 'accepted', 'rejected', 'withdrawn');
CREATE TYPE placement_status AS ENUM ('active', 'completed', 'terminated');
CREATE TYPE checkin_channel AS ENUM ('text', 'voice');
CREATE TYPE risk_level AS ENUM ('green', 'yellow', 'red');
CREATE TYPE alert_status AS ENUM ('unread', 'read', 'resolved');

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    phone VARCHAR(30),
    role user_role NOT NULL,
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE worker_profiles (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    birth_date DATE,
    city VARCHAR(100),
    province VARCHAR(100),
    skills TEXT,
    education_level VARCHAR(100),
    rehabilitation_program TEXT,
    experience_summary TEXT,
    status worker_status NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE umkm_profiles (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    business_name VARCHAR(150) NOT NULL,
    business_sector VARCHAR(120),
    city VARCHAR(100),
    province VARCHAR(100),
    business_address TEXT,
    company_description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    umkm_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    requirements TEXT,
    employment_type VARCHAR(50),
    location VARCHAR(150),
    salary_min NUMERIC(12, 2),
    salary_max NUMERIC(12, 2),
    status job_status NOT NULL DEFAULT 'draft',
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT salary_range_check CHECK (
        salary_min IS NULL OR salary_max IS NULL OR salary_min <= salary_max
    )
);

CREATE TABLE job_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    worker_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    cover_letter TEXT,
    status application_status NOT NULL DEFAULT 'submitted',
    applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (job_id, worker_id)
);

CREATE TABLE placements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE RESTRICT,
    worker_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    umkm_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    application_id UUID UNIQUE REFERENCES job_applications(id) ON DELETE SET NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    status placement_status NOT NULL DEFAULT 'active',
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT date_range_check CHECK (end_date IS NULL OR start_date <= end_date)
);

CREATE TABLE checkins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    worker_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    placement_id UUID REFERENCES placements(id) ON DELETE SET NULL,
    channel checkin_channel NOT NULL DEFAULT 'text',
    content TEXT NOT NULL,
    transcription TEXT,
    sentiment_score NUMERIC(4, 3),
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT sentiment_score_check CHECK (sentiment_score IS NULL OR (sentiment_score >= -1 AND sentiment_score <= 1))
);

CREATE TABLE risk_assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    worker_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    placement_id UUID REFERENCES placements(id) ON DELETE SET NULL,
    checkin_id UUID REFERENCES checkins(id) ON DELETE SET NULL,
    risk_level risk_level NOT NULL,
    risk_score NUMERIC(5, 2),
    trigger_reason TEXT,
    recommendation TEXT,
    model_name VARCHAR(100),
    assessed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT risk_score_check CHECK (risk_score IS NULL OR (risk_score >= 0 AND risk_score <= 100))
);

CREATE TABLE alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    umkm_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    worker_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    placement_id UUID REFERENCES placements(id) ON DELETE SET NULL,
    risk_assessment_id UUID REFERENCES risk_assessments(id) ON DELETE SET NULL,
    title VARCHAR(180) NOT NULL,
    message TEXT NOT NULL,
    status alert_status NOT NULL DEFAULT 'unread',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    read_at TIMESTAMPTZ,
    resolved_at TIMESTAMPTZ
);

CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_jobs_umkm_status ON jobs(umkm_id, status);
CREATE INDEX idx_job_applications_worker_status ON job_applications(worker_id, status);
CREATE INDEX idx_placements_worker_status ON placements(worker_id, status);
CREATE INDEX idx_checkins_worker_submitted_at ON checkins(worker_id, submitted_at DESC);
CREATE INDEX idx_risk_assessments_worker_assessed_at ON risk_assessments(worker_id, assessed_at DESC);
CREATE INDEX idx_alerts_umkm_status_created_at ON alerts(umkm_id, status, created_at DESC);
