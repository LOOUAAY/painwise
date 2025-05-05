import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import './Prescriptions.css';
import { api } from '../../services/api';
import { FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';

export default function Prescriptions() {
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [prescriptions, setPrescriptions] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingPrescription, setEditingPrescription] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    fetchPatients();
  }, []);

  useEffect(() => {
    if (selectedPatient) {
      fetchPrescriptions();
    }
  }, [selectedPatient]);

  const fetchPatients = async () => {
    try {
      const data = await api.getDoctorPatients(user.id);
      if (data.success) {
        setPatients(data.patients);
      } else {
        throw new Error(data.error || 'Failed to fetch patients');
      }
    } catch (error) {
      console.error('Error fetching patients:', error);
      setError('Failed to load patients. Please try again.');
    }
  };

  const fetchPrescriptions = async () => {
    if (!selectedPatient) return;
    try {
      setError(null);
      setLoading(true);
      const data = await api.getPrescriptions(selectedPatient.id);
      
      // Log the response for debugging
      console.log('Prescriptions API response:', data);
      
      if (data.success) {
        // Handle different response formats (data.data or data.prescriptions)
        const prescriptionsList = data.data || data.prescriptions || [];
        setPrescriptions(prescriptionsList);
        
        if (prescriptionsList.length === 0) {
          console.log('No prescriptions found for this patient');
        }
      } else {
        throw new Error(data.error || 'Failed to fetch prescriptions');
      }
    } catch (error) {
      console.error('Error fetching prescriptions:', error);
      setError('Failed to load prescriptions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddPrescription = () => {
    setEditingPrescription(null);
    setShowModal(true);
  };

  const handleEditPrescription = (prescription) => {
    setEditingPrescription(prescription);
    setShowModal(true);
  };

  const handleDeletePrescription = async (prescriptionId) => {
    if (!window.confirm('Are you sure you want to delete this prescription?')) return;

    try {
      setLoading(true);
      const data = await api.deletePrescription(prescriptionId);
      if (data.success) {
        fetchPrescriptions();
      } else {
        throw new Error(data.error || 'Failed to delete prescription');
      }
    } catch (error) {
      console.error('Error deleting prescription:', error);
      setError('Failed to delete prescription. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSavePrescription = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    // Get current date in YYYY-MM-DD format for start_date
    const today = new Date().toISOString().split('T')[0];
    
    // Create the prescription data object from form fields
    const prescriptionData = {
      patient_id: selectedPatient.id,
      doctor_id: user.id,
      name: formData.get('name'),
      dosage: formData.get('dosage'),
      schedule: formData.get('time'), // Rename 'time' to 'schedule' to match backend
      start_date: today, // Add required start_date field
      doctor_name: user.name || 'Dr. ' + user.email.split('@')[0],
      id: editingPrescription?.id
    };

    try {
      setError(null);
      setLoading(true);
      setSuccess(false);
      console.log('Saving prescription data:', prescriptionData);
      
      const data = await api.addPrescription(prescriptionData);
      
      if (data.success) {
        setSuccess(true);
        fetchPrescriptions();
        // Show success message briefly before closing modal
        setTimeout(() => {
          setShowModal(false);
          setEditingPrescription(null);
          setSuccess(false);
        }, 1500);
      } else {
        throw new Error(data.error || 'Failed to save prescription');
      }
    } catch (error) {
      console.error('Error saving prescription:', error);
      setError('Failed to save prescription. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="prescriptions-container">
      <div className="prescriptions-sidebar">
        <h3>Patients</h3>
        <div className="patient-list">
          {patients.map(patient => (
            <div
              key={patient.id}
              className={`patient-item ${selectedPatient?.id === patient.id ? 'active' : ''}`}
              onClick={() => setSelectedPatient(patient)}
            >
              <div className="patient-avatar">
                {patient.name.charAt(0).toUpperCase()}
              </div>
              <div className="patient-info">
                <div className="patient-name">{patient.name}</div>
                <div className="patient-email">{patient.email}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="prescriptions-main">
        {selectedPatient ? (
          <>
            <div className="prescriptions-header">
              <h3>Prescriptions for {selectedPatient.name}</h3>
              <button onClick={handleAddPrescription} className="add-prescription-btn">
                Add New Prescription
              </button>
            </div>

            <div className="prescriptions-list">
              {prescriptions.map(prescription => (
                <div key={prescription.id} className="prescription-card">
                  <div className="prescription-header">
                    <h4 className="prescription-title">{prescription.name}</h4>
                  </div>
                  <div className="prescription-content">
                    <p>Dosage: {prescription.dosage}</p>
                    <p>Schedule: {prescription.schedule || prescription.time}</p>
                    {prescription.start_date && (
                      <p>Start Date: {new Date(prescription.start_date).toLocaleDateString()}</p>
                    )}
                  </div>
                  <div className="prescription-actions">
                    <button
                      onClick={() => handleEditPrescription(prescription)}
                      className="edit-btn"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeletePrescription(prescription.id)}
                      className="delete-btn"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="no-patient-selected">
            <h3>Select a patient to view prescriptions</h3>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>{editingPrescription ? 'Edit Prescription' : 'New Prescription'}</h3>
            
            {error && (
              <div className="error-message">
                <FaExclamationTriangle /> {error}
              </div>
            )}
            
            {success && (
              <div className="success-message">
                <FaCheckCircle /> Prescription saved successfully!
              </div>
            )}
            
            <form onSubmit={handleSavePrescription}>
              <div className="form-group">
                <label>Medication Name</label>
                <input
                  type="text"
                  name="name"
                  defaultValue={editingPrescription?.name}
                  required
                />
              </div>
              <div className="form-group">
                <label>Dosage</label>
                <input
                  type="text"
                  name="dosage"
                  defaultValue={editingPrescription?.dosage}
                  placeholder="e.g., 10mg, 1 tablet, 5ml"
                  required
                />
              </div>
              <div className="form-group">
                <label>Schedule</label>
                <input
                  type="text"
                  name="time"
                  defaultValue={editingPrescription?.time || editingPrescription?.schedule}
                  placeholder="e.g., Once daily, Twice daily, 08:00, 12:00, 20:00"
                  required
                />
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
                  disabled={loading}
                  className={loading ? 'loading' : ''}
                >
                  {loading ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 