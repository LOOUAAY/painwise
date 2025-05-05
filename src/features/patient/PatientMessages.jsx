import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import './PatientMessages.css';
import { api } from '../../services/api';
import { FaUser, FaUserMd, FaPaperPlane, FaSpinner } from 'react-icons/fa';

export default function PatientMessages() {
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Debug: Log the current user object to check for doctor_id
    console.log('Current user:', user);
    fetchDoctors();
    
    // Set up polling for new messages every 30 seconds
    const interval = setInterval(() => {
      if (selectedDoctor) {
        fetchMessages(true);
      }
    }, 30000);
    
    return () => clearInterval(interval);
  }, [user.id, user.doctor_id]);

  useEffect(() => {
    if (selectedDoctor) {
      fetchMessages();
    }
  }, [selectedDoctor]);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      
      // If the patient has an assigned doctor, use that directly
      if (user.doctor_id) {
        console.log('Patient has assigned doctor ID:', user.doctor_id);
        
        // Get the detailed doctor info from the doctors list
        const response = await api.getDoctors();
        if (response.success) {
          const doctorsList = response.data || [];
          console.log('Doctors list:', doctorsList);
          
          // Find the assigned doctor in the list
          const assignedDoctor = doctorsList.find(doctor => Number(doctor.id) === Number(user.doctor_id));
          console.log('Found assigned doctor:', assignedDoctor);
          
          if (assignedDoctor) {
            setDoctors([assignedDoctor]); // Only show the assigned doctor
            setSelectedDoctor(assignedDoctor);
            setLoading(false);
            return;
          } else {
            console.warn('Could not find assigned doctor in doctors list');
          }
        }
      } else {
        console.log('No doctor_id found in user object:', user);
      }
      
      // Fallback: fetch all doctors if no assigned doctor found
      const response = await api.getDoctors();
      if (response.success) {
        setDoctors(response.data || []);
        // Auto-select first doctor if none selected
        if (response.data && response.data.length > 0 && !selectedDoctor) {
          setSelectedDoctor(response.data[0]);
        }
      } else {
        throw new Error(response.error || 'Failed to fetch doctors');
      }
    } catch (error) {
      console.error('Error fetching doctors:', error);
      setError('Failed to load doctors. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (silent = false) => {
    if (!selectedDoctor) return;
    
    try {
      if (!silent) setLoadingMessages(true);
      setError(null);
      
      console.log('Fetching messages between patient ID:', user.id, 'and doctor ID:', selectedDoctor.id);
      
      const response = await api.getMessages(user.id, selectedDoctor.id);
      
      if (response.success) {
        // Check if we have messages in the expected format
        const messagesList = response.data || [];
        console.log('Messages loaded:', messagesList.length);
        setMessages(messagesList);
        if (!silent) setTimeout(scrollToBottom, 100);
      } else {
        throw new Error(response.error || 'Failed to fetch messages');
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      if (!silent) setError('Failed to load messages: ' + error.message);
    } finally {
      if (!silent) setLoadingMessages(false);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedDoctor) return;

    try {
      // First, add the message to the UI immediately for better UX
      const tempMessage = {
        id: 'temp-' + Date.now(),
        sender_id: user.id,
        sender_type: 'patient',
        recipient_id: selectedDoctor.id,
        recipient_type: 'doctor',
        content: newMessage.trim(),
        created_at: new Date().toISOString(),
        sender_name: user.name || 'Patient',
        time: new Date().toLocaleTimeString(),
        date: new Date().toLocaleDateString()
      };
      
      setMessages(prev => [...prev, tempMessage]);
      setNewMessage('');
      setTimeout(scrollToBottom, 100);
      
      // Then send to the server
      const data = {
        sender_id: user.id,
        sender_type: 'patient',
        recipient_id: selectedDoctor.id,
        recipient_type: 'doctor',
        content: newMessage.trim()
      };
      
      const response = await api.sendMessage(data);
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to send message');
      }
      
      // Refresh messages to get the official one
      fetchMessages(true);
      
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send message: ' + error.message);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatMessageDate = (messages) => {
    let lastDate = null;
    return messages.map((message, index) => {
      const showDate = message.date !== lastDate;
      lastDate = message.date;
      return { ...message, showDate };
    });
  };

  // Render debugging information to help troubleshoot doctor connection issues
  const renderDebugInfo = () => {
    return (
      <div className="debug-info" style={{padding: '10px', margin: '10px 0', border: '1px solid #ccc', borderRadius: '4px', backgroundColor: '#f5f5f5', fontSize: '12px'}}>
        <h4>Debug Information:</h4>
        <p>User ID: {user?.id}</p>
        <p>Doctor ID from user: {user?.doctor_id || 'None'}</p>
        <p>Available doctors: {doctors.length}</p>
        <p>Selected doctor: {selectedDoctor ? `${selectedDoctor.name} (ID: ${selectedDoctor.id})` : 'None'}</p>
        <p>Loading status: {loading ? 'Loading' : 'Done'}</p>
        <button 
          style={{padding: '4px 8px', margin: '4px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px'}}
          onClick={() => console.log('User object:', user)}
        >
          Log User Object
        </button>
        <button 
          style={{padding: '4px 8px', margin: '4px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px'}}
          onClick={() => console.log('Doctors:', doctors)}
        >
          Log Doctors
        </button>
      </div>
    );
  };

  return (
    <div className="patient-messages-container">
      <h1 className="messages-title">Messages</h1>
      
      {error && <div className="error-message">{error}</div>}
      
      {/* Debug information panel for troubleshooting */}
      {renderDebugInfo()}
      
      <div className="messages-layout">
        <div className="messages-sidebar">
          <h2>My Doctors</h2>
          <div className="doctors-list">
            {loading ? (
              <div className="loading-spinner">
                <FaSpinner className="spinner" />
                <span>Loading doctors...</span>
              </div>
            ) : error ? (
              <div className="error-message">{error}</div>
            ) : doctors.length === 0 ? (
              <div className="no-doctors">No doctors found</div>
            ) : (
              doctors.map(doctor => (
                <div 
                  key={doctor.id}
                  className={`doctor-item ${selectedDoctor?.id === doctor.id ? 'selected' : ''}`}
                  onClick={() => setSelectedDoctor(doctor)}
                >
                  <div className="doctor-avatar">
                    <FaUserMd />
                  </div>
                  <div className="doctor-info">
                    <div className="doctor-name">Dr. {doctor.name}</div>
                    <div className="doctor-specialty">{doctor.specialty || 'General Practitioner'}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        
        <div className="messages-content">
          {selectedDoctor ? (
            <>
              <div className="messages-header">
                <div className="selected-doctor">
                  <div className="doctor-avatar large">
                    <FaUserMd />
                  </div>
                  <div className="doctor-info">
                    <div className="doctor-name">Dr. {selectedDoctor.name}</div>
                    <div className="doctor-specialty">{selectedDoctor.specialty || 'General Practitioner'}</div>
                  </div>
                </div>
              </div>
              
              <div className="messages-list">
                {loadingMessages ? (
                  <div className="loading-spinner">
                    <FaSpinner className="spinner" />
                    <span>Loading conversation...</span>
                  </div>
                ) : error ? (
                  <div className="error-message">{error}</div>
                ) : messages.length === 0 ? (
                  <div className="no-messages">
                    <p>No messages yet. Start a conversation with Dr. {selectedDoctor.name}.</p>
                  </div>
                ) : (
                  <div className="messages-thread">
                    {formatMessageDate(messages).map((message, index) => (
                      <React.Fragment key={message.id}>
                        {message.showDate && (
                          <div className="date-separator">
                            <span>{message.date}</span>
                          </div>
                        )}
                        
                        <div className={`message-item ${message.sender_type === 'patient' ? 'sent' : 'received'}`}>
                          <div className="message-avatar">
                            {message.sender_type === 'patient' ? <FaUser /> : <FaUserMd />}
                          </div>
                          <div className="message-content">
                            <div className="message-bubble">
                              {message.content}
                            </div>
                            <div className="message-time">{message.time}</div>
                          </div>
                        </div>
                      </React.Fragment>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>
              
              <form className="message-form" onSubmit={sendMessage}>
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  disabled={loadingMessages}
                />
                <button 
                  type="submit" 
                  disabled={!newMessage.trim() || loadingMessages}
                  className="send-button"
                >
                  <FaPaperPlane />
                </button>
              </form>
            </>
          ) : (
            <div className="no-selection">
              <p>Select a doctor to start messaging</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
