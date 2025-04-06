import { Link } from "react-router-dom";

function Success() {
  return (
    <div className="success-container">
      <div className="success-card">
        <h1 className="success-heading">Message Sent!</h1>
        <p className="success-text">
          Thank you for reaching out! I will get back to you soon.
        </p>
        <Link to="/" className="success-button">
          Back to Home
        </Link>
      </div>
    </div>
  );
}

export default Success;