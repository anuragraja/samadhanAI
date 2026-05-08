import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const STATUS_STEPS = ['Submitted', 'Under Review', 'In Progress', 'Resolved'];

function getStepIndex(status) {
  const idx = STATUS_STEPS.indexOf(status);
  return idx === -1 ? 0 : idx;
}

function StatusBadge({ status }) {
  const colorMap = {
    'Resolved': 'var(--success)',
    'In Progress': 'var(--warning)',
    'Submitted': 'var(--info)',
    'Under Review': '#a855f7',
    'Rejected': 'var(--danger)',
  };
  return (
    <span className="chip" style={{ background: colorMap[status] || 'rgba(255,255,255,0.1)', color: '#fff' }}>
      {status}
    </span>
  );
}

export default function TrackComplaint() {
  const [complaints, setComplaints] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchId, setSearchId] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const res = await axios.get('http://localhost:5000/api/complaints');
      if (res.data.success) {
        setComplaints(res.data.data);
        if (res.data.data.length > 0) setSelected(res.data.data[0]);
      }
    } catch (err) {
      setError('Could not load complaints. Make sure you are logged in.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const found = complaints.find(c =>
      c._id.includes(searchId) || c.title.toLowerCase().includes(searchId.toLowerCase())
    );
    if (found) {
      setSelected(found);
      setError('');
    } else {
      setError(`No complaint found matching "${searchId}"`);
    }
  };

  if (loading) {
    return (
      <div className="glass-card" style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
        <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '2rem' }}></i>
        <p>Loading your complaints...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div className="glass-card mb-4">
        <h2 className="mb-3">
          <i className="fa-solid fa-route text-secondary"></i> Track Complaint
        </h2>
        <form onSubmit={handleSearch} className="d-flex gap-2 mb-3">
          <input
            type="text"
            className="form-control"
            placeholder="Search by Complaint ID or title..."
            value={searchId}
            onChange={e => setSearchId(e.target.value)}
          />
          <button type="submit" className="btn btn-secondary">
            <i className="fa-solid fa-magnifying-glass"></i> Search
          </button>
        </form>
        {error && (
          <div className="alert alert-danger">
            <i className="fa-solid fa-exclamation-triangle"></i> {error}
          </div>
        )}
      </div>

      {complaints.length === 0 ? (
        <div className="glass-card text-center py-4">
          <i className="fa-solid fa-inbox fa-3x text-muted mb-3"></i>
          <h4>No complaints found</h4>
          <p>You haven't submitted any complaints yet.</p>
        </div>
      ) : (
        <div className="grid-2" style={{ alignItems: 'start' }}>
          {/* Complaints List */}
          <div className="glass-card" style={{ maxHeight: '550px', overflowY: 'auto' }}>
            <h3 className="mb-3">
              <i className="fa-solid fa-list text-primary"></i> Your Complaints
            </h3>
            {complaints.map(c => (
              <div
                key={c._id}
                className="glass p-3 mb-2"
                onClick={() => setSelected(c)}
                style={{
                  cursor: 'pointer',
                  borderRadius: '8px',
                  border: selected?._id === c._id ? '1px solid var(--primary)' : '1px solid transparent',
                  transition: 'all 0.2s'
                }}
              >
                <div className="d-flex justify-between align-center">
                  <strong style={{ fontSize: '0.95rem' }}>{c.title}</strong>
                  <StatusBadge status={c.status} />
                </div>
                <div className="text-muted" style={{ fontSize: '0.8rem', marginTop: '4px' }}>
                  <i className="fa-solid fa-building"></i> {c.department} &bull;{' '}
                  {new Date(c.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>

          {/* Complaint Detail */}
          {selected && (
            <div className="glass-card">
              <div className="d-flex justify-between align-center mb-3">
                <h3 style={{ margin: 0 }}>{selected.title}</h3>
                <StatusBadge status={selected.status} />
              </div>

              <div className="mb-3" style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)' }}>
                ID: <code style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: '4px' }}>
                  {selected._id}
                </code>
              </div>

              {/* Progress Bar */}
              {selected.status !== 'Rejected' && (
                <div className="progress-container mb-4">
                  <div className="progress-bar-wrapper">
                    <div
                      className="progress-bar"
                      style={{ width: `${(getStepIndex(selected.status) / (STATUS_STEPS.length - 1)) * 100}%` }}
                    ></div>
                    <div className="progress-steps">
                      {STATUS_STEPS.map((step, i) => (
                        <div
                          key={step}
                          className={`step-dot ${i <= getStepIndex(selected.status) ? 'completed' : ''} ${i === getStepIndex(selected.status) && selected.status !== 'Resolved' ? 'active' : ''}`}
                        >
                          <i className={`fa-solid ${i < getStepIndex(selected.status) || selected.status === 'Resolved' ? 'fa-check' : i === getStepIndex(selected.status) ? 'fa-spinner fa-spin' : 'fa-circle'}`}></i>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="d-flex justify-between text-muted" style={{ fontSize: '0.75rem', marginTop: '10px' }}>
                    {STATUS_STEPS.map(s => <span key={s}>{s}</span>)}
                  </div>
                </div>
              )}

              <div className="mb-3">
                <strong className="text-muted">Description:</strong>
                <p style={{ marginTop: '4px' }}>{selected.description}</p>
              </div>

              <div className="grid-2" style={{ gap: '12px', marginBottom: '12px' }}>
                <div>
                  <strong className="text-muted">Location:</strong>
                  <p style={{ marginTop: '4px' }}>
                    <i className="fa-solid fa-location-dot text-primary"></i> {selected.location}
                  </p>
                </div>
                <div>
                  <strong className="text-muted">Department:</strong>
                  <p style={{ marginTop: '4px' }}>
                    <i className="fa-solid fa-building text-secondary"></i> {selected.department}
                  </p>
                </div>
                <div>
                  <strong className="text-muted">Priority:</strong>
                  <p style={{ marginTop: '4px' }}>
                    <i className={`fa-solid ${selected.priority === 'Urgent' ? 'fa-exclamation-triangle text-danger' : selected.priority === 'High' ? 'fa-exclamation-circle text-warning' : 'fa-info-circle text-info'}`}></i>{' '}
                    {selected.priority}
                  </p>
                </div>
                <div>
                  <strong className="text-muted">Filed On:</strong>
                  <p style={{ marginTop: '4px' }}>
                    <i className="fa-regular fa-calendar text-muted"></i>{' '}
                    {new Date(selected.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>

              {selected.resolution && (
                <div className="glass p-3" style={{ borderRadius: '8px', borderLeft: '3px solid var(--success)' }}>
                  <strong className="text-success">
                    <i className="fa-solid fa-check-circle"></i> Resolution Note:
                  </strong>
                  <p style={{ marginTop: '6px' }}>{selected.resolution}</p>
                </div>
              )}

              {selected.images && selected.images.length > 0 && (
                <div className="mt-3">
                  <strong className="text-muted">Attachments ({selected.images.length}):</strong>
                  <div className="d-flex flex-wrap gap-2 mt-2">
                    {selected.images.map((img, i) => (
                      <a
                        key={i}
                        href={`http://localhost:5000/uploads/${img}`}
                        target="_blank"
                        rel="noreferrer"
                        className="chip"
                        style={{ textDecoration: 'none' }}
                      >
                        <i className="fa-solid fa-paperclip"></i> File {i + 1}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
