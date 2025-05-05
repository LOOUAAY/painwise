import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Navigation.css';
import { useEffect, useState } from 'react';
import { FaBars, FaTimes, FaUserMd, FaChartLine, FaCalendarAlt, FaComments, 
  FaPrescriptionBottle, FaSignOutAlt, FaTachometerAlt, FaCog, FaClipboardList, 
  FaHome, FaNotesMedical, FaHeartbeat, FaUser, FaBell } from 'react-icons/fa';
import { api } from '../services/api';

export default function Navigation() {
  const { user, logout } = useAuth();
  const [doctorName, setDoctorName] = useState('');
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const fetchDoctor = async () => {
      if (user && user.role === 'patient' && user.doctor_id) {
        try {
          console.log('Fetching doctor information for doctor_id:', user.doctor_id);
          const data = await api.getDoctors();
          console.log('Doctor data response:', data);
          if (data.success) {
            const doctor = data.data.find(doc => String(doc.id) === String(user.doctor_id));
            console.log('Found doctor:', doctor);
            if (doctor) setDoctorName(doctor.name);
          }
        } catch (err) {
          console.error('Failed to fetch doctor:', err);
          setDoctorName('');
        }
      }
    };
    fetchDoctor();
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (isMenuOpen && 
          !e.target.closest('.nav-menu') && 
          !e.target.closest('.hamburger-menu')) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMenuOpen]);

  if (!user) {
    return null;
  }

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path);
  };

  return (
    <nav className="navbar-container">
      <div className="navbar">
        <div className="navbar-brand">
          <Link to={user.role === 'doctor' ? '/doctor' : '/patient'} className="navbar-brand-link">
            <span role="img" aria-label="logo" className="navbar-logo-icon">💊</span>
            <span className="navbar-logo-text">PainWise</span>
          </Link>
        </div>

        <button 
          className="hamburger-menu"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
        </button>

        <div className={`nav-menu ${isMenuOpen ? 'open' : ''}`}>
          <div className="user-info">
            <span className="welcome-message">
              Welcome, {user.role === 'doctor' ? `Dr. ${user.name || user.email.split('@')[0]}` : 'Patient'}
            </span>
            {user.role === 'patient' && user.doctor_id && doctorName && (
              <span className="assigned-doctor">
                Your Doctor: {doctorName}
              </span>
            )}
          </div>

          {user.role === 'doctor' ? (
            <div className="nav-sections">
              <div className="nav-section">
                <div className="nav-section-title">Main</div>
                <Link to="/doctor" className={`nav-link-item ${isActive('/doctor') && !isActive('/doctor/analytics') ? 'active' : ''}`} onClick={() => setIsMenuOpen(false)}>
                  <FaHome /> Dashboard
                </Link>
                <Link to="/doctor/analytics" className={`nav-link-item ${isActive('/doctor/analytics') ? 'active' : ''}`} onClick={() => setIsMenuOpen(false)}>
                  <FaChartLine /> Analytics
                </Link>
              </div>

              <div className="nav-section">
                <div className="nav-section-title">Patient Management</div>
                <Link to="/doctor/appointments" className={`nav-link-item ${isActive('/doctor/appointments') ? 'active' : ''}`} onClick={() => setIsMenuOpen(false)}>
                  <FaCalendarAlt /> Appointments
                </Link>
                <Link to="/doctor/prescriptions" className={`nav-link-item ${isActive('/doctor/prescriptions') ? 'active' : ''}`} onClick={() => setIsMenuOpen(false)}>
                  <FaPrescriptionBottle /> Prescriptions
                </Link>
              </div>

              <div className="nav-section">
                <div className="nav-section-title">Communication</div>
                <Link to="/doctor/messages" className={`nav-link-item ${isActive('/doctor/messages') ? 'active' : ''}`} onClick={() => setIsMenuOpen(false)}>
                  <FaComments /> Messages
                </Link>
              </div>
            </div>
          ) : (
            <div className="nav-sections">
              <div className="nav-section">
                <div className="nav-section-title">Main</div>
                <Link to="/patient" className={`nav-link-item ${isActive('/patient') && !isActive('/patient/profile') && !isActive('/patient/prescriptions') && !isActive('/patient/appointments') && !isActive('/patient/log-pain') ? 'active' : ''}`} onClick={() => setIsMenuOpen(false)}>
                  <FaHome /> Dashboard
                </Link>
                <Link to="/patient/log-pain" className={`nav-link-item ${isActive('/patient/log-pain') ? 'active' : ''}`} onClick={() => setIsMenuOpen(false)}>
                  <FaHeartbeat /> Log Pain
                </Link>
              </div>

              <div className="nav-section">
                <div className="nav-section-title">My Health</div>
                <Link to="/patient/prescriptions" className={`nav-link-item ${isActive('/patient/prescriptions') ? 'active' : ''}`} onClick={() => setIsMenuOpen(false)}>
                  <FaPrescriptionBottle /> My Medications
                </Link>
                <Link to="/patient/appointments" className={`nav-link-item ${isActive('/patient/appointments') ? 'active' : ''}`} onClick={() => setIsMenuOpen(false)}>
                  <FaCalendarAlt /> My Appointments
                </Link>
              </div>

              <div className="nav-section">
                <div className="nav-section-title">Communication</div>
                <Link to="/patient/messages" className={`nav-link-item ${isActive('/patient/messages') ? 'active' : ''}`} onClick={() => setIsMenuOpen(false)}>
                  <FaComments /> Messages
                </Link>
              </div>

              <div className="nav-section">
                <div className="nav-section-title">Settings</div>
                <Link to="/patient/profile" className={`nav-link-item ${isActive('/patient/profile') ? 'active' : ''}`} onClick={() => setIsMenuOpen(false)}>
                  <FaUser /> Profile Settings
                </Link>
              </div>
            </div>
          )}

          <button 
            onClick={logout} 
            className="logout-button"
          >
            <FaSignOutAlt /> Sign Out
          </button>
        </div>
      </div>
    </nav>
  );
}