import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';
import './PatientPrescriptions.css';
import { FaCalendarAlt, FaPills, FaClock } from 'react-icons/fa';

export default function PatientPrescriptions() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  const fetchPrescriptions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.getPrescriptions(user.id);
      console.log('Prescriptions response:', response);
      
      if (response.success) {
        // Sort prescriptions by start_date (newest first)
        const sortedPrescriptions = (response.data || []).sort((a, b) => {
          return new Date(b.start_date) - new Date(a.start_date);
        });
        setPrescriptions(sortedPrescriptions);
      } else {
        throw new Error(response.error || 'Failed to load prescriptions');
      }
    } catch (err) {
      console.error('Error fetching prescriptions:', err);
      setError('Could not load your prescriptions. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Format date to a more readable format
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric', 
      month: 'long', 
      day: 'numeric'
    });
  };

  // Group prescriptions by status (active/inactive)
  const groupedPrescriptions = prescriptions.reduce((groups, prescription) => {
    const status = prescription.status || 'active';
    if (!groups[status]) {
      groups[status] = [];
    }
    groups[status].push(prescription);
    return groups;
  }, { active: [], inactive: [] });

  if (loading) {
    return (
      <div className="prescriptions-container loading">
        <div className="loader"></div>
        <p>Loading your prescriptions...</p>
      </div>
    );
  }

  return (
    <div className="patient-prescriptions-container">
      <h2>My Prescriptions</h2>
      
      {error && (
        <div className="error-message">{error}</div>
      )}
      
      {!loading && prescriptions.length === 0 ? (
        <div className="no-prescriptions">
          <FaPills size={48} />
          <p>You don't have any prescriptions yet.</p>
          <p className="sub-text">Your doctor will add prescriptions as part of your treatment plan.</p>
        </div>
      ) : (
        <>
          {/* Active Prescriptions */}
          <div className="prescription-section">
            <h3>Current Medications</h3>
            {groupedPrescriptions.active && groupedPrescriptions.active.length > 0 ? (
              <div className="prescription-list">
                {groupedPrescriptions.active.map(prescription => (
                  <div key={prescription.id} className="prescription-card active">
                    <div className="prescription-header">
                      <h4>{prescription.name}</h4>
                      <span className="status active">Active</span>
                    </div>
                    
                    <div className="prescription-details">
                      <div className="detail-item">
                        <span className="label">Dosage:</span>
                        <span className="value">{prescription.dosage}</span>
                      </div>
                      
                      <div className="detail-item">
                        <span className="label">Schedule:</span>
                        <span className="value">
                          <FaClock className="icon" /> {prescription.schedule}
                        </span>
                      </div>
                      
                      <div className="detail-item">
                        <span className="label">Start Date:</span>
                        <span className="value">
                          <FaCalendarAlt className="icon" /> {formatDate(prescription.start_date)}
                        </span>
                      </div>
                      
                      {prescription.end_date && (
                        <div className="detail-item">
                          <span className="label">End Date:</span>
                          <span className="value">
                            <FaCalendarAlt className="icon" /> {formatDate(prescription.end_date)}
                          </span>
                        </div>
                      )}
                      
                      {prescription.doctor_name && (
                        <div className="detail-item">
                          <span className="label">Prescribed by:</span>
                          <span className="value">{prescription.doctor_name}</span>
                        </div>
                      )}
                    </div>
                    
                    {prescription.notes && (
                      <div className="prescription-notes">
                        <p>{prescription.notes}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-items-message">No active prescriptions found.</p>
            )}
          </div>
          
          {/* Past Prescriptions */}
          {groupedPrescriptions.inactive && groupedPrescriptions.inactive.length > 0 && (
            <div className="prescription-section past">
              <h3>Past Medications</h3>
              <div className="prescription-list">
                {groupedPrescriptions.inactive.map(prescription => (
                  <div key={prescription.id} className="prescription-card inactive">
                    <div className="prescription-header">
                      <h4>{prescription.name}</h4>
                      <span className="status inactive">Inactive</span>
                    </div>
                    
                    <div className="prescription-details">
                      <div className="detail-item">
                        <span className="label">Dosage:</span>
                        <span className="value">{prescription.dosage}</span>
                      </div>
                      
                      <div className="detail-item">
                        <span className="label">Schedule:</span>
                        <span className="value">
                          <FaClock className="icon" /> {prescription.schedule}
                        </span>
                      </div>
                      
                      <div className="detail-item">
                        <span className="label">Start Date:</span>
                        <span className="value">
                          <FaCalendarAlt className="icon" /> {formatDate(prescription.start_date)}
                        </span>
                      </div>
                      
                      {prescription.end_date && (
                        <div className="detail-item">
                          <span className="label">End Date:</span>
                          <span className="value">
                            <FaCalendarAlt className="icon" /> {formatDate(prescription.end_date)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
