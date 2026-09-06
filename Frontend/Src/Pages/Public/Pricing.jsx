import { Check, LoaderCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PublicFooter from "../../Components/Layout/PublicFooter";
import PublicHeader from "../../Components/Layout/PublicHeader";
import { getPlans } from "../../Services/billingService";
import "../../Styles/publicMarketing.css";

const prettyLimit = (key, value) => {
  const label = key.replaceAll("_", " ");
  if (value === null) return `Unlimited ${label}`;
  if (typeof value === "boolean") return value ? label : null;
  if (value === "all") return `All ${label}`;
  return `${value} ${label}`;
};

function Pricing() {
  const [plans, setPlans] = useState([]);
  const [cycle, setCycle] = useState("monthly");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getPlans()
      .then((data) => setPlans(data?.plans || []))
      .catch((err) => setError(err.response?.data?.message || "Unable to load pricing."))
      .finally(() => setLoading(false));
  }, []);

  const renderGroup = (role, title, description) => {
    const rolePlans = plans.filter((plan) => plan.role === role);

    return (
      <section className="marketing-section">
        <div className="container">
          <div className="section-heading"><p className="eyebrow">{role}</p><h2>{title}</h2><p>{description}</p></div>
          <div className="public-plan-grid">
            {rolePlans.map((plan) => {
              const isFree = Number(plan.price_monthly || 0) === 0;
              const price = cycle === "yearly" ? plan.price_yearly : plan.price_monthly;
              const features = Object.entries(plan.limits || {})
                .map(([key, value]) => prettyLimit(key, value))
                .filter(Boolean)
                .slice(0, 9);

              return (
                <article className={`public-plan-card ${!isFree ? "featured" : ""}`} key={plan.id}>
                  <div><h3>{plan.name}</h3><p>{isFree ? "Start without payment." : "For users who need higher limits and more flexibility."}</p></div>
                  <div className="public-plan-price"><strong>{isFree ? "Free" : `₹${Number(price || 0).toLocaleString("en-IN")}`}</strong>{!isFree && <span>/{cycle === "yearly" ? "year" : "month"}</span>}</div>
                  <div className="public-plan-features">{features.map((feature) => <div key={feature}><Check size={15} /><span>{feature}</span></div>)}</div>
                  <Link className={`button ${isFree ? "button-secondary" : "button-primary"}`} to="/register">{isFree ? "Create free account" : "Get started"}</Link>
                </article>
              );
            })}
          </div>
        </div>
      </section>
    );
  };

  return (
    <div className="public-page">
      <PublicHeader />
      <main>
        <section className="marketing-hero">
          <div className="container marketing-hero-inner">
            <p className="eyebrow">Simple pricing</p>
            <h1>Start free. Upgrade when you need more.</h1>
            <p>Student and recruiter plans are separated so you only pay for the tools relevant to your workflow.</p>
            <div className="pricing-cycle"><button className={cycle === "monthly" ? "active" : ""} type="button" onClick={() => setCycle("monthly")}>Monthly</button><button className={cycle === "yearly" ? "active" : ""} type="button" onClick={() => setCycle("yearly")}>Yearly</button></div>
          </div>
        </section>
        {error && <div className="container marketing-error">{error}</div>}
        {loading ? <div className="marketing-loading"><LoaderCircle className="spin" size={24} /> Loading plans...</div> : <>{renderGroup("student", "Plans for students", "Build, improve and share your professional profile.")}{renderGroup("recruiter", "Plans for recruiters", "Discover candidates and use structured evaluation tools.")}</>}
      </main>
      <PublicFooter />
    </div>
  );
}

export default Pricing;
