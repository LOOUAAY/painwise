import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';
import './DoctorDashboard.css';
import { FaUserMd, FaChartLine, FaCalendarAlt, FaEnvelope, FaPrescriptionBottleAlt } from 'react-icons/fa';
import PatientDetails from './PatientDetails';

export default function DoctorDashboard() {
  // State management
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  // Stats summary
  const totalPatients = patients.length;
  const totalLogs = patients.reduce((sum, p) => sum + (p.logs ? p.logs.length : 0), 0);
  const avgPain = patients.length
    ? Math.round(
        patients.reduce((sum, p) => {
          const logs = p.logs || [];
          return sum + (logs.length ? logs.reduce((s, l) => s + (Number(l.pain_level) || 0), 0) / logs.length : 0);
        }, 0) / patients.length
      )
    : 0;

  // Initial data loading
  useEffect(() => {
    fetchPatients();
  }, [user.id]);

  // Fetch patients for the doctor
  const fetchPatients = async () => {
    try {
      setLoading(true);
      const data = await api.getDoctorPatients(user.id);
      if (data.success) {
        setPatients(data.patients || []);
      } else {
        throw new Error(data.error || 'Failed to fetch patients');
      }
    } catch (error) {
      console.error('Error fetching patients:', error);
      setError('Failed to load patients. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle patient selection
  const handlePatientSelect = (patient) => {
    setSelectedPatient(patient);
  };

  // Close patient details
  const handleClosePatientModal = () => {
    setSelectedPatient(null);
  };

  return (
    <div className="doctor-dashboard">
      <div className="dashboard-sidebar">
        <div className="sidebar-header">
          <div className="doctor-avatar">
            <FaUserMd />
          </div>
          <div className="doctor-info">
            <h3>Dr. {user?.name || 'Doctor'}</h3>
            <p>{user?.email || 'doctor@example.com'}</p>
          </div>
        </div>

        <div className="sidebar-stats">
          <div className="stat-item">
            <h4>Patients</h4>
            <span>{totalPatients}</span>
          </div>
          <div className="stat-item">
            <h4>Pain Logs</h4>
            <span>{totalLogs}</span>
          </div>
          <div className="stat-item pain-stat">
            <h4>Avg. Pain</h4>
            <span>
              {avgPain}/10
              <span className={`pain-level-indicator ${avgPain <= 3 ? 'pain-level-low' : avgPain <= 6 ? 'pain-level-medium' : 'pain-level-high'}`}></span>
            </span>
          </div>
        </div>
        
        <div className="patients-section">
          <h3>My Patients</h3>
          {loading ? (
            <div className="loading">Loading patients...</div>
          ) : error ? (
            <div className="error">{error}</div>
          ) : patients.length === 0 ? (
            <div className="no-patients">No patients found</div>
          ) : (
            <div className="patients-list">
              {patients.map(patient => (
                <button
                  key={patient.id}
                  className={`patient-item ${selectedPatient?.id === patient.id ? 'active' : ''}`}
                  onClick={() => handlePatientSelect(patient)}
                >
                  <div className="patient-avatar">
                    {patient.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="patient-info">
                    <div className="patient-name">{patient.name}</div>
                    <div className="patient-email">{patient.email}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="dashboard-content">
        {loading ? (
          <div className="loading">Loading dashboard...</div>
        ) : error ? (
          <div className="error">{error}</div>
        ) : selectedPatient ? (
          <PatientDetails patient={selectedPatient} onClose={handleClosePatientModal} />
        ) : (
          <div className="welcome-dashboard">
            <h2>Welcome to Your Doctor Dashboard</h2>
            <p>Select a patient from the sidebar to view their details, or use the navigation menu above to access different features.</p>
            <div className="dashboard-features">
              <Link to="/doctor/appointments" className="feature-card">
                <FaCalendarAlt className="feature-icon" />
                <h3>Appointments</h3>
                <p>Manage your patient appointments</p>
              </Link>
              <Link to="/doctor/messages" className="feature-card">
                <FaEnvelope className="feature-icon" />
                <h3>Messages</h3>
                <p>Communicate with your patients</p>
              </Link>
              <Link to="/doctor/prescriptions" className="feature-card">
                <FaPrescriptionBottleAlt className="feature-icon" />
                <h3>Prescriptions</h3>
                <p>Manage patient prescriptions</p>
              </Link>
              <Link to="/doctor/analytics" className="feature-card">
                <FaChartLine className="feature-icon" />
                <h3>Pain Analytics</h3>
                <p>View pain trends and analytics</p>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}