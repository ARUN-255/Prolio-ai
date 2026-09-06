import { LoaderCircle, MailCheck, UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getRecruiterInvitations } from "../../Services/recruiterService";
import "../../Styles/recruiterInvitations.css";

function Invitations() {
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getRecruiterInvitations()
      .then((data) => setInvitations(data?.invitations || []))
      .catch((err) => setError(err.response?.data?.message || "Unable to load invitations."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="recruiter-state"><LoaderCircle className="spin" size={24} /> Loading invitations...</div>;
  }

  return (
    <div className="invitations-page">
      <header className="recruiter-heading">
        <div><p className="eyebrow">Recruiter outreach</p><h1>Invitations</h1><p>Review candidate invitations sent from public candidate profiles.</p></div>
        <div className="invitations-count"><MailCheck size={18} /><strong>{invitations.length}</strong><span>sent</span></div>
      </header>

      {error && <div className="recruiter-error">{error}</div>}

      {invitations.length === 0 ? (
        <section className="invitations-empty"><UserRound size={34} /><h2>No invitations yet</h2><p>Open a public candidate profile to send an invitation.</p><Link className="button button-primary" to="/recruiter/candidates">Find candidates</Link></section>
      ) : (
        <section className="invitations-list">
          {invitations.map((invitation) => (
            <article className="invitation-card" key={invitation.id}>
              <div className="invitation-avatar">{invitation.candidate_name?.charAt(0)?.toUpperCase() || "C"}</div>
              <div className="invitation-content">
                <div className="invitation-title-row"><div><h2>{invitation.candidate_name || "Candidate"}</h2><p>{invitation.job_title ? `For ${invitation.job_title}` : "General invitation"}</p></div><span className={`invitation-status ${invitation.status || "sent"}`}>{invitation.status || "sent"}</span></div>
                {invitation.message && <p className="invitation-message">{invitation.message}</p>}
                <div className="invitation-meta"><span>{invitation.created_at ? new Date(invitation.created_at).toLocaleString() : "Sent"}</span>{invitation.candidate_slug && <Link to={`/recruiter/candidates/${invitation.candidate_slug}`}>View candidate →</Link>}</div>
              </div>
            </article>
          ))}
        </section>
      )}
    </div>
  );
}

export default Invitations;
