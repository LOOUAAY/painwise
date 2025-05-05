import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';
import { FaHeartbeat, FaBrain, FaBed, FaPills, FaAppleAlt, FaRunning } from 'react-icons/fa';
import './PatientDetails.css';

export default function PatientDetails({ patient, onClose }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [patientDetails, setPatientDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState('');
  const [error, setError] = useState(null);
  const [currentLogIndex, setCurrentLogIndex] = useState(0);
  const { user } = useAuth();

  useEffect(() => {
    if (patient) {
      fetchPatientDetails();
    }
  }, [patient]);

  const fetchPatientDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching details for patient ID:', patient.id, 'and doctor ID:', user.id);
      
      // Add a direct fetch for debugging purposes
      const directResponse = await fetch(`http://localhost/app/api/check_database.php`);
      const dbInfo = await directResponse.json();
      console.log('Database info:', dbInfo);
      
      // Check if patients table exists
      const patientsTableExists = dbInfo.tables.includes('patients');
      console.log('Patients table exists:', patientsTableExists);
      
      // Try the normal API call
      const response = await api.getPatientDetails(patient.id, user.id);
      console.log('API response:', response);
      
      if (response.success) {
        setPatientDetails(response.patient);
        console.log('Patient details set successfully');
        
        // Only try to get pain logs if we got patient details successfully
        try {
          const painLogsResponse = await api.getPainLogs(patient.id);
          console.log('Pain logs response:', painLogsResponse);
          
          if (painLogsResponse.success) {
            setPatientDetails(prev => ({
              ...prev,
              pain_logs: painLogsResponse.logs || []
            }));
          }
        } catch (logsError) {
          console.warn('Error fetching pain logs (non-critical):', logsError);
          // Don't fail the whole component if just the logs fail
        }
      } else {
        throw new Error(response.error || 'Failed to load patient details');
      }
    } catch (error) {
      console.error('Error fetching patient details:', error);
      setError(error.message || 'Failed to load patient details. Please try again.');
      
      // Create a fallback patient object with minimal data from the parent component
      if (patient) {
        setPatientDetails({
          ...patient,  // Use data passed from parent
          fallback: true, // Mark as fallback data
          prescriptions: [] // Empty prescriptions
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const response = await fetch('/send_message.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          doctor_id: user.id,
          patient_id: patient.id,
          content: newMessage.trim(),
          sender: 'doctor'
        }),
      });

      const data = await response.json();
      if (data.success) {
        setNewMessage('');
        fetchPatientDetails(); // Refresh messages
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  if (loading) {
    return <div className="loading">Loading patient details...</div>;
  }

  if (!patientDetails) {
    return <div className="error">Failed to load patient details</div>;
  }

  return (
    <div className="patient-details-container">
      <div className="patient-details-header">
        <div className="patient-info-header">
          <div className="patient-avatar">
            {patient.name.charAt(0).toUpperCase()}
          </div>
          <div className="patient-header-info">
            <h2>{patient.name}</h2>
            <p>{patient.email}</p>
          </div>
        </div>
        <button className="close-btn" onClick={onClose}>×</button>
      </div>

      <div className="tabs">
        <button 
          className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button 
          className={`tab ${activeTab === 'medical-history' ? 'active' : ''}`}
          onClick={() => setActiveTab('medical-history')}
        >
          Medical History
        </button>
        <button 
          className={`tab ${activeTab === 'prescriptions' ? 'active' : ''}`}
          onClick={() => setActiveTab('prescriptions')}
        >
          Prescriptions
        </button>
        <button 
          className={`tab ${activeTab === 'pain-logs' ? 'active' : ''}`}
          onClick={() => setActiveTab('pain-logs')}
        >
          Pain Logs
        </button>
        <button 
          className={`tab ${activeTab === 'messages' ? 'active' : ''}`}
          onClick={() => setActiveTab('messages')}
        >
          Messages
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'overview' && (
          <div className="overview-section">
            <div className="info-card">
              <h3>Personal Information</h3>
              <div className="info-grid">
                <div className="info-item">
                  <label>Age</label>
                  <span>{patientDetails.age}</span>
                </div>
                <div className="info-item">
                  <label>Gender</label>
                  <span>{patientDetails.gender}</span>
                </div>
                <div className="info-item">
                  <label>Phone</label>
                  <span>{patientDetails.phone}</span>
                </div>
                <div className="info-item">
                  <label>Address</label>
                  <span>{patientDetails.address}</span>
                </div>
              </div>
            </div>

            <div className="info-card">
              <h3>Recent Appointments</h3>
              <div className="appointments-list">
                {patientDetails.recent_appointments?.map(appointment => (
                  <div key={appointment.id} className="appointment-item">
                    <div className="appointment-date">
                      {new Date(appointment.datetime).toLocaleDateString()}
                    </div>
                    <div className="appointment-type">{appointment.type}</div>
                    <div className="appointment-status">{appointment.status}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'medical-history' && (
          <div className="medical-history-section">
            <div className="info-card">
              <h3>Medical Conditions</h3>
              <div className="conditions-list">
                {patientDetails.medical_conditions?.map(condition => (
                  <div key={condition.id} className="condition-item">
                    <div className="condition-name">{condition.name}</div>
                    <div className="condition-date">Diagnosed: {condition.diagnosed_date}</div>
                    <div className="condition-notes">{condition.notes}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="info-card">
              <h3>Allergies</h3>
              <div className="allergies-list">
                {patientDetails.allergies?.map(allergy => (
                  <div key={allergy.id} className="allergy-item">
                    <div className="allergy-name">{allergy.name}</div>
                    <div className="allergy-severity">{allergy.severity}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'prescriptions' && (
          <div className="prescriptions-section">
            <div className="info-card">
              <h3>Current Prescriptions</h3>
              <div className="prescriptions-list">
                {patientDetails.prescriptions && patientDetails.prescriptions.length > 0 ? (
                  patientDetails.prescriptions.filter(p => p.status === 'active').map(prescription => (
                    <div key={prescription.id} className="prescription-item">
                      <div className="prescription-name">{prescription.medication}</div>
                      <div className="prescription-dosage">{prescription.dosage}</div>
                      <div className="prescription-time">{prescription.schedule || prescription.time}</div>
                      <div className="prescription-notes">{prescription.notes}</div>
                    </div>
                  ))
                ) : (
                  <div className="no-data">No active prescriptions found</div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'pain-logs' && (
          <div className="pain-logs-section">
            <h3 className="section-title">Pain Log History</h3>
            
            {patientDetails.pain_logs && patientDetails.pain_logs.length > 0 ? (
              <>
                <div className="pain-logs-summary">
                  <div className="summary-card">
                    <h4>Total Logs</h4>
                    <div className="summary-value">{patientDetails.pain_logs.length}</div>
                  </div>
                  <div className="summary-card">
                    <h4>Average Pain Level</h4>
                    <div className="summary-value">
                      {(patientDetails.pain_logs.reduce((sum, log) => sum + (Number(log.pain_level) || Number(log.rating) || 0), 0) / patientDetails.pain_logs.length).toFixed(1)}/10
                    </div>
                  </div>
                  <div className="summary-card">
                    <h4>Latest Log</h4>
                    <div className="summary-value">
                      {new Date(patientDetails.pain_logs[0].log_time || patientDetails.pain_logs[0].timestamp || patientDetails.pain_logs[0].created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                
                <div className="pain-logs-navigation">
                  <button 
                    className="nav-button prev" 
                    onClick={() => setCurrentLogIndex(prev => Math.max(0, prev - 1))}
                    disabled={currentLogIndex === 0}
                  >
                    ← Previous Log
                  </button>
                  <span className="log-counter">Log {currentLogIndex + 1} of {patientDetails.pain_logs.length}</span>
                  <button 
                    className="nav-button next"
                    onClick={() => setCurrentLogIndex(prev => Math.min(patientDetails.pain_logs.length - 1, prev + 1))}
                    disabled={currentLogIndex === patientDetails.pain_logs.length - 1}
                  >
                    Next Log →
                  </button>
                </div>
                
                <div className="pain-logs-list">
                  {(() => {
                    const log = patientDetails.pain_logs[currentLogIndex];
                    
                    // Parse JSON fields if they're strings
                    const parsePainPoints = () => {
                      try {
                        if (!log.pain_points) return [];
                        return Array.isArray(log.pain_points) ? log.pain_points : JSON.parse(log.pain_points);
                      } catch (e) {
                        console.error('Error parsing pain points:', e);
                        return [];
                      }
                    };
                    
                    const parseMedication = () => {
                      try {
                        if (!log.medication) return { otc: false, rx: false };
                        return typeof log.medication === 'string' ? JSON.parse(log.medication) : log.medication;
                      } catch (e) {
                        return { otc: false, rx: false };
                      }
                    };
                    
                    const parseNutrition = () => {
                      try {
                        if (!log.nutrition) return {};
                        return typeof log.nutrition === 'string' ? JSON.parse(log.nutrition) : log.nutrition;
                      } catch (e) {
                        return {};
                      }
                    };
                    
                    const parseExercise = () => {
                      try {
                        if (!log.exercise) return { exercised: false };
                        return typeof log.exercise === 'string' ? JSON.parse(log.exercise) : log.exercise;
                      } catch (e) {
                        return { exercised: false };
                      }
                    };
                
                    const painPoints = parsePainPoints();
                    const medication = parseMedication();
                    const nutrition = parseNutrition();
                    const exercise = parseExercise();
                    const logDate = new Date(log.log_time || log.timestamp || log.created_at).toLocaleString();
                    const painLevel = Number(log.pain_level) || Number(log.rating) || 0;
                
                    return (
                      <div key={log.id || currentLogIndex} className="pain-log-item">
                        <div className="log-header">
                          <h4>Log Date: {logDate}</h4>
                          <div className="pain-level-display">
                            Pain Level: {painLevel}/10
                          </div>
                        </div>
                        
                        <div className="log-details-grid">
                          {/* Pain Assessment Card */}
                          <div className="detail-card pain-assessment">
                            <h5>Pain Assessment</h5>
                            <div className="pain-map-container-small">
                              {/* Simplified Pain Map Display */}
                              <div style={{ position: 'relative', width: '150px', height: '250px', border: '1px solid #ccc', margin: '0 auto', background: 'url(/path/to/body-outline.png) no-repeat center center / contain' }}>
                                {painPoints.map((point, index) => (
                                  <div key={index} style={{
                                    position: 'absolute',
                                    left: `${point.x}%`,
                                    top: `${point.y}%`,
                                    width: '10px',
                                    height: '10px',
                                    backgroundColor: `rgba(255, 0, 0, ${point.rating / 10})`,
                                    borderRadius: '50%',
                                    transform: 'translate(-50%, -50%)'
                                  }}></div>
                                ))}
                              </div>
                            </div>
                            <div className="reported-points">
                              <h6>Reported Pain Points:</h6>
                              {painPoints.length > 0 ? (
                                painPoints.map((point, index) => (
                                  <p key={index}>Body: Level {point.rating}/10 - {log.pain_type || 'N/A'}</p>
                                ))
                              ) : (
                                <p>No specific points reported.</p>
                              )}
                            </div>
                          </div>
                          
                          {/* Functionality Card */}
                          <div className="detail-card functionality">
                            <FaHeartbeat className="card-icon" />
                            <h5>Functionality</h5>
                            <div className="metric-value">{log.functionality || 0}/10</div>
                            <div className="metric-bar">
                              <div className="bar-fill" style={{ width: `${(log.functionality || 0) * 10}%` }}></div>
                            </div>
                            <p className="metric-description">Patient's ability to perform daily activities</p>
                          </div>
                          
                          {/* Mental Health Card */}
                          <div className="detail-card mental-health">
                            <FaBrain className="card-icon" />
                            <h5>Mental Health</h5>
                            <div className="mental-health-metrics">
                              <div className="metric-item">
                                <label>Mood</label>
                                <div className="metric-value">{log.mood || 0}/10</div>
                                <div className="metric-bar">
                                  <div className="bar-fill" style={{ width: `${(log.mood || 0) * 10}%` }}></div>
                                </div>
                              </div>
                              <div className="metric-item">
                                <label>Anxiety</label>
                                <div className="metric-value">{log.anxiety || 0}/10</div>
                                <div className="metric-bar">
                                  <div className="bar-fill" style={{ width: `${(log.anxiety || 0) * 10}%` }}></div>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          {/* Sleep Quality Card */}
                          <div className="detail-card sleep-quality">
                            <FaBed className="card-icon" />
                            <h5>Sleep Quality</h5>
                            <div className="metric-value">{log.sleep || 0}/10</div>
                            <div className="metric-bar">
                              <div className="bar-fill" style={{ width: `${(log.sleep || 0) * 10}%` }}></div>
                            </div>
                          </div>
                          
                          {/* Medication Card */}
                          <div className="detail-card medication">
                            <FaPills className="card-icon" />
                            <h5>Medication</h5>
                            <div className="medication-details">
                              <p>OTC Medication: {medication?.otc ? 'Yes' : 'No'} ({medication?.otc_count !== undefined ? `${medication.otc_count}/day` : 'N/A'})</p>
                              <p>Prescription: {medication?.rx ? 'Yes' : 'No'} ({medication?.rx_count !== undefined ? `${medication.rx_count}/day` : 'N/A'})</p>
                            </div>
                          </div>
                          
                          {/* Nutrition Card */}
                          <div className="detail-card nutrition">
                            <FaAppleAlt className="card-icon" />
                            <h5>Nutrition</h5>
                            <div className="nutrition-details">
                              <p>Diet: {nutrition?.plant_based !== undefined ? (nutrition.plant_based ? 'Plant-Based' : 'Standard') : 'Standard'}</p>
                              <p>Fruits & Vegetables: {nutrition?.fruit_veg_servings !== undefined ? `${nutrition.fruit_veg_servings} servings` : 'No'}</p>
                              <p>Water Intake: {nutrition?.water_intake || 0} oz/day</p>
                            </div>
                          </div>
                          
                          {/* Exercise Card */}
                          <div className="detail-card exercise">
                            <FaRunning className="card-icon" />
                            <h5>Exercise</h5>
                            <div className="exercise-details">
                              <p>Active: {exercise?.active ? 'Yes' : 'No'}</p>
                              {exercise?.active && (
                                <>
                                  <p>Type: {exercise.type || 'N/A'}</p>
                                  <p>Duration: {exercise.duration || 'N/A'} mins</p>
                                  <p>Relaxation: {exercise.relaxation || 'None'}</p>
                                </> 
                              )}
                            </div>
                          </div>
                          
                          {/* Notes Card */}
                          <div className="detail-card notes">
                            <h5>Notes</h5>
                            <p>{log.notes || 'No additional notes.'}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </>
            ) : (
              <div className="no-logs">No pain logs found for this patient.</div>
            )}
          </div>
        )}

        {activeTab === 'messages' && (
          <div className="messages-section">
            <div className="messages-list">
              {patientDetails.messages?.map(message => (
                <div key={message.id} className={`message-item ${message.sender === 'doctor' ? 'sent' : 'received'}`}>
                  <div className="message-content">{message.content}</div>
                  <div className="message-timestamp">{new Date(message.timestamp).toLocaleString()}</div>
                </div>
              ))}
            </div>
            <form onSubmit={sendMessage} className="message-input-form">
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                rows="3"
              />
              <button type="submit">Send Message</button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}