import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const localizer = momentLocalizer(moment);

const AppointmentCalendar = ({ onSelectAppointment }) => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAppointments();
  }, [user]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/appointments.php?${user.role}_id=${user.id}`);
      if (response.data.success) {
        const formattedAppointments = response.data.appointments.map(apt => ({
          id: apt.id,
          title: user.role === 'doctor' ? apt.patient_name : apt.doctor_name,
          start: new Date(apt.datetime),
          end: new Date(new Date(apt.datetime).getTime() + 60 * 60 * 1000), // 1 hour duration
          type: apt.type,
          notes: apt.notes
        }));
        setAppointments(formattedAppointments);
      }
    } catch (err) {
      setError('Failed to fetch appointments');
      console.error('Error fetching appointments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = ({ start }) => {
    if (onSelectAppointment) {
      onSelectAppointment({
        datetime: start.toISOString(),
        type: '',
        notes: ''
      });
    }
  };

  if (loading) return <div className="text-center p-4">Loading appointments...</div>;
  if (error) return <div className="text-center p-4 text-red-500">{error}</div>;

  return (
    <div className="h-[600px] bg-white rounded-lg shadow p-4">
      <Calendar
        localizer={localizer}
        events={appointments}
        startAccessor="start"
        endAccessor="end"
        onSelectSlot={handleSelect}
        selectable
        views={['month', 'week', 'day']}
        defaultView="week"
        style={{ height: '100%' }}
        eventPropGetter={(event) => ({
          className: 'bg-blue-500 hover:bg-blue-600'
        })}
      />
    </div>
  );
};

export default AppointmentCalendar; 