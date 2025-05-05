import React, { useState, useEffect } from 'react';
import AppointmentCalendar from '../components/AppointmentCalendar';
import AppointmentModal from '../components/AppointmentModal';
import PainMap from '../components/PainMap';
import MessageSystem from '../components/MessageSystem';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';

const PatientDashboard = () => {
  const { user } = useAuth();
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [painLogs, setPainLogs] = useState([]);
  const [medications, setMedications] = useState([]);
  const [personalNotes, setPersonalNotes] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [currentPain, setCurrentPain] = useState({
    rating: 0,
    location: [],
    type: '',
    notes: ''
  });

  useEffect(() => {
    fetchPatientData();
    fetchDoctors();
    const fetchLogs = async () => {
      try {
        const data = await api.getPainLogs(user.id);
        setPainLogs(data.logs || []);
      } catch (error) {
        console.error('Failed to fetch pain logs:', error);
      }
    };

    fetchLogs();
  }, [user.id]);

  const fetchDoctors = async () => {
    try {
      const response = await fetch('/api/get_doctors.php');
      const data = await response.json();
      if (data.success) {
        setDoctors(data.data);
      }
    } catch (error) {
      console.error('Error fetching doctors:', error);
    }
  };

  const fetchPatientData = async () => {
    try {
      const [painLogsRes, medicationsRes, notesRes] = await Promise.all([
        fetch(`/api/get_pain_logs.php?patient_id=${user.id}`),
        fetch(`/api/get_prescriptions.php?patient_id=${user.id}`),
        fetch(`/api/get_notes.php?patient_id=${user.id}`)
      ]);
      
      const painLogsData = await painLogsRes.json();
      const medicationsData = await medicationsRes.json();
      const notesData = await notesRes.json();

      setPainLogs(painLogsData.data || []);
      setMedications(medicationsData.data || []);
      setPersonalNotes(notesData.data || []);
    } catch (error) {
      console.error('Error fetching patient data:', error);
    }
  };

  const handlePainLogSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/save_pain_log.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...currentPain,
          timestamp: new Date().toISOString()
        })
      });
      
      if (response.ok) {
        fetchPatientData();
        setCurrentPain({ rating: 0, location: [], type: '', notes: '' });
      }
    } catch (error) {
      console.error('Error saving pain log:', error);
    }
  };

  const handleAppointmentSelect = (appointment) => {
    setSelectedAppointment(appointment);
    setShowAppointmentModal(true);
  };

  const handleAppointmentSave = () => {
    setShowAppointmentModal(false);
    setSelectedAppointment(null);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Pain Tracking Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Pain Tracker</h2>
          <form onSubmit={handlePainLogSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Pain Level (0-10)</label>
              <input
                type="range"
                min="0"
                max="10"
                value={currentPain.rating}
                onChange={(e) => setCurrentPain({...currentPain, rating: parseInt(e.target.value)})}
                className="w-full"
              />
              <span className="text-sm text-gray-500">{currentPain.rating}/10</span>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Pain Type</label>
              <select
                value={currentPain.type}
                onChange={(e) => setCurrentPain({...currentPain, type: e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              >
                <option value="">Select type</option>
                <option value="sharp">Sharp</option>
                <option value="dull">Dull</option>
                <option value="throbbing">Throbbing</option>
                <option value="burning">Burning</option>
                <option value="cramping">Cramping</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Pain Location</label>
              <PainMap
                painPoints={currentPain.location}
                onPointClick={(x, y) => {
                  setCurrentPain({
                    ...currentPain,
                    location: [...currentPain.location, { x, y, rating: currentPain.rating }]
                  });
                }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Notes</label>
              <textarea
                value={currentPain.notes}
                onChange={(e) => setCurrentPain({...currentPain, notes: e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                rows="3"
              />
            </div>

            <button
              type="submit"
              className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Log Pain
            </button>
          </form>
        </div>

        {/* Medication Management Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Medications</h2>
          <div className="space-y-4">
            {medications.map((med) => (
              <div key={med.id} className="border rounded p-4">
                <h3 className="font-medium">{med.name}</h3>
                <p className="text-sm text-gray-600">Dosage: {med.dosage}</p>
                <p className="text-sm text-gray-600">Schedule: {med.schedule}</p>
                <div className="mt-2">
                  <button
                    onClick={() => {/* Mark as taken */}}
                    className="text-sm text-blue-500 hover:text-blue-600"
                  >
                    Mark as Taken
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Personal Notes Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Personal Notes</h2>
          <div className="space-y-4">
            {personalNotes.map((note) => (
              <div key={note.id} className="border rounded p-4">
                <p className="text-sm text-gray-600">{note.content}</p>
                <p className="text-xs text-gray-500 mt-2">{new Date(note.timestamp).toLocaleString()}</p>
              </div>
            ))}
            <button
              onClick={() => {/* Add new note */}}
              className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Add Note
            </button>
          </div>
        </div>

        {/* Appointments Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Appointments</h2>
            <button
              onClick={() => handleAppointmentSelect({})}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              New Appointment
            </button>
          </div>
          <AppointmentCalendar onSelectAppointment={handleAppointmentSelect} />
        </div>

        {/* Messaging Section */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Messages</h2>
              <select
                value={selectedDoctor?.id || ''}
                onChange={(e) => setSelectedDoctor(doctors.find(d => d.id === e.target.value))}
                className="p-2 border rounded"
              >
                <option value="">Select a doctor to message</option>
                {doctors.map(doctor => (
                  <option key={doctor.id} value={doctor.id}>
                    Dr. {doctor.name}
                  </option>
                ))}
              </select>
            </div>
            {selectedDoctor && (
              <MessageSystem
                recipientId={selectedDoctor.id}
                recipientType="doctor"
                recipientName={`Dr. ${selectedDoctor.name}`}
              />
            )}
          </div>
        </div>
      </div>

      {showAppointmentModal && (
        <AppointmentModal
          appointment={selectedAppointment}
          onClose={() => {
            setShowAppointmentModal(false);
            setSelectedAppointment(null);
          }}
          onSave={handleAppointmentSave}
        />
      )}
    </div>
  );
};

export default PatientDashboard; 