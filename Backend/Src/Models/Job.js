const pool = require("../Config/db");

const Job = {
  async findAllByRecruiterId(recruiterId) {
    const result = await pool.query(
      `SELECT *
       FROM recruiter_jobs
       WHERE recruiter_id = $1
       ORDER BY created_at DESC`,
      [recruiterId]
    );
    return result.rows;
  },

  async findByIdAndRecruiterId(id, recruiterId) {
    const result = await pool.query(
      `SELECT *
       FROM recruiter_jobs
       WHERE id = $1 AND recruiter_id = $2`,
      [id, recruiterId]
    );
    return result.rows[0];
  },

  async create({ recruiterId, title, company, location, employmentType, description, requiredSkills, status }) {
    const result = await pool.query(
      `INSERT INTO recruiter_jobs (
        recruiter_id,
        title,
        company,
        location,
        employment_type,
        description,
        required_skills,
        status
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
      RETURNING *`,
      [
        recruiterId,
        title,
        company || null,
        location || null,
        employmentType || null,
        description,
        requiredSkills || [],
        status || "active",
      ]
    );
    return result.rows[0];
  },

  async update({ id, recruiterId, title, company, location, employmentType, description, requiredSkills, status }) {
    const result = await pool.query(
      `UPDATE recruiter_jobs
       SET title = $1,
           company = $2,
           location = $3,
           employment_type = $4,
           description = $5,
           required_skills = $6,
           status = $7,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $8 AND recruiter_id = $9
       RETURNING *`,
      [
        title,
        company || null,
        location || null,
        employmentType || null,
        description,
        requiredSkills || [],
        status || "active",
        id,
        recruiterId,
      ]
    );
    return result.rows[0];
  },

  async delete(id, recruiterId) {
    const result = await pool.query(
      `DELETE FROM recruiter_jobs
       WHERE id = $1 AND recruiter_id = $2
       RETURNING *`,
      [id, recruiterId]
    );
    return result.rows[0];
  },
};

module.exports = Job;
