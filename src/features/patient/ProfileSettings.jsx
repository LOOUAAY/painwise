import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';
import './ProfileSettings.css';
import { FaCheck, FaExclamationTriangle } from 'react-icons/fa';

export default function ProfileSettings() {
  const { user, updateUserData } = useAuth();
  const [form, setForm] = useState({
    name: '',
    email: '',
    age: '',
    gender: '',
    phone: '',
    address: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [medicalHistoryItems, setMedicalHistoryItems] = useState([]);
  const [newCondition, setNewCondition] = useState({
    condition_name: '',
    diagnosed_date: '',
    notes: ''
  });
  const [showMedicalForm, setShowMedicalForm] = useState(false);

  useEffect(() => {
    if (user) {
      fetchUserProfile();
      fetchMedicalHistory();
    }
  }, [user]);

  const fetchUserProfile = async () => {
    try {
      const response = await api.getPatientProfile(user.id);
      if (response.success) {
        const profileData = response.data || {};
        setForm({
          name: profileData.name || user.name || '',
          email: profileData.email || user.email || '',
          age: profileData.age || '',
          gender: profileData.gender || '',
          phone: profileData.phone || '',
          address: profileData.address || ''
        });
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
      // If we can't fetch the profile, at least use what we have in the auth context
      setForm({
        name: user.name || '',
        email: user.email || '',
        age: user.age || '',
        gender: user.gender || '',
        phone: user.phone || '',
        address: user.address || ''
      });
    }
  };

  const fetchMedicalHistory = async () => {
    try {
      const response = await api.getMedicalHistory(user.id);
      if (response.success) {
        setMedicalHistoryItems(response.data || []);
      }
    } catch (err) {
      console.error('Error fetching medical history:', err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Include the patient ID in the form data
      const profileData = {
        ...form,
        id: user.id // Include the ID in the data object
      };
      
      const response = await api.updatePatientProfile(profileData);
      if (response.success) {
        setSuccess(true);
        // Update the auth context with new user data
        updateUserData({
          ...user,
          ...form
        });
        
        // Show success message briefly
        setTimeout(() => {
          setSuccess(false);
        }, 3000);
      } else {
        throw new Error(response.error || 'Failed to update profile');
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err.message || 'An error occurred while updating your profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleConditionChange = (e) => {
    const { name, value } = e.target;
    setNewCondition(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddMedicalCondition = async (e) => {
    e.preventDefault();
    if (!newCondition.condition_name) return;

    setLoading(true);
    try {
      const response = await api.addMedicalHistory(user.id, newCondition);
      if (response.success) {
        // Reset form and fetch updated list
        setNewCondition({
          condition_name: '',
          diagnosed_date: '',
          notes: ''
        });
        await fetchMedicalHistory();
        setShowMedicalForm(false);
      } else {
        throw new Error(response.error || 'Failed to add medical condition');
      }
    } catch (err) {
      console.error('Error adding medical condition:', err);
      setError(err.message || 'An error occurred while adding the medical condition.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCondition = async (id) => {
    if (!window.confirm('Are you sure you want to delete this medical condition?')) return;

    setLoading(true);
    try {
      const response = await api.deleteMedicalHistory(id);
      if (response.success) {
        await fetchMedicalHistory();
      } else {
        throw new Error(response.error || 'Failed to delete medical condition');
      }
    } catch (err) {
      console.error('Error deleting medical condition:', err);
      setError(err.message || 'An error occurred while deleting the medical condition.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-settings-container">
      <h2>Profile Settings</h2>
      
      {error && (
        <div className="error-message">
          <FaExclamationTriangle /> {error}
        </div>
      )}
      
      {success && (
        <div className="success-message">
          <FaCheck /> Profile updated successfully!
        </div>
      )}
      
      <div className="profile-section">
        <h3>Personal Information</h3>
        <form onSubmit={handleProfileSubmit}>
          <div className="form-group">
            <label>Name</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleInputChange}
              required
              disabled
            />
            <small>Email cannot be changed</small>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>Age</label>
              <input
                type="number"
                name="age"
                value={form.age}
                onChange={handleInputChange}
                min="0"
                max="120"
              />
            </div>
            
            <div className="form-group">
              <label>Gender</label>
              <select 
                name="gender" 
                value={form.gender} 
                onChange={handleInputChange}
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
                <option value="prefer-not-to-say">Prefer not to say</option>
              </select>
            </div>
          </div>
          
          <div className="form-group">
            <label>Phone</label>
            <input
              type="tel"
              name="phone"
              value={form.phone}
              onChange={handleInputChange}
              placeholder="e.g., (123) 456-7890"
            />
          </div>
          
          <div className="form-group">
            <label>Address</label>
            <textarea
              name="address"
              value={form.address}
              onChange={handleInputChange}
              rows="3"
              placeholder="Enter your full address"
            ></textarea>
          </div>
          
          <button 
            type="submit" 
            className="save-btn"
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
      
      <div className="medical-history-section">
        <div className="section-header">
          <h3>Medical History</h3>
          <button 
            className="add-btn"
            onClick={() => setShowMedicalForm(true)}
            disabled={loading}
          >
            Add Condition
          </button>
        </div>
        
        {showMedicalForm && (
          <form className="medical-form" onSubmit={handleAddMedicalCondition}>
            <div className="form-group">
              <label>Condition Name</label>
              <input
                type="text"
                name="condition_name"
                value={newCondition.condition_name}
                onChange={handleConditionChange}
                required
                placeholder="e.g., Hypertension, Diabetes, etc."
              />
            </div>
            
            <div className="form-group">
              <label>Diagnosed Date (optional)</label>
              <input
                type="date"
                name="diagnosed_date"
                value={newCondition.diagnosed_date}
                onChange={handleConditionChange}
              />
            </div>
            
            <div className="form-group">
              <label>Notes (optional)</label>
              <textarea
                name="notes"
                value={newCondition.notes}
                onChange={handleConditionChange}
                rows="3"
                placeholder="Add any additional information about this condition"
              ></textarea>
            </div>
            
            <div className="form-actions">
              <button 
                type="button" 
                className="cancel-btn"
                onClick={() => setShowMedicalForm(false)}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="save-btn"
                disabled={loading || !newCondition.condition_name}
              >
                {loading ? 'Adding...' : 'Add Condition'}
              </button>
            </div>
          </form>
        )}
        
        {medicalHistoryItems.length > 0 ? (
          <div className="medical-history-list">
            {medicalHistoryItems.map(item => (
              <div key={item.id} className="medical-history-item">
                <div className="item-header">
                  <h4>{item.condition_name}</h4>
                  <button 
                    className="delete-btn"
                    onClick={() => handleDeleteCondition(item.id)}
                    disabled={loading}
                  >
                    Delete
                  </button>
                </div>
                {item.diagnosed_date && (
                  <p className="diagnosed-date">
                    Diagnosed: {new Date(item.diagnosed_date).toLocaleDateString()}
                  </p>
                )}
                {item.notes && (
                  <p className="notes">{item.notes}</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="no-data-message">No medical conditions added yet.</p>
        )}
      </div>
    </div>
  );
}
