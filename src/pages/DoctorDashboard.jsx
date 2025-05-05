import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import AppointmentCalendar from '../components/AppointmentCalendar';
import AppointmentModal from '../components/AppointmentModal';
import AppointmentList from '../components/AppointmentList';
import ReminderPreferences from '../components/ReminderPreferences';
import NotificationService from '../services/NotificationService';
import PainMap from '../components/PainMap';
import { Line } from 'react-chartjs-2';
import MessageSystem from '../components/MessageSystem';

const DoctorDashboard = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [view, setView] = useState('calendar');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patients, setPatients] = useState([]);
  const [patientData, setPatientData] = useState({
    painLogs: [],
    medications: [],
    notes: []
  });

  useEffect(() => {
    fetchAppointments();
    fetchPatients();
  }, [user]);

  useEffect(() => {
    if (selectedPatient) {
      fetchPatientData(selectedPatient.id);
    }
  }, [selectedPatient]);

  const fetchPatients = async () => {
    try {
      const response = await axios.get(`/api/get_doctor_patients.php?doctor_id=${user.id}`);
      if (response.data.success) {
        setPatients(response.data.patients);
      }
    } catch (err) {
      console.error('Error fetching patients:', err);
    }
  };

  const fetchPatientData = async (patientId) => {
    try {
      const [painLogsRes, medicationsRes, notesRes] = await Promise.all([
        axios.get(`/api/get_pain_logs.php?patient_id=${patientId}`),
        axios.get(`/api/get_prescriptions.php?patient_id=${patientId}`),
        axios.get(`/api/get_notes.php?patient_id=${patientId}`)
      ]);

      setPatientData({
        painLogs: painLogsRes.data,
        medications: medicationsRes.data,
        notes: notesRes.data
      });
    } catch (err) {
      console.error('Error fetching patient data:', err);
    }
  };

  const handlePrescriptionUpdate = async (prescriptionId, updates) => {
    try {
      await axios.put('/api/edit_prescription.php', {
        id: prescriptionId,
        ...updates
      });
      fetchPatientData(selectedPatient.id);
    } catch (err) {
      console.error('Error updating prescription:', err);
    }
  };

  const handleAddPrescription = async (prescription) => {
    try {
      await axios.post('/api/add_prescription.php', {
        ...prescription,
        patient_id: selectedPatient.id,
        doctor_id: user.id
      });
      fetchPatientData(selectedPatient.id);
    } catch (err) {
      console.error('Error adding prescription:', err);
    }
  };

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/appointments.php?doctor_id=${user.id}`);
      if (response.data.success) {
        setAppointments(response.data.appointments);
        // Schedule notifications for upcoming appointments
        response.data.appointments.forEach(appointment => {
          if (appointment.reminder_time && appointment.status === 'confirmed') {
            NotificationService.scheduleNotification(appointment);
          }
        });
      }
    } catch (err) {
      setError('Failed to fetch appointments');
      console.error('Error fetching appointments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAppointmentSelect = (appointment) => {
    setSelectedAppointment(appointment);
    setShowAppointmentModal(true);
  };

  const handleAppointmentSave = () => {
    fetchAppointments();
    setShowAppointmentModal(false);
    setSelectedAppointment(null);
  };

  const handleStatusChange = async (appointmentId, newStatus) => {
    try {
      const appointment = appointments.find(apt => apt.id === appointmentId);
      if (!appointment) return;

      await axios.put('/api/appointments.php', {
        id: appointmentId,
        ...appointment,
        status: newStatus
      });

      fetchAppointments();
    } catch (err) {
      setError('Failed to update appointment status');
      console.error('Error updating status:', err);
    }
  };

  const renderPainTrends = () => {
    if (!patientData.painLogs.length) return null;

    const data = {
      labels: patientData.painLogs.map(log => new Date(log.timestamp).toLocaleDateString()),
      datasets: [{
        label: 'Pain Level',
        data: patientData.painLogs.map(log => log.rating),
        fill: false,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      }]
    };

    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Pain Trends</h3>
        <Line data={data} />
      </div>
    );
  };

  if (loading) return <div className="text-center p-4">Loading appointments...</div>;
  if (error) return <div className="text-center p-4 text-red-500">{error}</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-2">Total Appointments</h3>
          <p className="text-3xl font-bold">{appointments.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-2">Upcoming Appointments</h3>
          <p className="text-3xl font-bold">
            {appointments.filter(apt => new Date(apt.datetime) > new Date() && apt.status === 'confirmed').length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-2">Pending Appointments</h3>
          <p className="text-3xl font-bold">
            {appointments.filter(apt => apt.status === 'pending').length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-2">Total Patients</h3>
          <p className="text-3xl font-bold">{patients.length}</p>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Appointments Section */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Appointments</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setView('calendar')}
                  className={`px-4 py-2 rounded ${view === 'calendar' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
                >
                  Calendar
                </button>
                <button
                  onClick={() => setView('list')}
                  className={`px-4 py-2 rounded ${view === 'list' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
                >
                  List
                </button>
                <button
                  onClick={() => handleAppointmentSelect({})}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  New Appointment
                </button>
              </div>
            </div>

            {view === 'calendar' ? (
              <AppointmentCalendar onSelectAppointment={handleAppointmentSelect} />
            ) : (
              <AppointmentList
                appointments={appointments}
                onSelectAppointment={handleAppointmentSelect}
                onStatusChange={handleStatusChange}
              />
            )}
          </div>
        </div>

        {/* Patient Selection */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Select Patient</h2>
            <select
              value={selectedPatient?.id || ''}
              onChange={(e) => setSelectedPatient(patients.find(p => p.id === e.target.value))}
              className="w-full p-2 border rounded"
            >
              <option value="">Select a patient</option>
              {patients.map(patient => (
                <option key={patient.id} value={patient.id}>
                  {patient.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Patient Data Section */}
      {selectedPatient && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Pain Tracking */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Pain Tracking</h2>
              {renderPainTrends()}
              <div className="mt-4">
                <h3 className="text-lg font-semibold mb-2">Recent Pain Logs</h3>
                <div className="space-y-4">
                  {patientData.painLogs.slice(0, 5).map(log => (
                    <div key={log.id} className="border rounded p-4">
                      <div className="flex justify-between">
                        <span className="font-medium">Pain Level: {log.rating}/10</span>
                        <span className="text-sm text-gray-500">
                          {new Date(log.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-2">{log.notes}</p>
                      <PainMap painPoints={log.location} style={{ marginTop: '1rem' }} />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Medications */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Medications</h2>
                <button
                  onClick={() => {/* Open add prescription modal */}}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Add Prescription
                </button>
              </div>
              <div className="space-y-4">
                {patientData.medications.map(med => (
                  <div key={med.id} className="border rounded p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">{med.name}</h3>
                        <p className="text-sm text-gray-600">Dosage: {med.dosage}</p>
                        <p className="text-sm text-gray-600">Schedule: {med.schedule}</p>
                      </div>
                      <button
                        onClick={() => {/* Open edit prescription modal */}}
                        className="text-sm text-blue-500 hover:text-blue-600"
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Messaging Section */}
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <MessageSystem
              recipientId={selectedPatient.id}
              recipientType="patient"
              recipientName={selectedPatient.name}
            />
          </div>
        </>
      )}

      {/* Appointment Modal */}
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

export default DoctorDashboard; 