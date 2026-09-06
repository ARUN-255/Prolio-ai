import { ArrowRight, GitCompareArrows, Search, UsersRound } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { searchCandidates } from "../../Services/recruiterService";
import "../../Styles/recruiter.css";

function RecruiterDashboard() {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    searchCandidates()
      .then((data) => setCandidates(data?.candidates || []))
      .catch((err) => setError(err.response?.data?.message || "Unable to load recruiter dashboard."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="recruiter-page">
      <header className="recruiter-heading"><div><p className="eyebrow">Recruiter workspace</p><h1>Discover the right talent</h1><p>Search public student profiles, review their work and compare resumes from one workspace.</p></div><Link className="button button-primary" to="/recruiter/candidates"><Search size={17} /> Find candidates</Link></header>
      {error && <div className="recruiter-error">{error}</div>}
      <section className="recruiter-stats">
        <article><span className="recruiter-stat-icon"><UsersRound size={21} /></span><div><strong>{loading ? "—" : candidates.length}</strong><p>Discoverable candidates</p></div></article>
        <article><span className="recruiter-stat-icon"><Search size={21} /></span><div><strong>3</strong><p>Search filters available</p></div></article>
        <article><span className="recruiter-stat-icon"><GitCompareArrows size={21} /></span><div><strong>Ready</strong><p>Resume comparison</p></div></article>
      </section>
      <section className="recruiter-dashboard-grid">
        <article className="recruiter-panel"><div className="recruiter-panel-heading"><div><h2>Candidate discovery</h2><p>Search by keyword, skill and location.</p></div></div><div className="recruiter-quick-list"><Link to="/recruiter/candidates"><Search size={19} /><div><strong>Search public candidates</strong><span>Explore profiles that students have made public.</span></div><ArrowRight size={18} /></Link><Link to="/recruiter/compare"><GitCompareArrows size={19} /><div><strong>Compare resumes</strong><span>Review multiple public resumes side by side.</span></div><ArrowRight size={18} /></Link></div></article>
        <article className="recruiter-panel"><div className="recruiter-panel-heading"><div><h2>Recently discoverable</h2><p>A quick view of public candidates.</p></div><Link to="/recruiter/candidates">View all</Link></div>{loading ? <div className="recruiter-small-state">Loading candidates...</div> : candidates.length === 0 ? <div className="recruiter-small-state">No public candidates are available yet.</div> : <div className="dashboard-candidates">{candidates.slice(0, 4).map((candidate) => <Link to={`/recruiter/candidates/${candidate.public_slug}`} key={candidate.id}><span className="candidate-avatar small">{candidate.name?.charAt(0)?.toUpperCase() || "C"}</span><div><strong>{candidate.name}</strong><span>{candidate.headline || candidate.location || "Student candidate"}</span></div><ArrowRight size={16} /></Link>)}</div>}</article>
      </section>
    </div>
  );
}

export default RecruiterDashboard;
