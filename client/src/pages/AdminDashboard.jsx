import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    total: 0,
    resolved: 0,
    pending: 0,
    escalated: 0,
    recentComplaints: []
  });
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const [error, setError] = useState('');
  const { user, isSuperAdmin } = useAuth();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsResponse, complaintsResponse] = await Promise.all([
        axios.get('http://localhost:5000/api/admin/stats'),
        axios.get('http://localhost:5000/api/complaints')
      ]);

      if (statsResponse.data.success) {
        setStats(statsResponse.data.data);
      }

      if (complaintsResponse.data.success) {
        setComplaints(complaintsResponse.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const updateComplaintStatus = async (complaintId, status, resolution = '') => {
    try {
      setUpdating(complaintId);
      const response = await axios.put(`http://localhost:5000/api/complaints/${complaintId}`, {
        status,
        resolution
      });

      if (response.data.success) {
        // Refresh data
        await fetchDashboardData();
      }
    } catch (err) {
      console.error('Failed to update complaint:', err);
      setError('Failed to update complaint status.');
    } finally {
      setUpdating(null);
    }
  };

  const getDepartmentIcon = (department) => {
    switch (department) {
      case 'Water Department': return 'fa-droplet text-secondary';
      case 'Electricity Department': return 'fa-bolt text-warning';
      case 'Road Department': return 'fa-road text-muted';
      case 'Public Safety': return 'fa-shield-halved text-success';
      default: return 'fa-building text-primary';
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

  if (loading) {
    return (
      <div className="dashboard-layout">
        <div className="sidebar glass-card">
          <h3 className="mb-4 text-center">Admin Panel</h3>
          <div className="text-center">
            <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '2rem' }}></i>
            <p>Loading...</p>
          </div>
        </div>
        <div className="dashboard-content">
          <div className="loading-spinner" style={{ textAlign: 'center', padding: '2rem' }}>
            <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '2rem' }}></i>
            <p>Loading dashboard data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      <div className="sidebar glass-card">
        <h3 className="mb-4 text-center">Admin Panel</h3>
        <Link to="/admin" className="sidebar-link active">
          <i className="fa-solid fa-chart-pie"></i> Overview
        </Link>

        {isSuperAdmin && (
          <>
            <Link to="#" className="sidebar-link">
              <i className="fa-solid fa-droplet text-secondary"></i> Water Dept
            </Link>
            <Link to="#" className="sidebar-link">
              <i className="fa-solid fa-bolt text-warning"></i> Electricity
            </Link>
            <Link to="#" className="sidebar-link">
              <i className="fa-solid fa-road text-muted"></i> Roads
            </Link>
            <Link to="#" className="sidebar-link">
              <i className="fa-solid fa-shield-halved text-success"></i> Safety
            </Link>
          </>
        )}

        {!isSuperAdmin && user?.department && (
          <div className="sidebar-link active">
            <i className={`fa-solid ${getDepartmentIcon(user.department)}`}></i> {user.department}
          </div>
        )}

        <div className="mt-4 p-3 glass" style={{ fontSize: '0.9rem' }}>
          <strong>Role:</strong> {user?.role?.replace('_', ' ').toUpperCase()}<br/>
          {user?.department && <><strong>Department:</strong> {user.department}</>}
        </div>
      </div>

      <div className="dashboard-content">
        {error && (
          <div className="alert alert-danger mb-4">
            <i className="fa-solid fa-exclamation-triangle"></i> {error}
          </div>
        )}

        <h2 className="mb-4">
          <i className="fa-solid fa-city text-primary"></i> City Governance Dashboard
        </h2>

        <div className="grid-4 mb-4">
          <div className="glass-card text-center" style={{ padding: '20px' }}>
            <h4 className="text-muted">Total Complaints</h4>
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>{stats.total}</div>
            <small className="text-muted">All time</small>
          </div>

          <div className="glass-card text-center" style={{ padding: '20px' }}>
            <h4 className="text-muted">Resolved</h4>
            <div style={{
              fontSize: '2.5rem',
              fontWeight: 'bold',
              color: 'var(--success)'
            }}>{stats.resolved}</div>
            <small className="text-success">
              {stats.total > 0 ? Math.round((stats.resolved / stats.total) * 100) : 0}% resolution rate
            </small>
          </div>

          <div className="glass-card text-center" style={{ padding: '20px' }}>
            <h4 className="text-muted">Pending</h4>
            <div style={{
              fontSize: '2.5rem',
              fontWeight: 'bold',
              color: 'var(--warning)'
            }}>{stats.pending}</div>
            <small className="text-warning">Requires attention</small>
          </div>

          <div className="glass-card text-center emergency-card" style={{ padding: '20px' }}>
            <h4 className="text-muted">Escalated</h4>
            <div style={{
              fontSize: '2.5rem',
              fontWeight: 'bold',
              color: 'var(--danger)'
            }}>{stats.escalated}</div>
            <small className="text-danger">Urgent priority</small>
          </div>
        </div>

        <div className="grid-2">
          <div className="glass-card">
            <h3 className="mb-3">
              <i className="fa-solid fa-chart-bar text-primary"></i> Department Performance
            </h3>
            <div className="department-stats">
              {['Water Department', 'Electricity Department', 'Road Department', 'Public Safety'].map(dept => {
                const deptComplaints = complaints.filter(c => c.department === dept);
                const resolved = deptComplaints.filter(c => c.status === 'Resolved').length;
                const total = deptComplaints.length;
                const percentage = total > 0 ? Math.round((resolved / total) * 100) : 0;

                return (
                  <div key={dept} className="department-item">
                    <div className="d-flex justify-between align-center">
                      <div className="d-flex align-center gap-2">
                        <i className={`fa-solid ${getDepartmentIcon(dept)}`}></i>
                        <span>{dept}</span>
                      </div>
                      <div className="text-right">
                        <div className="fw-bold">{resolved}/{total}</div>
                        <small className="text-muted">{percentage}% resolved</small>
                      </div>
                    </div>
                    <div className="progress-bar mt-2">
                      <div
                        className="progress-fill"
                        style={{
                          width: `${percentage}%`,
                          background: percentage > 80 ? 'var(--success)' : percentage > 60 ? 'var(--warning)' : 'var(--danger)'
                        }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="glass-card">
            <h3 className="mb-3">
              <i className="fa-solid fa-exclamation-triangle text-danger"></i> Priority Alerts
            </h3>
            <div className="alerts-list">
              {complaints
                .filter(c => c.priority === 'Urgent' && c.status !== 'Resolved')
                .slice(0, 5)
                .map(c => (
                  <div key={c._id} className="alert-item urgent">
                    <div className="d-flex justify-between align-start">
                      <div className="flex-1">
                        <div className="alert-title">{c.title}</div>
                        <div className="alert-meta">
                          <i className={`fa-solid ${getDepartmentIcon(c.department)}`}></i> {c.department} •
                          {new Date(c.createdAt).toLocaleDateString()}
                        </div>
                        <div className="alert-location">
                          <i className="fa-solid fa-map-marker-alt"></i> {c.location}
                        </div>
                      </div>
                      <div className="alert-actions">
                        {updating === c._id ? (
                          <i className="fa-solid fa-spinner fa-spin"></i>
                        ) : (
                          <button
                            className="btn btn-success btn-sm"
                            onClick={() => updateComplaintStatus(c._id, 'In Progress')}
                          >
                            Assign
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

              {complaints.filter(c => c.priority === 'Urgent' && c.status !== 'Resolved').length === 0 && (
                <div className="text-center text-muted py-3">
                  <i className="fa-solid fa-check-circle fa-2x mb-2 text-success"></i>
                  <p>No urgent alerts at this time.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="glass-card mt-4">
          <h3 className="mb-3">
            <i className="fa-solid fa-list text-info"></i> All Complaints
          </h3>
          <div className="complaints-table">
            {complaints.length > 0 ? (
              complaints.map(c => (
                <div key={c._id} className="complaint-row" style={{ alignItems: 'flex-start' }}>
                  <div className="complaint-info" style={{ flex: '1' }}>
                    <div className="complaint-title" style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>{c.title}</div>
                    <div className="complaint-details mt-1">
                      <span className="chip small" style={{ background: 'rgba(30,144,255,0.2)' }}>
                        <i className={`fa-solid ${getDepartmentIcon(c.department)}`}></i> {c.department}
                      </span>
                      <span className="text-muted small ml-2">
                        {c.userId?.name || 'Unknown User'} • {new Date(c.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    {c.description && (
                      <div className="mt-2 text-muted small">
                        {c.description}
                      </div>
                    )}
                    {c.images && c.images.length > 0 && (
                      <div className="mt-2 text-primary small">
                        <i className="fa-solid fa-paperclip"></i> {c.images.length} attachment(s)
                      </div>
                    )}
                  </div>
                  <div className="complaint-status" style={{ margin: '0 15px' }}>
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
                  <div className="complaint-actions">
                    {updating === c._id ? (
                      <i className="fa-solid fa-spinner fa-spin"></i>
                    ) : (
                      <div className="btn-group">
                        {c.status !== 'Resolved' && (
                          <button
                            className="btn btn-success btn-sm"
                            onClick={() => updateComplaintStatus(c._id, 'Resolved', 'Issue resolved by department')}
                          >
                            Resolve
                          </button>
                        )}
                        {c.status !== 'In Progress' && c.status !== 'Resolved' && (
                          <button
                            className="btn btn-warning btn-sm"
                            onClick={() => updateComplaintStatus(c._id, 'In Progress')}
                          >
                            Start Work
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4">
                <i className="fa-solid fa-inbox fa-3x text-muted mb-3"></i>
                <h4>No recent complaints</h4>
                <p>All complaints are up to date.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
