import { BriefcaseBusiness, GitCompareArrows, Search, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import PublicFooter from "../../Components/Layout/PublicFooter";
import PublicHeader from "../../Components/Layout/PublicHeader";
import "../../Styles/publicMarketing.css";

const cards = [
  { icon: Search, title: "Search public candidates", text: "Filter discoverable student profiles by keyword, skill and location." },
  { icon: GitCompareArrows, title: "Compare resumes", text: "Review two public resumes using structural metrics, required-skill matching and optional AI guidance." },
  { icon: Sparkles, title: "Analyze projects", text: "Evaluate public projects against job context without inventing information that is not in the candidate profile." },
  { icon: BriefcaseBusiness, title: "Manage jobs", text: "Create job posts that can be reused as context for candidate evaluation." },
];

function Recruiters() {
  return (
    <div className="public-page">
      <PublicHeader />
      <main>
        <section className="marketing-hero"><div className="container marketing-hero-inner"><p className="eyebrow">For recruiters</p><h1>Find student talent using the work they choose to make public.</h1><p>Search profiles, inspect projects, compare public resumes and keep job context in a single recruiter workspace.</p><div className="marketing-hero-actions"><Link className="button button-primary" to="/register">Create recruiter account</Link><Link className="button button-secondary" to="/pricing">Recruiter pricing</Link></div></div></section>
        <section className="marketing-section"><div className="container"><div className="section-heading"><p className="eyebrow">Recruiter tools</p><h2>Structured evaluation without unnecessary complexity</h2><p>Prolio focuses on information the student has deliberately made public.</p></div><div className="marketing-card-grid">{cards.map(({ icon: Icon, title, text }) => <article className="marketing-card" key={title}><span className="marketing-card-icon"><Icon size={21} /></span><h3>{title}</h3><p>{text}</p></article>)}</div></div></section>
        <section className="marketing-section alt"><div className="container"><div className="section-heading"><p className="eyebrow">Evaluation principles</p><h2>Job-relevant information first</h2><p>AI-assisted recruiter tools are designed to use supplied resume, project and job information and avoid protected personal characteristics.</p></div><div className="marketing-steps">{["Search students who opted into public discovery.","Open a candidate profile and review skills, projects and experience.","Use project analysis or resume comparison with role-specific context.","Use the output as decision support, not as an automatic hiring decision."].map((text,index)=><article className="marketing-step" key={text}><span className="marketing-step-number">{index+1}</span><div><h3>Step {index+1}</h3><p>{text}</p></div></article>)}</div></div></section>
        <section className="marketing-cta"><div className="container"><div className="marketing-cta-card"><div><h2>Try the recruiter workspace.</h2><p>Create a recruiter account and start with the free plan.</p></div><Link className="button button-primary" to="/register">Get started</Link></div></div></section>
      </main>
      <PublicFooter />
    </div>
  );
}

export default Recruiters;
