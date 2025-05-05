import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import './CreateAppointment.css';

const CreateAppointment = ({ patientId }) => {
  const { currentUser } = useAuth();
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    purpose: '',
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          patient_id: patientId,
          doctor_id: currentUser.id,
          doctor_name: currentUser.name,
          date_time: `${formData.date}T${formData.time}:00`
        })
      });

      if (response.ok) {
        setSuccess(true);
        setFormData({ date: '', time: '', purpose: '', notes: '' });
      }
    } catch (error) {
      console.error('Error creating appointment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="create-appointment">
      <h2>Schedule New Appointment</h2>
      {success && (
        <div className="success-message">
          Appointment scheduled successfully!
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Date</label>
          <input 
            type="date" 
            value={formData.date}
            onChange={(e) => setFormData({...formData, date: e.target.value})}
            required
          />
        </div>
        <div className="form-group">
          <label>Time</label>
          <input 
            type="time" 
            value={formData.time}
            onChange={(e) => setFormData({...formData, time: e.target.value})}
            required
          />
        </div>
        <div className="form-group">
          <label>Purpose</label>
          <input 
            type="text" 
            value={formData.purpose}
            onChange={(e) => setFormData({...formData, purpose: e.target.value})}
            required
          />
        </div>
        <div className="form-group">
          <label>Notes</label>
          <textarea 
            value={formData.notes}
            onChange={(e) => setFormData({...formData, notes: e.target.value})}
          />
        </div>
        <button 
          type="submit" 
          disabled={isSubmitting}
          className="submit-btn"
        >
          {isSubmitting ? 'Scheduling...' : 'Schedule Appointment'}
        </button>
      </form>
    </div>
  );
};

export default CreateAppointment;
