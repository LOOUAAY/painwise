import { createBrowserRouter, RouterProvider, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { TrackingProvider } from './contexts/TrackingContext';
import PatientDashboard from './features/patient/PatientDashboard';
import DoctorDashboard from './features/doctor/DoctorDashboard';
import PainTracker from './features/patient/PainTracker';
import MedicationReminders from './features/medication/MedicationReminders';
import AnalyticsDashboard from './features/analytics/AnalyticsDashboard';
import Login from './features/auth/Login';
import LogPain from './features/patient/LogPain';
import NotFound from './features/NotFound';
import Navigation from './components/Navigation';
import ProtectedRoute from './components/ProtectedRoute';
import Register from './features/auth/Register';
import './index.css';
// Doctor Components
import AppointmentManagement from './features/doctor/AppointmentManagement';
import Messages from './features/doctor/Messages';
import PrescriptionManagement from './features/doctor/PrescriptionManagement';
// Patient Components
import ProfileSettings from './features/patient/ProfileSettings';
import PatientPrescriptions from './features/patient/PatientPrescriptions';
import PatientAppointments from './features/patient/PatientAppointments';
import PatientMessages from './features/patient/PatientMessages';

const contentStyles = {
  padding: '0',
  minHeight: 'calc(100vh - 60px)',
  backgroundColor: '#f8f9fa',
  marginTop: '0',
  width: '100%',
  display: 'flex',
  flexDirection: 'column'
};

const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/login" replace />
  },
  {
    path: "/login",
    element: <Login />
  },
  {
    path: "/register",
    element: <Register />
  },
  {
    path: "/patient/*",
    element: (
      <ProtectedRoute allowedRoles={['patient']}>
        <div className="protected-layout">
          <Navigation />
          <div style={contentStyles}>
            <Routes>
              <Route index element={<PatientDashboard />} />
              <Route path="pain-tracker" element={
                <TrackingProvider>
                  <PainTracker />
                </TrackingProvider>
              } />
              <Route path="results" element={<AnalyticsDashboard />} />
              <Route path="log-pain" element={<LogPain />} />
              <Route path="profile" element={<ProfileSettings />} />
              <Route path="prescriptions" element={<PatientPrescriptions />} />
              <Route path="appointments" element={<PatientAppointments />} />
              <Route path="messages" element={<PatientMessages />} />
              <Route path="*" element={<Navigate to="/patient" replace />} />
            </Routes>
          </div>
        </div>
      </ProtectedRoute>
    )
  },
  {
    path: "/doctor/*",
    element: (
      <ProtectedRoute allowedRoles={['doctor']}>
        <div className="protected-layout">
          <Navigation />
          <div style={contentStyles}>
            <Routes>
              <Route index element={<DoctorDashboard />} />
              <Route path="analytics" element={<AnalyticsDashboard />} />
              <Route path="appointments" element={<AppointmentManagement />} />
              <Route path="messages" element={<Messages />} />
              <Route path="prescriptions" element={<PrescriptionManagement />} />
              <Route path="*" element={<Navigate to="/doctor" replace />} />
            </Routes>
          </div>
        </div>
      </ProtectedRoute>
    )
  },
  {
    path: "*",
    element: <Navigate to="/login" replace />
  }
]);

function App() {
  // Add error boundary for debugging
  useEffect(() => {
    // Log environment information
    console.log('Environment:', import.meta.env.MODE);
    console.log('Base URL:', import.meta.env.BASE_URL);
    console.log('API URL:', import.meta.env.VITE_API_BASE_URL);
    
    // Add global error handler
    window.addEventListener('error', (event) => {
      console.error('Global error caught:', event.error);
    });
    
    return () => {
      window.removeEventListener('error', () => {});
    };
  }, []);

  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}

export default App;