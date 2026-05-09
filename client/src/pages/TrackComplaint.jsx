import { useState, useEffect } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const STATUS_STEPS  = ['Submitted', 'Under Review', 'In Progress', 'Resolved'];
const STATUS_COLORS = { Resolved:'#10b981', 'In Progress':'#f59e0b', Submitted:'#3b82f6', 'Under Review':'#8b5cf6', Rejected:'#ef4444' };
const PRIORITY_COLORS = { Emergency:'#ef4444', Urgent:'#f87171', High:'#f59e0b', Normal:'#3b82f6', Low:'#10b981' };

export default function TrackComplaint() {
  const [complaints, setComplaints] = useState([]);
  const [selected, setSelected]     = useState(null);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');
  const [filter, setFilter]         = useState('All');
  const [error, setError]           = useState('');

  useEffect(() => { fetchComplaints(); }, []);

  const fetchComplaints = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/complaints');
      if (res.data.success) {
        setComplaints(res.data.data);
        if (res.data.data.length > 0) setSelected(res.data.data[0]);
      }
    } catch { setError('Could not load complaints. Make sure you are logged in.'); }
    finally { setLoading(false); }
  };

  const filtered = complaints.filter(c => {
    const matchSearch = !search || c.title.toLowerCase().includes(search.toLowerCase()) || c._id.includes(search);
    const matchFilter = filter === 'All' || c.status === filter;
    return matchSearch && matchFilter;
  });

  const stepIdx = (status) => {
    const i = STATUS_STEPS.indexOf(status);
    return i === -1 ? 0 : i;
  };

  if (loading) return (
    <div style={{ display:'flex', justifyContent:'center', alignItems:'center', height:'50vh', flexDirection:'column', gap:'1rem' }}>
      <div style={{ width:'50px', height:'50px', borderRadius:'50%', border:'3px solid var(--secondary)', borderTopColor:'transparent', animation:'spin 0.8s linear infinite' }}></div>
      <p className="text-muted">Loading complaints...</p>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <div>
      {/* Search bar */}
      <div className="glass-card mb-3 fade-in">
        <h2 className="mb-3"><i className="fa-solid fa-route text-secondary"></i> Track Your Complaints</h2>
        {error && <div className="alert alert-danger">{error}</div>}
        <div className="d-flex gap-2" style={{ flexWrap:'wrap' }}>
          <input className="form-control" style={{ flex:1, minWidth:'200px' }} placeholder="Search by ID or title..."
            value={search} onChange={e => setSearch(e.target.value)} />
          <select className="form-control" style={{ width:'160px' }} value={filter} onChange={e => setFilter(e.target.value)}>
            {['All','Submitted','Under Review','In Progress','Resolved','Rejected'].map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {complaints.length === 0 ? (
        <div className="glass-card text-center py-5">
          <i className="fa-solid fa-inbox fa-4x text-muted mb-3"></i>
          <h4>No complaints filed yet</h4>
          <p className="text-muted mb-3">Start by raising your first complaint.</p>
          <a href="/raise" className="btn btn-primary"><i className="fa-solid fa-plus"></i> Raise Complaint</a>
        </div>
      ) : (
        <div className="grid-2 fade-in" style={{ alignItems:'start' }}>
          {/* List panel */}
          <div className="glass-card" style={{ maxHeight:'620px', overflowY:'auto' }}>
            <h4 className="mb-3" style={{ fontSize:'1rem' }}>
              <i className="fa-solid fa-list text-primary"></i> Complaints
              <span className="chip ms-2" style={{ fontSize:'0.7rem', background:'rgba(30,144,255,0.15)', color:'var(--secondary)' }}>{filtered.length}</span>
            </h4>
            {filtered.length === 0 && <p className="text-muted text-center py-3">No matching complaints.</p>}
            {filtered.map(c => (
              <div key={c._id} onClick={() => setSelected(c)}
                className="glass mb-2 fade-in"
                style={{ borderRadius:'10px', padding:'12px', cursor:'pointer', transition:'all 0.2s',
                  border: selected?._id === c._id ? '1px solid var(--primary)' : '1px solid transparent',
                  background: selected?._id === c._id ? 'rgba(255,106,61,0.08)' : 'rgba(255,255,255,0.03)'
                }}
                onMouseEnter={e => { if(selected?._id !== c._id) e.currentTarget.style.background='rgba(255,255,255,0.05)'; }}
                onMouseLeave={e => { if(selected?._id !== c._id) e.currentTarget.style.background='rgba(255,255,255,0.03)'; }}
              >
                <div className="d-flex justify-between align-center mb-1">
                  <strong style={{ fontSize:'0.9rem', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', flex:1 }}>{c.title}</strong>
                  <span style={{ background:STATUS_COLORS[c.status]||'#6b7280', color:'#fff', padding:'2px 8px', borderRadius:'20px', fontSize:'0.7rem', fontWeight:'bold', flexShrink:0, marginLeft:'8px' }}>
                    {c.status}
                  </span>
                </div>
                <div className="text-muted" style={{ fontSize:'0.75rem', display:'flex', gap:'10px', flexWrap:'wrap' }}>
                  <span><i className="fa-solid fa-building"></i> {c.department}</span>
                  <span><i className="fa-regular fa-clock"></i> {new Date(c.createdAt).toLocaleDateString()}</span>
                  <span style={{ color: PRIORITY_COLORS[c.priority] || 'inherit' }}>
                    <i className="fa-solid fa-flag"></i> {c.priority}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Detail panel */}
          {selected && (
            <div className="glass-card fade-in">
              {/* Header */}
              <div className="d-flex justify-between align-center mb-3">
                <h3 style={{ margin:0, fontSize:'1.2rem' }}>{selected.title}</h3>
                <span style={{ background:STATUS_COLORS[selected.status], color:'#fff', padding:'5px 14px', borderRadius:'20px', fontWeight:'bold', fontSize:'0.85rem', flexShrink:0, marginLeft:'10px' }}>
                  {selected.status}
                </span>
              </div>

              {/* ID */}
              <div className="mb-3" style={{ fontSize:'0.8rem', color:'var(--text-muted)' }}>
                ID: <code style={{ background:'rgba(255,255,255,0.08)', padding:'2px 8px', borderRadius:'4px', fontSize:'0.8rem' }}>{selected._id}</code>
              </div>

              {/* Progress stepper */}
              {selected.status !== 'Rejected' && (
                <div className="mb-3">
                  <div style={{ position:'relative', height:'8px', background:'rgba(255,255,255,0.1)', borderRadius:'4px', marginBottom:'12px' }}>
                    <div style={{ position:'absolute', top:0, left:0, height:'100%', borderRadius:'4px', background:'linear-gradient(90deg, var(--primary), var(--secondary))', width:`${(stepIdx(selected.status) / (STATUS_STEPS.length - 1)) * 100}%`, transition:'width 1s ease' }}></div>
                    {STATUS_STEPS.map((step, i) => (
                      <div key={step} style={{ position:'absolute', top:'50%', transform:'translate(-50%,-50%)', left:`${(i / (STATUS_STEPS.length - 1)) * 100}%`, width:'22px', height:'22px', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.7rem',
                        background: i <= stepIdx(selected.status) ? (selected.status === 'Resolved' ? '#10b981' : 'var(--secondary)') : 'var(--bg-darker)',
                        border: `2px solid ${i <= stepIdx(selected.status) ? (selected.status === 'Resolved' ? '#10b981' : 'var(--secondary)') : 'rgba(255,255,255,0.2)'}`,
                        color: i <= stepIdx(selected.status) ? '#fff' : 'transparent'
                      }}>
                        <i className={`fa-solid ${i < stepIdx(selected.status) || selected.status === 'Resolved' ? 'fa-check' : i === stepIdx(selected.status) ? 'fa-spinner fa-spin' : 'fa-circle'}`}></i>
                      </div>
                    ))}
                  </div>
                  <div className="d-flex justify-between text-muted" style={{ fontSize:'0.68rem' }}>
                    {STATUS_STEPS.map(s => <span key={s}>{s}</span>)}
                  </div>
                </div>
              )}

              {selected.status === 'Rejected' && (
                <div className="alert alert-danger mb-3"><i className="fa-solid fa-ban"></i> This complaint was rejected.</div>
              )}

              {/* Meta info */}
              <div className="grid-2 mb-3" style={{ gap:'12px' }}>
                {[
                  { icon:'fa-building', label:'Department', value:selected.department, color:'var(--secondary)' },
                  { icon:'fa-flag', label:'Priority', value:selected.priority, color:PRIORITY_COLORS[selected.priority] },
                  { icon:'fa-location-dot', label:'Location', value:selected.location?.split(',')[0], color:'var(--danger)' },
                  { icon:'fa-calendar', label:'Filed On', value:new Date(selected.createdAt).toLocaleString(), color:'var(--text-muted)' },
                ].map(m => (
                  <div key={m.label} style={{ background:'rgba(255,255,255,0.03)', padding:'10px', borderRadius:'8px' }}>
                    <div className="text-muted" style={{ fontSize:'0.72rem', marginBottom:'4px' }}>{m.label}</div>
                    <div style={{ fontSize:'0.85rem', color:m.color, fontWeight:'500', display:'flex', alignItems:'center', gap:'5px' }}>
                      <i className={`fa-solid ${m.icon}`}></i> {m.value}
                    </div>
                  </div>
                ))}
              </div>

              {/* Description */}
              <div className="mb-3">
                <h5 className="mb-1 text-muted" style={{ fontSize:'0.8rem' }}>DESCRIPTION</h5>
                <p style={{ lineHeight:'1.7', fontSize:'0.9rem' }}>{selected.description}</p>
              </div>

              {/* Map preview if lat/lng */}
              {selected.lat && selected.lng && (
                <div className="mb-3">
                  <h5 className="mb-2 text-muted" style={{ fontSize:'0.8rem' }}><i className="fa-solid fa-map-location-dot text-danger"></i> LOCATION MAP</h5>
                  <div style={{ height:'200px', borderRadius:'10px', overflow:'hidden', border:'1px solid rgba(255,255,255,0.1)' }}>
                    <MapContainer center={[selected.lat, selected.lng]} zoom={15} style={{ height:'100%', width:'100%' }} zoomControl={false}>
                      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                      <Marker position={[selected.lat, selected.lng]} />
                    </MapContainer>
                  </div>
                </div>
              )}

              {/* Resolution note */}
              {selected.resolution && (
                <div className="p-3 mb-3 glass" style={{ borderRadius:'8px', borderLeft:'3px solid var(--success)' }}>
                  <strong className="text-success"><i className="fa-solid fa-check-circle"></i> Resolution:</strong>
                  <p style={{ marginTop:'6px', fontSize:'0.9rem' }}>{selected.resolution}</p>
                </div>
              )}

              {/* Timeline */}
              {selected.timeline?.length > 0 && (
                <div>
                  <h5 className="mb-2 text-muted" style={{ fontSize:'0.8rem' }}>ACTIVITY TIMELINE</h5>
                  <ul className="timeline">
                    {[...selected.timeline].reverse().map((t, i) => (
                      <li key={i} className="timeline-item">
                        <div className={`timeline-dot ${t.status === 'Resolved' ? 'resolved' : t.status === 'Rejected' ? 'rejected' : ''}`}>
                          <i className={`fa-solid ${t.status === 'Resolved' ? 'fa-check' : t.status === 'Rejected' ? 'fa-times' : 'fa-circle'}`} style={{ fontSize:'0.65rem' }}></i>
                        </div>
                        <div className="timeline-body">
                          <div className="timeline-status">{t.status}</div>
                          <div className="timeline-note">{t.note}</div>
                          <div className="timeline-time">{t.changedByName} • {new Date(t.timestamp).toLocaleString()}</div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Images */}
              {selected.images?.length > 0 && (
                <div className="mt-3">
                  <h5 className="mb-2 text-muted" style={{ fontSize:'0.8rem' }}>ATTACHMENTS ({selected.images.length})</h5>
                  <div className="d-flex" style={{ gap:'8px', flexWrap:'wrap' }}>
                    {selected.images.map((img, i) => (
                      <a key={i} href={`http://localhost:5000/uploads/${img}`} target="_blank" rel="noreferrer">
                        <img src={`http://localhost:5000/uploads/${img}`} alt={`Attachment ${i+1}`} style={{ width:'80px', height:'64px', objectFit:'cover', borderRadius:'6px', border:'1px solid rgba(255,255,255,0.15)', transition:'transform 0.2s' }}
                          onMouseEnter={e => e.target.style.transform='scale(1.05)'}
                          onMouseLeave={e => e.target.style.transform='scale(1)'}
                        />
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
