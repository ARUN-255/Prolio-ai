const pool = require("./db");

const ensureSchema = async () => {
  await pool.query(`
    ALTER TABLE subscriptions
      ADD COLUMN IF NOT EXISTS current_period_start TIMESTAMP,
      ADD COLUMN IF NOT EXISTS current_period_end TIMESTAMP,
      ADD COLUMN IF NOT EXISTS cancel_at_period_end BOOLEAN NOT NULL DEFAULT FALSE;

    CREATE TABLE IF NOT EXISTS recruiter_jobs (
      id SERIAL PRIMARY KEY,
      recruiter_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      title VARCHAR(200) NOT NULL,
      company VARCHAR(200),
      location VARCHAR(200),
      employment_type VARCHAR(50),
      description TEXT NOT NULL,
      required_skills TEXT[] DEFAULT '{}',
      status VARCHAR(20) NOT NULL DEFAULT 'active'
        CHECK (status IN ('draft', 'active', 'closed')),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_recruiter_jobs_recruiter
      ON recruiter_jobs(recruiter_id);

    CREATE TABLE IF NOT EXISTS recruiter_invitations (
      id SERIAL PRIMARY KEY,
      recruiter_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      candidate_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      job_id INTEGER REFERENCES recruiter_jobs(id) ON DELETE SET NULL,
      message TEXT,
      status VARCHAR(20) NOT NULL DEFAULT 'sent'
        CHECK (status IN ('sent', 'viewed', 'accepted', 'declined')),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE (recruiter_id, candidate_id, job_id)
    );

    CREATE INDEX IF NOT EXISTS idx_recruiter_invitations_recruiter
      ON recruiter_invitations(recruiter_id);
  `);
};

module.exports = ensureSchema;
