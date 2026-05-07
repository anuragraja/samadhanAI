import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <>
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">Smart AI-Powered Citizen Grievance System</h1>
          <p className="hero-subtitle">Automatically classify, prioritize, and resolve complaints using Artificial Intelligence.</p>
          <div className="d-flex gap-2">
            <Link to="/raise" className="btn btn-primary">Raise Complaint</Link>
            <Link to="/dashboard" className="btn btn-outline">Explore Features</Link>
          </div>
        </div>
        <div className="hero-image">
          <i className="fa-solid fa-microchip"></i>
        </div>
      </section>

      <section className="mt-4">
        <h2 className="text-center mb-4">Core AI Features</h2>
        <div className="grid-3">
          <div className="glass-card text-center">
            <i className="fa-solid fa-brain feature-icon"></i>
            <h3>AI Classification</h3>
            <p className="text-muted mt-2">NLP auto-categorizes complaints to the correct department instantly.</p>
          </div>
          <div className="glass-card text-center">
            <i className="fa-solid fa-image feature-icon"></i>
            <h3>Image Verification</h3>
            <p className="text-muted mt-2">YOLO-style visual recognition detects severity and prevents spam.</p>
          </div>
          <div className="glass-card text-center">
            <i className="fa-solid fa-route feature-icon"></i>
            <h3>Smart Routing</h3>
            <p className="text-muted mt-2">Intelligent assignment to the nearest available official.</p>
          </div>
        </div>
      </section>

      <div className="stats-container">
        <div className="stat-item">
          <div className="stat-number">10K+</div>
          <div className="stat-label">Resolved</div>
        </div>
        <div className="stat-item">
          <div className="stat-number">95%</div>
          <div className="stat-label">AI Accuracy</div>
        </div>
        <div className="stat-item">
          <div className="stat-number">50+</div>
          <div className="stat-label">Departments</div>
        </div>
      </div>
    </>
  );
}
