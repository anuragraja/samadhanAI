import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import API_URL from '../api';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line } from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
const DEPT_ICONS = {
  'Water Department': { icon: 'fa-droplet', color: '#3b82f6' },
  'Electricity Department': { icon: 'fa-bolt', color: '#f59e0b' },
  'Road Department': { icon: 'fa-road', color: '#94a3b8' },
  'Public Safety': { icon: 'fa-shield-halved', color: '#10b981' },
  'Garbage Department': { icon: 'fa-trash', color: '#8b5cf6' },
};

const STATUS_COLORS = {
  'Resolved': '#10b981', 'In Progress': '#f59e0b',
  'Submitted': '#3b82f6', 'Under Review': '#8b5cf6', 'Rejected': '#ef4444',
};

function StatCard({ label, value, icon, color, sub, pulse }) {
  return (
    <div className="glass-card text-center fade-in" style={{
      padding: '24px', border: `1px solid ${color}30`,
      background: `linear-gradient(135deg, ${color}10, transparent)`,
      animation: pulse ? 'emergencyPulse 2s infinite' : 'none'
    }}>
      <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: `${color}20`, margin: '0 auto 14px', display: 'flex', alignItems: 'center', justifyContent: 'center', color, fontSize: '1.6rem' }}>
        <i className={`fa-solid ${icon}`}></i>
      </div>
      <div style={{ fontSize: '2.4rem', fontWeight: '800', color, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: '0.9rem', fontWeight: '600', margin: '6px 0 4px', color: 'var(--text-light)' }}>{label}</div>
      {sub && <div className="text-muted" style={{ fontSize: '0.75rem' }}>{sub}</div>}
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState(null);
  const [filterDept, setFilterDept] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('overview'); // overview | complaints | analytics
  const { user, isSuperAdmin } = useAuth();

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [sRes, cRes] = await Promise.all([
        axios.get(`${API_URL}/api/admin/stats`),
        axios.get(`${API_URL}/api/complaints`)
      ]);
      if (sRes.data.success) setStats(sRes.data.data);
      if (cRes.data.success) setComplaints(cRes.data.data);
    } catch { setError('Failed to load dashboard data.'); }
    finally { setLoading(false); }
  };

  const updateStatus = async (id, status, resolution = '') => {
    try {
      setUpdating(id);
      const res = await axios.put(`${API_URL}/api/complaints/${id}`, { status, resolution });
      if (res.data.success) {
        setComplaints(prev => prev.map(c => c._id === id ? res.data.data : c));
        if (selected?._id === id) setSelected(res.data.data);
      }
    } catch { setError('Update failed.'); }
    finally { setUpdating(null); }
  };

  // Filtered complaints
  const filtered = complaints.filter(c => {
    const matchDept = filterDept === 'All' || c.department === filterDept;
    const matchStatus = filterStatus === 'All' || c.status === filterStatus;
    const matchSearch = !search || c.title.toLowerCase().includes(search.toLowerCase()) || c.location.toLowerCase().includes(search.toLowerCase());
    return matchDept && matchStatus && matchSearch;
  });

  const deptChartData = stats?.departmentStats?.map(d => ({ name: d.department.replace(' Department', ''), total: d.total, resolved: d.resolved })) || [];
  const pieData = ['Submitted', 'Under Review', 'In Progress', 'Resolved', 'Rejected'].map(s => ({
    name: s, value: complaints.filter(c => c.status === s).length
  })).filter(d => d.value > 0);

  const navItems = [
    { id: 'overview', label: 'Overview', icon: 'fa-chart-pie' },
    { id: 'complaints', label: 'Complaints', icon: 'fa-list' },
    { id: 'analytics', label: 'Analytics', icon: 'fa-chart-bar' },
  ];

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ width: '60px', height: '60px', borderRadius: '50%', border: '3px solid var(--secondary)', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }}></div>
      <p className="text-muted">Loading Admin Dashboard...</p>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  // ── Complaint Detail View ────────────────────────────────────────────────
  if (selected) return (
    <div className="fade-in">
      <button className="btn btn-outline mb-3" onClick={() => setSelected(null)}>
        <i className="fa-solid fa-arrow-left"></i> Back
      </button>

      <div className="glass-card mb-3">
        <div className="d-flex justify-between align-center mb-3">
          <h2 style={{ margin: 0, fontSize: '1.6rem' }}>{selected.title}</h2>
          <span style={{ background: STATUS_COLORS[selected.status], color: '#fff', padding: '6px 18px', borderRadius: '20px', fontWeight: 'bold', fontSize: '0.9rem' }}>
            {selected.status}
          </span>
        </div>
        <div className="grid-2 mb-3" style={{ gap: '12px' }}>
          {[
            { label: 'Complaint ID', value: selected._id, mono: true },
            { label: 'Reported By', value: `${selected.userId?.name} (${selected.userId?.email})` },
            { label: 'Department', value: selected.department },
            { label: 'Category', value: selected.category || 'General' },
            { label: 'Location', value: selected.location },
            { label: 'Filed On', value: new Date(selected.createdAt).toLocaleString() },
          ].map(f => (
            <div key={f.label}>
              <div className="text-muted" style={{ fontSize: '0.75rem', marginBottom: '2px' }}>{f.label}</div>
              <div style={{ fontWeight: '500', fontSize: '0.9rem', fontFamily: f.mono ? 'monospace' : 'inherit', background: f.mono ? 'rgba(255,255,255,0.05)' : 'none', padding: f.mono ? '3px 8px' : '0', borderRadius: '4px', display: f.mono ? 'inline-block' : 'block' }}>
                {f.value}
              </div>
            </div>
          ))}
        </div>
        <div className="d-flex align-center gap-2">
          <span className={`priority-badge ${selected.priority === 'Emergency' ? 'priority-emergency' : selected.priority === 'Urgent' ? 'priority-urgent' : selected.priority === 'High' ? 'priority-high' : 'priority-normal'}`}>
            <i className="fa-solid fa-flag"></i> {selected.priority} Priority
          </span>
          {selected.aiScore && (
            <span className="chip" style={{ background: 'rgba(139,92,246,0.15)', color: '#a78bfa', border: '1px solid rgba(139,92,246,0.3)' }}>
              <i className="fa-solid fa-robot"></i> AI Score: {selected.aiScore}/100
            </span>
          )}
        </div>
      </div>

      <div className="grid-2 mb-3">
        {/* Description & evidence */}
        <div className="glass-card">
          <h4 className="mb-2"><i className="fa-solid fa-file-lines text-secondary"></i> Description</h4>
          <p style={{ lineHeight: '1.7', color: 'var(--text-light)' }}>{selected.description}</p>

          {selected.images?.length > 0 && (
            <div className="mt-3">
              <h4 className="mb-2"><i className="fa-solid fa-images text-primary"></i> Evidence ({selected.images.length})</h4>
              <div className="d-flex" style={{ gap: '10px', flexWrap: 'wrap' }}>
                {selected.images.map((img, i) => (
                  <a key={i} href={`${API_URL}/uploads/${img}`} target="_blank" rel="noreferrer">
                    <img src={`${API_URL}/uploads/${img}`} alt="evidence" style={{ width: '100px', height: '80px', objectFit: 'cover', borderRadius: '8px', border: '2px solid rgba(255,255,255,0.1)' }} />
                  </a>
                ))}
              </div>
            </div>
          )}

          {selected.resolution && (
            <div className="mt-3 p-3 glass" style={{ borderRadius: '8px', borderLeft: '3px solid var(--success)' }}>
              <strong className="text-success"><i className="fa-solid fa-check-circle"></i> Resolution:</strong>
              <p style={{ marginTop: '6px' }}>{selected.resolution}</p>
            </div>
          )}
        </div>

        {/* Admin actions */}
        <div>
          <div className="glass-card mb-3">
            <h4 className="mb-3"><i className="fa-solid fa-gear text-warning"></i> Admin Actions</h4>
            <div className="d-flex flex-column gap-2">
              {[
                { status: 'Under Review', label: 'Mark Under Review', icon: 'fa-eye', cls: 'btn-info' },
                { status: 'In Progress', label: 'Start Work', icon: 'fa-person-digging', cls: 'btn-warning' },
                { status: 'Resolved', label: 'Resolve Issue', icon: 'fa-check-double', cls: 'btn-success', note: 'Issue resolved by department' },
                { status: 'Rejected', label: 'Reject', icon: 'fa-ban', cls: 'btn-danger', note: 'Complaint rejected' },
              ].map(a => (
                <button key={a.status} className={`btn ${a.cls} w-100`}
                  disabled={updating === selected._id || selected.status === a.status}
                  onClick={() => updateStatus(selected._id, a.status, a.note)}
                >
                  {updating === selected._id ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className={`fa-solid ${a.icon}`}></i>}
                  {a.label}
                </button>
              ))}
            </div>
          </div>

          {/* Timeline */}
          {selected.timeline?.length > 0 && (
            <div className="glass-card">
              <h4 className="mb-3"><i className="fa-solid fa-timeline text-secondary"></i> Timeline</h4>
              <ul className="timeline">
                {selected.timeline.map((t, i) => (
                  <li key={i} className="timeline-item">
                    <div className={`timeline-dot ${t.status === 'Resolved' ? 'resolved' : t.status === 'Rejected' ? 'rejected' : ''}`}>
                      <i className={`fa-solid ${t.status === 'Resolved' ? 'fa-check' : t.status === 'Rejected' ? 'fa-times' : 'fa-circle'}`} style={{ fontSize: '0.7rem' }}></i>
                    </div>
                    <div className="timeline-body">
                      <div className="timeline-status">{t.status}</div>
                      <div className="timeline-note">{t.note}</div>
                      <div className="timeline-time">
                        {t.changedByName} • {new Date(t.timestamp).toLocaleString()}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // ── Main Admin Dashboard ─────────────────────────────────────────────────
  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <div className="sidebar glass-card" style={{ alignSelf: 'start', position: 'sticky', top: '80px' }}>
        <div className="text-center mb-3">
          <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--secondary), #005cbf)', margin: '0 auto 10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', color: '#fff', fontWeight: 'bold' }}>
            {user?.name?.charAt(0)}
          </div>
          <h4 style={{ fontSize: '1rem', marginBottom: '2px' }}>{user?.name}</h4>
          <span className="chip" style={{ fontSize: '0.7rem', background: 'rgba(239,68,68,0.15)', color: '#f87171' }}>
            {user?.role === 'super_admin' ? '⚡ Super Admin' : `🏢 ${user?.department}`}
          </span>
        </div>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1rem' }}>
          {navItems.map(n => (
            <button key={n.id} onClick={() => setActiveTab(n.id)}
              className={`sidebar-link ${activeTab === n.id ? 'active' : ''}`}
              style={{ width: '100%', textAlign: 'left', background: 'transparent', border: 'none', cursor: 'pointer' }}
            >
              <i className={`fa-solid ${n.icon}`}></i> {n.label}
            </button>
          ))}

          <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', marginTop: '1rem', paddingTop: '1rem' }}>
            <p className="text-muted" style={{ fontSize: '0.7rem', padding: '0 12px', marginBottom: '8px' }}>DEPARTMENTS</p>
            {['All', ...Object.keys(DEPT_ICONS)].map(d => (
              <button key={d} onClick={() => { setFilterDept(d); setActiveTab('complaints'); }}
                className={`sidebar-link ${filterDept === d && activeTab === 'complaints' ? 'active' : ''}`}
                style={{ width: '100%', textAlign: 'left', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '0.85rem' }}
              >
                <i className={`fa-solid ${d === 'All' ? 'fa-grid' : DEPT_ICONS[d].icon}`} style={{ color: d === 'All' ? 'inherit' : DEPT_ICONS[d]?.color }}></i>
                {d === 'All' ? 'All Departments' : d.replace(' Department', '')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="dashboard-content">
        {error && <div className="alert alert-danger mb-3"><i className="fa-solid fa-exclamation-triangle"></i> {error}</div>}

        {/* ── OVERVIEW TAB ── */}
        {activeTab === 'overview' && (
          <div className="fade-in">
            <h2 className="mb-3">
              <i className="fa-solid fa-city text-primary"></i>{' '}
              {isSuperAdmin ? 'City Governance Dashboard' : `${user?.department} Dashboard`}
            </h2>

            {/* Stat cards */}
            <div className="grid-4 mb-3">
              <StatCard label="Total Complaints" value={stats?.total || 0} icon="fa-file-lines" color="#3b82f6" />
              <StatCard label="Resolved" value={stats?.resolved || 0} icon="fa-check-circle" color="#10b981" sub={`${stats?.total ? Math.round((stats.resolved / stats.total) * 100) : 0}% rate`} />
              <StatCard label="Pending" value={stats?.pending || 0} icon="fa-hourglass-half" color="#f59e0b" />
              <StatCard label="Emergency" value={stats?.emergency || 0} icon="fa-triangle-exclamation" color="#ef4444" pulse />
            </div>

            <div className="grid-2 mb-3">
              {/* Urgent alerts */}
              <div className="glass-card">
                <h3 className="mb-3"><i className="fa-solid fa-siren text-danger"></i> Urgent Alerts</h3>
                {complaints.filter(c => ['Urgent', 'Emergency'].includes(c.priority) && c.status !== 'Resolved').slice(0, 5).map(c => (
                  <div key={c._id} className="alert-item urgent" onClick={() => setSelected(c)} style={{ cursor: 'pointer' }}>
                    <div className="alert-title">{c.title}</div>
                    <div className="alert-meta"><i className={`fa-solid ${DEPT_ICONS[c.department]?.icon}`}></i> {c.department}</div>
                    <div className="alert-location"><i className="fa-solid fa-location-dot"></i> {c.location?.split(',')[0]}</div>
                  </div>
                ))}
                {complaints.filter(c => ['Urgent', 'Emergency'].includes(c.priority) && c.status !== 'Resolved').length === 0 && (
                  <div className="text-center py-3 text-muted">
                    <i className="fa-solid fa-circle-check fa-2x text-success mb-2"></i>
                    <p>No urgent alerts!</p>
                  </div>
                )}
              </div>

              {/* Department performance */}
              <div className="glass-card">
                <h3 className="mb-3"><i className="fa-solid fa-chart-bar text-secondary"></i> Department Performance</h3>
                {stats?.departmentStats?.map(d => {
                  const pct = d.total > 0 ? Math.round((d.resolved / d.total) * 100) : 0;
                  const di = DEPT_ICONS[d.department];
                  return (
                    <div key={d.department} className="department-item">
                      <div className="d-flex justify-between align-center" style={{ marginBottom: '6px' }}>
                        <div className="d-flex align-center gap-1" style={{ fontSize: '0.85rem' }}>
                          <i className={`fa-solid ${di?.icon}`} style={{ color: di?.color }}></i>
                          <span>{d.department.replace(' Department', '')}</span>
                        </div>
                        <span style={{ fontSize: '0.8rem', fontWeight: '600', color: pct > 70 ? 'var(--success)' : pct > 40 ? 'var(--warning)' : 'var(--danger)' }}>
                          {d.resolved}/{d.total} ({pct}%)
                        </span>
                      </div>
                      <div className="progress-bar">
                        <div className="progress-fill" style={{ width: `${pct}%`, background: pct > 70 ? 'var(--success)' : pct > 40 ? 'var(--warning)' : 'var(--danger)' }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recent complaints */}
            <div className="glass-card">
              <div className="d-flex justify-between align-center mb-3">
                <h3 style={{ margin: 0 }}><i className="fa-solid fa-clock-rotate-left text-warning"></i> Recent Complaints</h3>
                <button onClick={() => setActiveTab('complaints')} className="btn btn-outline btn-sm">View All</button>
              </div>
              {stats?.recentComplaints?.slice(0, 5).map(c => (
                <div key={c._id} className="complaint-row mb-2" onClick={() => setSelected(c)}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: '600', fontSize: '0.95rem' }}>{c.title}</div>
                    <div className="text-muted" style={{ fontSize: '0.8rem' }}>{c.userId?.name} • {new Date(c.createdAt).toLocaleDateString()}</div>
                  </div>
                  <span style={{ background: STATUS_COLORS[c.status], color: '#fff', padding: '3px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 'bold', marginLeft: '10px' }}>
                    {c.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── COMPLAINTS TAB ── */}
        {activeTab === 'complaints' && (
          <div className="fade-in">
            <div className="glass-card mb-3">
              <div className="d-flex justify-between align-center mb-3" style={{ flexWrap: 'wrap', gap: '10px' }}>
                <h3 style={{ margin: 0 }}>
                  <i className="fa-solid fa-list text-info"></i> All Complaints
                  <span className="chip ms-2" style={{ fontSize: '0.75rem', background: 'rgba(59,130,246,0.15)', color: 'var(--secondary)' }}>{filtered.length}</span>
                </h3>
                <div className="d-flex gap-1" style={{ flexWrap: 'wrap' }}>
                  <input type="text" className="form-control" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} style={{ width: '180px' }} />
                  <select className="form-control" value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ width: '140px' }}   >
                    {['All', 'Submitted', 'Under Review', 'In Progress', 'Resolved', 'Rejected'].map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              {filtered.length === 0 ? (
                <div className="text-center py-4">
                  <i className="fa-solid fa-inbox fa-3x text-muted mb-3"></i>
                  <h4>No complaints found</h4>
                  <p className="text-muted">Try adjusting your filters.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {filtered.map(c => {
                    const di = DEPT_ICONS[c.department];
                    return (
                      <div key={c._id} className="complaint-row" onClick={() => setSelected(c)}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '10px', background: 'rgba(0,0,0,0.3)', flexShrink: 0, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {c.images?.length > 0
                            ? <img src={`${API_URL}/uploads/${c.images[0]}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                            : <i className={`fa-solid ${di?.icon}`} style={{ color: di?.color }}></i>
                          }
                        </div>
                        <div style={{ flex: 1, marginLeft: '12px' }}>
                          <div style={{ fontWeight: '600', fontSize: '0.95rem', marginBottom: '3px' }}>{c.title}</div>
                          <div className="d-flex align-center gap-2" style={{ fontSize: '0.78rem', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
                            <span><i className={`fa-solid ${di?.icon}`} style={{ color: di?.color }}></i> {c.department}</span>
                            <span><i className="fa-solid fa-location-dot text-danger"></i> {c.location?.split(',')[0]}</span>
                            <span><i className="fa-regular fa-clock"></i> {new Date(c.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="d-flex flex-column align-center gap-1" style={{ marginLeft: '12px' }}>
                          <span style={{ background: STATUS_COLORS[c.status], color: '#fff', padding: '3px 10px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 'bold', whiteSpace: 'nowrap' }}>{c.status}</span>
                          <span className={`priority-badge ${c.priority === 'Emergency' ? 'priority-emergency' : c.priority === 'Urgent' ? 'priority-urgent' : c.priority === 'High' ? 'priority-high' : 'priority-normal'}`} style={{ fontSize: '0.7rem' }}>
                            {c.priority}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── ANALYTICS TAB ── */}
        {activeTab === 'analytics' && (
          <div className="fade-in">
            <h2 className="mb-3"><i className="fa-solid fa-chart-pie text-primary"></i> Analytics</h2>

            <div className="grid-2 mb-3">
              <div className="glass-card">
                <h4 className="mb-3">Complaints by Status</h4>
                <div style={{ height: '250px' }}>
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                        {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip contentStyle={{ background: 'var(--bg-dark)', border: '1px solid var(--glass-border)', borderRadius: '8px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="glass-card">
                <h4 className="mb-3">Department Workload</h4>
                <div style={{ height: '250px' }}>
                  <ResponsiveContainer>
                    <BarChart data={deptChartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                      <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} />
                      <Tooltip contentStyle={{ background: 'var(--bg-dark)', border: '1px solid var(--glass-border)', borderRadius: '8px' }} />
                      <Bar dataKey="total" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Total" />
                      <Bar dataKey="resolved" fill="#10b981" radius={[4, 4, 0, 0]} name="Resolved" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className="glass-card">
              <h4 className="mb-3">Priority Distribution</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px,1fr))', gap: '12px' }}>
                {['Emergency', 'Urgent', 'High', 'Normal', 'Low'].map(p => {
                  const count = complaints.filter(c => c.priority === p).length;
                  const pct = complaints.length > 0 ? Math.round((count / complaints.length) * 100) : 0;
                  const colors = { Emergency: '#ef4444', Urgent: '#f87171', High: '#f59e0b', Normal: '#3b82f6', Low: '#10b981' };
                  return (
                    <div key={p} style={{ background: `${colors[p]}15`, border: `1px solid ${colors[p]}30`, borderRadius: '10px', padding: '16px', textAlign: 'center' }}>
                      <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: colors[p] }}>{count}</div>
                      <div style={{ fontSize: '0.85rem', marginTop: '4px' }}>{p}</div>
                      <div className="text-muted" style={{ fontSize: '0.75rem' }}>{pct}%</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
