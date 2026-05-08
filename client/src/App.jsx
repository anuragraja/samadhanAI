import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Placeholders for Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import RaiseComplaint from './pages/RaiseComplaint';
import Dashboard from './pages/Dashboard';
import TrackComplaint from './pages/TrackComplaint';
import AdminDashboard from './pages/AdminDashboard';
import Helpline from './pages/Helpline';

// Components
import Chatbot from './components/Chatbot';

// Protected Route Component
function ProtectedRoute({ children, requireAdmin = false, requireUser = false }) {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-spinner" style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '50vh',
        fontSize: '1.2rem'
      }}>
        <i className="fa-solid fa-spinner fa-spin"></i> Loading...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  if (requireUser && isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  return children;
}

function Navigation() {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isAuthenticated, user, logout, isAdmin } = useAuth();

  return (
    <nav className="navbar glass">
      <div className="nav-container">
        <div className="logo">
          <i className="fa-solid fa-robot"></i>
          <span>SamadhanAI</span>
        </div>
        <div className={`nav-links ${mobileMenuOpen ? 'show' : ''}`}>
          <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>Home</Link>

          {isAuthenticated ? (
            <>
              {isAdmin ? (
                <Link to="/admin" className={`nav-link ${location.pathname === '/admin' ? 'active' : ''}`}>Admin</Link>
              ) : (
                <>
                  <Link to="/raise" className={`nav-link ${location.pathname === '/raise' ? 'active' : ''}`}>Raise Complaint</Link>
                  <Link to="/track" className={`nav-link ${location.pathname === '/track' ? 'active' : ''}`}>Track</Link>
                  <Link to="/dashboard" className={`nav-link ${location.pathname === '/dashboard' ? 'active' : ''}`}>Dashboard</Link>
                </>
              )}
            </>
          ) : (
            <>
              <Link to="/login" className={`nav-link ${location.pathname === '/login' ? 'active' : ''}`}>Login</Link>
              <Link to="/register" className={`nav-link ${location.pathname === '/register' ? 'active' : ''}`}>Register</Link>
            </>
          )}

          <Link to="/helpline" className={`nav-link ${location.pathname === '/helpline' ? 'active' : ''}`}>Helpline</Link>
        </div>
        <div className="user-actions">
          {isAuthenticated ? (
            <>
              <button className="btn btn-icon">
                <i className="fa-regular fa-bell"></i>
                <span className="badge">3</span>
              </button>
              <div className="user-menu">
                <span className="user-name">{user?.name}</span>
                <button className="btn btn-outline btn-sm" onClick={logout}>
                  <i className="fa-solid fa-sign-out-alt"></i> Logout
                </button>
              </div>
            </>
          ) : (
            <Link to="/login" className="btn btn-primary">Login</Link>
          )}
          <div className="mobile-menu-btn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            <i className="fa-solid fa-bars"></i>
          </div>
        </div>
      </div>
    </nav>
  );
}

function AppContent() {
  return (
    <>
      <div className="bg-gradient-sphere sphere-1"></div>
      <div className="bg-gradient-sphere sphere-2"></div>
      <div className="bg-gradient-sphere sphere-3"></div>

      <Navigation />

      <main id="app-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/raise" element={
            <ProtectedRoute requireUser={true}>
              <RaiseComplaint />
            </ProtectedRoute>
          } />
          <Route path="/dashboard" element={
            <ProtectedRoute requireUser={true}>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/track" element={
            <ProtectedRoute requireUser={true}>
              <TrackComplaint />
            </ProtectedRoute>
          } />
          <Route path="/admin" element={
            <ProtectedRoute requireAdmin={true}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
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
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;
