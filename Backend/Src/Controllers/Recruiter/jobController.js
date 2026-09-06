const Job = require("../../Models/Job");
const quotaService = require("../../Services/quotaService");

const normalizeSkills = (value) => {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.map((item) => String(item).trim()).filter(Boolean))];
};

const validateStatus = (status) => ["draft", "active", "closed"].includes(status);

const getJobs = async (req, res) => {
  try {
    const jobs = await Job.findAllByRecruiterId(req.user.id);
    return res.status(200).json({ success: true, count: jobs.length, jobs });
  } catch (error) {
    console.error("GET RECRUITER JOBS ERROR:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const createJob = async (req, res) => {
  const recruiterId = req.user.id;
  let quotaReserved = false;

  try {
    const {
      title,
      company = "",
      location = "",
      employment_type = "",
      description,
      required_skills = [],
      status = "active",
    } = req.body;

    if (!title?.trim() || !description?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Job title and description are required",
      });
    }

    if (!validateStatus(status)) {
      return res.status(400).json({ success: false, message: "Invalid job status" });
    }

    const quota = await quotaService.consumeQuota(recruiterId, "job_posts_per_month");

    if (!quota.allowed) {
      return res.status(429).json({
        success: false,
        message: "Monthly job posting limit reached",
        quota,
      });
    }

    quotaReserved = !quota.unlimited;

    const job = await Job.create({
      recruiterId,
      title: title.trim(),
      company: company.trim(),
      location: location.trim(),
      employmentType: employment_type.trim(),
      description: description.trim(),
      requiredSkills: normalizeSkills(required_skills),
      status,
    });

    return res.status(201).json({
      success: true,
      message: "Job created successfully",
      job,
      quota,
    });
  } catch (error) {
    console.error("CREATE RECRUITER JOB ERROR:", error);

    if (quotaReserved) {
      try {
        await quotaService.refundQuota(recruiterId, "job_posts_per_month");
      } catch (refundError) {
        console.error("JOB QUOTA REFUND ERROR:", refundError);
      }
    }

    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

const updateJob = async (req, res) => {
  try {
    const recruiterId = req.user.id;
    const existing = await Job.findByIdAndRecruiterId(req.params.id, recruiterId);

    if (!existing) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }

    const status = req.body.status ?? existing.status;
    if (!validateStatus(status)) {
      return res.status(400).json({ success: false, message: "Invalid job status" });
    }

    const title = req.body.title ?? existing.title;
    const description = req.body.description ?? existing.description;

    if (!String(title).trim() || !String(description).trim()) {
      return res.status(400).json({
        success: false,
        message: "Job title and description are required",
      });
    }

    const job = await Job.update({
      id: existing.id,
      recruiterId,
      title: String(title).trim(),
      company: String(req.body.company ?? existing.company ?? "").trim(),
      location: String(req.body.location ?? existing.location ?? "").trim(),
      employmentType: String(req.body.employment_type ?? existing.employment_type ?? "").trim(),
      description: String(description).trim(),
      requiredSkills: req.body.required_skills === undefined
        ? existing.required_skills || []
        : normalizeSkills(req.body.required_skills),
      status,
    });

    return res.status(200).json({
      success: true,
      message: "Job updated successfully",
      job,
    });
  } catch (error) {
    console.error("UPDATE RECRUITER JOB ERROR:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const deleteJob = async (req, res) => {
  try {
    const job = await Job.delete(req.params.id, req.user.id);

    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }

    return res.status(200).json({ success: true, message: "Job deleted successfully" });
  } catch (error) {
    console.error("DELETE RECRUITER JOB ERROR:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

module.exports = {
  getJobs,
  createJob,
  updateJob,
  deleteJob,
};
