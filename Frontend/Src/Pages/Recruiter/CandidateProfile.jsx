import {
  ArrowLeft,
  ExternalLink,
  Github,
  Linkedin,
  LoaderCircle,
  MapPin,
  MonitorUp,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getCandidateBySlug } from "../../Services/recruiterService";
import "../../Styles/recruiter.css";

const safeArray = (value) => (Array.isArray(value) ? value : []);

function CandidateProfile() {
  const { slug } = useParams();
  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");

    getCandidateBySlug(slug)
      .then((data) => setCandidate(data?.candidate || null))
      .catch((err) => setError(err.response?.data?.message || "Unable to load candidate."))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="recruiter-state">
        <LoaderCircle className="spin" size={24} /> Loading candidate...
      </div>
    );
  }

  if (error || !candidate) {
    return (
      <div className="recruiter-page">
        <Link className="candidate-back" to="/recruiter/candidates">
          <ArrowLeft size={16} /> Back to candidates
        </Link>
        <div className="recruiter-error">{error || "Candidate not found."}</div>
      </div>
    );
  }

  const profile = candidate.profile || {};
  const user = candidate.user || {};
  const skills = safeArray(candidate.skills);
  const projects = safeArray(candidate.projects);
  const education = safeArray(candidate.education);
  const experiences = safeArray(candidate.experiences || candidate.experience);
  const certificates = safeArray(candidate.certificates);

  return (
    <div className="recruiter-page candidate-profile-page">
      <Link className="candidate-back" to="/recruiter/candidates">
        <ArrowLeft size={16} /> Back to candidates
      </Link>

      <section className="candidate-profile-hero">
        <div className="candidate-avatar profile">
          {user.name?.charAt(0)?.toUpperCase() || "C"}
        </div>

        <div className="candidate-profile-intro">
          <p className="eyebrow">Candidate profile</p>
          <h1>{user.name || "Candidate"}</h1>
          <p className="candidate-profile-headline">
            {profile.headline || "Student candidate"}
          </p>
          {profile.location && (
            <p className="candidate-location">
              <MapPin size={15} /> {profile.location}
            </p>
          )}
        </div>

        <div className="candidate-profile-links">
          {profile.website && (
            <a href={profile.website} target="_blank" rel="noreferrer">
              <MonitorUp size={16} /> Website
            </a>
          )}
          {profile.linkedin && (
            <a href={profile.linkedin} target="_blank" rel="noreferrer">
              <Linkedin size={16} /> LinkedIn
            </a>
          )}
          {profile.github && (
            <a href={profile.github} target="_blank" rel="noreferrer">
              <Github size={16} /> GitHub
            </a>
          )}
        </div>
      </section>

      {profile.bio && (
        <section className="recruiter-panel candidate-about-panel">
          <h2>About</h2>
          <p className="candidate-profile-text">{profile.bio}</p>
        </section>
      )}

      <section className="recruiter-dashboard-grid candidate-profile-grid">
        <article className="recruiter-panel">
          <h2>Skills</h2>
          {skills.length ? (
            <div className="candidate-skills candidate-profile-skills">
              {skills.map((skill, index) => (
                <span key={`${skill.name || skill}-${index}`}>
                  {typeof skill === "string" ? skill : skill.name}
                  {typeof skill === "object" && skill.proficiency
                    ? ` · ${skill.proficiency}`
                    : ""}
                </span>
              ))}
            </div>
          ) : (
            <p className="recruiter-small-state">No public skills.</p>
          )}
        </article>

        <article className="recruiter-panel">
          <h2>Education</h2>
          {education.length ? (
            <div className="candidate-detail-list">
              {education.map((item, index) => (
                <div className="candidate-detail-item" key={index}>
                  <strong>{item.degree || "Education"}</strong>
                  <span>{item.institution}</span>
                  {item.field_of_study && <small>{item.field_of_study}</small>}
                  {(item.start_year || item.end_year) && (
                    <small>
                      {[item.start_year, item.end_year].filter(Boolean).join(" – ")}
                    </small>
                  )}
                  {item.grade && <small>Grade: {item.grade}</small>}
                  {item.description && <p>{item.description}</p>}
                </div>
              ))}
            </div>
          ) : (
            <p className="recruiter-small-state">No public education.</p>
          )}
        </article>
      </section>

      <section className="recruiter-panel">
        <h2>Experience</h2>
        {experiences.length ? (
          <div className="candidate-detail-list">
            {experiences.map((item, index) => (
              <div className="candidate-detail-item" key={index}>
                <strong>{item.role || "Experience"}</strong>
                <span>{item.company}</span>
                {(item.start_date || item.end_date || item.is_current) && (
                  <small>
                    {[item.start_date, item.is_current ? "Present" : item.end_date]
                      .filter(Boolean)
                      .join(" – ")}
                  </small>
                )}
                {item.description && <p>{item.description}</p>}
              </div>
            ))}
          </div>
        ) : (
          <p className="recruiter-small-state">No public experience.</p>
        )}
      </section>

      <section className="recruiter-panel">
        <h2>Projects</h2>
        {projects.length ? (
          <div className="candidate-project-grid">
            {projects.map((project, index) => (
              <article className="candidate-project-card" key={index}>
                <h3>{project.title || "Project"}</h3>
                {project.description && <p>{project.description}</p>}
                <div className="candidate-skills">
                  {safeArray(project.tech_stack).map((tech) => (
                    <span key={tech}>{tech}</span>
                  ))}
                </div>
                {project.link && (
                  <a href={project.link} target="_blank" rel="noreferrer">
                    Open project <ExternalLink size={14} />
                  </a>
                )}
              </article>
            ))}
          </div>
        ) : (
          <p className="recruiter-small-state">No public projects.</p>
        )}
      </section>

      <section className="recruiter-panel">
        <h2>Certificates</h2>
        {certificates.length ? (
          <div className="candidate-certificate-grid">
            {certificates.map((item, index) => (
              <article className="candidate-certificate-card" key={index}>
                <div>
                  <strong>{item.title || "Certificate"}</strong>
                  {item.issuer && <span>{item.issuer}</span>}
                  {item.date && <small>{item.date}</small>}
                </div>
                {item.file_url && (
                  <a href={item.file_url} target="_blank" rel="noreferrer" aria-label="Open certificate">
                    <ExternalLink size={16} />
                  </a>
                )}
              </article>
            ))}
          </div>
        ) : (
          <p className="recruiter-small-state">No public certificates.</p>
        )}
      </section>
    </div>
  );
}

export default CandidateProfile;
