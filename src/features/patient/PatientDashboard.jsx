import React, { useState, useEffect } from 'react';
import { FaHeartbeat, FaCalendarAlt, FaPills, FaBell } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import './PatientDashboard.css';

const PatientDashboard = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [latestPainLog, setLatestPainLog] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [newNotifications, setNewNotifications] = useState(0);

  const fetchDashboardData = async () => {
    try {
      if (!user?.id) return;
      
      // Use the correct api endpoints through our API service
      const API_BASE = 'http://localhost/app/api';
      
      // Fetch latest pain log
      const painResponse = await fetch(`${API_BASE}/get_pain_logs.php?patient_id=${user.id}&limit=1`);
      const painData = await painResponse.json();
      
      // Fetch appointments
      const apptResponse = await fetch(`${API_BASE}/get_appointments.php?patient_id=${user.id}`);
      const apptData = await apptResponse.json();
      
      // Fetch prescriptions
      const rxResponse = await fetch(`${API_BASE}/get_prescriptions.php?patient_id=${user.id}`);
      const rxData = await rxResponse.json();
      
      // Update state
      if (painData.success) setLatestPainLog(painData.data?.[0] || null);
      if (apptData.success) setAppointments((apptData.data || []).slice(0, 3));
      if (rxData.success) {
        // Make sure we only get active prescriptions for the dashboard
        const activePrescriptions = (rxData.data || []).filter(p => p.status === 'active' || !p.status);
        setPrescriptions(activePrescriptions.slice(0, 3));
      }
      
    } catch (error) {
      console.error('Dashboard error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    fetchDashboardData();
    
    // Refresh data every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, [user?.id]);

  if (!user || isLoading) {
    return <div className="loading-spinner">Loading dashboard...</div>;
  }

  return (
    <div className="patient-dashboard">
      <div className="dashboard-header">
        <div>
          <h1>Welcome, {user?.name || 'Patient'}</h1>
          <p>Here's your health overview</p>
        </div>
        {newNotifications > 0 && (
          <button className="notifications-badge">
            <FaBell />
            <span>{newNotifications}</span>
          </button>
        )}
      </div>

      <div className="dashboard-grid">
        {/* Health Summary Card */}
        <div className="dashboard-card health-summary">
          <div className="card-header">
            <FaHeartbeat className="card-icon" />
            <h2>Health Summary</h2>
          </div>
          {latestPainLog ? (
            <div className="summary-content">
              <div className="pain-level-indicator">
                <div 
                  className="pain-level" 
                  style={{
                    width: `${latestPainLog.average_intensity * 10}%`,
                    backgroundColor: `hsl(${360 - latestPainLog.average_intensity * 36}, 70%, 50%)`
                  }}
                ></div>
                <span>{latestPainLog.average_intensity}/10 Pain Level</span>
              </div>
              <div className="summary-stats">
                <div className="stat">
                  <span className="stat-label">Last Recorded</span>
                  <span className="stat-value">
                    {new Date(latestPainLog.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="stat">
                  <span className="stat-label">Main Areas</span>
                  <span className="stat-value">
                    {latestPainLog.pain_points?.slice(0, 3).map(p => p.location).join(', ')}
                  </span>
                </div>
              </div>
              <button className="view-details-btn">View Full Report</button>
            </div>
          ) : (
            <p className="no-data">No recent pain logs</p>
          )}
        </div>

        {/* Upcoming Appointments */}
        <div className="dashboard-card appointments">
          <div className="card-header">
            <FaCalendarAlt className="card-icon" />
            <h2>Upcoming Appointments</h2>
          </div>
          {appointments.length > 0 ? (
            <ul className="items-list">
              {appointments.map((appt) => {
                // Check if this is an upcoming appointment (today or future)
                const today = new Date().toISOString().split('T')[0];
                const isUpcoming = appt.appointment_date >= today;
                
                return isUpcoming ? (
                  <li key={appt.id} className="item">
                    <div className="item-date">
                      {new Date(appt.appointment_date).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric'
                      })}
                    </div>
                    <div className="item-main">
                      <h3>{appt.type || 'Medical Appointment'}</h3>
                      <p>With Dr. {appt.doctor_name}</p>
                      {appt.notes && <p className="appointment-notes">{appt.notes}</p>}
                    </div>
                    <div className="item-time">
                      {appt.appointment_time.substring(0, 5)}
                    </div>
                  </li>
                ) : null;
              }).filter(Boolean)}
            </ul>
          ) : (
            <p className="no-data">No upcoming appointments</p>
          )}
          <button className="view-all-btn" onClick={() => window.location.href = '/patient/appointments'}>View All Appointments</button>
        </div>

        {/* Current Prescriptions */}
        <div className="dashboard-card prescriptions">
          <div className="card-header">
            <FaPills className="card-icon" />
            <h2>Active Prescriptions</h2>
          </div>
          {prescriptions.filter(p => !p.is_completed).length > 0 ? (
            <ul className="items-list">
              {prescriptions
                .filter(p => !p.is_completed)
                .slice(0, 3)
                .map((rx) => (
                  <li key={rx.id} className="item">
                    <div className="item-icon">💊</div>
                    <div className="item-main">
                      <h3>{rx.medication_name}</h3>
                      <p>{rx.dosage} • {rx.frequency}</p>
                    </div>
                    <div className="item-meta">
                      Dr. {rx.doctor_name.split(' ')[0]}
                    </div>
                  </li>
                ))}
            </ul>
          ) : (
            <p className="no-data">No active prescriptions</p>
          )}
          <button className="view-all-btn">View All Prescriptions</button>
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;