import PublicFooter from "../../Components/Layout/PublicFooter";
import PublicHeader from "../../Components/Layout/PublicHeader";
import "../../Styles/publicMarketing.css";

function PrivacyPolicy() {
  return (
    <div className="public-page">
      <PublicHeader />
      <main className="legal-page"><div className="container"><article className="legal-card">
        <p className="eyebrow">Legal</p><h1>Privacy Policy</h1><p className="legal-updated">Last updated: September 2026</p>
        <p>This policy explains the main categories of information Prolio AI processes during the beta and how public visibility works.</p>
        <h2>Information you provide</h2><p>Account information can include your name, email or phone number and account role. Students may add profile, education, skills, experience, projects, certificates and resume information. Recruiters may add job information and use candidate evaluation tools.</p>
        <h2>Public profile controls</h2><p>Student portfolio sections and resumes are not treated as public merely because they exist in an account. Public discovery and public resume features use the visibility choices supported by the product. Review those settings before sharing a portfolio link.</p>
        <h2>Uploaded resumes</h2><p>When a resume is uploaded directly to the ATS checker for analysis, the application is designed to parse the file in memory for that check rather than save it as a permanent Prolio resume unless the product explicitly offers and you choose a save option.</p>
        <h2>AI processing</h2><p>AI-assisted features send relevant professional content and prompts to the configured AI provider to produce requested feedback or answers. Avoid adding secrets or unrelated sensitive information to resumes, job descriptions or public profiles.</p>
        <h2>Service providers</h2><p>Prolio AI may rely on infrastructure, database, cache, object storage, AI and payment providers to operate the service. Payment card details are handled through the payment provider rather than stored directly by the Prolio AI application.</p>
        <h2>Security and retention</h2><p>The service uses access controls, private object storage and authenticated APIs for protected account data. No online service can guarantee absolute security. Account and user-generated data may remain while the account or relevant feature remains active, subject to operational and legal requirements.</p>
        <h2>Your choices</h2><p>You can control supported public visibility settings, delete supported portfolio and resume items, and manage subscription preferences from the product. Additional account deletion or data export controls should be provided before a full public production launch if required by applicable policy or law.</p>
      </article></div></main>
      <PublicFooter />
    </div>
  );
}

export default PrivacyPolicy;
