import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import './Messages.css';
import { api } from '../../services/api';
import { FaUser, FaUserMd, FaPaperPlane } from 'react-icons/fa';

export default function Messages() {
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchPatients();
  }, [user.id]);

  useEffect(() => {
    if (selectedPatient) {
      fetchMessages();
    }
  }, [selectedPatient]);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const data = await api.getDoctorPatients(user.id);
      if (data.success) {
        setPatients(data.patients);
        // Auto-select first patient if none selected
        if (data.patients.length > 0 && !selectedPatient) {
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

  const fetchMessages = async () => {
    if (!selectedPatient) return;
    try {
      setLoadingMessages(true);
      setError(null);
      
      console.log('Fetching messages between doctor ID:', user.id, 'and patient ID:', selectedPatient.id);
      
      // Use the api service to make the request with the correct base URL
      const data = await api.getMessages(user.id, selectedPatient.id);
      console.log('Messages response:', data); // Debug log
      
      if (data.success) {
        // Check if we have messages in the expected format
        const messagesList = data.data || [];
        console.log('Messages loaded:', messagesList.length);
        setMessages(messagesList);
        setTimeout(scrollToBottom, 100);
      } else {
        throw new Error(data.error || 'Failed to fetch messages');
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      setError('Failed to load messages: ' + error.message);
    } finally {
      setLoadingMessages(false);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedPatient) return;

    try {
      // First, add the message to the UI immediately for better UX
      const tempMessage = {
        id: 'temp-' + Date.now(),
        sender_id: user.id,
        sender_type: 'doctor',
        recipient_id: selectedPatient.id,
        recipient_type: 'patient',
        content: newMessage.trim(),
        created_at: new Date().toISOString(),
        sender_name: user.name || 'Doctor',
        time: new Date().toLocaleTimeString(),
        date: new Date().toLocaleDateString()
      };
      
      // Add the temporary message to the UI for better UX
      setMessages(prev => [...prev, tempMessage]);
      setNewMessage(''); // Clear input immediately
      setTimeout(scrollToBottom, 100);
      
      // Prepare the message data
      const messageData = {
        sender_id: user.id,
        sender_type: 'doctor',
        recipient_id: selectedPatient.id,
        recipient_type: 'patient',
        content: newMessage.trim()
      };

      console.log('Sending message:', messageData); // Debug log

      // Send the message using the API service
      const response = await api.sendMessage(messageData);
      console.log('Message send response:', response); // Debug log

      if (response.success) {
        console.log('Message successfully sent to database with ID:', response.data?.id);
        // Fetch messages again to ensure we have the latest data
        fetchMessages();
      } else {
        throw new Error(data.error || 'Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send message. Please try again: ' + error.message);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  if (loading) {
    return <div className="loading">Loading patients...</div>;
  }

  return (
    <div className="messages-container">
      <div className="messages-sidebar">
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

      <div className="messages-main">
        {selectedPatient ? (
          <>
            <div className="messages-header">
              <h3>Conversation with {selectedPatient.name}</h3>
            </div>
            <div className="messages-list">
              {loadingMessages ? (
                <div className="loading-messages">Loading conversation...</div>
              ) : messages.length === 0 ? (
                <div className="no-messages">No messages yet. Start the conversation!</div>
              ) : (
                <>
                  {messages.map((message, index) => {
                    // Check both sender and sender_type to support both DB structures
                    const isFromDoctor = (message.sender === 'doctor') || 
                                        (message.sender_type === 'doctor' && message.sender_id == user.id);
                    const prevMessage = index > 0 ? messages[index - 1] : null;
                    
                    // Handle different date field names (created_at or timestamp)
                    const messageDate = message.created_at || message.timestamp;
                    const prevMessageDate = prevMessage ? (prevMessage.created_at || prevMessage.timestamp) : null;
                    
                    const showDateDivider = index === 0 || 
                      (prevMessage && new Date(messageDate).toDateString() !== new Date(prevMessageDate).toDateString());
                    
                    console.log('Rendering message:', message, 'isFromDoctor:', isFromDoctor);
                    
                    return (
                      <React.Fragment key={message.id || index}>
                        {showDateDivider && (
                          <div className="date-divider">
                            {new Date(messageDate).toLocaleDateString(undefined, {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </div>
                        )}
                        <div
                          className={`message ${isFromDoctor ? 'sent' : 'received'}`}
                        >
                          <div className="message-avatar">
                            {isFromDoctor ? <FaUserMd /> : <FaUser />}
                          </div>
                          <div className="message-bubble">
                            <div className="message-sender">{isFromDoctor ? 'You' : message.sender_name || 'Patient'}</div>
                            <div className="message-content">{message.content}</div>
                            <div className="message-time">{message.time || new Date(messageDate).toLocaleTimeString()}</div>
                          </div>
                        </div>
                      </React.Fragment>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>
            <form onSubmit={sendMessage} className="message-input-form">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                className="message-input"
                autoFocus
              />
              <button type="submit" className="send-button">
                <FaPaperPlane />
                <span>Send</span>
              </button>
            </form>
          </>
        ) : (
          <div className="no-patient-selected">
            <h3>Select a patient to start messaging</h3>
          </div>
        )}
      </div>
    </div>
  );
} 