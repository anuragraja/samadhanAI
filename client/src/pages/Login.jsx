import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

export default function Login() {
  const [activeTab, setActiveTab] = useState('email'); // 'email' | 'phone'
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [verificationId, setVerificationId] = useState(null);
  
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
    <div className="login-container d-flex align-items-center justify-content-center py-5" style={{ minHeight: '80vh', background: 'linear-gradient(135deg, rgba(255,152,0,0.1), rgba(33,150,243,0.1))' }}>
      <div className="glass-card shadow-lg" style={{ maxWidth: '450px', width: '100%', borderRadius: '20px', overflow: 'hidden', backgroundColor: 'rgba(255, 255, 255, 0.95)', border: '1px solid rgba(255,255,255,0.4)', backdropFilter: 'blur(10px)' }}>
        
        <div className="card-header border-0 text-center p-4" style={{ background: 'linear-gradient(90deg, #FF9800, #2196F3)', color: 'white' }}>
          <h3 className="mb-0 fw-bold" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.2)' }}><i className="fa-solid fa-shield-halved me-2"></i>SamadhanAI Login</h3>
          <p className="mb-0 mt-2 opacity-75">Access your civic dashboard</p>
        </div>

        <div className="card-body p-4 p-md-5">
          {error && <div className="alert alert-danger border-0 border-start border-danger border-4 shadow-sm py-2 px-3"><i className="fa-solid fa-triangle-exclamation me-2"></i>{error}</div>}
          {success && <div className="alert alert-success border-0 border-start border-success border-4 shadow-sm py-2 px-3"><i className="fa-solid fa-circle-check me-2"></i>{success}</div>}
          
          <div className="d-flex mb-4 gap-2 border-bottom pb-2">
            <button 
              type="button"
              className={`btn flex-grow-1 fw-bold ${activeTab === 'email' ? 'btn-primary shadow-sm' : 'btn-light text-muted'}`}
              onClick={() => { setActiveTab('email'); setError(''); setSuccess(''); }}
              style={{ borderRadius: '10px', transition: 'all 0.3s' }}
            >
              <i className="fa-solid fa-envelope me-2"></i>Email
            </button>
            <button 
              type="button"
              className={`btn flex-grow-1 fw-bold ${activeTab === 'phone' ? 'btn-primary shadow-sm' : 'btn-light text-muted'}`}
              onClick={() => { setActiveTab('phone'); setError(''); setSuccess(''); }}
              style={{ borderRadius: '10px', transition: 'all 0.3s' }}
            >
              <i className="fa-solid fa-phone me-2"></i>Phone
            </button>
          </div>

          {activeTab === 'email' ? (
            <form onSubmit={handleEmailSubmit}>
              <div className="form-group mb-3">
                <label className="form-label text-muted fw-bold small text-uppercase" style={{ letterSpacing: '1px' }}>Email Address</label>
                <div className="input-group input-group-lg shadow-sm" style={{ borderRadius: '12px', overflow: 'hidden' }}>
                  <span className="input-group-text bg-light border-0"><i className="fa-solid fa-at text-primary opacity-75"></i></span>
                  <input
                    type="email"
                    className="form-control border-0 bg-light shadow-none ps-0"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="form-group mb-4">
                <label className="form-label text-muted fw-bold small text-uppercase" style={{ letterSpacing: '1px' }}>Password</label>
                <div className="input-group input-group-lg shadow-sm" style={{ borderRadius: '12px', overflow: 'hidden' }}>
                  <span className="input-group-text bg-light border-0"><i className="fa-solid fa-lock text-primary opacity-75"></i></span>
                  <input
                    type="password"
                    className="form-control border-0 bg-light shadow-none ps-0"
                    placeholder="Enter password"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    required
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-primary btn-lg w-100 fw-bold shadow-sm mb-3" disabled={loading} style={{ borderRadius: '12px', background: 'linear-gradient(90deg, #2196F3, #1976D2)', border: 'none' }}>
                {loading ? <><i className="fa-solid fa-circle-notch fa-spin me-2"></i>Logging in...</> : <><i className="fa-solid fa-arrow-right-to-bracket me-2"></i>Login Securely</>}
              </button>
            </form>
          ) : (
            <div className="phone-login-section">
              
              {!verificationId ? (
                <form onSubmit={handleSendOtp}>
                  <div className="form-group mb-4">
                    <label className="form-label text-muted fw-bold small text-uppercase" style={{ letterSpacing: '1px' }}>Mobile Number</label>
                    <div className="input-group input-group-lg shadow-sm" style={{ borderRadius: '12px', overflow: 'hidden' }}>
                      <span className="input-group-text bg-light border-0 fw-bold text-primary opacity-75">+91</span>
                      <input
                        type="tel"
                        className="form-control border-0 bg-light shadow-none ps-0"
                        placeholder="Enter 10-digit number"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        required
                        maxLength={10}
                        pattern="[0-9]{10}"
                      />
                    </div>
                  </div>
                  <button type="submit" className="btn btn-primary btn-lg w-100 fw-bold shadow-sm mb-3" disabled={loading} style={{ borderRadius: '12px', background: 'linear-gradient(90deg, #FF9800, #F57C00)', border: 'none' }}>
                    {loading ? <><i className="fa-solid fa-circle-notch fa-spin me-2"></i>Sending OTP...</> : <><i className="fa-solid fa-paper-plane me-2"></i>Send OTP</>}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp}>
                  <div className="form-group mb-4">
                    <label className="form-label text-muted fw-bold small text-uppercase" style={{ letterSpacing: '1px' }}>Enter OTP</label>
                    <div className="input-group input-group-lg shadow-sm" style={{ borderRadius: '12px', overflow: 'hidden' }}>
                      <span className="input-group-text bg-light border-0"><i className="fa-solid fa-key text-primary opacity-75"></i></span>
                      <input
                        type="text"
                        className="form-control border-0 bg-light shadow-none ps-0 text-center fw-bold"
                        style={{ letterSpacing: '5px', fontSize: '1.2rem' }}
                        placeholder="• • • • • •"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        required
                        maxLength={6}
                      />
                    </div>
                  </div>
                  <button type="submit" className="btn btn-success btn-lg w-100 fw-bold shadow-sm mb-2" disabled={loading} style={{ borderRadius: '12px', border: 'none' }}>
                    {loading ? <><i className="fa-solid fa-circle-notch fa-spin me-2"></i>Verifying...</> : <><i className="fa-solid fa-check-double me-2"></i>Verify & Login</>}
                  </button>
                  <button type="button" className="btn btn-link w-100 text-decoration-none text-muted" onClick={() => { setVerificationId(null); setOtp(''); }}>
                    Change Phone Number
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Google Login Hidden for now 
          <div className="position-relative my-4">
            <hr className="text-muted opacity-25" />
            <span className="position-absolute top-50 start-50 translate-middle bg-white px-3 text-muted small fw-bold text-uppercase" style={{ borderRadius: '10px' }}>Or Continue With</span>
          </div>

          <button 
            type="button" 
            className="btn btn-outline-dark btn-lg w-100 fw-bold shadow-sm d-flex align-items-center justify-content-center gap-2 mb-2" 
            onClick={() => {}} 
            disabled={true}
            style={{ borderRadius: '12px', border: '2px solid #e0e0e0', transition: 'all 0.3s' }}
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" style={{ width: '24px' }} />
            Google
          </button>
          */}

          <div className="text-center mt-4">
            <p className="text-muted mb-0">Don't have an account? <Link to="/register" className="text-primary fw-bold text-decoration-none ms-1" style={{ transition: 'all 0.2s' }}>Register Now</Link></p>
          </div>

        </div>
      </div>
    </div>
  );
}