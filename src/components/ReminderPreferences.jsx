import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import NotificationService from '../services/NotificationService';

const ReminderPreferences = () => {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState({
    email_enabled: true,
    browser_notifications_enabled: true,
    reminder_lead_time: 24
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notificationPermission, setNotificationPermission] = useState('default');

  useEffect(() => {
    fetchPreferences();
    checkNotificationPermission();
  }, [user]);

  const fetchPreferences = async () => {
    try {
      const response = await axios.get(
        `/api/reminder_preferences.php?user_id=${user.id}&user_type=${user.role}`
      );
      if (response.data.success) {
        setPreferences(response.data.preferences);
      }
    } catch (err) {
      setError('Failed to fetch preferences');
      console.error('Error fetching preferences:', err);
    } finally {
      setLoading(false);
    }
  };

  const checkNotificationPermission = () => {
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  };

  const handlePreferenceChange = async (key, value) => {
    try {
      const updatedPreferences = { ...preferences, [key]: value };
      setPreferences(updatedPreferences);

      await axios.put('/api/reminder_preferences.php', {
        user_id: user.id,
        user_type: user.role,
        ...updatedPreferences
      });

      if (key === 'browser_notifications_enabled' && value) {
        const permission = await NotificationService.requestPermission();
        setNotificationPermission(permission ? 'granted' : 'denied');
      }
    } catch (err) {
      setError('Failed to update preferences');
      console.error('Error updating preferences:', err);
      // Revert the change if it failed
      fetchPreferences();
    }
  };

  if (loading) return <div className="text-center p-4">Loading preferences...</div>;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Reminder Preferences</h2>

      {error && (
        <div className="mb-4 text-red-500 text-sm">{error}</div>
      )}

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <label className="font-medium">Email Reminders</label>
            <p className="text-sm text-gray-500">Receive appointment reminders via email</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={preferences.email_enabled}
              onChange={(e) => handlePreferenceChange('email_enabled', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <label className="font-medium">Browser Notifications</label>
            <p className="text-sm text-gray-500">
              Receive appointment reminders in your browser
              {notificationPermission === 'denied' && (
                <span className="text-red-500 ml-2">
                  (Notifications blocked by browser)
                </span>
              )}
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={preferences.browser_notifications_enabled}
              onChange={(e) => handlePreferenceChange('browser_notifications_enabled', e.target.checked)}
              disabled={notificationPermission === 'denied'}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        <div>
          <label className="font-medium">Reminder Lead Time</label>
          <p className="text-sm text-gray-500 mb-2">
            How many hours before the appointment should you be reminded?
          </p>
          <select
            value={preferences.reminder_lead_time}
            onChange={(e) => handlePreferenceChange('reminder_lead_time', parseInt(e.target.value))}
            className="w-full p-2 border rounded"
          >
            <option value="1">1 hour before</option>
            <option value="2">2 hours before</option>
            <option value="4">4 hours before</option>
            <option value="12">12 hours before</option>
            <option value="24">24 hours before</option>
            <option value="48">48 hours before</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default ReminderPreferences; 