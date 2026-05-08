import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function RaiseComplaint() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: ''
  });
  const [images, setImages] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [step, setStep] = useState(0);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter(file => {
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'video/mp4', 'video/mov', 'video/avi'];
      const maxSize = 10 * 1024 * 1024; // 10MB

      if (!allowedTypes.includes(file.type)) {
        setError('Invalid file type. Only images and videos are allowed.');
        return false;
      }

      if (file.size > maxSize) {
        setError('File size too large. Maximum 10MB allowed.');
        return false;
      }

      return true;
    });

    if (validFiles.length + images.length > 5) {
      setError('Maximum 5 files allowed.');
      return;
    }

    setImages(prev => [...prev, ...validFiles]);
    setError('');
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setProcessing(true);
    setError('');
    setStep(1);

    try {
      // AI Simulation Steps
      setStep(2);
      await new Promise(r => setTimeout(r, 1000));
      setStep(3);
      await new Promise(r => setTimeout(r, 1000));
      setStep(4);
      await new Promise(r => setTimeout(r, 1000));

      // Create FormData for file upload
      const submitData = new FormData();
      submitData.append('title', formData.title);
      submitData.append('description', formData.description);
      submitData.append('location', formData.location);

      // Append images
      images.forEach((image, index) => {
        submitData.append('images', image);
      });

      // API call to backend
      const res = await axios.post('http://localhost:5000/api/complaints', submitData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (res.data.success) {
        navigate('/dashboard');
      } else {
        setError('Failed to submit complaint. Please try again.');
      }
    } catch (err) {
      console.error('Failed to post complaint:', err);
      setError(err.response?.data?.message || 'Failed to submit complaint. Please try again.');
    } finally {
      setProcessing(false);
      setStep(0);
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
            <div className={`processing-step ${step >= 1 ? 'active' : ''}`}>
              <i className={`fa-solid ${step >= 1 ? 'fa-check' : 'fa-spinner fa-spin'}`}></i>
              <span>{step >= 1 ? 'Language parsed (English)' : 'Understanding language...'}</span>
            </div>
            <div className={`processing-step ${step >= 2 ? 'active' : ''}`}>
              <i className={`fa-solid ${step >= 2 ? 'fa-check' : 'fa-circle-notch'}`}></i>
              <span>{step >= 2 ? 'Issue Detected' : 'Detecting issue...'}</span>
            </div>
            <div className={`processing-step ${step >= 3 ? 'active' : ''}`}>
              <i className={`fa-solid ${step >= 3 ? 'fa-check' : 'fa-circle-notch'}`}></i>
              <span>{step >= 3 ? 'Department Found' : 'Finding department...'}</span>
            </div>
            <div className={`processing-step ${step >= 4 ? 'active' : ''}`}>
              <i className={`fa-solid ${step >= 4 ? 'fa-check' : 'fa-circle-notch'}`}></i>
              <span>{step >= 4 ? 'Priority Set' : 'Setting priority...'}</span>
            </div>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h2 className="mb-3">
        <i className="fa-solid fa-pen-to-square text-primary"></i> Raise a Complaint
      </h2>
      <p className="text-muted mb-4">Our AI will automatically analyze your issue and route it to the right department.</p>

      {error && (
        <div className="alert alert-danger mb-3">
          <i className="fa-solid fa-exclamation-triangle"></i> {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid-2">
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              className="form-control"
              defaultValue={user?.name || ''}
              readOnly
            />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-control"
              defaultValue={user?.email || ''}
              readOnly
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Location</label>
          <div className="d-flex gap-2">
            <input
              type="text"
              className="form-control"
              placeholder="Enter location or use auto-detect"
              value={formData.location}
              onChange={e => setFormData({...formData, location: e.target.value})}
              required
            />
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setFormData({...formData, location: 'MG Road, Sector 14, Gurugram'})}
            >
              <i className="fa-solid fa-location-crosshairs"></i>
            </button>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Complaint Title</label>
          <input
            type="text"
            className="form-control"
            placeholder="e.g. Broken water pipe on Main Street"
            value={formData.title}
            onChange={e => setFormData({...formData, title: e.target.value})}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Description</label>
          <textarea
            className="form-control"
            placeholder="Describe the issue in detail. Include any relevant information that will help us resolve your complaint faster."
            value={formData.description}
            onChange={e => setFormData({...formData, description: e.target.value})}
            required
            rows="4"
          ></textarea>
        </div>

        <div className="form-group">
          <label className="form-label">Photo/Video Evidence (Optional)</label>
          <div className="upload-area" onClick={() => document.getElementById('image-upload').click()}>
            <i className="fa-solid fa-cloud-arrow-up upload-icon"></i>
            <p>Click to upload photos/videos</p>
            <small className="text-muted">Max 5 files, 10MB each. Supported: JPG, PNG, GIF, MP4, MOV, AVI</small>
          </div>
          <input
            id="image-upload"
            type="file"
            multiple
            accept="image/*,video/*"
            onChange={handleImageChange}
            style={{ display: 'none' }}
          />

          {images.length > 0 && (
            <div className="image-preview mt-3">
              <h4>Selected Files ({images.length}/5):</h4>
              <div className="d-flex flex-wrap gap-2">
                {images.map((image, index) => (
                  <div key={index} className="image-item">
                    <div className="image-preview-item">
                      {image.type.startsWith('image/') ? (
                        <img
                          src={URL.createObjectURL(image)}
                          alt={`Preview ${index + 1}`}
                          style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '4px' }}
                        />
                      ) : (
                        <div className="video-preview">
                          <i className="fa-solid fa-video"></i>
                          <span>{image.name}</span>
                        </div>
                      )}
                      <button
                        type="button"
                        className="btn btn-danger btn-sm remove-image"
                        onClick={() => removeImage(index)}
                      >
                        <i className="fa-solid fa-times"></i>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="d-flex gap-2 mt-4">
          <button type="submit" className="btn btn-primary w-100">
            <i className="fa-solid fa-paper-plane"></i> Submit to AI Analyzer
          </button>
        </div>
      </form>
    </div>
  );
}
