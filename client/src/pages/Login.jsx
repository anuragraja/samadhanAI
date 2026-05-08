import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

export default function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await login(formData.email, formData.password);

    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.message);
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

      <form onSubmit={handleSubmit}>
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

        <button
          type="submit"
          className="btn btn-primary w-100"
          disabled={loading}
        >
          {loading ? (
            <>
              <i className="fa-solid fa-spinner fa-spin"></i> Logging in...
            </>
          ) : (
            <>
              <i className="fa-solid fa-sign-in-alt"></i> Login
            </>
          )}
        </button>
      </form>

      <div className="text-center mt-3">
        <p>Don't have an account? <Link to="/register" className="text-primary">Register here</Link></p>
      </div>

      <div className="mt-4 p-3 glass" style={{ fontSize: '0.9rem' }}>
        <strong>Demo Accounts:</strong><br/>
        User: user@example.com / password123<br/>
        Admin: admin@samadhanai.com / admin123
      </div>
    </div>
  );
}