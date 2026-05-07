import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function RaiseComplaint() {
  const [formData, setFormData] = useState({ title: '', description: '', location: '' });
  const [processing, setProcessing] = useState(false);
  const [step, setStep] = useState(0);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setProcessing(true);

    // AI Simulation Steps
    setStep(1);
    await new Promise(r => setTimeout(r, 1000));
    setStep(2);
    await new Promise(r => setTimeout(r, 1000));
    setStep(3);
    await new Promise(r => setTimeout(r, 1000));
    setStep(4);
    await new Promise(r => setTimeout(r, 1000));

    try {
      // API call to Node Backend
      const res = await axios.post('http://localhost:5000/api/complaints', formData);
      console.log('Complaint created:', res.data);
      navigate('/dashboard'); // Could go to success screen
    } catch (err) {
      console.error('Failed to post complaint:', err);
      // Fallback for demonstration if node server isn't running
      navigate('/dashboard'); 
    }
  };

  if (processing) {
    return (
      <div className="glass-card ai-processing" style={{ maxWidth: '600px', margin: '0 auto' }}>
        <div className="scan-container">
            <i className="fa-solid fa-brain"></i>
            <div className="scan-line"></div>
        </div>
        <h2 className="mb-4">AI is analyzing your complaint...</h2>
        <div style={{ textAlign: 'left', maxWidth: '300px', margin: '0 auto' }}>
            <div className={`processing-step ${step >= 1 ? 'active' : ''}`}><i className={`fa-solid ${step >= 1 ? 'fa-check' : 'fa-spinner fa-spin'}`}></i> <span>{step >= 1 ? 'Language parsed (English)' : 'Understanding language...'}</span></div>
            <div className={`processing-step ${step >= 2 ? 'active' : ''}`}><i className={`fa-solid ${step >= 2 ? 'fa-check' : 'fa-circle-notch'}`}></i> <span>{step >= 2 ? 'Issue Detected' : 'Detecting issue...'}</span></div>
            <div className={`processing-step ${step >= 3 ? 'active' : ''}`}><i className={`fa-solid ${step >= 3 ? 'fa-check' : 'fa-circle-notch'}`}></i> <span>{step >= 3 ? 'Department Found' : 'Finding department...'}</span></div>
            <div className={`processing-step ${step >= 4 ? 'active' : ''}`}><i className={`fa-solid ${step >= 4 ? 'fa-check' : 'fa-circle-notch'}`}></i> <span>{step >= 4 ? 'Priority Set' : 'Setting priority...'}</span></div>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h2 className="mb-3"><i className="fa-solid fa-pen-to-square text-primary"></i> Raise a Complaint</h2>
      <p className="text-muted mb-4">Our AI will automatically analyze your issue.</p>
      
      <form onSubmit={handleSubmit}>
          <div className="grid-2">
              <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input type="text" className="form-control" defaultValue="John Doe" required />
              </div>
              <div className="form-group">
                  <label className="form-label">Mobile Number</label>
                  <input type="tel" className="form-control" defaultValue="+91 9876543210" required />
              </div>
          </div>
          
          <div className="form-group">
              <label className="form-label">Location</label>
              <div className="d-flex gap-2">
                  <input type="text" className="form-control" placeholder="Auto-detecting..." value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} required />
                  <button type="button" className="btn btn-secondary" onClick={() => setFormData({...formData, location: 'MG Road, Sector 14'})}><i className="fa-solid fa-location-crosshairs"></i></button>
              </div>
          </div>

          <div className="form-group">
              <label className="form-label">Complaint Title</label>
              <input type="text" className="form-control" placeholder="e.g. Broken water pipe" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
          </div>

          <div className="form-group">
              <label className="form-label">Description</label>
              <textarea className="form-control" placeholder="Describe the issue in detail..." value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} required></textarea>
          </div>

          <div className="form-group">
              <label className="form-label">Photo/Video Proof (AI Verified)</label>
              <div className="upload-area">
                  <i className="fa-solid fa-cloud-arrow-up upload-icon"></i>
                  <p>Drag & Drop or Click to Upload</p>
                  <small className="text-muted">Max size: 10MB</small>
              </div>
          </div>

          <div className="d-flex gap-2 mt-4">
              <button type="submit" className="btn btn-primary w-100">Submit to AI Analyzer</button>
              <button type="button" className="btn btn-outline w-100"><i className="fa-solid fa-microphone"></i> Voice Complaint</button>
          </div>
      </form>
    </div>
  );
}
