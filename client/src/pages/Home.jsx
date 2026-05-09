import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const features = [
  { icon: 'fa-brain', color: '#8b5cf6', title: 'AI Classification', desc: 'NLP engine auto-detects complaint type and routes to the correct government department instantly.' },
  { icon: 'fa-map-location-dot', color: '#3b82f6', title: 'Live Location', desc: 'GPS-based location detection with interactive map. Pinpoint the exact issue location.' },
  { icon: 'fa-bolt', color: '#f59e0b', title: 'Smart Priority', desc: 'AI scores complaints 0-100. Emergency issues are flagged instantly and alert admins in real-time.' },
  { icon: 'fa-bell', color: '#10b981', title: 'Real-time Alerts', desc: 'Socket.io powers live notifications. Citizens and admins get instant updates without refreshing.' },
  { icon: 'fa-shield-halved', color: '#ef4444', title: 'JWT Security', desc: 'Enterprise-grade JWT authentication protects all data with role-based access control.' },
  { icon: 'fa-chart-pie', color: '#06b6d4', title: 'Analytics Dashboard', desc: 'Recharts-powered admin analytics with complaint trends, department stats, and resolution rates.' },
];

const depts = [
  { icon: 'fa-droplet', color: '#3b82f6', name: 'Water & Sewage' },
  { icon: 'fa-bolt', color: '#f59e0b', name: 'Electricity' },
  { icon: 'fa-road', color: '#94a3b8', name: 'Roads & Infra' },
  { icon: 'fa-shield-halved', color: '#10b981', name: 'Public Safety' },
  { icon: 'fa-trash', color: '#8b5cf6', name: 'Garbage & Sanitation' },
];

export default function Home() {
  const { isAuthenticated, isAdmin } = useAuth();

  return (
    <>
      {/* ── Hero ── */}
      <section className="hero-section" style={{ paddingTop: '3rem', paddingBottom: '3rem' }}>
        <div className="hero-content">
          <div className="chip mb-3" style={{ background: 'rgba(255,106,61,0.15)', color: 'var(--primary)', border: '1px solid rgba(255,106,61,0.3)', display: 'inline-flex', gap: '6px', padding: '6px 16px' }}>
            <i className="fa-solid fa-robot"></i> Powered by Artificial Intelligence
          </div>
          <h1 className="hero-title">
            Smart AI Citizen<br />
            <span style={{ background: 'linear-gradient(135deg, var(--primary), var(--secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Grievance Platform
            </span>
          </h1>
          <p className="hero-subtitle">
            SamadhanAI automatically classifies, prioritizes, and routes your civic complaints to the right government department — using real-time AI and geolocation.
          </p>
          <div className="d-flex gap-2" style={{ flexWrap: 'wrap' }}>
            {isAuthenticated ? (
              isAdmin
                ? <Link to="/admin" className="btn btn-primary"><i className="fa-solid fa-gauge-high"></i> Admin Dashboard</Link>
                : <>
                  <Link to="/raise" className="btn btn-primary"><i className="fa-solid fa-plus"></i> Raise Complaint</Link>
                  <Link to="/dashboard" className="btn btn-outline"><i className="fa-solid fa-user"></i> My Dashboard</Link>
                </>
            ) : (
              <>
                <Link to="/register" className="btn btn-primary"><i className="fa-solid fa-rocket"></i> Get Started Free</Link>
                <Link to="/login" className="btn btn-outline"><i className="fa-solid fa-right-to-bracket"></i> Login</Link>
              </>
            )}
          </div>

          {/* Trust badges */}
          <div className="d-flex gap-2 mt-3" style={{ flexWrap: 'wrap' }}>
            {['🔒 JWT Secured', '⚡ Real-time', '🤖 AI Powered', '📍 GPS Location'].map(b => (
              <span key={b} style={{ fontSize: '0.75rem', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.05)', padding: '4px 12px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.08)' }}>{b}</span>
            ))}
          </div>
        </div>

        <div className="hero-image" style={{ position: 'relative' }}>
          <div style={{ position: 'relative', width: '350px', height: '350px' }}>
            {/* Creative Rotating Rings */}
            <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '2px dashed rgba(30,144,255,0.3)', animation: 'spin 20s linear infinite' }}></div>
            <div style={{ position: 'absolute', inset: '20px', borderRadius: '50%', border: '2px dashed rgba(255,106,61,0.2)', animation: 'spin 15s linear infinite reverse' }}></div>
            <div style={{ position: 'absolute', inset: '40px', borderRadius: '50%', border: '2px dashed rgba(16,185,129,0.15)', animation: 'spin 25s linear infinite' }}></div>

            {/* Center icon */}
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <i className="fa-solid fa-microchip" style={{ fontSize: '7rem', color: 'var(--secondary)', filter: 'drop-shadow(0 0 40px rgba(30,144,255,0.6))', animation: 'float 6s ease-in-out infinite' }}></i>
            </div>
          </div>
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>

      </section>

      {/* ── Stats ── */}
      <div className="glass-card mb-4" style={{ background: 'linear-gradient(135deg, rgba(30,144,255,0.08), rgba(255,106,61,0.08))', border: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '20px' }}>
          {[
            { num: '10K+', label: 'Complaints Resolved', icon: 'fa-check-circle', color: '#10b981' },
            { num: '95%', label: 'AI Accuracy Rate', icon: 'fa-brain', color: '#8b5cf6' },
            { num: '5', label: 'Departments Covered', icon: 'fa-building', color: '#3b82f6' },
            { num: '24/7', label: 'Real-time Monitoring', icon: 'fa-satellite', color: '#f59e0b' },
          ].map(s => (
            <div key={s.label} className="text-center">
              <div style={{ color: s.color, fontSize: '1.5rem', marginBottom: '6px' }}><i className={`fa-solid ${s.icon}`}></i></div>
              <div style={{ fontSize: '2rem', fontWeight: '800', color: s.color }}>{s.num}</div>
              <div className="text-muted" style={{ fontSize: '0.8rem' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Features ── */}
      <section className="mb-4">
        <h2 className="text-center mb-2" style={{ fontSize: '2rem' }}>Core AI Features</h2>
        <p className="text-muted text-center mb-4">Production-ready smart governance technology</p>
        <div className="grid-3">
          {features.map(f => (
            <div key={f.title} className="glass-card" style={{ textAlign: 'left' }}>
              <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: `${f.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px', fontSize: '1.4rem', color: f.color }}>
                <i className={`fa-solid ${f.icon}`}></i>
              </div>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '8px' }}>{f.title}</h3>
              <p className="text-muted" style={{ fontSize: '0.88rem', lineHeight: '1.6' }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="glass-card mb-4" style={{ textAlign: 'center' }}>
        <h2 className="mb-2">How SamadhanAI Works</h2>
        <p className="text-muted mb-4">Three simple steps to resolve civic issues</p>
        <div className="grid-3">
          {[
            { step: '01', icon: 'fa-pen-to-square', color: 'var(--primary)', title: 'Submit Complaint', desc: 'Describe your issue. Attach photos, auto-detect your GPS location on the map.' },
            { step: '02', icon: 'fa-robot', color: 'var(--secondary)', title: 'AI Analyzes', desc: 'Our NLP engine classifies the complaint, assigns priority, and routes it to the right department.' },
            { step: '03', icon: 'fa-check-double', color: '#10b981', title: 'Track & Resolve', desc: 'Get real-time status updates. Department works on your complaint. You\'re notified at every step.' },
          ].map(s => (
            <div key={s.step} style={{ position: 'relative', padding: '20px' }}>
              <div style={{ fontSize: '4rem', fontWeight: '900', color: 'rgba(255,255,255,0.04)', position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', fontFamily: 'Outfit' }}>{s.step}</div>
              <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: `${s.color}20`, margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.6rem', color: s.color, border: `2px solid ${s.color}30` }}>
                <i className={`fa-solid ${s.icon}`}></i>
              </div>
              <h3 style={{ marginBottom: '8px' }}>{s.title}</h3>
              <p className="text-muted" style={{ fontSize: '0.88rem', lineHeight: '1.6' }}>{s.desc}</p>
            </div>
          ))}
        </div>

        {!isAuthenticated && (
          <div className="mt-4">
            <Link to="/register" className="btn btn-primary" style={{ padding: '14px 40px', fontSize: '1.1rem' }}>
              <i className="fa-solid fa-rocket"></i> Start Now — It's Free
            </Link>
          </div>
        )}
      </section>
    </>
  );
}
