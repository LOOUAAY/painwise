import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';
import './AppointmentManagement.css';
import { FaUser, FaSearch, FaPlus, FaCalendarAlt, FaClock, FaCheck, FaExclamationTriangle } from 'react-icons/fa';

export default function AppointmentManagement() {
  const { user } = useAuth();
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [formData, setFormData] = useState({
    appointment_date: '',
    appointment_time: '',
    type: 'Regular Checkup',
    notes: '',
    status: 'scheduled'
  });

  useEffect(() => {
    fetchPatients();
    fetchAppointments();
  }, []);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const response = await api.getDoctorPatients(user.id);
      if (response && response.success) {
        setPatients(response.patients || []);
      } else {
        throw new Error(response?.error || 'Failed to fetch patients');
      }
    } catch (err) {
      console.error('Error fetching patients:', err);
      setError('Failed to load patients. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.getAppointments(user.id, 'doctor');
      
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
      setError('Failed to load appointments. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddAppointment = () => {
    // Set default date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const formattedDate = tomorrow.toISOString().split('T')[0];
    
    setFormData({
      appointment_date: formattedDate,
      appointment_time: '09:00',
      type: 'Regular Checkup',
      notes: '',
      status: 'scheduled'
    });
    
    setShowModal(true);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePatientSelect = (patient) => {
    setSelectedPatient(patient);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedPatient) {
      setError('Please select a patient for this appointment');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const appointmentData = {
        doctor_id: user.id,
        patient_id: selectedPatient.id,
        ...formData
      };
      
      const response = await api.addAppointment(appointmentData);
      
      if (response && response.success) {
        setSuccess('Appointment scheduled successfully');
        setShowModal(false);
        await fetchAppointments();
        setTimeout(() => setSuccess(null), 3000);
      } else {
        throw new Error(response?.error || 'Failed to schedule appointment');
      }
    } catch (err) {
      console.error('Error scheduling appointment:', err);
      setError('Failed to schedule appointment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Format date string to more readable format
  const formatDate = (dateStr) => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateStr).toLocaleDateString(undefined, options);
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

  // Filter patients by search term
  const filteredPatients = searchTerm 
    ? patients.filter(p => 
        p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.email?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : patients;

  return (
    <div className="appointments-management">
      <div className="appointments-header">
        <h2>Appointments</h2>
        <button className="add-appointment-btn" onClick={handleAddAppointment}>
          <FaPlus /> Schedule New Appointment
        </button>
      </div>
      
      {error && (
        <div className="error-message">
          <FaExclamationTriangle /> {error}
        </div>
      )}
      
      {success && (
        <div className="success-message">
          <FaCheck /> {success}
        </div>
      )}
      
      {loading && appointments.length === 0 ? (
        <div className="loading-container">
          <div className="loader"></div>
          <p>Loading appointments...</p>
        </div>
      ) : appointments.length === 0 ? (
        <div className="no-appointments">
          <FaCalendarAlt className="icon" />
          <h3>No appointments scheduled</h3>
          <p>Click the "Schedule New Appointment" button to create your first appointment.</p>
        </div>
      ) : (
        <div className="appointments-list">
          {Object.keys(groupedAppointments).sort().map(date => (
            <div key={date} className="appointment-date-group">
              <h3 className="appointment-date">
                <FaCalendarAlt /> {formatDate(date)}
              </h3>
              <div className="appointment-cards">
                {groupedAppointments[date].map(appointment => (
                  <div 
                    key={appointment.id} 
                    className={`appointment-card ${appointment.status}`}
                  >
                    <div className="appointment-time">
                      <FaClock />
                      <span>{appointment.appointment_time}</span>
                    </div>
                    <div className="appointment-details">
                      <h4>{appointment.patient_name}</h4>
                      <div className="appointment-email">{appointment.patient_email}</div>
                      <div className="appointment-type">{appointment.type}</div>
                      {appointment.notes && (
                        <div className="appointment-notes">{appointment.notes}</div>
                      )}
                    </div>
                    <div className="appointment-status">
                      <span className={`status-badge ${appointment.status}`}>
                        {appointment.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Appointment Scheduling Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Schedule New Appointment</h3>
            
            {error && (
              <div className="error-message modal-error">
                <FaExclamationTriangle /> {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Select Patient</label>
                <div className="patient-search-box">
                  <FaSearch className="search-icon" />
                  <input
                    type="text"
                    placeholder="Search patients..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                <div className="patient-selector-list">
                  {filteredPatients.length === 0 ? (
                    <div className="no-patients-found">No patients found</div>
                  ) : (
                    filteredPatients.map(patient => (
                      <div
                        key={patient.id}
                        className={`patient-option ${selectedPatient?.id === patient.id ? 'selected' : ''}`}
                        onClick={() => handlePatientSelect(patient)}
                      >
                        <div className="patient-avatar">
                          <FaUser />
                        </div>
                        <div className="patient-option-info">
                          <div className="patient-name">{patient.name}</div>
                          <div className="patient-email">{patient.email}</div>
                        </div>
                        {selectedPatient?.id === patient.id && (
                          <div className="selected-icon">
                            <FaCheck />
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Date</label>
                  <input
                    type="date"
                    name="appointment_date"
                    value={formData.appointment_date}
                    onChange={handleFormChange}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Time</label>
                  <input
                    type="time"
                    name="appointment_time"
                    value={formData.appointment_time}
                    onChange={handleFormChange}
                    required
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label>Appointment Type</label>
                <select 
                  name="type" 
                  value={formData.type}
                  onChange={handleFormChange}
                  required
                >
                  <option value="Regular Checkup">Regular Checkup</option>
                  <option value="Follow-up">Follow-up</option>
                  <option value="Consultation">Consultation</option>
                  <option value="Emergency">Emergency</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              
              <div className="form-group">
                <label>Status</label>
                <select 
                  name="status" 
                  value={formData.status}
                  onChange={handleFormChange}
                  required
                >
                  <option value="scheduled">Scheduled</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              
              <div className="form-group">
                <label>Notes (Optional)</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleFormChange}
                  placeholder="Add any notes or special instructions"
                  rows="3"
                ></textarea>
              </div>
              
              <div className="modal-actions">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={loading || !selectedPatient}
                  className={loading ? 'loading' : ''}
                >
                  {loading ? 'Scheduling...' : 'Schedule Appointment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
