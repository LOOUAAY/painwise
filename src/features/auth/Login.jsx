import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';
import { FaUserInjured, FaUserMd, FaArrowLeft, FaChartLine, FaBell, 
  FaFileMedical, FaComments, FaPills, FaLock, FaEnvelope, FaCheckCircle } from 'react-icons/fa';
import './AuthStyles.css';

// Add some basic styles if AuthStyles.css is not loaded
const defaultStyles = {
  authContainer: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8f9fa',
    padding: '2rem'
  },
  loginCard: {
    background: 'white',
    borderRadius: '20px',
    padding: '2rem',
    maxWidth: '800px',
    width: '90%',
    boxShadow: '0 8px 32px rgba(31, 38, 135, 0.1)',
    border: '1px solid #e2e8f0'
  },
  brandHeader: {
    textAlign: 'center',
    padding: '2rem',
    backgroundColor: '#4F46E5',
    color: 'white'
  },
  logo: {
    fontSize: '2.5rem',
    fontWeight: '700',
    letterSpacing: '2px'
  },
  roleSelection: {
    marginTop: '3rem'
  },
  roleOptions: {
    display: 'flex',
    gap: '2rem'
  },
  roleOption: {
    flex: '1'
  },
  roleBtn: {
    width: '100%',
    padding: '1.5rem',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    backgroundColor: '#f8f9fa'
  },
  roleBtnHover: {
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
  },
  roleIcon: {
    fontSize: '2rem',
    marginBottom: '1rem'
  },
  featuresList: {
    listStyleType: 'none',
    padding: '0',
    marginTop: '1rem'
  },
  featuresListItem: {
    marginBottom: '0.5rem'
  },
  form: {
    marginTop: '2rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.2rem',
  },
  input: {
    padding: '0.8rem',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    fontSize: 16,
  },
  submitBtn: {
    background: '#4F46E5',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    padding: '0.75rem 2.5rem',
    fontWeight: 600,
    fontSize: 18,
    cursor: 'pointer',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
  },
  backBtn: {
    background: 'white',
    color: '#4F46E5',
    border: '1px solid #4F46E5',
    borderRadius: '8px',
    padding: '0.5rem 1.5rem',
    fontWeight: 600,
    fontSize: 16,
    cursor: 'pointer',
    marginTop: '1rem',
    marginBottom: '0.5rem',
  },
  error: {
    color: 'red',
    textAlign: 'center',
    marginTop: 8
  }
};

export default function Login() {
  const navigate = useNavigate();
  const { login, user } = useAuth();
  const location = useLocation();
  const [selectedRole, setSelectedRole] = useState(null);
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [formVisible, setFormVisible] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // If we're coming from a protected route, store that in state
  useEffect(() => {
    if (location.state?.from) {
      localStorage.setItem('redirectPath', location.state.from.pathname);
    }
  }, [location]);

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setForm({ email: '', password: '' });
    setError('');
    setFormVisible(false);
    setTimeout(() => setFormVisible(true), 100);
  };

  const handleBack = () => {
    setSelectedRole(null);
    setForm({ email: '', password: '' });
    setError('');
  };

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      // Use the API service based on the selected role
      let response;
      try {
        response = selectedRole === 'patient' 
          ? await api.login(form)
          : await api.loginDoctor(form);
      } catch (apiError) {
        console.error('API error:', apiError);
        setError('Login failed. Please check your credentials.');
        setLoading(false);
        return;
      }
      
      // Check if we have a successful response with user data
      if (response && response.user) {
        // Call the AuthContext login with role and user data
        const loginSuccess = login(selectedRole, response.user);
        
        if (loginSuccess) {
          // Use replace to prevent back navigation to login page
          const redirectPath = localStorage.getItem('redirectPath');
          if (redirectPath) {
            localStorage.removeItem('redirectPath');
            navigate(redirectPath, { replace: true });
          } else {
            navigate(selectedRole === 'patient' ? '/patient' : '/doctor', { replace: true });
          }
        } else {
          setError('Failed to set user session. Please try again.');
        }
      } else {
        setError('Invalid response from server. Please try again.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Server error. Please try again.');
    }
    setLoading(false);
  };

  // Remove the useEffect that was causing the infinite loop
  // We'll handle navigation only in handleSubmit

  return (
    <div className="auth-container animated-gradient">
      <div className="login-card">
        <div className="brand-header">
          <h1 className="logo">PainWise</h1>
          <p>Chronic Pain Management Platform</p>
        </div>
        
        {!selectedRole ? (
          <div className="role-selection">
            <h3 className="text-center text-xl font-semibold my-6">Select your role to continue</h3>
            
            <div className="role-options">
              {/* Patient Role Option */}
              <div className="role-option">
                <button 
                  className="role-btn patient flat-card"
                  onClick={() => handleRoleSelect('patient')}
                >
                  <div className="role-icon patient-icon">
                    <FaUserInjured size={32} />
                  </div>
                  <h4 className="role-title">Patient</h4>
                </button>
              </div>
              
              {/* Doctor Role Option */}
              <div className="role-option">
                <button 
                  className="role-btn doctor flat-card"
                  onClick={() => handleRoleSelect('doctor')}
                >
                  <div className="role-icon doctor-icon">
                    <FaUserMd size={32} />
                  </div>
                  <h4 className="role-title">Doctor</h4>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className={`login-form ${formVisible ? 'form-animated' : ''}`}>
            <button className="back-button mb-6" onClick={handleBack}>
              <FaArrowLeft className="mr-2" /> Back to role selection
            </button>
            
            {error && <div className="error-message">{error}</div>}
            
            <h3 className="text-center text-xl font-semibold mb-6 text-gray-800">
              {selectedRole === 'patient' ? 'Patient Login' : 'Doctor Login'}
            </h3>
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="email" className="form-label">Email Address</label>
                <div className="input-icon-wrapper">
                  <FaEnvelope className="input-icon" />
                  <input
                    id="email"
                    className="form-input"
                    type="email"
                    name="email"
                    placeholder="Enter your email"
                    value={form.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="password" className="form-label">Password</label>
                <div className="input-icon-wrapper">
                  <FaLock className="input-icon" />
                  <input
                    id="password"
                    className="form-input"
                    type="password"
                    name="password"
                    placeholder="Enter your password"
                    value={form.password}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              
              <div className="flex items-center justify-between my-6">
                <div className="remember-me">
                  <input
                    id="remember-me"
                    type="checkbox"
                    className="remember-checkbox"
                    checked={rememberMe}
                    onChange={() => setRememberMe(!rememberMe)}
                  />
                  <label htmlFor="remember-me" className="remember-label">
                    Remember me
                  </label>
                </div>
                
                <a href="#" className="forgot-password">
                  Forgot password?
                </a>
              </div>
              
              <button 
                type="submit" 
                className={`submit-button ${selectedRole === 'patient' ? 'patient-button' : 'doctor-button'}`}
                disabled={loading}
              >
                {loading ? 'Logging in...' : 'Log In'}
              </button>
            </form>
            
            <div className="text-center mt-6">
              <p className="text-gray-600 mb-4">Don't have an account?</p>
              <button 
                className={`submit-button ${selectedRole === 'patient' ? 'patient-button' : 'doctor-button'}`}
                onClick={() => navigate('/register')}
              >
                Sign Up
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}