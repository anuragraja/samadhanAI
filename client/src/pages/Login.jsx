import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

export default function Login() {
  const [activeTab, setActiveTab] = useState('email'); // 'email' | 'phone'
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [verificationId, setVerificationId] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { login, sendDemoOtp, verifyDemoOtp } = useAuth();
  const navigate = useNavigate();

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    
    const result = await login(formData.email, formData.password);
    if (result.success) {
      setSuccess('Login successful!');
      setTimeout(() => navigate('/dashboard'), 1000);
    } else {
      setError(result.message);
    }
    setLoading(false);
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!phone) {
      setError('Please enter a phone number');
      return;
    }
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const formattedPhone = phone.startsWith('+') ? phone : `+91${phone}`;
      const result = await sendDemoOtp(formattedPhone);
      
      if (result.success) {
        setVerificationId(true);
        // DEMO ONLY: Showing OTP in UI
        setSuccess(`OTP sent successfully! (Demo OTP: ${result.otp})`);
      } else {
        setError(result.message || 'Failed to send OTP');
      }
    } catch (err) {
      setError(err.message || 'Failed to send OTP');
    }
    setLoading(false);
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp) return;
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const formattedPhone = phone.startsWith('+') ? phone : `+91${phone}`;
      const backendResult = await verifyDemoOtp(formattedPhone, otp);

      if (backendResult.success) {
        setSuccess('Phone login successful!');
        setTimeout(() => navigate('/dashboard'), 1000);
      } else {
        setError(backendResult.message);
      }
    } catch (err) {
      setError('Invalid OTP or expired');
    }
    setLoading(false);
  };

  return (
    <div className="glass-card" style={{ maxWidth: '400px', margin: '2rem auto' }}>
      <h2 className="mb-4 text-center"><i className="fa-solid fa-sign-in-alt text-primary"></i> Login to SamadhanAI</h2>

      {error && (
        <div className="alert alert-danger mb-3">
          <i className="fa-solid fa-exclamation-triangle"></i> {error}
        </div>
      )}
      
      {success && (
        <div className="alert alert-success mb-3">
          <i className="fa-solid fa-circle-check"></i> {success}
        </div>
      )}

      <div className="d-flex mb-4 gap-2">
        <button 
          type="button"
          className={`btn flex-grow-1 ${activeTab === 'email' ? 'btn-primary' : 'btn-outline-primary'}`}
          onClick={() => { setActiveTab('email'); setError(''); setSuccess(''); }}
        >
          <i className="fa-solid fa-envelope"></i> Email
        </button>
        <button 
          type="button"
          className={`btn flex-grow-1 ${activeTab === 'phone' ? 'btn-primary' : 'btn-outline-primary'}`}
          onClick={() => { setActiveTab('phone'); setError(''); setSuccess(''); }}
        >
          <i className="fa-solid fa-phone"></i> Phone
        </button>
      </div>

      {activeTab === 'email' ? (
        <form onSubmit={handleEmailSubmit}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-control"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-control"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary w-100" disabled={loading}>
            {loading ? (
              <><i className="fa-solid fa-spinner fa-spin"></i> Logging in...</>
            ) : (
              <><i className="fa-solid fa-sign-in-alt"></i> Login</>
            )}
          </button>
        </form>
      ) : (
        <div className="phone-login-section">
          {!verificationId ? (
            <form onSubmit={handleSendOtp}>
              <div className="form-group">
                <label className="form-label">Mobile Number</label>
                <div className="input-group">
                  <span className="input-group-text">+91</span>
                  <input
                    type="tel"
                    className="form-control"
                    placeholder="Enter 10-digit number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    maxLength={10}
                    pattern="[0-9]{10}"
                  />
                </div>
              </div>
              <button type="submit" className="btn btn-primary w-100" disabled={loading}>
                {loading ? (
                  <><i className="fa-solid fa-spinner fa-spin"></i> Sending OTP...</>
                ) : (
                  <><i className="fa-solid fa-paper-plane"></i> Send OTP</>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp}>
              <div className="form-group">
                <label className="form-label">Enter OTP</label>
                <input
                  type="text"
                  className="form-control text-center"
                  style={{ letterSpacing: '5px', fontSize: '1.2rem' }}
                  placeholder="• • • • • •"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                  maxLength={6}
                />
              </div>
              <button type="submit" className="btn btn-success w-100 mb-2" disabled={loading}>
                {loading ? (
                  <><i className="fa-solid fa-spinner fa-spin"></i> Verifying...</>
                ) : (
                  <><i className="fa-solid fa-check-double"></i> Verify & Login</>
                )}
              </button>
              <button type="button" className="btn btn-link w-100" onClick={() => { setVerificationId(false); setOtp(''); }}>
                Change Phone Number
              </button>
            </form>
          )}
        </div>
      )}

      <div className="text-center mt-3">
        <p>Don't have an account? <Link to="/register" className="text-primary">Register here</Link></p>
      </div>
    </div>
  );
}