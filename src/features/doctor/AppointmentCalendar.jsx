import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useAuth } from '../../contexts/AuthContext';
import './AppointmentCalendar.css';
import { api } from '../../services/api';

const localizer = momentLocalizer(moment);

export default function AppointmentCalendar() {
  const [appointments, setAppointments] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getAppointments(user.id);
      
      if (data.success) {
        const formattedAppointments = data.appointments.map(apt => ({
          ...apt,
          start: new Date(apt.datetime),
          end: new Date(new Date(apt.datetime).getTime() + 30 * 60000), // 30 min duration
          title: `Appointment with ${apt.patient_name}`
        }));
        setAppointments(formattedAppointments);
      } else {
        throw new Error(data.error || 'Failed to fetch appointments');
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
      setError('Failed to load appointments. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSlot = ({ start }) => {
    setSelectedAppointment({
      start,
      end: new Date(start.getTime() + 30 * 60000),
      title: 'New Appointment'
    });
    setShowModal(true);
  };

  const handleSelectEvent = (appointment) => {
    setSelectedAppointment(appointment);
    setShowModal(true);
  };

  const handleSaveAppointment = async (appointmentData) => {
    try {
      setError(null);
      const data = await api.addAppointment({
        ...appointmentData,
        doctor_id: user.id
      });
      
      if (data.success) {
        fetchAppointments();
        setShowModal(false);
        setSelectedAppointment(null);
      } else {
        throw new Error(data.error || 'Failed to save appointment');
      }
    } catch (error) {
      console.error('Error saving appointment:', error);
      setError('Failed to save appointment. Please try again.');
    }
  };

  return (
    <div className="appointment-calendar-container">
      <div className="calendar-header">
        <h2>Appointment Calendar</h2>
        <button 
          className="add-appointment-btn"
          onClick={() => {
            setSelectedAppointment(null);
            setShowModal(true);
          }}
        >
          Add New Appointment
        </button>
      </div>

      <div className="calendar-wrapper">
        <Calendar
          localizer={localizer}
          events={appointments}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 'calc(100vh - 200px)' }}
          onSelectSlot={handleSelectSlot}
          onSelectEvent={handleSelectEvent}
          selectable
          views={['month', 'week', 'day']}
          defaultView="week"
        />
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>{selectedAppointment?.id ? 'Edit Appointment' : 'New Appointment'}</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              handleSaveAppointment({
                ...selectedAppointment,
                datetime: formData.get('datetime'),
                patient_id: formData.get('patient_id'),
                type: formData.get('type'),
                notes: formData.get('notes'),
                status: formData.get('status')
              });
            }}>
              <div className="form-group">
                <label>Date & Time</label>
                <input
                  type="datetime-local"
                  name="datetime"
                  defaultValue={selectedAppointment?.start?.toISOString().slice(0, 16)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Patient</label>
                <select name="patient_id" required>
                  <option value="">Select Patient</option>
                  {/* Add patient options here */}
                </select>
              </div>
              <div className="form-group">
                <label>Type</label>
                <input
                  type="text"
                  name="type"
                  defaultValue={selectedAppointment?.type}
                  placeholder="e.g., Follow-up, Consultation"
                />
              </div>
              <div className="form-group">
                <label>Status</label>
                <select name="status" defaultValue={selectedAppointment?.status || 'pending'}>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div className="form-group">
                <label>Notes</label>
                <textarea
                  name="notes"
                  defaultValue={selectedAppointment?.notes}
                  placeholder="Add any notes about the appointment"
                />
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 