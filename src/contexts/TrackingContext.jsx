import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const TrackingContext = createContext({
  addTracking: () => {},
  getTrackings: () => [],
  trackings: []
});

export const useTracking = () => {
  const context = useContext(TrackingContext);
  if (context === undefined) {
    throw new Error('useTracking must be used within a TrackingProvider');
  }
  return context;
};

export const TrackingProvider = ({ children }) => {
  const { user } = useAuth();
  const [trackings, setTrackings] = useState([]);

  useEffect(() => {
    // Only load trackings if we have a valid user
    if (user && user.role) {
      const savedTrackings = localStorage.getItem(`trackings_${user.role}_${user.id}`);
      if (savedTrackings) {
        const parsedTrackings = JSON.parse(savedTrackings);
        setTrackings(parsedTrackings);
      }
    }
  }, [user]);

  const addTracking = async (trackingData) => {
    try {
      if (!user || !user.role) {
        throw new Error('User not authenticated');
      }

      const newTracking = {
        ...trackingData,
        timestamp: new Date().toISOString(),
        userId: user.id,
        role: user.role
      };

      setTrackings(prev => [...prev, newTracking]);

      localStorage.setItem(`trackings_${user.role}_${user.id}`, 
        JSON.stringify([...trackings, newTracking])
      );

      return newTracking;
    } catch (error) {
      console.error('Error saving tracking:', error);
      throw error;
    }
  };

  const getTrackings = () => trackings;

  return (
    <TrackingContext.Provider value={{ addTracking, getTrackings, trackings }}>
      {children}
    </TrackingContext.Provider>
  );
};
