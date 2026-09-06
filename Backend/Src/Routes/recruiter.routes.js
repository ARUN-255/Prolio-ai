const express = require("express");

const router = express.Router();

const {
  protect,
  authorize,
} = require("../Middleware/authMiddleware");

const {
  searchCandidates,
  getCandidateBySlug,
  getPublicResumes,
} = require("../Controllers/Recruiter/searchController");

const {
  getPublicResume,
  comparePublicResumes,
  downloadPublicResume,
} = require("../Controllers/Recruiter/comparisonController");

const {
  analyzePublicProject,
} = require("../Controllers/Recruiter/projectAnalyzerController");

const {
  getJobs,
  createJob,
  updateJob,
  deleteJob,
} = require("../Controllers/Recruiter/jobController");

router.get(
  "/candidates/search",
  protect,
  authorize("recruiter"),
  searchCandidates
);

router.get(
  "/candidates/:slug",
  protect,
  authorize("recruiter"),
  getCandidateBySlug
);

router.get(
  "/resumes/public",
  protect,
  authorize("recruiter"),
  getPublicResumes
);

router.post(
  "/resumes/compare",
  protect,
  authorize("recruiter"),
  comparePublicResumes
);

router.get(
  "/resumes/:id/download",
  protect,
  authorize("recruiter"),
  downloadPublicResume
);

router.get(
  "/resumes/:id",
  protect,
  authorize("recruiter"),
  getPublicResume
);

router.post(
  "/projects/:id/analyze",
  protect,
  authorize("recruiter"),
  analyzePublicProject
);

router.get(
  "/jobs",
  protect,
  authorize("recruiter"),
  getJobs
);

router.post(
  "/jobs",
  protect,
  authorize("recruiter"),
  createJob
);

router.put(
  "/jobs/:id",
  protect,
  authorize("recruiter"),
  updateJob
);

router.delete(
  "/jobs/:id",
  protect,
  authorize("recruiter"),
  deleteJob
);

module.exports = router;
