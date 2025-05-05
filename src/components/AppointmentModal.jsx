import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const AppointmentModal = ({ appointment, onClose, onSave }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    datetime: '',
    type: '',
    notes: '',
    status: 'pending',
    reminder_time: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (appointment) {
      setFormData({
        datetime: appointment.datetime,
        type: appointment.type || '',
        notes: appointment.notes || '',
        status: appointment.status || 'pending',
        reminder_time: appointment.reminder_time || ''
      });
    }
  }, [appointment]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const data = {
        ...formData,
        doctor_id: user.role === 'doctor' ? user.id : appointment.doctor_id,
        patient_id: user.role === 'patient' ? user.id : appointment.patient_id
      };

      if (appointment?.id) {
        data.id = appointment.id;
        await axios.put('/api/appointments.php', data);
      } else {
        await axios.post('/api/appointments.php', data);
      }

      onSave();
      onClose();
    } catch (err) {
      setError('Failed to save appointment');
      console.error('Error saving appointment:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">
          {appointment?.id ? 'Edit Appointment' : 'New Appointment'}
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date and Time
            </label>
            <input
              type="datetime-local"
              value={formData.datetime.slice(0, 16)}
              onChange={(e) => setFormData({ ...formData, datetime: e.target.value })}
              className="w-full p-2 border rounded"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full p-2 border rounded"
            >
              <option value="">Select type</option>
              <option value="checkup">Check-up</option>
              <option value="followup">Follow-up</option>
              <option value="consultation">Consultation</option>
              <option value="emergency">Emergency</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full p-2 border rounded"
            >
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reminder Time
            </label>
            <input
              type="datetime-local"
              value={formData.reminder_time ? formData.reminder_time.slice(0, 16) : ''}
              onChange={(e) => setFormData({ ...formData, reminder_time: e.target.value })}
              className="w-full p-2 border rounded"
            />
            <p className="text-sm text-gray-500 mt-1">
              Set when you want to receive a reminder for this appointment
            </p>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full p-2 border rounded"
              rows="3"
            />
          </div>

          {error && (
            <div className="mb-4 text-red-500 text-sm">{error}</div>
          )}

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AppointmentModal; 