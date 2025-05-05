import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';
import PainAnalytics from '../doctor/PainAnalytics';
import './AnalyticsDashboard.css';
import { FaChartLine, FaUserAlt, FaCalendarAlt, FaFilter } from 'react-icons/fa';

export default function AnalyticsDashboard() {
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user && user.role === 'doctor') {
      fetchPatients();
    }
  }, [user]);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const data = await api.getDoctorPatients(user.id);
      if (data.success) {
        setPatients(data.patients || []);
        // Automatically select the first patient if available
        if (data.patients && data.patients.length > 0 && !selectedPatient) {
          setSelectedPatient(data.patients[0]);
        }
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

  const handlePatientSelect = (patient) => {
    setSelectedPatient(patient);
  };

  if (loading) {
    return (
      <div className="analytics-container loading-container">
        <div className="loading-spinner"></div>
        <p>Loading analytics data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="analytics-container error-container">
        <h1>Treatment Analytics</h1>
        <div className="error-message">{error}</div>
        <button onClick={fetchPatients} className="retry-button">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="analytics-container">
      <div className="analytics-header">
        <h1>Pain Treatment Analytics</h1>
        <p>Monitor patient pain patterns and treatment effectiveness</p>
      </div>

      <div className="analytics-content">
        <div className="patients-selection">
          <h3>Select Patient</h3>
          <div className="patients-list">
            {patients.length === 0 ? (
              <div className="no-patients">No patients found</div>
            ) : (
              patients.map(patient => (
                <div
                  key={patient.id}
                  className={`patient-card ${selectedPatient?.id === patient.id ? 'selected' : ''}`}
                  onClick={() => handlePatientSelect(patient)}
                >
                  <div className="patient-avatar">
                    <FaUserAlt />
                  </div>
                  <div className="patient-info">
                    <h4>{patient.name}</h4>
                    <p>{patient.email}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        
        <div className="analytics-main">
          {selectedPatient ? (
            <PainAnalytics patientId={selectedPatient.id} />
          ) : (
            <div className="no-patient-selected">
              <FaChartLine className="big-icon" />
              <h3>Select a patient to view pain analytics</h3>
              <p>Choose a patient from the list to see their pain tracking data and analytics.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}