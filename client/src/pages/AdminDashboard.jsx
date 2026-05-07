import { Link } from 'react-router-dom';

export default function AdminDashboard() {
  return (
    <div className="dashboard-layout">
        <div className="sidebar glass-card">
            <h3 className="mb-4 text-center">Admin Panel</h3>
            <Link to="/admin" className="sidebar-link active"><i className="fa-solid fa-chart-pie"></i> Overview</Link>
            <Link to="#" className="sidebar-link"><i className="fa-solid fa-droplet text-secondary"></i> Water Dept</Link>
            <Link to="#" className="sidebar-link"><i className="fa-solid fa-bolt text-warning"></i> Electricity</Link>
            <Link to="#" className="sidebar-link"><i className="fa-solid fa-road text-muted"></i> Roads</Link>
            <Link to="#" className="sidebar-link"><i className="fa-solid fa-shield-halved text-success"></i> Safety</Link>
        </div>
        <div className="dashboard-content">
            <h2 className="mb-4">City Governance Dashboard</h2>
            
            <div className="grid-4 mb-4">
                <div className="glass-card text-center" style={{ padding: '15px' }}>
                    <h4 className="text-muted">Total</h4>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>12,450</div>
                </div>
                <div className="glass-card text-center" style={{ padding: '15px' }}>
                    <h4 className="text-muted">Resolved</h4>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--success)' }}>11,200</div>
                </div>
                <div className="glass-card text-center" style={{ padding: '15px' }}>
                    <h4 className="text-muted">Pending</h4>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--warning)' }}>850</div>
                </div>
                <div className="glass-card text-center emergency-card" style={{ padding: '15px' }}>
                    <h4 className="text-muted">Escalated</h4>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--danger)' }}>400</div>
                </div>
            </div>

            <div className="grid-2">
                <div className="glass-card">
                    <h3 className="mb-3">AI Prediction & Analytics</h3>
                    <div style={{ height: '200px', display: 'flex', alignItems: 'flex-end', gap: '10px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px' }}>
                        <div style={{ flex: 1, background: 'var(--secondary)', height: '60%', borderRadius: '4px 4px 0 0' }}></div>
                        <div style={{ flex: 1, background: 'var(--primary)', height: '80%', borderRadius: '4px 4px 0 0' }}></div>
                        <div style={{ flex: 1, background: 'var(--success)', height: '40%', borderRadius: '4px 4px 0 0' }}></div>
                        <div style={{ flex: 1, background: 'var(--warning)', height: '90%', borderRadius: '4px 4px 0 0' }}></div>
                        <div style={{ flex: 1, background: 'var(--danger)', height: '30%', borderRadius: '4px 4px 0 0' }}></div>
                    </div>
                    <div className="d-flex justify-between mt-2 text-muted" style={{ fontSize: '0.8rem' }}>
                        <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span>
                    </div>
                </div>
                <div className="glass-card">
                    <h3 className="mb-3">Priority Alerts</h3>
                    <div className="glass p-2 mb-2 d-flex justify-between align-center" style={{ borderLeft: '3px solid var(--danger)' }}>
                        <span>Main Water Pipe Burst - Sector 4</span>
                        <button className="btn btn-outline" style={{ padding: '5px 10px', fontSize: '0.8rem' }}>Assign</button>
                    </div>
                    <div className="glass p-2 d-flex justify-between align-center" style={{ borderLeft: '3px solid var(--warning)' }}>
                        <span>Streetlight Outage - MG Road</span>
                        <button className="btn btn-outline" style={{ padding: '5px 10px', fontSize: '0.8rem' }}>Assign</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
}
