import {
  ArrowLeft,
  Download,
  ExternalLink,
  FileText,
  Github,
  Linkedin,
  LoaderCircle,
  MailPlus,
  MapPin,
  MonitorUp,
  Sparkles,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  analyzePublicProject,
  getCandidateBySlug,
  getPublicResumeDownload,
  getRecruiterJobs,
  sendRecruiterInvitation,
} from "../../Services/recruiterService";
import "../../Styles/recruiter.css";
import "../../Styles/candidateTools.css";

const safeArray = (value) => (Array.isArray(value) ? value : []);

function CandidateProfile() {
  const { slug } = useParams();
  const [candidate, setCandidate] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [downloadId, setDownloadId] = useState(null);
  const [analyzingProjectId, setAnalyzingProjectId] = useState(null);
  const [projectAnalyses, setProjectAnalyses] = useState({});
  const [analysisContext, setAnalysisContext] = useState({ job_title: "", required_skills: "", job_description: "" });
  const [inviteForm, setInviteForm] = useState({ job_id: "", message: "" });
  const [sendingInvite, setSendingInvite] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError("");

    Promise.all([getCandidateBySlug(slug), getRecruiterJobs()])
      .then(([candidateData, jobsData]) => {
        setCandidate(candidateData?.candidate || null);
        setJobs(jobsData?.jobs || []);
      })
      .catch((err) => setError(err.response?.data?.message || "Unable to load candidate."))
      .finally(() => setLoading(false));
  }, [slug]);

  const downloadResume = async (resume) => {
    if (!resume?.id) return;
    try {
      setDownloadId(resume.id);
      setError("");
      const data = await getPublicResumeDownload(resume.id);
      const url = data?.download?.pdf_url;
      if (!url) throw new Error("Resume PDF is not available yet.");
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Unable to download resume.");
    } finally {
      setDownloadId(null);
    }
  };

  const analyzeProject = async (project) => {
    if (!project?.id) {
      setError("This project needs to be refreshed before it can be analyzed.");
      return;
    }

    try {
      setAnalyzingProjectId(project.id);
      setError("");
      const data = await analyzePublicProject(project.id, {
        job_title: analysisContext.job_title.trim(),
        job_description: analysisContext.job_description.trim(),
        required_skills: analysisContext.required_skills.split(",").map((skill) => skill.trim()).filter(Boolean),
      });
      setProjectAnalyses((current) => ({ ...current, [project.id]: data }));
    } catch (err) {
      setError(err.response?.data?.message || "Unable to analyze project.");
    } finally {
      setAnalyzingProjectId(null);
    }
  };

  const sendInvitation = async (event) => {
    event.preventDefault();
    if (!candidate?.candidate_id) return setError("Candidate id is unavailable.");

    try {
      setSendingInvite(true);
      setError("");
      setSuccess("");
      const data = await sendRecruiterInvitation({
        candidate_id: candidate.candidate_id,
        job_id: inviteForm.job_id ? Number(inviteForm.job_id) : null,
        message: inviteForm.message.trim(),
      });
      setSuccess(data.message || "Invitation sent successfully.");
      setInviteForm({ job_id: "", message: "" });
    } catch (err) {
      setError(err.response?.data?.message || "Unable to send invitation.");
    } finally {
      setSendingInvite(false);
    }
  };

  if (loading) {
    return <div className="recruiter-state"><LoaderCircle className="spin" size={24} /> Loading candidate...</div>;
  }

  if (error && !candidate) {
    return <div className="recruiter-page"><Link className="candidate-back" to="/recruiter/candidates"><ArrowLeft size={16} /> Back to candidates</Link><div className="recruiter-error">{error}</div></div>;
  }

  if (!candidate) return null;

  const profile = candidate.profile || {};
  const user = candidate.user || {};
  const skills = safeArray(candidate.skills);
  const projects = safeArray(candidate.projects);
  const education = safeArray(candidate.education);
  const experiences = safeArray(candidate.experiences || candidate.experience);
  const certificates = safeArray(candidate.certificates);
  const resumes = safeArray(candidate.resumes);

  return (
    <div className="recruiter-page candidate-profile-page">
      <Link className="candidate-back" to="/recruiter/candidates"><ArrowLeft size={16} /> Back to candidates</Link>
      {error && <div className="recruiter-error">{error}</div>}
      {success && <div className="candidate-success">{success}</div>}

      <section className="candidate-profile-hero">
        <div className="candidate-avatar profile">{user.name?.charAt(0)?.toUpperCase() || "C"}</div>
        <div className="candidate-profile-intro"><p className="eyebrow">Candidate profile</p><h1>{user.name || "Candidate"}</h1><p className="candidate-profile-headline">{profile.headline || "Student candidate"}</p>{profile.location && <p className="candidate-location"><MapPin size={15} /> {profile.location}</p>}</div>
        <div className="candidate-profile-links">
          {profile.website && <a href={profile.website} target="_blank" rel="noreferrer"><MonitorUp size={16} /> Website</a>}
          {profile.linkedin && <a href={profile.linkedin} target="_blank" rel="noreferrer"><Linkedin size={16} /> LinkedIn</a>}
          {profile.github && <a href={profile.github} target="_blank" rel="noreferrer"><Github size={16} /> GitHub</a>}
        </div>
      </section>

      {profile.bio && <section className="recruiter-panel candidate-about-panel"><h2>About</h2><p className="candidate-profile-text">{profile.bio}</p></section>}

      <section className="candidate-invite-card">
        <div className="candidate-invite-heading"><MailPlus size={20} /><div><h2>Invite candidate</h2><p>Send a recruiter invitation, optionally linked to one of your jobs.</p></div></div>
        <form onSubmit={sendInvitation}>
          <select value={inviteForm.job_id} onChange={(e) => setInviteForm({ ...inviteForm, job_id: e.target.value })}><option value="">General invitation</option>{jobs.filter((job) => job.status !== "closed").map((job) => <option value={job.id} key={job.id}>{job.title}{job.company ? ` — ${job.company}` : ""}</option>)}</select>
          <input maxLength="1000" value={inviteForm.message} onChange={(e) => setInviteForm({ ...inviteForm, message: e.target.value })} placeholder="Optional message to the candidate" />
          <button className="button button-primary" disabled={sendingInvite} type="submit">{sendingInvite ? <><LoaderCircle className="spin" size={16} /> Sending...</> : <><MailPlus size={16} /> Send invitation</>}</button>
        </form>
      </section>

      <section className="recruiter-dashboard-grid candidate-profile-grid">
        <article className="recruiter-panel"><h2>Skills</h2>{skills.length ? <div className="candidate-skills candidate-profile-skills">{skills.map((skill, index) => <span key={`${skill.name || skill}-${index}`}>{typeof skill === "string" ? skill : skill.name}{typeof skill === "object" && skill.proficiency ? ` · ${skill.proficiency}` : ""}</span>)}</div> : <p className="recruiter-small-state">No public skills.</p>}</article>
        <article className="recruiter-panel"><h2>Public resumes</h2>{resumes.length ? <div className="candidate-resume-list">{resumes.map((resume) => <article key={resume.id} className="candidate-resume-item"><div><FileText size={17} /><div><strong>{resume.title}</strong><span>{resume.is_primary ? "Primary resume" : "Public resume"}</span></div></div><button type="button" disabled={!resume.pdf_url || downloadId === resume.id} onClick={() => downloadResume(resume)}>{downloadId === resume.id ? <LoaderCircle className="spin" size={16} /> : <Download size={16} />}</button></article>)}<Link className="candidate-compare-link" to="/recruiter/compare">Compare public resumes →</Link></div> : <p className="recruiter-small-state">No public resumes.</p>}</article>
      </section>

      <section className="recruiter-panel"><h2>Education</h2>{education.length ? <div className="candidate-detail-list">{education.map((item, index) => <div className="candidate-detail-item" key={index}><strong>{item.degree || "Education"}</strong><span>{item.institution}</span>{item.field_of_study && <small>{item.field_of_study}</small>}{(item.start_year || item.end_year) && <small>{[item.start_year, item.end_year].filter(Boolean).join(" – ")}</small>}{item.grade && <small>Grade: {item.grade}</small>}{item.description && <p>{item.description}</p>}</div>)}</div> : <p className="recruiter-small-state">No public education.</p>}</section>

      <section className="recruiter-panel"><h2>Experience</h2>{experiences.length ? <div className="candidate-detail-list">{experiences.map((item, index) => <div className="candidate-detail-item" key={index}><strong>{item.role || "Experience"}</strong><span>{item.company}</span>{(item.start_date || item.end_date || item.is_current) && <small>{[item.start_date, item.is_current ? "Present" : item.end_date].filter(Boolean).join(" – ")}</small>}{item.description && <p>{item.description}</p>}</div>)}</div> : <p className="recruiter-small-state">No public experience.</p>}</section>

      <section className="recruiter-panel">
        <div className="candidate-project-heading"><div><h2>Projects</h2><p>Optionally add job context before running the project analyzer.</p></div></div>
        {projects.length > 0 && <div className="project-analysis-context"><input value={analysisContext.job_title} onChange={(e) => setAnalysisContext({ ...analysisContext, job_title: e.target.value })} placeholder="Job title (optional)" /><input value={analysisContext.required_skills} onChange={(e) => setAnalysisContext({ ...analysisContext, required_skills: e.target.value })} placeholder="Required skills, comma separated" /><textarea rows="3" value={analysisContext.job_description} onChange={(e) => setAnalysisContext({ ...analysisContext, job_description: e.target.value })} placeholder="Job description (optional)" /></div>}
        {projects.length ? <div className="candidate-project-grid">{projects.map((project, index) => { const result = projectAnalyses[project.id]; const deterministic = result?.analysis; const ai = result?.ai_analysis; return <article className="candidate-project-card" key={project.id || index}><h3>{project.title || "Project"}</h3>{project.description && <p>{project.description}</p>}<div className="candidate-skills">{safeArray(project.tech_stack).map((tech) => <span key={tech}>{tech}</span>)}</div><div className="candidate-project-actions">{project.link && <a href={project.link} target="_blank" rel="noreferrer">Open project <ExternalLink size={14} /></a>}<button type="button" disabled={analyzingProjectId === project.id} onClick={() => analyzeProject(project)}>{analyzingProjectId === project.id ? <LoaderCircle className="spin" size={14} /> : <Sparkles size={14} />} Analyze</button></div>{result && <div className="project-analysis-result">{deterministic && <p><strong>Technical match:</strong> {deterministic.match_percentage ?? deterministic.score ?? "Analyzed"}{typeof deterministic.match_percentage === "number" ? "%" : ""}</p>}{ai && <><p><strong>AI quality:</strong> {ai.project_quality || "Analyzed"}</p>{ai.recruiter_feedback && <p>{ai.recruiter_feedback}</p>}{safeArray(ai.technical_strengths).length > 0 && <small>Strengths: {ai.technical_strengths.join(" · ")}</small>}{safeArray(ai.technical_gaps).length > 0 && <small>Gaps: {ai.technical_gaps.join(" · ")}</small>}</>}{!result.ai_available && <small>AI feedback was unavailable; deterministic analysis completed.</small>}</div>}</article>; })}</div> : <p className="recruiter-small-state">No public projects.</p>}
      </section>

      <section className="recruiter-panel"><h2>Certificates</h2>{certificates.length ? <div className="candidate-certificate-grid">{certificates.map((item, index) => <article className="candidate-certificate-card" key={index}><div><strong>{item.title || "Certificate"}</strong>{item.issuer && <span>{item.issuer}</span>}{item.date && <small>{String(item.date).slice(0, 10)}</small>}</div>{item.file_url && <a href={item.file_url} target="_blank" rel="noreferrer" aria-label="Open certificate"><ExternalLink size={16} /></a>}</article>)}</div> : <p className="recruiter-small-state">No public certificates.</p>}</section>
    </div>
  );
}

export default CandidateProfile;
