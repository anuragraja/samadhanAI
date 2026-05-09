import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import API_URL from './api';

const socket = io(API_URL);

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import RaiseComplaint from './pages/RaiseComplaint';
import Dashboard from './pages/Dashboard';
import TrackComplaint from './pages/TrackComplaint';
import AdminDashboard from './pages/AdminDashboard';
import Helpline from './pages/Helpline';
import Chatbot from './components/Chatbot';

// ── Protected Route ────────────────────────────────────────────────────────
function ProtectedRoute({ children, requireAdmin = false, requireUser = false }) {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ width: '50px', height: '50px', borderRadius: '50%', border: '3px solid var(--secondary)', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }}></div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (requireAdmin && !isAdmin) return <Navigate to="/dashboard" replace />;
  if (requireUser && isAdmin) return <Navigate to="/admin" replace />;

  return children;
}

// ── Navigation ─────────────────────────────────────────────────────────────
function Navigation() {
  const location = useLocation();
  const { isAuthenticated, user, logout, isAdmin } = useAuth();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const notifRef = useRef(null);
  const profileRef = useRef(null);

  // ── Click-outside: close both dropdowns ────────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setDropdownOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // ── Socket.io real-time notifications ──────────────────────────────────
  useEffect(() => {
    if (!isAuthenticated || !user) return;

    socket.emit('join_room', isAdmin ? 'admin_room' : `user_${user.id}`);

    const addNotif = (n) => {
      setNotifications(p => [n, ...p]);
      setUnreadCount(p => p + 1);
    };

    socket.on('new_complaint', c => addNotif({ id: Date.now(), title: 'New Complaint', message: `"${c.title}" registered.`, type: 'info', time: new Date() }));
    socket.on('emergency_alert', c => addNotif({ id: Date.now() + 1, title: '🚨 EMERGENCY ALERT', message: `High priority at ${c.location}`, type: 'danger', time: new Date() }));
    socket.on('complaint_status_changed', c => addNotif({ id: Date.now(), title: 'Status Updated', message: `"${c.title}" → ${c.status}`, type: 'success', time: new Date() }));
    socket.on('complaint_submitted', c => addNotif({ id: Date.now() + 2, title: 'Complaint Submitted', message: `Your complaint "${c.title}" was submitted!`, type: 'success', time: new Date() }));

    return () => {
      socket.off('new_complaint');
      socket.off('emergency_alert');
      socket.off('complaint_status_changed');
      socket.off('complaint_submitted');
    };
  }, [isAuthenticated, user, isAdmin]);

  const openNotif = () => { setNotifOpen(o => !o); setDropdownOpen(false); };
  const openProfile = () => { setDropdownOpen(o => !o); setNotifOpen(false); };

  return (
    <nav className="navbar glass">
      <div className="nav-container">
        {/* Logo */}
        <Link to="/" className="logo" style={{ textDecoration: 'none' }}>
          <i className="fa-solid fa-robot"></i>
          <span>SamadhanAI</span>
        </Link>

        {/* Nav links */}
        <div className={`nav-links ${mobileMenuOpen ? 'show' : ''}`}>
          <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`} onClick={() => setMobileMenuOpen(false)}>Home</Link>

          {isAuthenticated ? (
            isAdmin ? (
              <Link to="/admin" className={`nav-link ${location.pathname === '/admin' ? 'active' : ''}`} onClick={() => setMobileMenuOpen(false)}>Admin</Link>
            ) : (
              <>
                <Link to="/raise" className={`nav-link ${location.pathname === '/raise' ? 'active' : ''}`} onClick={() => setMobileMenuOpen(false)}>Raise Complaint</Link>
                <Link to="/track" className={`nav-link ${location.pathname === '/track' ? 'active' : ''}`} onClick={() => setMobileMenuOpen(false)}>Track</Link>
                <Link to="/dashboard" className={`nav-link ${location.pathname === '/dashboard' ? 'active' : ''}`} onClick={() => setMobileMenuOpen(false)}>Dashboard</Link>
              </>
            )
          ) : (
            <>
              <Link to="/login" className={`nav-link ${location.pathname === '/login' ? 'active' : ''}`} onClick={() => setMobileMenuOpen(false)}>Login</Link>
              <Link to="/register" className={`nav-link ${location.pathname === '/register' ? 'active' : ''}`} onClick={() => setMobileMenuOpen(false)}>Register</Link>
            </>
          )}

          <Link to="/helpline" className={`nav-link ${location.pathname === '/helpline' ? 'active' : ''}`} onClick={() => setMobileMenuOpen(false)}>Helpline</Link>
        </div>

        {/* Right actions */}
        <div className="user-actions">
          {isAuthenticated ? (
            <>
              {/* ── Notification Bell ── */}
              <div ref={notifRef} style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <button onClick={openNotif} style={{ position: 'relative', background: 'transparent', border: 'none', color: 'var(--text-light)', fontSize: '1.2rem', cursor: 'pointer', padding: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', transition: 'background 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <i className="fa-regular fa-bell"></i>
                  {unreadCount > 0 && (
                    <span style={{ position: 'absolute', top: '-5px', right: '-5px', background: 'var(--danger)', color: '#fff', borderRadius: '50%', width: '18px', height: '18px', fontSize: '0.65rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', pointerEvents: 'none' }}>
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {notifOpen && (
                  <div style={{ position: 'absolute', top: 'calc(100% + 10px)', right: '-10px', width: '320px', maxWidth: '85vw', borderRadius: '14px', zIndex: 1002, background: 'var(--bg-dark)', boxShadow: '0 15px 40px rgba(0,0,0,0.7)', border: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden' }}>
                    {/* Header */}
                    <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)' }}>
                      <span style={{ fontWeight: '700', fontSize: '0.95rem' }}>
                        Notifications {unreadCount > 0 && <span style={{ background: 'var(--danger)', color: '#fff', borderRadius: '10px', padding: '1px 7px', fontSize: '0.7rem', marginLeft: '6px' }}>{unreadCount}</span>}
                      </span>
                      {unreadCount > 0 && (
                        <button onClick={() => setUnreadCount(0)} style={{ background: 'transparent', color: 'var(--secondary)', border: 'none', cursor: 'pointer', fontSize: '0.78rem' }}>
                          Mark all read
                        </button>
                      )}
                    </div>
                    {/* List */}
                    <div style={{ maxHeight: '340px', overflowY: 'auto' }}>
                      {notifications.length > 0 ? notifications.map(n => (
                        <div key={n.id}
                          style={{ padding: '13px 16px', borderBottom: '1px solid rgba(255,255,255,0.04)', display: 'flex', gap: '12px', cursor: 'default', transition: 'background 0.2s' }}
                          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >
                          <div style={{
                            width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                            background: n.type === 'danger' ? 'rgba(239,68,68,0.2)' : n.type === 'success' ? 'rgba(16,185,129,0.2)' : 'rgba(59,130,246,0.2)',
                            color: n.type === 'danger' ? 'var(--danger)' : n.type === 'success' ? 'var(--success)' : '#3b82f6'
                          }}>
                            <i className={`fa-solid ${n.type === 'danger' ? 'fa-triangle-exclamation' : n.type === 'success' ? 'fa-check' : 'fa-bell'}`}></i>
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontWeight: '600', fontSize: '0.87rem', marginBottom: '2px' }}>{n.title}</div>
                            <div style={{ fontSize: '0.77rem', color: 'var(--text-muted)', marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{n.message}</div>
                            <div style={{ fontSize: '0.68rem', color: 'var(--secondary)' }}>{new Date(n.time).toLocaleTimeString()}</div>
                          </div>
                        </div>
                      )) : (
                        <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
                          <i className="fa-regular fa-bell-slash" style={{ fontSize: '2rem', display: 'block', marginBottom: '10px' }}></i>
                          <p style={{ margin: 0 }}>No notifications yet</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* ── Profile Menu ── */}
              <div ref={profileRef} style={{ position: 'relative' }}>
                <div onClick={openProfile} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', borderRadius: '50%', transition: 'transform 0.2s', userSelect: 'none' }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                >
                  <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), #ff4b1f)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.1rem', flexShrink: 0, boxShadow: '0 0 0 2px rgba(255,255,255,0.1)' }}>
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                </div>

                {dropdownOpen && (
                  <div style={{ position: 'absolute', top: 'calc(100% + 10px)', right: '0', minWidth: '220px', borderRadius: '14px', zIndex: 1002, background: 'var(--bg-dark)', boxShadow: '0 15px 40px rgba(0,0,0,0.7)', border: '1px solid rgba(255,255,255,0.1)', padding: '8px', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                    {/* User info */}
                    <div style={{ padding: '10px 12px', borderBottom: '1px solid rgba(255,255,255,0.07)', marginBottom: '4px' }}>
                      <p style={{ margin: 0, fontWeight: '700', fontSize: '0.95rem' }}>{user?.name}</p>
                      <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email}</p>
                    </div>

                    {isAdmin ? (
                      <Link to="/admin" onClick={() => setDropdownOpen(false)}
                        style={{ padding: '9px 12px', color: 'var(--text-light)', textDecoration: 'none', borderRadius: '8px', display: 'flex', gap: '10px', alignItems: 'center', transition: 'background 0.2s', fontSize: '0.9rem' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.07)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <i className="fa-solid fa-gauge-high" style={{ width: '16px', color: 'var(--secondary)' }}></i> Dashboard
                      </Link>
                    ) : (
                      <Link to="/dashboard" onClick={() => setDropdownOpen(false)}
                        style={{ padding: '9px 12px', color: 'var(--text-light)', textDecoration: 'none', borderRadius: '8px', display: 'flex', gap: '10px', alignItems: 'center', transition: 'background 0.2s', fontSize: '0.9rem' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.07)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <i className="fa-solid fa-user" style={{ width: '16px', color: 'var(--secondary)' }}></i> My Dashboard
                      </Link>
                    )}

                    <button onClick={() => { setDropdownOpen(false); logout(); }}
                      style={{ padding: '9px 12px', color: 'var(--danger)', background: 'transparent', border: 'none', textAlign: 'left', cursor: 'pointer', borderRadius: '8px', fontSize: '0.9rem', display: 'flex', gap: '10px', alignItems: 'center', transition: 'background 0.2s', width: '100%' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.08)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <i className="fa-solid fa-right-from-bracket" style={{ width: '16px' }}></i> Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <Link to="/login" className="btn btn-primary btn-sm">Login</Link>
          )}

          <div className="mobile-menu-btn" onClick={() => setMobileMenuOpen(o => !o)}>
            <i className={`fa-solid ${mobileMenuOpen ? 'fa-times' : 'fa-bars'}`}></i>
          </div>
        </div>
      </div>
    </nav>
  );
}

// ── App Content ────────────────────────────────────────────────────────────
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
          <Route path="/helpline" element={<Helpline />} />
          <Route path="/raise" element={<ProtectedRoute requireUser><RaiseComplaint /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute requireUser><Dashboard /></ProtectedRoute>} />
          <Route path="/track" element={<ProtectedRoute requireUser><TrackComplaint /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute requireAdmin><AdminDashboard /></ProtectedRoute>} />
        </Routes>
      </main>

      <Chatbot />

      <footer>
        <div className="footer-content">
          <div className="footer-logo"><i className="fa-solid fa-robot"></i> SamadhanAI</div>
          <p>Smart AI-Powered Citizen Grievance System</p>
          <div className="social-icons">
            <i className="fa-brands fa-twitter"></i>
            <i className="fa-brands fa-facebook"></i>
            <i className="fa-brands fa-instagram"></i>
          </div>
          <p className="gov-text">© 2026 SamadhanAI · Supported by Digital Governance Initiative</p>
        </div>
      </footer>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}
