import {
  BriefcaseBusiness,
  LoaderCircle,
  MapPin,
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  createRecruiterJob,
  deleteRecruiterJob,
  getRecruiterJobs,
  updateRecruiterJob,
} from "../../Services/recruiterService";
import "../../Styles/recruiterJobs.css";

const emptyForm = {
  title: "",
  company: "",
  location: "",
  employment_type: "",
  description: "",
  required_skills: "",
  status: "active",
};

function ManageJobs() {
  const [jobs, setJobs] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadJobs = async () => {
    try {
      setLoading(true);
      const data = await getRecruiterJobs();
      setJobs(data?.jobs || []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load jobs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadJobs(); }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
    setMessage("");
    setShowForm(true);
  };

  const openEdit = (job) => {
    setEditingId(job.id);
    setForm({
      title: job.title || "",
      company: job.company || "",
      location: job.location || "",
      employment_type: job.employment_type || "",
      description: job.description || "",
      required_skills: Array.isArray(job.required_skills) ? job.required_skills.join(", ") : "",
      status: job.status || "active",
    });
    setError("");
    setMessage("");
    setShowForm(true);
  };

  const save = async (event) => {
    event.preventDefault();
    if (!form.title.trim() || !form.description.trim()) {
      setError("Job title and description are required.");
      return;
    }

    const payload = {
      ...form,
      title: form.title.trim(),
      description: form.description.trim(),
      required_skills: form.required_skills.split(",").map((skill) => skill.trim()).filter(Boolean),
    };

    try {
      setSaving(true);
      setError("");
      const data = editingId
        ? await updateRecruiterJob(editingId, payload)
        : await createRecruiterJob(payload);

      if (editingId) {
        setJobs((current) => current.map((job) => job.id === editingId ? data.job : job));
        setMessage("Job updated successfully.");
      } else {
        setJobs((current) => [data.job, ...current]);
        setMessage("Job created successfully.");
      }

      setShowForm(false);
      setForm(emptyForm);
      setEditingId(null);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save job.");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this job post?")) return;
    try {
      setError("");
      await deleteRecruiterJob(id);
      setJobs((current) => current.filter((job) => job.id !== id));
      setMessage("Job deleted.");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to delete job.");
    }
  };

  const changeStatus = async (job, status) => {
    try {
      setError("");
      const data = await updateRecruiterJob(job.id, {
        ...job,
        required_skills: job.required_skills || [],
        status,
      });
      setJobs((current) => current.map((item) => item.id === job.id ? data.job : item));
    } catch (err) {
      setError(err.response?.data?.message || "Unable to update job status.");
    }
  };

  return (
    <div className="jobs-page">
      <header className="recruiter-heading">
        <div><p className="eyebrow">Recruiting pipeline</p><h1>Jobs</h1><p>Create and manage job posts used as context for candidate and resume evaluation.</p></div>
        <button className="button button-primary" type="button" onClick={openCreate}><Plus size={17} /> Post a job</button>
      </header>

      {error && <div className="recruiter-error">{error}</div>}
      {message && <div className="jobs-success">{message}</div>}

      {showForm && (
        <section className="job-editor-card">
          <div className="job-editor-head"><div><h2>{editingId ? "Edit job" : "Create job"}</h2><p>Only role-relevant details are used for matching.</p></div><button type="button" onClick={() => setShowForm(false)}><X size={19} /></button></div>
          <form onSubmit={save} className="job-form">
            <div className="job-form-grid">
              <label>Job title<input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Full Stack Developer" /></label>
              <label>Company<input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} placeholder="Company name" /></label>
              <label>Location<input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Chennai / Remote" /></label>
              <label>Employment type<input value={form.employment_type} onChange={(e) => setForm({ ...form, employment_type: e.target.value })} placeholder="Internship / Full-time" /></label>
            </div>
            <label>Required skills<input value={form.required_skills} onChange={(e) => setForm({ ...form, required_skills: e.target.value })} placeholder="React, Node.js, PostgreSQL, AWS" /></label>
            <label>Description<textarea rows="7" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Responsibilities, requirements and role details..." /></label>
            <label>Status<select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}><option value="draft">Draft</option><option value="active">Active</option><option value="closed">Closed</option></select></label>
            <div className="job-form-actions"><button className="button button-primary" disabled={saving} type="submit">{saving ? <><LoaderCircle className="spin" size={17} /> Saving...</> : editingId ? "Save changes" : "Create job"}</button><button className="job-secondary" type="button" onClick={() => setShowForm(false)}>Cancel</button></div>
          </form>
        </section>
      )}

      {loading ? (
        <div className="recruiter-state"><LoaderCircle className="spin" size={24} /> Loading jobs...</div>
      ) : jobs.length === 0 ? (
        <div className="jobs-empty"><BriefcaseBusiness size={34} /><h2>No jobs yet</h2><p>Create a job to start building your recruiter workflow.</p><button className="button button-primary" type="button" onClick={openCreate}><Plus size={17} /> Create first job</button></div>
      ) : (
        <section className="jobs-grid">
          {jobs.map((job) => (
            <article className="job-card" key={job.id}>
              <div className="job-card-head"><div><span className={`job-status ${job.status}`}>{job.status}</span><h2>{job.title}</h2><p>{job.company || "Company not specified"}</p></div><div className="job-card-actions"><button type="button" onClick={() => openEdit(job)} aria-label="Edit job"><Pencil size={16} /></button><button type="button" onClick={() => remove(job.id)} aria-label="Delete job"><Trash2 size={16} /></button></div></div>
              {job.location && <p className="job-location"><MapPin size={14} /> {job.location}</p>}
              {job.employment_type && <small className="job-type">{job.employment_type}</small>}
              <p className="job-description">{job.description}</p>
              <div className="candidate-skills">{(job.required_skills || []).map((skill) => <span key={skill}>{skill}</span>)}</div>
              <div className="job-card-footer"><span>{job.created_at ? new Date(job.created_at).toLocaleDateString() : ""}</span><select value={job.status} onChange={(e) => changeStatus(job, e.target.value)}><option value="draft">Draft</option><option value="active">Active</option><option value="closed">Closed</option></select></div>
            </article>
          ))}
        </section>
      )}
    </div>
  );
}

export default ManageJobs;
