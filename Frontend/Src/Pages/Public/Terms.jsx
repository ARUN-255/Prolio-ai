import PublicFooter from "../../Components/Layout/PublicFooter";
import PublicHeader from "../../Components/Layout/PublicHeader";
import "../../Styles/publicMarketing.css";

function Terms() {
  return (
    <div className="public-page">
      <PublicHeader />
      <main className="legal-page"><div className="container"><article className="legal-card">
        <p className="eyebrow">Legal</p><h1>Terms of Use</h1><p className="legal-updated">Last updated: September 2026</p>
        <p>These terms govern access to the Prolio AI beta platform. By creating an account or using the service, you agree to use the platform lawfully and to provide information you are authorized to submit.</p>
        <h2>Accounts and access</h2><p>You are responsible for keeping your login credentials secure and for activity performed through your account. Student and recruiter accounts may have different tools, limits and pricing.</p>
        <h2>User content</h2><p>You retain responsibility for profile, resume, project and job information you submit. You control which supported student information is made public. Do not upload content that infringes another person's rights or contains confidential information you are not authorized to share.</p>
        <h2>AI-assisted features</h2><p>ATS feedback, chatbot responses, resume comparison and project analysis are decision-support tools. Outputs can be incomplete or incorrect and should be reviewed by a person before important application or hiring decisions.</p>
        <h2>Recruiter use</h2><p>Recruiters must use candidate information for legitimate professional evaluation and should not make employment decisions based on protected personal characteristics. Public visibility does not grant permission to misuse, resell or scrape candidate data.</p>
        <h2>Payments and subscriptions</h2><p>Paid plans are billed through the payment provider shown during checkout. Limits and prices displayed at checkout apply to the selected plan and billing cycle. Auto-Pay is not enabled unless the user explicitly opts in where supported.</p>
        <h2>Availability</h2><p>Prolio AI is currently a beta product. Features may change and temporary downtime may occur. We may restrict abusive activity or access that threatens the security or reliability of the service.</p>
        <h2>Contact and updates</h2><p>These terms may be updated as the product develops. Material changes should be reflected on this page before or when they take effect.</p>
      </article></div></main>
      <PublicFooter />
    </div>
  );
}

export default Terms;
