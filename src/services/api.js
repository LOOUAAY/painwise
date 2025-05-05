// Use environment-specific API base URL
const API_BASE = import.meta.env.VITE_API_BASE_URL || 
  (import.meta.env.PROD ? '/api' : 'http://localhost/app/api');

console.log('Using API base URL:', API_BASE);

const handleResponse = async (response) => {
  let data;
  try {
    data = await response.json();
  } catch (e) {
    throw new Error('Invalid JSON response');
  }
  if (!response.ok || data.success === false) {
    throw new Error(data.error || 'An error occurred');
  }
  return data;
};

export const api = {
  // Auth
  login: async (credentials) => {
    const response = await fetch(`${API_BASE}/login_patient.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
      // Removed credentials: 'include' to fix CORS issues
    });
    return handleResponse(response);
  },

  loginDoctor: async (credentials) => {
    const response = await fetch(`${API_BASE}/login_doctor.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
      // Removed credentials: 'include' to fix CORS issues
    });
    return handleResponse(response);
  },

  register: async (userData) => {
    const response = await fetch(`${API_BASE}/register_patient.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
      // Removed credentials: 'include' to fix CORS issues
    });
    return handleResponse(response);
  },

  // Doctors
  getDoctors: async () => {
    try {
      console.log('Fetching doctors from:', `${API_BASE}/get_doctors.php`);
      const response = await fetch(`${API_BASE}/get_doctors.php`);
      
      // Log response status for debugging
      console.log('Doctors API response status:', response.status);
      
      // If response is not OK, get the error text
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Doctors API error:', errorText);
        throw new Error(`Failed to fetch doctors: ${response.status} ${response.statusText}`);
      }
      
      return handleResponse(response);
    } catch (error) {
      console.error('Error in getDoctors:', error);
      throw error;
    }
  },

  getDoctorPatients: async (doctorId) => {
    const response = await fetch(`${API_BASE}/get_doctor_patients.php?doctor_id=${doctorId}`);
    return handleResponse(response);
  },

  // Patient Details
  getPatientDetails: async (patientId, doctorId) => {
    const response = await fetch(`${API_BASE}/get_patient_details.php?patient_id=${patientId}&doctor_id=${doctorId}`);
    return handleResponse(response);
  },

  // Appointments
  getAppointments: async (id, role = 'doctor') => {
    const param = role === 'doctor' ? 'doctor_id' : 'patient_id';
    const response = await fetch(`${API_BASE}/get_appointments.php?${param}=${id}`);
    return handleResponse(response);
  },
  addAppointment: async (data) => {
    const response = await fetch(`${API_BASE}/add_appointment.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  // Messages
  getMessages: async (senderId, recipientId) => {
    const response = await fetch(`${API_BASE}/get_messages.php?sender_id=${senderId}&recipient_id=${recipientId}`);
    return handleResponse(response);
  },
  sendMessage: async (data) => {
    const response = await fetch(`${API_BASE}/send_message.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  // Prescriptions
  getPrescriptions: async (patientId) => {
    const response = await fetch(`${API_BASE}/get_prescriptions.php?patient_id=${patientId}`);
    return handleResponse(response);
  },
  addPrescription: async (data) => {
    const response = await fetch(`${API_BASE}/add_prescription.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },
  deletePrescription: async (id) => {
    const response = await fetch(`${API_BASE}/delete_prescription.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    return handleResponse(response);
  },
  
  // Patient Profile
  getPatientProfile: async (patientId) => {
    const response = await fetch(`${API_BASE}/get_patient_profile.php?patient_id=${patientId}`);
    return handleResponse(response);
  },
  updatePatientProfile: async (data) => {
    const response = await fetch(`${API_BASE}/update_patient_profile.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },
  
  // Medical History
  getMedicalHistory: async (patientId) => {
    const response = await fetch(`${API_BASE}/get_medical_history.php?patient_id=${patientId}`);
    return handleResponse(response);
  },
  addMedicalHistory: async (data) => {
    const response = await fetch(`${API_BASE}/add_medical_history.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },
  deleteMedicalHistory: async (id) => {
    const response = await fetch(`${API_BASE}/delete_medical_history.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    return handleResponse(response);
  },

  // Pain Logs
  getPainLogs: async (patientId) => {
    const response = await fetch(`${API_BASE}/debug_pain_logs.php?patient_id=${patientId}`);
    return handleResponse(response);
  },

  savePainLog: async (logData) => {
    const response = await fetch(`${API_BASE}/save_pain_log_fixed.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(logData),
      credentials: 'include'
    });
    return handleResponse(response);
  },

  // Files
  uploadFile: async (formData) => {
    const response = await fetch(`${API_BASE}/upload_file.php`, {
      method: 'POST',
      body: formData,
      credentials: 'include'
    });
    return handleResponse(response);
  },

  // Notifications
  getNotifications: async (userId) => {
    const response = await fetch(`${API_BASE}/notifications.php?user_id=${userId}`, {
      credentials: 'include'
    });
    return handleResponse(response);
  },

  markNotificationAsRead: async (notificationId) => {
    const response = await fetch(`${API_BASE}/notifications.php`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notification_id: notificationId }),
      credentials: 'include'
    });
    return handleResponse(response);
  }
};