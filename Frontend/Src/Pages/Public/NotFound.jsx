import { Link } from "react-router-dom";
import PublicFooter from "../../Components/Layout/PublicFooter";
import PublicHeader from "../../Components/Layout/PublicHeader";
import "../../Styles/publicMarketing.css";

function NotFound() {
  return (
    <div className="public-page">
      <PublicHeader />
      <main className="legal-page"><div className="container"><article className="legal-card" style={{ textAlign: "center" }}><p className="eyebrow">404</p><h1>Page not found</h1><p>The page you requested does not exist or may have moved.</p><Link className="button button-primary" to="/">Go to home</Link></article></div></main>
      <PublicFooter />
    </div>
  );
}

export default NotFound;
