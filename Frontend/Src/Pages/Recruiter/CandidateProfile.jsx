import { ArrowLeft, LoaderCircle, MapPin } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getCandidateBySlug } from "../../Services/recruiterService";
import "../../Styles/recruiter.css";

function CandidateProfile() {
  const { slug } = useParams();
  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getCandidateBySlug(slug)
      .then((data) => setCandidate(data?.candidate || null))
      .catch((err) => setError(err.response?.data?.message || "Unable to load candidate."))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return <div className="recruiter-state"><LoaderCircle className="spin" size={24} /> Loading candidate...</div>;
  }

  if (error || !candidate) {
    return (
      <div className="recruiter-page">
        <Link className="candidate-back" to="/recruiter/candidates"><ArrowLeft size={16} /> Back to candidates</Link>
        <div className="recruiter-error">{error || "Candidate not found."}</div>
      </div>
    );
  }

  const profile = candidate.profile || {};
  const user = candidate.user || candidate;
  const skills = candidate.skills || [];
  const projects = candidate.projects || [];
  const education = candidate.education || [];
  const experiences = candidate.experiences || candidate.experience || [];
  const certificates = candidate.certificates || [];

  return (
    <div className="recruiter-page">
      <Link className="candidate-back" to="/recruiter/candidates"><ArrowLeft size={16} /> Back to candidates</Link>

      <section className="candidate-profile-hero">
        <div className="candidate-avatar profile">{user.name?.charAt(0)?.toUpperCase() || "C"}</div>
        <div>
          <p className="eyebrow">Candidate profile</p>
          <h1>{user.name || "Candidate"}</h1>
          <p className="candidate-profile-headline">{profile.headline || "Student candidate"}</p>
          {profile.location && <p className="candidate-location"><MapPin size={15} /> {profile.location}</p>}
        </div>
      </section>

      {profile.bio && <section className="recruiter-panel"><h2>About</h2><p className="candidate-profile-text">{profile.bio}</p></section>}

      <section className="recruiter-dashboard-grid">
        <article className="recruiter-panel"><h2>Skills</h2><div className="candidate-skills">{skills.length ? skills.map((skill, index) => <span key={skill.id || index}>{typeof skill === "string" ? skill : skill.name}</span>) : <p className="recruiter-small-state">No public skills.</p>}</div></article>
        <article className="recruiter-panel"><h2>Education</h2>{education.length ? education.map((item, index) => <div className="candidate-detail-item" key={item.id || index}><strong>{item.degree || "Education"}</strong><span>{item.institution}</span><small>{[item.start_year, item.end_year].filter(Boolean).join(" - ")}</small></div>) : <p className="recruiter-small-state">No public education.</p>}</article>
      </section>

      <section className="recruiter-panel"><h2>Experience</h2>{experiences.length ? experiences.map((item, index) => <div className="candidate-detail-item" key={item.id || index}><strong>{item.role || "Experience"}</strong><span>{item.company}</span><p>{item.description}</p></div>) : <p className="recruiter-small-state">No public experience.</p>}</section>

      <section className="recruiter-panel"><h2>Projects</h2>{projects.length ? <div className="candidate-project-grid">{projects.map((project, index) => <article className="candidate-project-card" key={project.id || index}><h3>{project.title}</h3><p>{project.description}</p><div className="candidate-skills">{(project.tech_stack || []).map((tech) => <span key={tech}>{tech}</span>)}</div>{project.link && <a href={project.link} target="_blank" rel="noreferrer">Open project →</a>}</article>)}</div> : <p className="recruiter-small-state">No public projects.</p>}</section>

      {certificates.length > 0 && <section className="recruiter-panel"><h2>Certificates</h2>{certificates.map((item, index) => <div className="candidate-detail-item" key={item.id || index}><strong>{item.title}</strong><span>{item.issuer}</span></div>)}</section>}
    </div>
  );
}

export default CandidateProfile;
