import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const [complaints, setComplaints] = useState([
    { _id: 'C1204', title: 'Streetlight not working', createdAt: '2026-05-01', status: 'Resolved', department: 'Electricity' },
    { _id: 'C1205', title: 'Water leakage on Main St.', createdAt: '2026-05-05', status: 'In Progress', department: 'Water' }
  ]);

  useEffect(() => {
    // Attempt to fetch from Node backend
    axios.get('http://localhost:5000/api/complaints')
      .then(res => {
        if(res.data && res.data.data && res.data.data.length > 0) {
            setComplaints(res.data.data);
        }
      })
      .catch(err => console.log('Backend not running, using mock data.'));
  }, []);

  return (
    <div className="dashboard-layout">
      <div className="sidebar glass-card">
          <div className="text-center mb-4">
              <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--primary)', margin: '0 auto 10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 'bold' }}>JD</div>
              <h3>John Doe</h3>
              <span className="chip mt-2" style={{ background: 'rgba(30,144,255,0.2)' }}><i className="fa-solid fa-award text-secondary"></i> Smart Contributor</span>
          </div>
          <Link to="/dashboard" className="sidebar-link active"><i className="fa-solid fa-house-user"></i> My Profile</Link>
          <Link to="/raise" className="sidebar-link"><i className="fa-solid fa-plus"></i> New Complaint</Link>
          <Link to="/track" className="sidebar-link"><i className="fa-solid fa-magnifying-glass-location"></i> Track Status</Link>
      </div>
      <div className="dashboard-content">
          <div className="glass-card mb-4">
              <h2><i className="fa-solid fa-hand-holding-heart text-primary"></i> Trust Points</h2>
              <div className="d-flex align-center gap-3 mt-3">
                  <div style={{ fontSize: '3rem', fontWeight: 'bold', color: 'var(--primary)' }}>1250</div>
                  <div>
                      <p>You are a verified active citizen.</p>
                      <div style={{ width: '200px', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', marginTop: '5px' }}>
                          <div style={{ width: '75%', height: '100%', background: 'var(--primary)', borderRadius: '3px' }}></div>
                      </div>
                      <small className="text-muted">250 points to next level</small>
                  </div>
              </div>
          </div>

          <div className="glass-card">
              <h3 className="mb-3">Recent Complaints</h3>
              {complaints.map(c => (
                <div key={c._id} className="glass p-3 mb-2 d-flex justify-between align-center" style={{ borderRadius: '8px' }}>
                    <div>
                        <strong>{c.title}</strong><br/>
                        <small className="text-muted">{c._id} | {new Date(c.createdAt).toLocaleDateString()}</small>
                    </div>
                    <span className="chip" style={{ 
                        background: c.status === 'Resolved' ? 'rgba(16,185,129,0.2)' : 'rgba(245,158,11,0.2)', 
                        color: c.status === 'Resolved' ? 'var(--success)' : 'var(--warning)', 
                        border: 'none' 
                    }}>{c.status}</span>
                </div>
              ))}
          </div>
      </div>
    </div>
  );
}
