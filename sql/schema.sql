CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE SCHEMA IF NOT EXISTS surveyjs;

CREATE TABLE IF NOT EXISTS surveyjs.surveys (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug         TEXT UNIQUE NOT NULL,
  title        TEXT NOT NULL,
  json_schema  JSONB NOT NULL,
  version      INT NOT NULL DEFAULT 1,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS surveyjs.responses (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  survey_slug   TEXT NOT NULL REFERENCES surveyjs.surveys(slug) ON DELETE CASCADE,
  response_data JSONB NOT NULL,
  submitted_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  meta          JSONB NULL
);

CREATE INDEX IF NOT EXISTS idx_surveys_slug ON surveyjs.surveys(slug);
CREATE INDEX IF NOT EXISTS idx_responses_survey_slug ON surveyjs.responses(survey_slug);

CREATE TABLE IF NOT EXISTS surveyjs.creator_themes (
  name        TEXT PRIMARY KEY,
  theme       JSONB NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS surveyjs.clients (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hotel_name              TEXT NOT NULL,
  location                TEXT,
  pms_system              TEXT,
  crs_system              TEXT,
  rate_shopping_tool      TEXT,
  rms_system              TEXT,
  google_drive_folder_id  TEXT,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS surveyjs.onboarding_instances (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id             UUID NOT NULL REFERENCES surveyjs.clients(id) ON DELETE CASCADE,
  survey_slug           TEXT NOT NULL REFERENCES surveyjs.surveys(slug) ON DELETE CASCADE,
  source_survey_slug    TEXT,
  token                 TEXT UNIQUE NOT NULL,
  scope_revenue         BOOLEAN NOT NULL DEFAULT false,
  scope_distribution    BOOLEAN NOT NULL DEFAULT false,
  scope_digital         BOOLEAN NOT NULL DEFAULT false,
  scope_social          BOOLEAN NOT NULL DEFAULT false,
  theme                 TEXT,
  status                TEXT NOT NULL DEFAULT 'not_started',
  draft_data            JSONB,
  final_data            JSONB,
  completion_percent    NUMERIC(5,2) NOT NULL DEFAULT 0,
  current_page          INTEGER NOT NULL DEFAULT 0,
  last_saved_at         TIMESTAMPTZ,
  expires_at            TIMESTAMPTZ,
  revoked_at            TIMESTAMPTZ,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_onboarding_instances_client_id
  ON surveyjs.onboarding_instances(client_id);
CREATE INDEX IF NOT EXISTS idx_onboarding_instances_token
  ON surveyjs.onboarding_instances(token);
CREATE INDEX IF NOT EXISTS idx_onboarding_instances_status
  ON surveyjs.onboarding_instances(status);
CREATE INDEX IF NOT EXISTS idx_onboarding_instances_source_survey_slug
  ON surveyjs.onboarding_instances(source_survey_slug);
