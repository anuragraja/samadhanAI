import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import API_URL from '../api';

const DEPT_ICONS = {
  'Water Department': 'fa-droplet',
  'Electricity Department': 'fa-bolt',
  'Road Department': 'fa-road',
  'Public Safety': 'fa-shield-halved',
  'Garbage Department': 'fa-trash',
  'General': 'fa-building',
};

const STATUS_COLORS = {
  'Resolved':     { bg: '#10b981', text: '#fff' },
  'In Progress':  { bg: '#f59e0b', text: '#fff' },
  'Submitted':    { bg: '#3b82f6', text: '#fff' },
  'Under Review': { bg: '#8b5cf6', text: '#fff' },
  'Rejected':     { bg: '#ef4444', text: '#fff' },
};

const PRIORITY_STYLES = {
  'Emergency': 'priority-emergency',
  'Urgent':    'priority-urgent',
  'High':      'priority-high',
  'Normal':    'priority-normal',
  'Low':       'priority-low',
};

export default function Dashboard() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();

  useEffect(() => { fetchComplaints(); }, []);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/api/complaints`);
      if (res.data.success) setComplaints(res.data.data);
    } catch {
      setError('Failed to load complaints.');
    } finally {
      setLoading(false);
    }
  };

  const resolved   = complaints.filter(c => c.status === 'Resolved').length;
  const pending    = complaints.filter(c => ['Submitted','Under Review','In Progress'].includes(c.status)).length;
  const urgent     = complaints.filter(c => ['Urgent','Emergency'].includes(c.priority) && c.status !== 'Resolved').length;
  const totalScore = complaints.length > 0 ? Math.min(100, Math.round((resolved / complaints.length) * 100)) : 0;

  if (loading) return (
    <div style={{ display:'flex', justifyContent:'center', alignItems:'center', height:'60vh', flexDirection:'column', gap:'1rem' }}>
      <div style={{ width:'60px', height:'60px', borderRadius:'50%', border:'3px solid var(--secondary)', borderTopColor:'transparent', animation:'spin 0.8s linear infinite' }}></div>
      <p className="text-muted">Loading your dashboard...</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <div className="dashboard-layout">
      {/* ── Sidebar ── */}
      <div className="sidebar glass-card" style={{ alignSelf:'start', position:'sticky', top:'80px' }}>
        <div className="text-center mb-4">
          <div style={{
            width:'80px', height:'80px', borderRadius:'50%',
            background:'linear-gradient(135deg, var(--primary), #ff4b1f)',
            margin:'0 auto 12px', display:'flex', alignItems:'center',
            justifyContent:'center', fontSize:'2rem', fontWeight:'bold', color:'#fff',
            boxShadow:'0 0 0 4px rgba(255,106,61,0.2)'
          }}>{user?.name?.charAt(0).toUpperCase()}</div>
          <h3 style={{ fontSize:'1.1rem', marginBottom:'4px' }}>{user?.name}</h3>
          <p className="text-muted" style={{ fontSize:'0.8rem', marginBottom:'8px' }}>{user?.email}</p>
          <span className="chip" style={{ background:'rgba(16,185,129,0.15)', color:'var(--success)', border:'1px solid rgba(16,185,129,0.3)', fontSize:'0.75rem' }}>
            <i className="fa-solid fa-circle-check"></i> Verified Citizen
          </span>
        </div>

        <div style={{ borderTop:'1px solid rgba(255,255,255,0.08)', paddingTop:'1rem' }}>
          <Link to="/dashboard" className="sidebar-link active">
            <i className="fa-solid fa-house-user"></i> My Dashboard
          </Link>
          <Link to="/raise" className="sidebar-link">
            <i className="fa-solid fa-plus"></i> Raise Complaint
          </Link>
          <Link to="/track" className="sidebar-link">
            <i className="fa-solid fa-magnifying-glass-location"></i> Track Status
          </Link>
          <Link to="/helpline" className="sidebar-link">
            <i className="fa-solid fa-phone-volume"></i> Helpline
          </Link>
        </div>

        <div className="mt-3 p-3 glass" style={{ borderRadius:'8px', textAlign:'center' }}>
          <div style={{ fontSize:'2rem', fontWeight:'bold', color:'var(--primary)' }}>
            {resolved * 50 + 250}
          </div>
          <div className="text-muted" style={{ fontSize:'0.8rem', marginBottom:'8px' }}>Civic Score</div>
          <div style={{ height:'6px', background:'rgba(255,255,255,0.1)', borderRadius:'3px' }}>
            <div style={{ height:'100%', width:`${totalScore}%`, background:'linear-gradient(90deg, var(--primary), var(--secondary))', borderRadius:'3px', transition:'width 1s' }}></div>
          </div>
          <small className="text-muted">{resolved} of {complaints.length} resolved</small>
        </div>
      </div>

      {/* ── Main Content ── */}
      <div className="dashboard-content">
        {error && <div className="alert alert-danger"><i className="fa-solid fa-exclamation-triangle"></i> {error}</div>}

        {/* Welcome banner */}
        <div className="glass-card mb-3 fade-in" style={{ background:'linear-gradient(135deg, rgba(255,106,61,0.1), rgba(30,144,255,0.1))', border:'1px solid rgba(255,106,61,0.2)' }}>
          <div className="d-flex justify-between align-center">
            <div>
              <h2 style={{ fontSize:'1.6rem', marginBottom:'6px' }}>
                Welcome back, <span style={{ color:'var(--primary)' }}>{user?.name?.split(' ')[0]}</span>! 👋
              </h2>
              <p className="text-muted">Here's an overview of your civic contributions.</p>
            </div>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <Link to="/helpline" className="btn btn-outline" style={{ background: 'rgba(255,255,255,0.05)' }}>
                <i className="fa-solid fa-phone-volume"></i> Helpline
              </Link>
              <Link to="/raise" className="btn btn-primary">
                <i className="fa-solid fa-plus"></i> New Complaint
              </Link>
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid-4 mb-3">
          {[
            { label:'Total Filed', value:complaints.length, icon:'fa-file-lines', color:'#3b82f6', cls:'stat-card-total' },
            { label:'Resolved',    value:resolved,          icon:'fa-check-circle', color:'#10b981', cls:'stat-card-resolved' },
            { label:'Pending',     value:pending,           icon:'fa-hourglass-half', color:'#f59e0b', cls:'stat-card-pending' },
            { label:'Urgent',      value:urgent,            icon:'fa-triangle-exclamation', color:'#ef4444', cls:'stat-card-emergency' },
          ].map(s => (
            <div key={s.label} className={`glass-card text-center ${s.cls}`} style={{ padding:'20px' }}>
              <div style={{ width:'50px', height:'50px', borderRadius:'12px', background:`${s.color}20`, margin:'0 auto 12px', display:'flex', alignItems:'center', justifyContent:'center', color:s.color, fontSize:'1.5rem' }}>
                <i className={`fa-solid ${s.icon}`}></i>
              </div>
              <div style={{ fontSize:'2.2rem', fontWeight:'bold', color:s.color }}>{s.value}</div>
              <div className="text-muted" style={{ fontSize:'0.85rem' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Complaints grid */}
        <div className="glass-card fade-in">
          <div className="d-flex justify-between align-center mb-3">
            <h3 style={{ margin:0 }}>
              <i className="fa-solid fa-list-check text-secondary"></i> My Complaints
              <span className="chip ms-2" style={{ fontSize:'0.75rem', background:'rgba(30,144,255,0.15)', color:'var(--secondary)' }}>{complaints.length}</span>
            </h3>
            <Link to="/track" className="btn btn-outline btn-sm">View Timeline</Link>
          </div>

          {complaints.length === 0 ? (
            <div className="text-center py-5">
              <i className="fa-solid fa-clipboard-check fa-4x text-muted mb-3"></i>
              <h4 style={{ marginBottom:'10px' }}>No complaints filed yet</h4>
              <p className="text-muted mb-3">Help improve your city by reporting civic issues.</p>
              <Link to="/raise" className="btn btn-primary">
                <i className="fa-solid fa-plus"></i> File First Complaint
              </Link>
            </div>
          ) : (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(290px, 1fr))', gap:'16px' }}>
              {complaints.map(c => {
                const sc = STATUS_COLORS[c.status] || { bg:'#6b7280', text:'#fff' };
                const deptIcon = DEPT_ICONS[c.department] || 'fa-building';
                return (
                  <div key={c._id} className="glass fade-in"
                    style={{ borderRadius:'12px', overflow:'hidden', display:'flex', flexDirection:'column', cursor:'pointer', transition:'all 0.3s', border:'1px solid rgba(255,255,255,0.06)' }}
                    onMouseEnter={e => { e.currentTarget.style.transform='translateY(-4px)'; e.currentTarget.style.boxShadow='0 12px 30px rgba(0,0,0,0.3)'; e.currentTarget.style.borderColor='rgba(255,255,255,0.15)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='none'; e.currentTarget.style.borderColor='rgba(255,255,255,0.06)'; }}
                  >
                    {/* Image */}
                    <div style={{ height:'140px', background:'rgba(0,0,0,0.3)', position:'relative', overflow:'hidden' }}>
                      {c.images?.length > 0
                        ? <img src={`${API_URL}/uploads/${c.images[0]}`} alt="complaint" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                        : <div style={{ height:'100%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'3rem', color:'rgba(255,255,255,0.1)' }}>
                            <i className={`fa-solid ${deptIcon}`}></i>
                          </div>
                      }
                      {/* Status badge overlay */}
                      <span style={{ position:'absolute', top:'10px', right:'10px', background:sc.bg, color:sc.text, padding:'4px 12px', borderRadius:'20px', fontSize:'0.75rem', fontWeight:'bold', boxShadow:'0 2px 8px rgba(0,0,0,0.3)' }}>
                        {c.status}
                      </span>
                    </div>

                    {/* Body */}
                    <div style={{ padding:'16px', flex:1, display:'flex', flexDirection:'column' }}>
                      <div className="d-flex justify-between align-center mb-1">
                        <span className={`priority-badge ${PRIORITY_STYLES[c.priority] || 'priority-normal'}`}>
                          <i className="fa-solid fa-flag"></i> {c.priority}
                        </span>
                        <span className="text-muted" style={{ fontSize:'0.75rem' }}>
                          <i className="fa-regular fa-clock"></i> {new Date(c.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      <h4 style={{ margin:'8px 0 6px', fontSize:'1rem', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', color:'var(--text-light)' }}>{c.title}</h4>

                      <p className="text-muted" style={{ fontSize:'0.82rem', lineHeight:'1.5', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden', marginBottom:'12px', flex:1 }}>
                        {c.description}
                      </p>

                      <div style={{ borderTop:'1px solid rgba(255,255,255,0.06)', paddingTop:'10px', display:'flex', flexDirection:'column', gap:'6px' }}>
                        <div className="d-flex align-center gap-1" style={{ fontSize:'0.8rem' }}>
                          <i className="fa-solid fa-location-dot text-danger"></i>
                          <span className="text-muted" style={{ overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{c.location?.split(',')[0]}</span>
                        </div>
                        <div className="d-flex justify-between align-center" style={{ fontSize:'0.8rem' }}>
                          <span style={{ color:'var(--secondary)', display:'flex', alignItems:'center', gap:'5px' }}>
                            <i className={`fa-solid ${deptIcon}`}></i> {c.department}
                          </span>
                          {c.assignedTo
                            ? <span className="text-success"><i className="fa-solid fa-user-check"></i> Assigned</span>
                            : <span className="text-warning"><i className="fa-solid fa-hourglass"></i> Pending</span>
                          }
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
