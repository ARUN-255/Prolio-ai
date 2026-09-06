const pool = require("../Config/db");

const Invitation = {
  async findAllByRecruiterId(recruiterId) {
    const result = await pool.query(
      `SELECT
        i.*,
        u.name AS candidate_name,
        u.public_slug AS candidate_slug,
        j.title AS job_title
       FROM recruiter_invitations i
       JOIN users u ON u.id = i.candidate_id
       LEFT JOIN recruiter_jobs j ON j.id = i.job_id
       WHERE i.recruiter_id = $1
       ORDER BY i.created_at DESC`,
      [recruiterId]
    );
    return result.rows;
  },

  async create({ recruiterId, candidateId, jobId, message }) {
    const result = await pool.query(
      `INSERT INTO recruiter_invitations (
        recruiter_id,
        candidate_id,
        job_id,
        message
      )
      VALUES ($1,$2,$3,$4)
      RETURNING *`,
      [recruiterId, candidateId, jobId || null, message || null]
    );
    return result.rows[0];
  },
};

module.exports = Invitation;
