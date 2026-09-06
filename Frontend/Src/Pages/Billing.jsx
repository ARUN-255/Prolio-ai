import {
  Check,
  CreditCard,
  LoaderCircle,
  RefreshCcw,
  ShieldCheck,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../Context/AuthContext";
import {
  cancelSubscription,
  createCheckout,
  getMySubscription,
  getPlans,
  resumeSubscription,
  updateAutoPay,
} from "../Services/billingService";
import "../Styles/billing.css";

const loadRazorpay = () => new Promise((resolve) => {
  if (window.Razorpay) return resolve(true);
  const script = document.createElement("script");
  script.src = "https://checkout.razorpay.com/v1/checkout.js";
  script.onload = () => resolve(true);
  script.onerror = () => resolve(false);
  document.body.appendChild(script);
});

const formatLimit = (key, value) => {
  const label = key.replaceAll("_", " ");
  if (value === null) return `Unlimited ${label}`;
  if (typeof value === "boolean") return value ? label : null;
  if (value === "all") return `All ${label}`;
  return `${value} ${label}`;
};

function Billing() {
  const { user } = useAuth();
  const role = user?.role || "student";
  const [plans, setPlans] = useState([]);
  const [subscription, setSubscription] = useState(null);
  const [cycle, setCycle] = useState("monthly");
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const refresh = async () => {
    const [plansData, subscriptionData] = await Promise.all([
      getPlans(role),
      getMySubscription(),
    ]);
    setPlans(plansData?.plans || []);
    setSubscription(subscriptionData?.subscription || null);
  };

  useEffect(() => {
    refresh()
      .catch((err) => setError(err.response?.data?.message || "Unable to load billing."))
      .finally(() => setLoading(false));
  }, [role]);

  const currentPlan = subscription?.plan_name;

  const paidPlans = useMemo(
    () => plans.filter((plan) => Number(plan.price_monthly || 0) > 0),
    [plans]
  );

  const startCheckout = async (plan) => {
    const key = import.meta.env.VITE_RAZORPAY_KEY_ID;
    if (!key) {
      setError("Razorpay public key is not configured. Set VITE_RAZORPAY_KEY_ID before payment testing or deployment.");
      return;
    }

    try {
      setWorking(String(plan.id));
      setError("");
      setMessage("");

      const loaded = await loadRazorpay();
      if (!loaded) throw new Error("Razorpay checkout could not be loaded.");

      const data = await createCheckout({ planId: plan.id, billingCycle: cycle });
      const checkout = data?.checkout;
      if (!checkout?.order_id) throw new Error("Checkout order was not returned.");

      const razorpay = new window.Razorpay({
        key,
        amount: checkout.amount,
        currency: checkout.currency || "INR",
        name: "Prolio AI",
        description: `${checkout.plan_name} · ${cycle}`,
        order_id: checkout.order_id,
        prefill: {
          name: user?.name || "",
          email: user?.email || "",
          contact: user?.phone || "",
        },
        notes: {
          plan_id: String(checkout.plan_id),
          billing_cycle: cycle,
        },
        theme: {},
        handler: async () => {
          setMessage("Payment submitted. Your plan will update after payment verification.");
          window.setTimeout(() => {
            refresh().catch(() => {});
          }, 2500);
        },
        modal: {
          ondismiss: () => setWorking(""),
        },
      });

      razorpay.open();
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Unable to start checkout.");
      setWorking("");
    }
  };

  const toggleAutoPay = async () => {
    try {
      setWorking("autopay");
      setError("");
      const data = await updateAutoPay(!subscription?.auto_pay);
      setSubscription(data.subscription);
      setMessage("Auto-Pay preference updated.");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to update Auto-Pay.");
    } finally {
      setWorking("");
    }
  };

  const toggleCancellation = async () => {
    try {
      setWorking("cancel");
      setError("");
      const data = subscription?.cancel_at_period_end
        ? await resumeSubscription()
        : await cancelSubscription();
      setSubscription(data.subscription);
      setMessage(data.message || "Subscription updated.");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to update subscription.");
    } finally {
      setWorking("");
    }
  };

  if (loading) {
    return <div className="billing-state"><LoaderCircle className="spin" size={24} /> Loading plans...</div>;
  }

  return (
    <div className="billing-page">
      <header className="billing-heading">
        <div><p className="eyebrow">Plan & billing</p><h1>Manage your plan</h1><p>Review limits, upgrade your workspace and manage renewal preferences.</p></div>
        <button className="billing-refresh" type="button" onClick={() => refresh()}><RefreshCcw size={16} /> Refresh</button>
      </header>

      {error && <div className="recruiter-error">{error}</div>}
      {message && <div className="billing-success">{message}</div>}

      <section className="billing-current-card">
        <div className="billing-current-icon"><ShieldCheck size={25} /></div>
        <div><span>Current plan</span><h2>{currentPlan || "Free"}</h2><p>Status: {subscription?.status || "active"}{subscription?.billing_cycle ? ` · ${subscription.billing_cycle}` : ""}</p></div>
        <div className="billing-current-meta">
          {subscription?.current_period_end && <small>Period ends {new Date(subscription.current_period_end).toLocaleDateString()}</small>}
          {subscription?.cancel_at_period_end && <strong>Cancellation scheduled</strong>}
        </div>
      </section>

      <div className="billing-cycle-toggle" aria-label="Billing cycle">
        <button className={cycle === "monthly" ? "active" : ""} type="button" onClick={() => setCycle("monthly")}>Monthly</button>
        <button className={cycle === "yearly" ? "active" : ""} type="button" onClick={() => setCycle("yearly")}>Yearly</button>
      </div>

      <section className="billing-plan-grid">
        {plans.map((plan) => {
          const isCurrent = plan.name === currentPlan;
          const isFree = Number(plan.price_monthly || 0) === 0;
          const price = cycle === "yearly" ? plan.price_yearly : plan.price_monthly;
          const features = Object.entries(plan.limits || {})
            .map(([key, value]) => formatLimit(key, value))
            .filter(Boolean)
            .slice(0, 8);

          return (
            <article className={`billing-plan-card ${isCurrent ? "current" : ""}`} key={plan.id}>
              <div className="billing-plan-head"><div><h2>{plan.name}</h2><p>{isCurrent ? "Your current plan" : isFree ? "Start with the essentials" : "More room for serious use"}</p></div>{isCurrent && <span>Current</span>}</div>
              <div className="billing-price"><strong>{isFree ? "Free" : `₹${Number(price || 0).toLocaleString("en-IN")}`}</strong>{!isFree && <span>/{cycle === "yearly" ? "year" : "month"}</span>}</div>
              <div className="billing-features">{features.map((feature) => <div key={feature}><Check size={15} /><span>{feature}</span></div>)}</div>
              {!isCurrent && !isFree && <button className="button button-primary" type="button" disabled={Boolean(working)} onClick={() => startCheckout(plan)}>{working === String(plan.id) ? <><LoaderCircle className="spin" size={16} /> Preparing...</> : <><CreditCard size={16} /> Upgrade</>}</button>}
            </article>
          );
        })}
      </section>

      {paidPlans.length > 0 && currentPlan && !currentPlan.endsWith("Free") && (
        <section className="billing-controls">
          <article><div><h3>Auto-Pay preference</h3><p>Prolio keeps Auto-Pay off unless you explicitly enable it.</p></div><button type="button" disabled={working === "autopay"} onClick={toggleAutoPay}>{subscription?.auto_pay ? "Enabled" : "Disabled"}</button></article>
          <article><div><h3>{subscription?.cancel_at_period_end ? "Resume subscription" : "Cancel at period end"}</h3><p>Your paid access remains available until the end of the current billing period.</p></div><button className="danger" type="button" disabled={working === "cancel"} onClick={toggleCancellation}>{subscription?.cancel_at_period_end ? "Keep subscription" : "Schedule cancellation"}</button></article>
        </section>
      )}
    </div>
  );
}

export default Billing;
