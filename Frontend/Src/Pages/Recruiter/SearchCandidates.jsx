import { BriefcaseBusiness, LoaderCircle, MapPin, Search, UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { searchCandidates } from "../../Services/recruiterService";
import "../../Styles/recruiter.css";

function SearchCandidates() {
  const [filters, setFilters] = useState({ q: "", skill: "", location: "" });
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadCandidates = async (nextFilters = filters) => {
    try {
      setLoading(true);
      setError("");
      const data = await searchCandidates(nextFilters);
      setCandidates(data?.candidates || []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load candidates.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadCandidates({ q: "", skill: "", location: "" }); }, []);

  const submit = (event) => {
    event.preventDefault();
    loadCandidates(filters);
  };

  const clear = () => {
    const empty = { q: "", skill: "", location: "" };
    setFilters(empty);
    loadCandidates(empty);
  };

  return (
    <div className="recruiter-page">
      <header className="recruiter-heading">
        <div><p className="eyebrow">Talent discovery</p><h1>Find candidates</h1><p>Search public student profiles by role, skill or location.</p></div>
        <div className="recruiter-count"><UserRound size={18} /><strong>{candidates.length}</strong><span>candidates</span></div>
      </header>

      <form className="candidate-search-panel" onSubmit={submit}>
        <label><span>Search</span><div className="candidate-input"><Search size={17} /><input value={filters.q} onChange={(e) => setFilters({ ...filters, q: e.target.value })} placeholder="Name, headline or keyword" /></div></label>
        <label><span>Skill</span><div className="candidate-input"><BriefcaseBusiness size={17} /><input value={filters.skill} onChange={(e) => setFilters({ ...filters, skill: e.target.value })} placeholder="React, Java, AWS..." /></div></label>
        <label><span>Location</span><div className="candidate-input"><MapPin size={17} /><input value={filters.location} onChange={(e) => setFilters({ ...filters, location: e.target.value })} placeholder="Chennai, Bengaluru..." /></div></label>
        <div className="candidate-search-actions"><button className="button button-primary" type="submit" disabled={loading}>Search</button><button className="candidate-clear" type="button" onClick={clear}>Clear</button></div>
      </form>

      {error && <div className="recruiter-error">{error}</div>}
      {loading ? <div className="recruiter-state"><LoaderCircle className="spin" size={24} /> Searching candidates...</div> : candidates.length === 0 ? (
        <div className="recruiter-empty"><Search size={32} /><h2>No candidates found</h2><p>Try a broader keyword, another skill, or clear the filters.</p></div>
      ) : (
        <section className="candidate-grid">
          {candidates.map((candidate) => (
            <article className="candidate-card" key={candidate.id}>
              <div className="candidate-card-top"><div className="candidate-avatar">{candidate.name?.charAt(0)?.toUpperCase() || "C"}</div><div><h2>{candidate.name || "Candidate"}</h2><p>{candidate.headline || "Student candidate"}</p></div></div>
              {candidate.location && <p className="candidate-location"><MapPin size={15} /> {candidate.location}</p>}
              {candidate.bio && <p className="candidate-bio">{candidate.bio}</p>}
              <div className="candidate-skills">{(candidate.skills || []).slice(0, 6).map((skill) => <span key={skill}>{skill}</span>)}{(candidate.skills || []).length > 6 && <span>+{candidate.skills.length - 6}</span>}</div>
              {candidate.public_slug ? <Link className="candidate-view" to={`/recruiter/candidates/${candidate.public_slug}`}>View candidate →</Link> : <span className="candidate-unavailable">Profile link unavailable</span>}
            </article>
          ))}
        </section>
      )}
    </div>
  );
}

export default SearchCandidates;
