import { Navigate, Route, Routes } from "react-router-dom";

import DashboardLayout from "../Components/Layout/DashboardLayout";
import HomePage from "../Pages/Home/HomePage";
import Login from "../Pages/Public/Login";
import Signup from "../Pages/Public/Signup";
import PublicProfile from "../Pages/Public/PublicProfile";
import Features from "../Pages/Public/Features";
import Students from "../Pages/Public/Students";
import Recruiters from "../Pages/Public/Recruiters";
import Pricing from "../Pages/Public/Pricing";
import Terms from "../Pages/Public/Terms";
import PrivacyPolicy from "../Pages/Public/PrivacyPolicy";
import Refund from "../Pages/Public/Refund";
import NotFound from "../Pages/Public/NotFound";
import Billing from "../Pages/Billing";

import ProtectedRoute from "./ProtectedRoute";
import RoleRoute from "./RoleRoute";

import StudentDashboard from "../Pages/Student/Dashboard";
import PortfolioMaker from "../Pages/Student/PortfolioMaker";
import AddProject from "../Pages/Student/AddProject";
import AddSkill from "../Pages/Student/AddSkill";
import AddEducation from "../Pages/Student/AddEducation";
import AddExperience from "../Pages/Student/AddExperience";
import AddCertificate from "../Pages/Student/AddCertificate";
import PortfolioTemplates from "../Pages/Student/PortfolioTemplates";
import PortfolioPreview from "../Pages/Student/PortfolioPreview";
import Resumes from "../Pages/Student/Resumes";
import CreateResume from "../Pages/Student/CreateResume";
import ResumeEditor from "../Pages/Student/ResumeEditor";
import ATSChecker from "../Pages/Student/ATSChecker";

import RecruiterDashboard from "../Pages/Recruiter/Dashboard";
import SearchCandidates from "../Pages/Recruiter/SearchCandidates";
import CandidateProfile from "../Pages/Recruiter/CandidateProfile";
import CompareResumes from "../Pages/Recruiter/CompareResumes";
import ManageJobs from "../Pages/Recruiter/ManageJobs";

function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/welcome" element={<Navigate to="/" replace />} />
      <Route path="/features" element={<Features />} />
      <Route path="/students" element={<Students />} />
      <Route path="/recruiters" element={<Recruiters />} />
      <Route path="/pricing" element={<Pricing />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/privacy" element={<PrivacyPolicy />} />
      <Route path="/refund" element={<Refund />} />
      <Route path="/p/:slug" element={<PublicProfile />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Signup />} />

      <Route
        path="/student"
        element={
          <ProtectedRoute>
            <RoleRoute allowedRole="student">
              <DashboardLayout />
            </RoleRoute>
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<StudentDashboard />} />
        <Route path="portfolio" element={<PortfolioMaker />} />
        <Route path="portfolio/project/add" element={<AddProject />} />
        <Route path="portfolio/skill/add" element={<AddSkill />} />
        <Route path="portfolio/education/add" element={<AddEducation />} />
        <Route path="portfolio/experience/add" element={<AddExperience />} />
        <Route path="portfolio/certificate/add" element={<AddCertificate />} />
        <Route path="portfolio/templates" element={<PortfolioTemplates />} />
        <Route path="portfolio/preview" element={<PortfolioPreview />} />
        <Route path="resumes" element={<Resumes />} />
        <Route path="resumes/new" element={<CreateResume />} />
        <Route path="resumes/:id" element={<ResumeEditor />} />
        <Route path="ats" element={<ATSChecker />} />
        <Route path="billing" element={<Billing />} />
      </Route>

      <Route
        path="/recruiter"
        element={
          <ProtectedRoute>
            <RoleRoute allowedRole="recruiter">
              <DashboardLayout />
            </RoleRoute>
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<RecruiterDashboard />} />
        <Route path="candidates" element={<SearchCandidates />} />
        <Route path="candidates/:slug" element={<CandidateProfile />} />
        <Route path="compare" element={<CompareResumes />} />
        <Route path="jobs" element={<ManageJobs />} />
        <Route path="billing" element={<Billing />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default AppRouter;
