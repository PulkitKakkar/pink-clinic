CREATE TABLE IF NOT EXISTS learner_accounts (
  id uuid PRIMARY KEY,
  name text NOT NULL,
  email text NOT NULL UNIQUE,
  password_hash text NOT NULL,
  must_change_password boolean NOT NULL DEFAULT true,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS learner_sessions (
  id uuid PRIMARY KEY,
  learner_id uuid NOT NULL REFERENCES learner_accounts(id) ON DELETE CASCADE,
  token_hash text NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS learner_sessions_expiry_idx ON learner_sessions (expires_at);

CREATE TABLE IF NOT EXISTS learner_enrolments (
  id uuid PRIMARY KEY,
  learner_id uuid NOT NULL REFERENCES learner_accounts(id) ON DELETE CASCADE,
  course_id text NOT NULL,
  enrolled_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (learner_id, course_id)
);

CREATE TABLE IF NOT EXISTS learner_assignment_due_dates (
  learner_id uuid NOT NULL REFERENCES learner_accounts(id) ON DELETE CASCADE,
  assignment_id text NOT NULL,
  due_at timestamptz,
  PRIMARY KEY (learner_id, assignment_id)
);

CREATE TABLE IF NOT EXISTS learner_submissions (
  id uuid PRIMARY KEY,
  learner_id uuid NOT NULL REFERENCES learner_accounts(id) ON DELETE CASCADE,
  course_id text NOT NULL,
  assignment_id text NOT NULL,
  attempt integer NOT NULL CHECK (attempt > 0),
  written_answer text NOT NULL DEFAULT '',
  files jsonb NOT NULL DEFAULT '[]'::jsonb,
  status text NOT NULL CHECK (status IN ('submitted', 'under-review', 'changes-requested', 'passed')),
  feedback text NOT NULL DEFAULT '',
  submitted_at timestamptz NOT NULL DEFAULT now(),
  reviewed_at timestamptz,
  UNIQUE (learner_id, assignment_id, attempt)
);

CREATE INDEX IF NOT EXISTS learner_submissions_learner_idx ON learner_submissions (learner_id, submitted_at DESC);
CREATE INDEX IF NOT EXISTS learner_submissions_status_idx ON learner_submissions (status, submitted_at);
