const User = require("../../Models/User");
const StudentProfile = require("../../Models/StudentProfile");
const Skill = require("../../Models/Skill");
const Resume = require("../../Models/Resume");

const {
  buildPublicPortfolio,
} = require("../../Services/publicPortfolioService");

const searchCandidates = async (req, res) => {
  try {
    const { q = "", skill = "", location = "" } = req.query;
    const users = await User.findAllStudents();
    const candidates = [];

    for (const user of users) {
      const profile = await StudentProfile.findByUserId(user.id);
      if (!profile || !profile.is_public) continue;

      const [skills, publicResumes] = await Promise.all([
        Skill.findAllByUserId(user.id),
        Resume.findPublicByUserId(user.id),
      ]);

      const publicSkills = skills.filter((item) => item.is_public).map((item) => item.name);
      const searchableText = `${user.name || ""} ${profile.headline || ""} ${profile.bio || ""} ${profile.location || ""} ${publicSkills.join(" ")}`.toLowerCase();

      if (q && !searchableText.includes(q.toLowerCase())) continue;
      if (location && !(profile.location || "").toLowerCase().includes(location.toLowerCase())) continue;
      if (skill && !publicSkills.some((item) => item.toLowerCase().includes(skill.toLowerCase()))) continue;

      candidates.push({
        id: user.id,
        name: user.name,
        public_slug: user.public_slug,
        headline: profile.headline,
        bio: profile.bio,
        location: profile.location,
        skills: publicSkills,
        public_resume_count: publicResumes.length,
      });
    }

    return res.status(200).json({ success: true, count: candidates.length, candidates });
  } catch (error) {
    console.error("RECRUITER SEARCH ERROR:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const getCandidateBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const portfolio = await buildPublicPortfolio(slug);

    if (!portfolio) {
      return res.status(404).json({ success: false, message: "Candidate not found" });
    }

    const user = await User.findBySlug(slug);
    const publicResumes = user ? await Resume.findPublicByUserId(user.id) : [];

    return res.status(200).json({
      success: true,
      candidate: {
        ...portfolio,
        candidate_id: user?.id || null,
        resumes: publicResumes,
      },
    });
  } catch (error) {
    console.error("GET RECRUITER CANDIDATE ERROR:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const getPublicResumes = async (req, res) => {
  try {
    const resumes = await Resume.findAllPublic();

    const compact = resumes.map((resume) => ({
      id: resume.id,
      user_id: resume.user_id,
      title: resume.title,
      template_name: resume.template_name,
      is_primary: resume.is_primary,
      pdf_available: Boolean(resume.pdf_url),
      updated_at: resume.updated_at,
      owner_name: resume.owner_name,
      owner_slug: resume.owner_slug,
      owner_headline: resume.owner_headline,
      owner_location: resume.owner_location,
      skills: Array.isArray(resume.resume_data?.skills)
        ? resume.resume_data.skills.map((skill) =>
            typeof skill === "string" ? skill : skill?.name || skill?.skill_name || skill?.title || ""
          ).filter(Boolean)
        : [],
    }));

    return res.status(200).json({ success: true, count: compact.length, resumes: compact });
  } catch (error) {
    console.error("GET PUBLIC RESUMES ERROR:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

module.exports = {
  searchCandidates,
  getCandidateBySlug,
  getPublicResumes,
};
