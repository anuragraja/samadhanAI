import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { useState } from 'react';

// Placeholders for Pages
import Home from './pages/Home';
import RaiseComplaint from './pages/RaiseComplaint';
import Dashboard from './pages/Dashboard';
import TrackComplaint from './pages/TrackComplaint';
import AdminDashboard from './pages/AdminDashboard';
import Helpline from './pages/Helpline';

// Components
import Chatbot from './components/Chatbot';

function Navigation() {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="navbar glass">
      <div className="nav-container">
        <div className="logo">
          <i className="fa-solid fa-robot"></i>
          <span>SamadhanAI</span>
        </div>
        <div className={`nav-links ${mobileMenuOpen ? 'show' : ''}`}>
          <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>Home</Link>
          <Link to="/raise" className={`nav-link ${location.pathname === '/raise' ? 'active' : ''}`}>Raise Complaint</Link>
          <Link to="/track" className={`nav-link ${location.pathname === '/track' ? 'active' : ''}`}>Track</Link>
          <Link to="/admin" className={`nav-link ${location.pathname === '/admin' ? 'active' : ''}`}>Admin</Link>
          <Link to="/helpline" className={`nav-link ${location.pathname === '/helpline' ? 'active' : ''}`}>Helpline</Link>
        </div>
        <div className="user-actions">
          <button className="btn btn-icon">
            <i className="fa-regular fa-bell"></i>
            <span className="badge">3</span>
          </button>
          <Link to="/dashboard" className="btn btn-primary">Dashboard</Link>
          <div className="mobile-menu-btn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            <i className="fa-solid fa-bars"></i>
          </div>
        </div>
      </div>
    </nav>
  );
}

function App() {
  return (
    <Router>
      <div className="bg-gradient-sphere sphere-1"></div>
      <div className="bg-gradient-sphere sphere-2"></div>
      <div className="bg-gradient-sphere sphere-3"></div>
      
      <Navigation />
      
      <main id="app-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/raise" element={<RaiseComplaint />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/track" element={<TrackComplaint />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/helpline" element={<Helpline />} />
        </Routes>
      </main>

      <Chatbot />

      <footer>
        <div className="footer-content">
          <div className="footer-logo">
            <i className="fa-solid fa-robot"></i> SamadhanAI
          </div>
          <p>Smart AI-Powered Citizen Grievance System</p>
          <div className="social-icons">
            <i className="fa-brands fa-twitter"></i>
            <i className="fa-brands fa-facebook"></i>
            <i className="fa-brands fa-instagram"></i>
          </div>
          <p className="gov-text">Supported by Digital Governance Initiative</p>
        </div>
      </footer>
    </Router>
  )
}

export default App;
