import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Dashboard() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/complaints');
      if (response.data.success) {
        setComplaints(response.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch complaints:', err);
      setError('Failed to load complaints. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Resolved': return 'var(--success)';
      case 'In Progress': return 'var(--warning)';
      case 'Submitted': return 'var(--info)';
      case 'Under Review': return 'var(--secondary)';
      case 'Rejected': return 'var(--danger)';
      default: return 'var(--muted)';
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'Urgent': return 'fa-exclamation-triangle text-danger';
      case 'High': return 'fa-exclamation-circle text-warning';
      case 'Normal': return 'fa-info-circle text-info';
      case 'Low': return 'fa-check-circle text-success';
      default: return 'fa-circle text-muted';
    }
  };

  if (loading) {
    return (
      <div className="dashboard-layout">
        <div className="sidebar glass-card">
          <div className="text-center mb-4">
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--primary)', margin: '0 auto 10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 'bold' }}>
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <h3>{user?.name || 'User'}</h3>
            <span className="chip mt-2" style={{ background: 'rgba(30,144,255,0.2)' }}>
              <i className="fa-solid fa-award text-secondary"></i> Citizen
            </span>
          </div>
        </div>
        <div className="dashboard-content">
          <div className="loading-spinner" style={{ textAlign: 'center', padding: '2rem' }}>
            <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '2rem' }}></i>
            <p>Loading your dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      <div className="sidebar glass-card">
        <div className="text-center mb-4">
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: 'var(--primary)',
            margin: '0 auto 10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2rem',
            fontWeight: 'bold'
          }}>
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <h3>{user?.name || 'User'}</h3>
          <span className="chip mt-2" style={{ background: 'rgba(30,144,255,0.2)' }}>
            <i className="fa-solid fa-award text-secondary"></i> Smart Contributor
          </span>
        </div>
        <Link to="/dashboard" className="sidebar-link active">
          <i className="fa-solid fa-house-user"></i> My Profile
        </Link>
        <Link to="/raise" className="sidebar-link">
          <i className="fa-solid fa-plus"></i> New Complaint
        </Link>
        <Link to="/track" className="sidebar-link">
          <i className="fa-solid fa-magnifying-glass-location"></i> Track Status
        </Link>
      </div>
      <div className="dashboard-content">
        {error && (
          <div className="alert alert-danger mb-4">
            <i className="fa-solid fa-exclamation-triangle"></i> {error}
          </div>
        )}

        <div className="glass-card mb-4">
          <h2><i className="fa-solid fa-hand-holding-heart text-primary"></i> Welcome back, {user?.name}!</h2>
          <div className="d-flex align-center gap-3 mt-3">
            <div style={{ fontSize: '3rem', fontWeight: 'bold', color: 'var(--primary)' }}>
              {complaints.filter(c => c.status === 'Resolved').length * 50 + 250}
            </div>
            <div>
              <p>You are a verified active citizen.</p>
              <div style={{ width: '200px', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', marginTop: '5px' }}>
                <div style={{
                  width: `${Math.min(100, (complaints.filter(c => c.status === 'Resolved').length / Math.max(complaints.length, 1)) * 100)}%`,
                  height: '100%',
                  background: 'var(--primary)',
                  borderRadius: '3px'
                }}></div>
              </div>
              <small className="text-muted">
                {complaints.filter(c => c.status === 'Resolved').length} complaints resolved
              </small>
            </div>
          </div>
        </div>

        <div className="grid-2">
          <div className="glass-card">
            <h3 className="mb-3">
              <i className="fa-solid fa-chart-line text-primary"></i> Complaint Statistics
            </h3>
            <div className="stats-grid">
              <div className="stat-item">
                <div className="stat-number">{complaints.length}</div>
                <div className="stat-label">Total Complaints</div>
              </div>
              <div className="stat-item">
                <div className="stat-number text-success">
                  {complaints.filter(c => c.status === 'Resolved').length}
                </div>
                <div className="stat-label">Resolved</div>
              </div>
              <div className="stat-item">
                <div className="stat-number text-warning">
                  {complaints.filter(c => ['Submitted', 'Under Review', 'In Progress'].includes(c.status)).length}
                </div>
                <div className="stat-label">Pending</div>
              </div>
              <div className="stat-item">
                <div className="stat-number text-danger">
                  {complaints.filter(c => c.priority === 'Urgent' && c.status !== 'Resolved').length}
                </div>
                <div className="stat-label">Urgent</div>
              </div>
            </div>
          </div>

          <div className="glass-card">
            <h3 className="mb-3">
              <i className="fa-solid fa-clock text-warning"></i> Recent Activity
            </h3>
            <div className="activity-list">
              {complaints.slice(0, 5).map(c => (
                <div key={c._id} className="activity-item">
                  <div className="activity-icon">
                    <i className={`fa-solid ${getPriorityIcon(c.priority)}`}></i>
                  </div>
                  <div className="activity-content">
                    <div className="activity-title">{c.title}</div>
                    <div className="activity-meta">
                      {c.department} • {new Date(c.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="activity-status">
                    <span className="chip" style={{
                      background: `rgba(${getStatusColor(c.status) === 'var(--success)' ? '16,185,129' :
                        getStatusColor(c.status) === 'var(--warning)' ? '245,158,11' :
                        getStatusColor(c.status) === 'var(--info)' ? '59,130,246' :
                        getStatusColor(c.status) === 'var(--danger)' ? '239,68,68' : '156,163,175'},0.2)`,
                      color: getStatusColor(c.status),
                      border: 'none'
                    }}>
                      {c.status}
                    </span>
                  </div>
                </div>
              ))}
              {complaints.length === 0 && (
                <div className="text-center text-muted py-3">
                  <i className="fa-solid fa-inbox fa-2x mb-2"></i>
                  <p>No complaints yet. <Link to="/raise">Create your first complaint</Link></p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="glass-card mt-4">
          <h3 className="mb-3">
            <i className="fa-solid fa-list text-info"></i> Recent Complaints
          </h3>
          {complaints.length > 0 ? (
            <div className="complaints-list">
              {complaints.map(c => (
                <div key={c._id} className="complaint-item glass p-3 mb-2">
                  <div className="d-flex justify-between align-start">
                    <div className="flex-1">
                      <h4 className="mb-1">{c.title}</h4>
                      <div className="complaint-meta">
                        <span className="chip small" style={{ background: 'rgba(30,144,255,0.2)' }}>
                          <i className="fa-solid fa-building"></i> {c.department}
                        </span>
                        <span className="text-muted small">
                          {new Date(c.createdAt).toLocaleDateString()} at {new Date(c.createdAt).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-muted mt-2">{c.description.substring(0, 100)}...</p>
                      {c.images && c.images.length > 0 && (
                        <div className="mt-2">
                          <small className="text-muted">
                            <i className="fa-solid fa-paperclip"></i> {c.images.length} attachment(s)
                          </small>
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <span className="chip mb-2" style={{
                        background: `rgba(${getStatusColor(c.status) === 'var(--success)' ? '16,185,129' :
                          getStatusColor(c.status) === 'var(--warning)' ? '245,158,11' :
                          getStatusColor(c.status) === 'var(--info)' ? '59,130,246' :
                          getStatusColor(c.status) === 'var(--danger)' ? '239,68,68' : '156,163,175'},0.2)`,
                        color: getStatusColor(c.status),
                        border: 'none'
                      }}>
                        {c.status}
                      </span>
                      <div className="priority-indicator">
                        <i className={`fa-solid ${getPriorityIcon(c.priority)}`}></i>
                        <small className="text-muted"> {c.priority}</small>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4">
              <i className="fa-solid fa-file-alt fa-3x text-muted mb-3"></i>
              <h4>No complaints found</h4>
              <p>Start by raising your first complaint to see it here.</p>
              <Link to="/raise" className="btn btn-primary mt-3">
                <i className="fa-solid fa-plus"></i> Raise Complaint
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
