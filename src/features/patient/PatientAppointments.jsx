import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';
import './PatientAppointments.css';
import { FaCalendarAlt, FaClock, FaStethoscope, FaExclamationTriangle, FaCheck } from 'react-icons/fa';

export default function PatientAppointments() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.getAppointments(user.id, 'patient');
      
      if (response && response.success) {
        // Sort appointments by date and time
        const sortedAppointments = (response.data || []).sort((a, b) => {
          const dateA = new Date(`${a.appointment_date} ${a.appointment_time}`);
          const dateB = new Date(`${b.appointment_date} ${b.appointment_time}`);
          return dateA - dateB;
        });
        setAppointments(sortedAppointments);
      } else {
        throw new Error(response?.error || 'Failed to fetch appointments');
      }
    } catch (err) {
      console.error('Error fetching appointments:', err);
      setError('Could not load your appointments. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Format date to a more readable format
  const formatDate = (dateStr) => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateStr).toLocaleDateString(undefined, options);
  };

  // Format time to show as "9:00 AM" instead of "09:00"
  const formatTime = (timeStr) => {
    if (!timeStr) return '';
    try {
      const [hours, minutes] = timeStr.split(':');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const formattedHours = hours % 12 || 12;
      return `${formattedHours}:${minutes} ${ampm}`;
    } catch (e) {
      return timeStr;
    }
  };

  // Group appointments by date
  const groupedAppointments = appointments.reduce((groups, appointment) => {
    const date = appointment.appointment_date;
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(appointment);
    return groups;
  }, {});

  // Separate upcoming and past appointments
  const today = new Date().toISOString().split('T')[0];
  
  const upcomingDates = Object.keys(groupedAppointments)
    .filter(date => date >= today)
    .sort();
    
  const pastDates = Object.keys(groupedAppointments)
    .filter(date => date < today)
    .sort()
    .reverse(); // Most recent past date first

  if (loading) {
    return (
      <div className="patient-appointments-container loading">
        <div className="loader"></div>
        <p>Loading your appointments...</p>
      </div>
    );
  }

  return (
    <div className="patient-appointments-container">
      <h2>My Appointments</h2>
      
      {error && (
        <div className="error-message">
          <FaExclamationTriangle /> {error}
        </div>
      )}
      
      {!loading && appointments.length === 0 ? (
        <div className="no-appointments">
          <FaCalendarAlt size={48} />
          <p>You don't have any appointments scheduled yet.</p>
          <p className="sub-text">Your doctor will schedule appointments for you as part of your treatment plan.</p>
        </div>
      ) : (
        <>
          {/* Upcoming Appointments */}
          <div className="appointments-section upcoming">
            <h3>Upcoming Appointments</h3>
            
            {upcomingDates.length === 0 ? (
              <p className="no-items-message">No upcoming appointments found.</p>
            ) : (
              upcomingDates.map(date => (
                <div key={date} className="appointment-date-group">
                  <div className="appointment-date">
                    <FaCalendarAlt className="icon" />
                    <span>{formatDate(date)}</span>
                  </div>
                  
                  <div className="appointment-list">
                    {groupedAppointments[date].map(appointment => (
                      <div key={appointment.id} className={`appointment-card ${appointment.status}`}>
                        <div className="appointment-time">
                          <FaClock className="icon" />
                          <span>{formatTime(appointment.appointment_time)}</span>
                        </div>
                        
                        <div className="appointment-content">
                          <div className="appointment-header">
                            <h4>
                              <FaStethoscope className="icon" /> 
                              <span>With {appointment.doctor_name}</span>
                            </h4>
                            <span className={`status-badge ${appointment.status}`}>
                              {appointment.status}
                            </span>
                          </div>
                          
                          <div className="appointment-details">
                            <div className="detail-item">
                              <span className="label">Type:</span>
                              <span className="value">{appointment.type}</span>
                            </div>
                            
                            {appointment.notes && (
                              <div className="appointment-notes">
                                <p>{appointment.notes}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
          
          {/* Past Appointments */}
          {pastDates.length > 0 && (
            <div className="appointments-section past">
              <h3>Past Appointments</h3>
              
              {pastDates.map(date => (
                <div key={date} className="appointment-date-group">
                  <div className="appointment-date">
                    <FaCalendarAlt className="icon" />
                    <span>{formatDate(date)}</span>
                  </div>
                  
                  <div className="appointment-list">
                    {groupedAppointments[date].map(appointment => (
                      <div key={appointment.id} className={`appointment-card ${appointment.status} past`}>
                        <div className="appointment-time">
                          <FaClock className="icon" />
                          <span>{formatTime(appointment.appointment_time)}</span>
                        </div>
                        
                        <div className="appointment-content">
                          <div className="appointment-header">
                            <h4>
                              <FaStethoscope className="icon" /> 
                              <span>With {appointment.doctor_name}</span>
                            </h4>
                            <span className={`status-badge ${appointment.status}`}>
                              {appointment.status}
                            </span>
                          </div>
                          
                          <div className="appointment-details">
                            <div className="detail-item">
                              <span className="label">Type:</span>
                              <span className="value">{appointment.type}</span>
                            </div>
                            
                            {appointment.notes && (
                              <div className="appointment-notes">
                                <p>{appointment.notes}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
