import {
  Bot,
  BriefcaseBusiness,
  FileCheck2,
  FileText,
  GitCompareArrows,
  Search,
  UserRound,
} from "lucide-react";
import { Link } from "react-router-dom";
import PublicFooter from "../../Components/Layout/PublicFooter";
import PublicHeader from "../../Components/Layout/PublicHeader";
import "../../Styles/publicMarketing.css";

const features = [
  { icon: UserRound, title: "Portfolio Builder", text: "Create a public professional profile with projects, skills, education, experience and certificates." },
  { icon: FileText, title: "Resume Maker", text: "Build editable resumes, reorder sections and generate a secure PDF." },
  { icon: FileCheck2, title: "ATS Checker", text: "Compare a Prolio resume or uploaded PDF/DOCX against a job description." },
  { icon: Bot, title: "AI Portfolio Chat", text: "Let visitors ask job-relevant questions about information in a public portfolio." },
  { icon: Search, title: "Candidate Discovery", text: "Recruiters can search public student profiles by keyword, skill and location." },
  { icon: GitCompareArrows, title: "Resume Comparison", text: "Compare two public resumes with deterministic metrics and optional AI guidance." },
  { icon: BriefcaseBusiness, title: "Recruiter Jobs", text: "Create role context and manage job posts inside the recruiter workspace." },
];

function Features() {
  return (
    <div className="public-page">
      <PublicHeader />
      <main>
        <section className="marketing-hero"><div className="container marketing-hero-inner"><p className="eyebrow">Platform features</p><h1>Career tools that connect student work with recruiter evaluation.</h1><p>Prolio AI keeps portfolio building, resumes, ATS checks and recruiter discovery in one practical workflow.</p><div className="marketing-hero-actions"><Link className="button button-primary" to="/register">Create account</Link><Link className="button button-secondary" to="/pricing">View pricing</Link></div></div></section>
        <section className="marketing-section"><div className="container"><div className="section-heading"><p className="eyebrow">What is included</p><h2>One profile, multiple career workflows</h2><p>Each tool uses the same user-controlled professional data, reducing repeated work.</p></div><div className="marketing-card-grid">{features.map(({ icon: Icon, title, text }) => <article className="marketing-card" key={title}><span className="marketing-card-icon"><Icon size={21} /></span><h3>{title}</h3><p>{text}</p></article>)}</div></div></section>
        <section className="marketing-cta"><div className="container"><div className="marketing-cta-card"><div><h2>Build your profile first.</h2><p>Then reuse it across resumes, ATS checks and recruiter discovery.</p></div><Link className="button button-primary" to="/register">Get started</Link></div></div></section>
      </main>
      <PublicFooter />
    </div>
  );
}

export default Features;
