import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import './CreatePrescription.css';

const CreatePrescription = ({ patientId }) => {
  const { currentUser } = useAuth();
  const [formData, setFormData] = useState({
    medication_name: '',
    dosage: '',
    frequency: '',
    instructions: '',
    start_date: '',
    end_date: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/prescriptions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          patient_id: patientId,
          doctor_id: currentUser.id,
          doctor_name: currentUser.name,
          prescribed_date: new Date().toISOString()
        })
      });

      if (response.ok) {
        setSuccess(true);
        setFormData({
          medication_name: '',
          dosage: '',
          frequency: '',
          instructions: '',
          start_date: '',
          end_date: ''
        });
      }
    } catch (error) {
      console.error('Error creating prescription:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="create-prescription">
      <h2>Create New Prescription</h2>
      {success && (
        <div className="success-message">
          Prescription created successfully!
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Medication Name</label>
          <input 
            type="text" 
            value={formData.medication_name}
            onChange={(e) => setFormData({...formData, medication_name: e.target.value})}
            required
          />
        </div>
        <div className="form-group">
          <label>Dosage</label>
          <input 
            type="text" 
            value={formData.dosage}
            onChange={(e) => setFormData({...formData, dosage: e.target.value})}
            required
          />
        </div>
        <div className="form-group">
          <label>Frequency</label>
          <input 
            type="text" 
            value={formData.frequency}
            onChange={(e) => setFormData({...formData, frequency: e.target.value})}
            required
          />
        </div>
        <div className="form-group">
          <label>Instructions</label>
          <textarea 
            value={formData.instructions}
            onChange={(e) => setFormData({...formData, instructions: e.target.value})}
          />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Start Date</label>
            <input 
              type="date" 
              value={formData.start_date}
              onChange={(e) => setFormData({...formData, start_date: e.target.value})}
            />
          </div>
          <div className="form-group">
            <label>End Date</label>
            <input 
              type="date" 
              value={formData.end_date}
              onChange={(e) => setFormData({...formData, end_date: e.target.value})}
            />
          </div>
        </div>
        <button 
          type="submit" 
          disabled={isSubmitting}
          className="submit-btn"
        >
          {isSubmitting ? 'Creating...' : 'Create Prescription'}
        </button>
      </form>
    </div>
  );
};

export default CreatePrescription;
