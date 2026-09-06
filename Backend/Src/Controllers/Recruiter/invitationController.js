const Invitation = require("../../Models/Invitation");
const Job = require("../../Models/Job");
const User = require("../../Models/User");
const StudentProfile = require("../../Models/StudentProfile");
const quotaService = require("../../Services/quotaService");

const getInvitations = async (req, res) => {
  try {
    const invitations = await Invitation.findAllByRecruiterId(req.user.id);
    return res.status(200).json({ success: true, count: invitations.length, invitations });
  } catch (error) {
    console.error("GET RECRUITER INVITATIONS ERROR:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const createInvitation = async (req, res) => {
  const recruiterId = req.user.id;
  let quotaReserved = false;

  try {
    const { candidate_id, job_id = null, message = "" } = req.body;

    if (!candidate_id) {
      return res.status(400).json({ success: false, message: "candidate_id is required" });
    }

    if (message && String(message).length > 1000) {
      return res.status(400).json({ success: false, message: "Invitation message must be 1000 characters or less" });
    }

    const candidate = await User.findById(candidate_id);
    if (!candidate || candidate.role !== "student") {
      return res.status(404).json({ success: false, message: "Candidate not found" });
    }

    const profile = await StudentProfile.findByUserId(candidate.id);
    if (!profile?.is_public) {
      return res.status(404).json({ success: false, message: "Candidate is not publicly discoverable" });
    }

    if (job_id) {
      const job = await Job.findByIdAndRecruiterId(job_id, recruiterId);
      if (!job) {
        return res.status(404).json({ success: false, message: "Job not found" });
      }
    }

    const quota = await quotaService.consumeQuota(recruiterId, "invitations_per_month");
    if (!quota.allowed) {
      return res.status(429).json({ success: false, message: "Monthly invitation limit reached", quota });
    }

    quotaReserved = !quota.unlimited;

    const invitation = await Invitation.create({
      recruiterId,
      candidateId: candidate.id,
      jobId: job_id || null,
      message: String(message || "").trim(),
    });

    return res.status(201).json({
      success: true,
      message: "Invitation sent successfully",
      invitation,
      quota,
    });
  } catch (error) {
    console.error("CREATE RECRUITER INVITATION ERROR:", error);

    if (quotaReserved) {
      try {
        await quotaService.refundQuota(recruiterId, "invitations_per_month");
      } catch (refundError) {
        console.error("INVITATION QUOTA REFUND ERROR:", refundError);
      }
    }

    if (error.code === "23505") {
      return res.status(409).json({ success: false, message: "This candidate has already been invited for that job" });
    }

    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

module.exports = {
  getInvitations,
  createInvitation,
};
