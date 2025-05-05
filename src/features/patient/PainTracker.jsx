import React, { useState } from 'react';
// Removed unused icons: FaRegSmile, FaRegMoon, FaUtensils, FaCalendarAlt, FaClock, FaPills
import { useTracking } from '../../contexts/TrackingContext';
import bodyImage from '../../assets/images/body.jpg';
import './PainTracker.css';

const bodyAreas = [
  { id: 'head', name: 'Head' },
  { id: 'neck', name: 'Neck' },
  { id: 'shoulders', name: 'Shoulders' },
  { id: 'chest', name: 'Chest' },
  { id: 'back', name: 'Back' },
  { id: 'arms', name: 'Arms' },
  { id: 'legs', name: 'Legs' },
  { id: 'stomach', name: 'Stomach' },
  { id: 'hips', name: 'Hips' },
  { id: 'hands', name: 'Hands' },
  { id: 'feet', name: 'Feet' }
];

const sleepQualityLevels = [
  { value: 1, label: 'Very Poor', color: '#f87171' },
  { value: 2, label: 'Poor', color: '#fbbf24' },
  { value: 3, label: 'Average', color: '#60a5fa' },
  { value: 4, label: 'Good', color: '#34d399' },
  { value: 5, label: 'Excellent', color: '#22c55e' }
];

const moodLevels = [
  { value: 1, label: 'Terrible' },
  { value: 2, label: 'Bad' },
  { value: 3, label: 'Neutral' },
  { value: 4, label: 'Good' },
  { value: 5, label: 'Great' }
];

export default function PainTracker() {
  const [painLevel, setPainLevel] = useState(0);
  const [painAreas, setPainAreas] = useState([]);
  const [painNotes, setPainNotes] = useState('');
  const [hoursSlept, setHoursSlept] = useState('');
  const [sleepQuality, setSleepQuality] = useState('');
  const [foodCategory, setFoodCategory] = useState('');
  const [foodNotes, setFoodNotes] = useState('');

  const handlePainLevelChange = (level) => {
    setPainLevel(level);
  };

  const handlePainNotesChange = (e) => {
    setPainNotes(e.target.value);
  };

  const handlePainAreaToggle = (area) => {
    setPainAreas(prevAreas => 
      prevAreas.includes(area) 
        ? prevAreas.filter(a => a !== area) 
        : [...prevAreas, area]
    );
  };

  const handleHoursSleptChange = (e) => {
    setHoursSlept(e.target.value);
  };

  const handleSleepQualityChange = (quality) => {
    setSleepQuality(quality);
  };

  const handleFoodCategoryChange = (e) => {
    setFoodCategory(e.target.value);
  };

  const handleFoodNotesChange = (e) => {
    setFoodNotes(e.target.value);
  };

  const { addTracking } = useTracking();

  const handleSaveTracking = async () => {
    try {
      const trackingData = {
        painLevel,
        painAreas,
        painNotes,
        hoursSlept,
        sleepQuality,
        foodCategory,
        foodNotes
      };

      await addTracking(trackingData);
      alert('Pain tracking saved successfully!');
      
      // Reset form after successful save
      setPainLevel(0);
      setPainAreas([]);
      setPainNotes('');
      setHoursSlept('');
      setSleepQuality('');
      setFoodCategory('');
      setFoodNotes('');
    } catch (error) {
      console.error('Error saving tracking:', error);
      // Improved error feedback
      alert('Failed to save pain tracking. Please check your connection or try again later.'); 
    }
  };

  return (
    <div className="pain-tracker-container">
      <h2>Daily Pain Tracker</h2>
      
      <div className="tracking-section">
        <div className="pain-level-section">
          <h3>Pain Level (0-10)</h3>
          <div className="pain-slider">
            <input
              type="range"
              min="0"
              max="10"
              value={painLevel}
              onChange={(e) => handlePainLevelChange(parseInt(e.target.value))}
              className="pain-slider-input"
            />
            <div className="pain-level-display">{painLevel}</div>
          </div>
        </div>

        <div className="pain-areas-section">
          <h3>Pain Areas</h3>
          <div className="body-map-container">
            {/* Improved accessibility */}
            <img 
              src={bodyImage} 
              alt="Interactive human body map for tracking pain areas" 
              className="body-map" 
            />
            <div className="body-map-overlay">
              {bodyAreas.map(area => (
                <div
                  key={area.id}
                  className={`body-area ${painAreas.includes(area.id) ? 'active' : ''}`}
                  onClick={() => handlePainAreaToggle(area.id)}
                >
                  {area.name}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="notes-section">
          <h3>Additional Notes</h3>
          <textarea
            value={painNotes}
            onChange={handlePainNotesChange}
            placeholder="Describe your pain and any other symptoms..."
            className="notes-input"
          />
        </div>

        <div className="sleep-section">
          <h3>Sleep Quality</h3>
          <div className="sleep-inputs">
            <div className="hours-slept">
              <label>Hours slept:</label>
              <input
                type="number"
                value={hoursSlept}
                onChange={handleHoursSleptChange}
                min="0"
                max="24"
              />
            </div>
            <div className="sleep-quality">
              <label>Sleep quality:</label>
              <select
                value={sleepQuality}
                onChange={(e) => handleSleepQualityChange(e.target.value)}
              >
                <option value="">Select quality</option>
                {sleepQualityLevels.map(level => (
                  // Added missing key prop
                  <option key={level.value} value={level.value}>
                    {level.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="food-section">
          <h3>Diet & Nutrition</h3>
          <div className="food-inputs">
            <div className="food-category">
              <label>Food category:</label>
              <select
                value={foodCategory}
                onChange={handleFoodCategoryChange}
              >
                <option value="">Select category</option>
                <option value="meat">Meat</option>
                <option value="vegetables">Vegetables</option>
                <option value="fruits">Fruits</option>
                <option value="dairy">Dairy</option>
                <option value="grains">Grains</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="food-notes">
              <label>Food notes:</label>
              <textarea
                value={foodNotes}
                onChange={handleFoodNotesChange}
                placeholder="Describe your diet..."
              />
            </div>
          </div>
        </div>

        <button className="save-button" onClick={handleSaveTracking}>
          <span>Save Daily Tracking</span>
          <span className="cta-icon">💾</span>
        </button>
      </div>
    </div>
  );
}
