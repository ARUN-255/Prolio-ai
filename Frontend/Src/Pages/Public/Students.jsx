import { FileCheck2, FileText, Share2, UserRound } from "lucide-react";
import { Link } from "react-router-dom";
import PublicFooter from "../../Components/Layout/PublicFooter";
import PublicHeader from "../../Components/Layout/PublicHeader";
import "../../Styles/publicMarketing.css";

const cards = [
  { icon: UserRound, title: "Build once", text: "Add your headline, skills, projects, education, experience and certificates to a reusable profile." },
  { icon: FileText, title: "Create resumes", text: "Import your portfolio data into a resume, edit it directly and export a PDF." },
  { icon: FileCheck2, title: "Check job fit", text: "Run ATS checks against real job descriptions and see missing skills and keywords." },
  { icon: Share2, title: "Share professionally", text: "Use a public portfolio link and decide which information recruiters can see." },
];

function Students() {
  return (
    <div className="public-page">
      <PublicHeader />
      <main>
        <section className="marketing-hero"><div className="container marketing-hero-inner"><p className="eyebrow">For students</p><h1>Turn your college work into a profile recruiters can understand.</h1><p>Prolio AI helps you organize your professional information, create resumes and prepare for job applications without rebuilding everything every time.</p><div className="marketing-hero-actions"><Link className="button button-primary" to="/register">Start free</Link><Link className="button button-secondary" to="/features">Explore features</Link></div></div></section>
        <section className="marketing-section"><div className="container"><div className="section-heading"><p className="eyebrow">Student workflow</p><h2>From raw details to a shareable profile</h2></div><div className="marketing-card-grid">{cards.map(({ icon: Icon, title, text }) => <article className="marketing-card" key={title}><span className="marketing-card-icon"><Icon size={21} /></span><h3>{title}</h3><p>{text}</p></article>)}</div></div></section>
        <section className="marketing-section alt"><div className="container"><div className="section-heading"><p className="eyebrow">How it works</p><h2>A simple four-step process</h2></div><div className="marketing-steps">{["Create your student account and complete the portfolio sections.","Choose a portfolio template and make selected information public.","Create one or more resumes and tailor them for different roles.","Run ATS checks before applying and improve the gaps that matter."].map((text,index)=><article className="marketing-step" key={text}><span className="marketing-step-number">{index+1}</span><div><h3>Step {index+1}</h3><p>{text}</p></div></article>)}</div></div></section>
        <section className="marketing-cta"><div className="container"><div className="marketing-cta-card"><div><h2>Start with the free student plan.</h2><p>You can upgrade later if you need higher limits.</p></div><Link className="button button-primary" to="/register">Create student account</Link></div></div></section>
      </main>
      <PublicFooter />
    </div>
  );
}

export default Students;
