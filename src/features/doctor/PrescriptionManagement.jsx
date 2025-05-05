import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';
import './PrescriptionManagement.css';
import { FaUser, FaSearch, FaPlus, FaCalendarAlt, FaCheck, FaExclamationTriangle } from 'react-icons/fa';

export default function PrescriptionManagement() {
  const { user } = useAuth();
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [prescriptions, setPrescriptions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingPrescription, setEditingPrescription] = useState(null);
  
  // Format date to YYYY-MM-DD for form input
  const formatDateForInput = (date) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  };
  
  // Today's date for default start date
  const today = new Date().toISOString().split('T')[0];

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
      setLoading(true);
      const response = await api.getDoctorPatients(user.id);
      if (response.success) {
        setPatients(response.patients || []);
      } else {
        throw new Error(response.error || 'Failed to fetch patients');
      }
    } catch (err) {
      console.error('Error fetching patients:', err);
      setError('Failed to load patients. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchPrescriptions = async () => {
    if (!selectedPatient) return;
    try {
      setLoading(true);
      setError(null);
      const response = await api.getPrescriptions(selectedPatient.id);
      
      if (response.success) {
        const prescriptionsList = Array.isArray(response.data) ? response.data : [];
        setPrescriptions(prescriptionsList);
      } else {
        throw new Error(response.error || 'Failed to fetch prescriptions');
      }
    } catch (err) {
      console.error('Error fetching prescriptions:', err);
      setError('Failed to load prescriptions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePatientSelect = (patient) => {
    setSelectedPatient(patient);
  };

  const handleAddPrescription = () => {
    setEditingPrescription(null);
    setShowModal(true);
  };

  const handleEditPrescription = (prescription) => {
    setEditingPrescription(prescription);
    setShowModal(true);
  };

  const handleDeletePrescription = async (id) => {
    if (!window.confirm('Are you sure you want to delete this prescription?')) return;
    
    try {
      setLoading(true);
      const response = await api.deletePrescription(id);
      if (response.success) {
        setPrescriptions(prev => prev.filter(p => p.id !== id));
        setSuccess('Prescription deleted successfully');
        setTimeout(() => setSuccess(null), 3000);
      } else {
        throw new Error(response.error || 'Failed to delete prescription');
      }
    } catch (err) {
      console.error('Error deleting prescription:', err);
      setError('Failed to delete prescription. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSavePrescription = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    // Create prescription data object from form fields
    const prescriptionData = {
      patient_id: selectedPatient.id,
      doctor_id: user.id,
      name: formData.get('name'),
      dosage: formData.get('dosage'),
      schedule: formData.get('schedule'),
      start_date: formData.get('start_date'),
      end_date: formData.get('end_date') || null,
      notes: formData.get('notes') || null,
      status: formData.get('status') || 'active',
      doctor_name: user.name || 'Dr. ' + user.email.split('@')[0],
      id: editingPrescription?.id || null
    };

    try {
      setLoading(true);
      setError(null);
      
      const response = await api.addPrescription(prescriptionData);
      
      if (response.success) {
        await fetchPrescriptions();
        setSuccess(editingPrescription ? 'Prescription updated successfully' : 'Prescription added successfully');
        setTimeout(() => setSuccess(null), 3000);
        setShowModal(false);
      } else {
        throw new Error(response.error || 'Failed to save prescription');
      }
    } catch (err) {
      console.error('Error saving prescription:', err);
      setError('Failed to save prescription. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filteredPatients = searchTerm 
    ? patients.filter(p => 
        p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.email?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : patients;

  return (
    <div className="prescriptions-management-container">
      <div className="prescriptions-sidebar">
        <h3>My Patients</h3>
        <div className="search-box">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search patients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="patient-list">
          {loading && patients.length === 0 ? (
            <div className="loading-indicator">Loading patients...</div>
          ) : filteredPatients.length === 0 ? (
            <div className="no-patients">
              {searchTerm ? 'No patients found matching your search' : 'No patients assigned yet'}
            </div>
          ) : (
            filteredPatients.map(patient => (
              <div
                key={patient.id}
                className={`patient-item ${selectedPatient?.id === patient.id ? 'active' : ''}`}
                onClick={() => handlePatientSelect(patient)}
              >
                <div className="patient-avatar">
                  <FaUser />
                </div>
                <div className="patient-info">
                  <div className="patient-name">{patient.name}</div>
                  <div className="patient-email">{patient.email}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      
      <div className="prescriptions-main">
        {selectedPatient ? (
          <>
            <div className="prescriptions-header">
              <h3>Prescriptions for {selectedPatient.name}</h3>
              <button 
                className="add-prescription-btn"
                onClick={handleAddPrescription}
              >
                <FaPlus /> Add Prescription
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
            
            <div className="prescriptions-list">
              {loading ? (
                <div className="loading-indicator">Loading prescriptions...</div>
              ) : prescriptions.length === 0 ? (
                <div className="no-prescriptions">
                  No prescriptions for this patient yet.
                </div>
              ) : (
                prescriptions.map(prescription => (
                  <div key={prescription.id} className="prescription-card">
                    <div className="prescription-header">
                      <h4 className="prescription-title">{prescription.name}</h4>
                      <span className={`prescription-status ${prescription.status || 'active'}`}>
                        {prescription.status || 'Active'}
                      </span>
                    </div>
                    <div className="prescription-content">
                      <p><strong>Dosage:</strong> {prescription.dosage}</p>
                      <p><strong>Schedule:</strong> {prescription.schedule}</p>
                      <p><strong>Start Date:</strong> {prescription.start_date ? new Date(prescription.start_date).toLocaleDateString() : 'Not specified'}</p>
                      {prescription.end_date && (
                        <p><strong>End Date:</strong> {new Date(prescription.end_date).toLocaleDateString()}</p>
                      )}
                      {prescription.notes && (
                        <p className="prescription-notes">{prescription.notes}</p>
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
                ))
              )}
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
            
            <form onSubmit={handleSavePrescription}>
              <div className="form-group">
                <label>Medication Name</label>
                <input
                  type="text"
                  name="name"
                  defaultValue={editingPrescription?.name}
                  required
                  placeholder="e.g., Ibuprofen, Amoxicillin, etc."
                />
              </div>
              
              <div className="form-group">
                <label>Dosage</label>
                <input
                  type="text"
                  name="dosage"
                  defaultValue={editingPrescription?.dosage}
                  required
                  placeholder="e.g., 200mg, 1 tablet, 5ml, etc."
                />
              </div>
              
              <div className="form-group">
                <label>Schedule</label>
                <input
                  type="text"
                  name="schedule"
                  defaultValue={editingPrescription?.schedule}
                  required
                  placeholder="e.g., Once daily, Twice daily with meals, etc."
                />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Start Date</label>
                  <input
                    type="date"
                    name="start_date"
                    defaultValue={editingPrescription?.start_date ? formatDateForInput(editingPrescription.start_date) : today}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>End Date (Optional)</label>
                  <input
                    type="date"
                    name="end_date"
                    defaultValue={editingPrescription?.end_date ? formatDateForInput(editingPrescription.end_date) : ''}
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label>Status</label>
                <select 
                  name="status" 
                  defaultValue={editingPrescription?.status || 'active'}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              
              <div className="form-group">
                <label>Notes (Optional)</label>
                <textarea
                  name="notes"
                  defaultValue={editingPrescription?.notes}
                  placeholder="Additional information or instructions"
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
