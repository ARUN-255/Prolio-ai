import {
  AlertCircle,
  CheckCircle2,
  Download,
  GitCompareArrows,
  LoaderCircle,
  Sparkles,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  comparePublicResumes,
  getPublicResumeDownload,
  getPublicResumes,
} from "../../Services/recruiterService";
import "../../Styles/recruiterCompare.css";

const asArray = (value) => (Array.isArray(value) ? value : []);

function ResumeScore({ label, data, winner }) {
  if (!data) return null;

  return (
    <article className={`compare-score-card ${winner ? "winner" : ""}`}>
      <div className="compare-score-head">
        <div>
          <span>{label}</span>
          <h3>{data.owner_name || data.title}</h3>
          <p>{data.title}</p>
        </div>
        <div className="compare-score-number">{data.score ?? 0}</div>
      </div>
      <div className="compare-metrics">
        <span><strong>{data.skill_count ?? 0}</strong> skills</span>
        <span><strong>{data.project_count ?? 0}</strong> projects</span>
        <span><strong>{data.experience_count ?? 0}</strong> experience</span>
        <span><strong>{data.education_count ?? 0}</strong> education</span>
      </div>
      <div className="compare-job-match">
        <span>Required-skill match</span>
        <strong>{data.job_match_percentage ?? 0}%</strong>
      </div>
      {asArray(data.matched_required_skills).length > 0 && (
        <div className="compare-tag-block">
          <small>Matched required skills</small>
          <div className="compare-tags good">
            {data.matched_required_skills.map((skill) => <span key={skill}>{skill}</span>)}
          </div>
        </div>
      )}
      {asArray(data.missing_required_skills).length > 0 && (
        <div className="compare-tag-block">
          <small>Missing required skills</small>
          <div className="compare-tags missing">
            {data.missing_required_skills.map((skill) => <span key={skill}>{skill}</span>)}
          </div>
        </div>
      )}
    </article>
  );
}

function CompareResumes() {
  const [resumes, setResumes] = useState([]);
  const [resumeA, setResumeA] = useState("");
  const [resumeB, setResumeB] = useState("");
  const [requiredSkills, setRequiredSkills] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comparing, setComparing] = useState(false);
  const [downloadId, setDownloadId] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getPublicResumes()
      .then((data) => {
        const list = data?.resumes || [];
        setResumes(list);
        if (list[0]) setResumeA(String(list[0].id));
        if (list[1]) setResumeB(String(list[1].id));
      })
      .catch((err) => setError(err.response?.data?.message || "Unable to load public resumes."))
      .finally(() => setLoading(false));
  }, []);

  const selectedA = useMemo(
    () => resumes.find((resume) => String(resume.id) === String(resumeA)),
    [resumes, resumeA]
  );
  const selectedB = useMemo(
    () => resumes.find((resume) => String(resume.id) === String(resumeB)),
    [resumes, resumeB]
  );

  const compare = async (event) => {
    event.preventDefault();
    if (!resumeA || !resumeB) return setError("Select two public resumes.");
    if (resumeA === resumeB) return setError("Select two different resumes.");

    try {
      setComparing(true);
      setError("");
      const skills = requiredSkills
        .split(",")
        .map((skill) => skill.trim())
        .filter(Boolean);

      const data = await comparePublicResumes({
        resume_a_id: Number(resumeA),
        resume_b_id: Number(resumeB),
        required_skills: skills,
        job_title: jobTitle.trim(),
        job_description: jobDescription.trim(),
      });
      setResult(data);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to compare resumes.");
    } finally {
      setComparing(false);
    }
  };

  const download = async (resume) => {
    if (!resume?.id) return;
    try {
      setDownloadId(resume.id);
      setError("");
      const data = await getPublicResumeDownload(resume.id);
      const url = data?.download?.pdf_url;
      if (!url) throw new Error("Download URL unavailable");
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Unable to download resume.");
    } finally {
      setDownloadId(null);
    }
  };

  if (loading) {
    return <div className="recruiter-state"><LoaderCircle className="spin" size={24} /> Loading public resumes...</div>;
  }

  const comparison = result?.comparison;
  const ai = result?.ai_comparison;

  return (
    <div className="compare-page">
      <header className="recruiter-heading">
        <div><p className="eyebrow">Recruiter intelligence</p><h1>Compare resumes</h1><p>Compare two public student resumes using deterministic signals and optional AI guidance.</p></div>
      </header>

      {error && <div className="recruiter-error">{error}</div>}

      <form className="compare-form" onSubmit={compare}>
        <div className="compare-select-grid">
          <label>Resume A
            <select value={resumeA} onChange={(e) => setResumeA(e.target.value)}>
              <option value="">Select resume</option>
              {resumes.map((resume) => <option value={resume.id} key={resume.id}>{resume.owner_name} — {resume.title}</option>)}
            </select>
          </label>
          <label>Resume B
            <select value={resumeB} onChange={(e) => setResumeB(e.target.value)}>
              <option value="">Select resume</option>
              {resumes.map((resume) => <option value={resume.id} key={resume.id}>{resume.owner_name} — {resume.title}</option>)}
            </select>
          </label>
        </div>
        <label>Required skills <span>comma separated, optional</span>
          <input value={requiredSkills} onChange={(e) => setRequiredSkills(e.target.value)} placeholder="React, Node.js, PostgreSQL, AWS" />
        </label>
        <label>Job title <span>optional</span>
          <input value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} placeholder="Full Stack Developer" />
        </label>
        <label>Job description <span>optional, improves AI context</span>
          <textarea rows="5" value={jobDescription} onChange={(e) => setJobDescription(e.target.value)} placeholder="Paste role responsibilities and requirements..." />
        </label>
        <div className="compare-form-actions">
          <button className="button button-primary" disabled={comparing || resumes.length < 2} type="submit">
            {comparing ? <><LoaderCircle className="spin" size={17} /> Comparing...</> : <><GitCompareArrows size={17} /> Compare resumes</>}
          </button>
          <span>{resumes.length} public resume{resumes.length === 1 ? "" : "s"} available</span>
        </div>
      </form>

      {resumes.length < 2 && (
        <div className="compare-empty"><AlertCircle size={28} /><h2>Two public resumes are required</h2><p>Students need to make their resumes public before recruiters can compare them.</p></div>
      )}

      {comparison && (
        <section className="compare-results">
          <div className="compare-summary"><CheckCircle2 size={20} /><div><strong>Comparison complete</strong><p>{comparison.summary}</p>{result?.quota && <small>Usage: {result.quota.used}{result.quota.unlimited ? " · Unlimited" : ` / ${result.quota.limit}`}</small>}</div></div>
          <div className="compare-score-grid">
            <ResumeScore label="Resume A" data={comparison.resume_a} winner={comparison.higher_score === "resume_a"} />
            <ResumeScore label="Resume B" data={comparison.resume_b} winner={comparison.higher_score === "resume_b"} />
          </div>

          <div className="compare-insight-grid">
            <article><h3>Common skills</h3><div className="compare-tags neutral">{asArray(comparison.common_skills).length ? comparison.common_skills.map((skill) => <span key={skill}>{skill}</span>) : <small>None detected</small>}</div></article>
            <article><h3>Unique to Resume A</h3><div className="compare-tags neutral">{asArray(comparison.unique_skills_resume_a).length ? comparison.unique_skills_resume_a.map((skill) => <span key={skill}>{skill}</span>) : <small>None detected</small>}</div></article>
            <article><h3>Unique to Resume B</h3><div className="compare-tags neutral">{asArray(comparison.unique_skills_resume_b).length ? comparison.unique_skills_resume_b.map((skill) => <span key={skill}>{skill}</span>) : <small>None detected</small>}</div></article>
          </div>

          <div className="compare-downloads">
            <button type="button" onClick={() => download(selectedA)} disabled={!selectedA?.pdf_available || downloadId === selectedA?.id}><Download size={16} /> {downloadId === selectedA?.id ? "Preparing..." : "Download Resume A"}</button>
            <button type="button" onClick={() => download(selectedB)} disabled={!selectedB?.pdf_available || downloadId === selectedB?.id}><Download size={16} /> {downloadId === selectedB?.id ? "Preparing..." : "Download Resume B"}</button>
          </div>

          {ai && (
            <article className="compare-ai-card">
              <div className="compare-ai-heading"><Sparkles size={19} /><div><h3>AI recruiter guidance</h3><p>{ai.comparison_summary || "Additional job-focused comparison."}</p></div></div>
              <div className="compare-ai-grid">
                <div><h4>Resume A strengths</h4><ul>{asArray(ai.resume_a_strengths).map((item, index) => <li key={index}>{item}</li>)}</ul><h4>Gaps</h4><ul>{asArray(ai.resume_a_gaps).map((item, index) => <li key={index}>{item}</li>)}</ul></div>
                <div><h4>Resume B strengths</h4><ul>{asArray(ai.resume_b_strengths).map((item, index) => <li key={index}>{item}</li>)}</ul><h4>Gaps</h4><ul>{asArray(ai.resume_b_gaps).map((item, index) => <li key={index}>{item}</li>)}</ul></div>
              </div>
              <div className="compare-recommendation"><strong>Recommendation: {String(ai.recommended_resume || "tie").replace("_", " ")}</strong><p>{ai.recommendation_reason}</p></div>
            </article>
          )}
        </section>
      )}
    </div>
  );
}

export default CompareResumes;
