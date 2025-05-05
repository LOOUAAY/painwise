import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api'; // Import the api service

const defaultStyles = {
  card: {
    background: 'white',
    borderRadius: '20px',
    padding: '2rem',
    maxWidth: '500px',
    width: '90%',
    boxShadow: '0 8px 32px rgba(31, 38, 135, 0.1)',
    border: '1px solid #e2e8f0',
    margin: '2rem auto',
  },
  header: {
    textAlign: 'center',
    color: '#4F46E5',
    marginBottom: '1.5rem',
    fontWeight: 700,
    fontSize: 28
  },
  roleBtn: {
    width: '48%',
    padding: '1rem',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: 18,
    margin: '0 1%',
    background: '#f1f5f9',
    color: '#222',
    transition: 'all 0.2s',
  },
  roleBtnActive: {
    background: '#4F46E5',
    color: 'white',
  },
  form: {
    marginTop: '2rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.2rem',
  },
  input: {
    padding: '0.8rem',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    fontSize: 16,
  },
  submitBtn: {
    background: '#4F46E5',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    padding: '0.75rem 2.5rem',
    fontWeight: 600,
    fontSize: 18,
    cursor: 'pointer',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
  },
  switch: {
    textAlign: 'center',
    marginTop: '1.5rem',
    color: '#4F46E5',
    cursor: 'pointer',
    textDecoration: 'underline',
    fontWeight: 500
  },
  error: {
    color: 'red',
    textAlign: 'center',
    marginTop: 8
  },
  success: {
    color: 'green',
    textAlign: 'center',
    marginTop: 8
  },
  select: {
    padding: '0.8rem',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    fontSize: 16,
    width: '100%',
    backgroundColor: 'white',
  }
};

export default function Register() {
  const [role, setRole] = useState('patient');
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    specialty: '', // for doctor
    doctor_id: '', // for patient
  });
  const [doctors, setDoctors] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Fetch doctors when component mounts
  useEffect(() => {
    if (role === 'patient') {
      fetchDoctors();
    }
  }, [role]);

  const fetchDoctors = async () => {
    try {
      const data = await api.getDoctors(); // Use the api service function
      if (data.success) {
        setDoctors(data.doctors);
      } else {
        setError(data.error || 'Failed to load doctors list');
      }
    } catch (err) {
      setError('Failed to load doctors list: ' + err.message);
    }
  };

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRoleSwitch = (newRole) => {
    setRole(newRole);
    setForm({ name: '', email: '', password: '', confirmPassword: '', specialty: '', doctor_id: '' });
    setError('');
    setSuccess('');
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!form.name || !form.email || !form.password || !form.confirmPassword || 
        (role === 'doctor' && !form.specialty) ||
        (role === 'patient' && !form.doctor_id)) {
      setError('Please fill in all required fields.');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      const endpoint = role === 'patient' ? '/api/register_patient.php' : '/api/register_doctor.php';
      const payload = role === 'patient'
        ? { name: form.name, email: form.email, password: form.password, doctor_id: form.doctor_id }
        : { name: form.name, email: form.email, password: form.password, specialty: form.specialty };
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        setSuccess('Registration successful! You can now log in.');
        setTimeout(() => navigate('/login'), 1500);
      } else {
        setError(data.error || 'Registration failed.');
      }
    } catch (err) {
      setError('Server error. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8f9fa' }}>
      <div style={defaultStyles.card}>
        <div style={defaultStyles.header}>Sign Up</div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
          <button
            style={role === 'patient' ? { ...defaultStyles.roleBtn, ...defaultStyles.roleBtnActive } : defaultStyles.roleBtn}
            onClick={() => handleRoleSwitch('patient')}
          >
            Patient
          </button>
          <button
            style={role === 'doctor' ? { ...defaultStyles.roleBtn, ...defaultStyles.roleBtnActive } : defaultStyles.roleBtn}
            onClick={() => handleRoleSwitch('doctor')}
          >
            Doctor
          </button>
        </div>
        <form style={defaultStyles.form} onSubmit={handleSubmit}>
          <input
            style={defaultStyles.input}
            type="text"
            name="name"
            placeholder="Full Name"
            value={form.name}
            onChange={handleChange}
            required
          />
          <input
            style={defaultStyles.input}
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
          />
          <input
            style={defaultStyles.input}
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
          />
          <input
            style={defaultStyles.input}
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            value={form.confirmPassword}
            onChange={handleChange}
            required
          />
          {role === 'doctor' && (
            <input
              style={defaultStyles.input}
              type="text"
              name="specialty"
              placeholder="Specialty"
              value={form.specialty}
              onChange={handleChange}
              required
            />
          )}
          {role === 'patient' && (
            <select
              style={defaultStyles.select}
              name="doctor_id"
              value={form.doctor_id}
              onChange={handleChange}
              required
            >
              <option value="">Select a Doctor</option>
              {doctors.map(doctor => (
                <option key={doctor.id} value={doctor.id}>
                  {doctor.name} - {doctor.specialty}
                </option>
              ))}
            </select>
          )}
          <button
            style={defaultStyles.submitBtn}
            type="submit"
            disabled={loading}
          >
            {loading ? 'Signing up...' : 'Sign Up'}
          </button>
        </form>
        {error && <div style={defaultStyles.error}>{error}</div>}
        {success && <div style={defaultStyles.success}>{success}</div>}
        <div style={defaultStyles.switch} onClick={() => navigate('/login')}>
          Already have an account? Log in
        </div>
      </div>
    </div>
  );
}