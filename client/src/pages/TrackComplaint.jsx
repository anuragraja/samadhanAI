import { useState } from 'react';

export default function TrackComplaint() {
  const [showPhotoVerif, setShowPhotoVerif] = useState(false);

  if (showPhotoVerif) {
    return (
      <div className="glass-card" style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h2 className="mb-4"><i className="fa-solid fa-shield-halved text-success"></i> AI Image Verification</h2>
        
        <div className="grid-2">
            <div>
                <div style={{ background: '#000', height: '250px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid var(--success)', position: 'relative' }}>
                    <i className="fa-solid fa-image" style={{ fontSize: '4rem', color: '#333' }}></i>
                    <div style={{ position: 'absolute', top: '10px', right: '10px', background: 'var(--success)', padding: '5px 10px', borderRadius: '4px', fontSize: '0.8rem' }}>Genuine</div>
                    <div style={{ position: 'absolute', width: '100px', height: '100px', border: '2px dashed var(--primary)', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                        <span style={{ background: 'var(--primary)', color: '#fff', fontSize: '0.7rem', padding: '2px 4px', position: 'absolute', top: '-20px' }}>Leak Detected</span>
                    </div>
                </div>
            </div>
            <div>
                <h3 className="mb-3">AI Analysis Report</h3>
                <div className="mb-2"><strong className="text-muted">Confidence:</strong> <span className="text-success">98.5%</span></div>
                <div className="mb-2"><strong className="text-muted">Detected Issue:</strong> Major Water Pipe Leak</div>
                <div className="mb-2"><strong className="text-muted">Severity Meter:</strong> <span className="text-danger">High (8/10)</span></div>
                <div className="mb-2"><strong className="text-muted">Spam Check:</strong> Passed</div>
                
                <div className="mt-4 p-3 glass" style={{ borderRadius: '8px' }}>
                    <p style={{ fontSize: '0.9rem' }}>"Is your issue resolved?" (Citizen Approval Required)</p>
                    <div className="d-flex gap-2 mt-2">
                        <button className="btn btn-primary btn-sm" disabled>Yes (Awaiting Fix)</button>
                        <button className="btn btn-outline btn-sm" disabled>No</button>
                    </div>
                </div>
            </div>
        </div>
        <button className="btn btn-outline mt-4" onClick={() => setShowPhotoVerif(false)}>Back to Tracking</button>
      </div>
    );
  }

  return (
    <div className="glass-card" style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h2 className="mb-4"><i className="fa-solid fa-route text-secondary"></i> Track Complaint</h2>
        
        <div className="d-flex gap-2 mb-4">
            <input type="text" className="form-control" placeholder="Enter Complaint ID (e.g. C1205)" defaultValue="C1205" />
            <button className="btn btn-secondary">Track</button>
        </div>

        <div className="glass p-4" style={{ borderRadius: '12px', background: 'rgba(0,0,0,0.2)' }}>
            <div className="d-flex justify-between align-center mb-4">
                <h3>Status for C1205</h3>
                <span className="chip" style={{ background: 'var(--warning)', color: '#000' }}>In Progress</span>
            </div>
            
            <div className="progress-container">
                <div className="progress-bar-wrapper">
                    <div className="progress-bar" style={{ width: '75%' }}></div>
                    <div className="progress-steps">
                        <div className="step-dot completed"><i className="fa-solid fa-check"></i></div>
                        <div className="step-dot completed"><i className="fa-solid fa-check"></i></div>
                        <div className="step-dot completed"><i className="fa-solid fa-check"></i></div>
                        <div className="step-dot active"><i className="fa-solid fa-spinner fa-spin"></i></div>
                        <div className="step-dot"><i className="fa-solid fa-check"></i></div>
                    </div>
                </div>
                <div className="d-flex justify-between text-muted" style={{ fontSize: '0.8rem', marginTop: '15px' }}>
                    <span>Submitted</span>
                    <span>Reviewed</span>
                    <span>Assigned</span>
                    <span className="text-secondary">Working</span>
                    <span>Resolved</span>
                </div>
            </div>

            <div className="mt-4">
                <h4>Live Activity Feed</h4>
                <div className="mt-3" style={{ borderLeft: '2px solid rgba(255,255,255,0.1)', paddingLeft: '15px' }}>
                    <div className="mb-3">
                        <strong className="text-light">Officer Assigned</strong><br/>
                        <small className="text-muted">Today, 10:30 AM - Officer Ramesh from Water Dept is on the way.</small>
                    </div>
                    <div className="mb-3">
                        <strong className="text-light">AI Verification Complete</strong><br/>
                        <small className="text-muted">Yesterday, 04:15 PM - Image confirmed as genuine.</small>
                    </div>
                    <div>
                        <strong className="text-light">Complaint Registered</strong><br/>
                        <small className="text-muted">Yesterday, 04:10 PM - System logged C1205.</small>
                    </div>
                </div>
            </div>

            <button className="btn btn-outline w-100 mt-4" onClick={() => setShowPhotoVerif(true)}>View AI Verification Details</button>
        </div>
    </div>
  );
}
