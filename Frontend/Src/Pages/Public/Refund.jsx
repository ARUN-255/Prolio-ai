import PublicFooter from "../../Components/Layout/PublicFooter";
import PublicHeader from "../../Components/Layout/PublicHeader";
import "../../Styles/publicMarketing.css";

function Refund() {
  return (
    <div className="public-page">
      <PublicHeader />
      <main className="legal-page"><div className="container"><article className="legal-card">
        <p className="eyebrow">Legal</p><h1>Refund Policy</h1><p className="legal-updated">Last updated: September 2026</p>
        <p>Prolio AI currently offers free plans and optional paid plan upgrades. This beta policy is intended to keep billing expectations clear before checkout.</p>
        <h2>Before payment</h2><p>The selected plan, billing cycle and amount are shown before payment is completed. Please review the plan and account role before confirming payment.</p>
        <h2>Duplicate or failed payments</h2><p>If the payment provider records a duplicate charge, or money is debited for a transaction that is confirmed as failed and not automatically reversed, the transaction should be reviewed using the payment provider reference and Prolio AI order information.</p>
        <h2>Successful plan purchases</h2><p>For a successfully activated digital subscription, refund eligibility depends on the circumstances, applicable consumer requirements and whether the paid service has already been substantially used. A request should include the account email, payment reference, date and reason.</p>
        <h2>Cancellations</h2><p>Scheduling cancellation stops renewal at the end of the current paid period where supported; it does not normally remove access immediately. Auto-Pay remains opt-in.</p>
        <h2>Processing</h2><p>Approved refunds are returned through the original payment method when supported by the payment provider. Bank or card processing time can vary.</p>
        <h2>Production launch note</h2><p>Before commercial production launch, this beta refund policy should be reviewed against the business entity, payment-provider configuration and applicable consumer law for the markets where Prolio AI is offered.</p>
      </article></div></main>
      <PublicFooter />
    </div>
  );
}

export default Refund;
