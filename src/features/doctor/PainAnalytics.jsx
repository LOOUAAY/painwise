import React, { useState, useEffect } from 'react';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { useAuth } from '../../contexts/AuthContext';
import { FaHeartbeat, FaBrain, FaBed, FaPills, FaAppleAlt, FaRunning, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import './PainAnalytics.css';

const PAIN_LOCATIONS = ['Head', 'Neck', 'Shoulder', 'Back', 'Knee', 'Other'];

const PainAnalytics = ({ patientId }) => {
  const [painData, setPainData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentLogIndex, setCurrentLogIndex] = useState(0);
  const { user } = useAuth();
  const [painLogs, setPainLogs] = useState([]);
  
  // Store the patient ID to use for data fetching
  useEffect(() => {
    if (patientId) {
      fetchPainLogs(patientId);
    }
  }, [patientId]);

  // Reset current log index when logs are loaded
  useEffect(() => {
    if (painLogs.length > 0 && currentLogIndex >= painLogs.length) {
      setCurrentLogIndex(0);
    }
  }, [painLogs.length, currentLogIndex]);

  // Process data when current log index changes
  useEffect(() => {
    if (painLogs && painLogs.length > 0) {
      // Process data for charts based on the current log index
      const processedData = processDataForCharts(painLogs);
      setPainData(processedData);
    }
  }, [currentLogIndex, painLogs?.length]);

  const fetchPainLogs = async (id) => {
    try {
      setLoading(true);
      setError(null);
      
      const patientIdToUse = id || patientId;
      console.log('Fetching pain logs for patient ID:', patientIdToUse);
      
      const response = await fetch(`http://localhost/app/api/debug_pain_logs.php?patient_id=${patientIdToUse}`, {
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('API response: ', data);
      
      if (data.success) {
        console.log('Successfully loaded', data.data?.length || 0, 'pain logs');
        const logs = data.data || [];
        setPainLogs(logs);
        
        if (!logs || logs.length === 0) {
          console.warn('No pain logs found for this patient');
          setPainData({
            timeSeriesData: [],
            locationData: [],
            painPoints: [],
            currentLog: null,
            totalLogs: 0,
            averagePain: 0,
            insightSummary: ['No pain logs recorded for this patient yet.']
          });
        } else {
          const processedData = processDataForCharts(logs);
          setPainData(processedData);
        }
      } else {
        const errorMessage = data?.error || 'Failed to fetch pain logs';
        console.error('API error:', errorMessage, data);
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('Error fetching pain logs:', error);
      setError(`Failed to load pain analytics: ${error.message}. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  const processDataForCharts = (logs) => {
    if (!logs || logs.length === 0) {
      return {
        timeSeriesData: [],
        locationData: [],
        triggerChartData: [],
        painPoints: [],
        averagePain: 0,
        currentLog: null,
        totalLogs: 0
      };
    }
    
    // Sort logs by date (newest first)
    const sortedLogs = [...logs].sort((a, b) => {
      const dateA = new Date(a.created_at || a.timestamp);
      const dateB = new Date(b.created_at || b.timestamp);
      return dateB - dateA;
    });
    
    // Keep track of the current log index
    if (currentLogIndex >= sortedLogs.length) {
      setCurrentLogIndex(0);
    }
    
    // Get current log
    const currentLog = sortedLogs[currentLogIndex];
    
    // We'll use only the current log for display
    const filtered = [currentLog];

    // Get the most recent log for detailed display
    const mostRecentLog = filtered.length > 0 
      ? filtered.sort((a, b) => {
          const dateA = new Date(a.created_at || a.timestamp);
          const dateB = new Date(b.created_at || b.timestamp);
          return dateB - dateA;
        })[0]
      : null;

    console.log('Filtered logs for processing:', filtered);
    
    // Prepare time series data for pain intensity
    const dailyPainData = {};
    filtered.forEach(log => {
      // Handle different date field names
      const date = new Date(log.log_time || log.created_at || log.timestamp).toLocaleDateString();
      if (!dailyPainData[date]) {
        dailyPainData[date] = {
          date,
          intensity: 0,
          count: 0
        };
      }
      // Handle different pain level field names
      const painLevel = parseInt(log.pain_level || log.rating || 0);
      dailyPainData[date].intensity += painLevel;
      dailyPainData[date].count += 1;
    });

    // Calculate average pain level per day
    const timeSeriesData = Object.values(dailyPainData).map(day => ({
      date: day.date,
      avgPain: Math.round((day.intensity / day.count) * 10) / 10
    }));

    // Sort by date ascending
    timeSeriesData.sort((a, b) => new Date(a.date) - new Date(b.date));

    // Process pain points for body map
    let painPoints = [];
    if (mostRecentLog) {
      console.log('Most recent log for pain points:', mostRecentLog);
      try {
        // Try parsing pain_points field
        if (mostRecentLog.pain_points) {
          painPoints = typeof mostRecentLog.pain_points === 'string' 
            ? JSON.parse(mostRecentLog.pain_points) 
            : mostRecentLog.pain_points;
        }
        // Fallback to location field if present
        else if (mostRecentLog.location) {
          painPoints = typeof mostRecentLog.location === 'string' 
            ? JSON.parse(mostRecentLog.location) 
            : mostRecentLog.location;
        }
        
        // Ensure painPoints is an array
        if (!Array.isArray(painPoints)) {
          painPoints = [painPoints];
        }
        
        // Map the pain points to the format expected by the visualization
        painPoints = painPoints.map(point => ({
          x: point.x || 50, // Default to center if not specified
          y: point.y || 50,
          intensity: point.rating || point.pain_level || 5,
          location: point.location || 'Body',
          description: Array.isArray(point.types) ? point.types.join(', ') : (point.type || '')
        }));
        
        console.log('Processed pain points for visualization:', painPoints);
      } catch (e) {
        console.error('Error parsing pain points:', e);
        painPoints = [];
      }
    }

    // Prepare location data for chart
    const locationData = PAIN_LOCATIONS.map(location => {
      const count = filtered.filter(log => {
        try {
          const painPoints = typeof log.pain_points === 'string' 
            ? JSON.parse(log.pain_points || '[]') 
            : (log.pain_points || []);
          return painPoints.some(point => point.location === location);
        } catch (e) {
          return false;
        }
      }).length;
      return { name: location, value: count };
    }).filter(item => item.value > 0);

    // Prepare trigger data
    const triggerData = {};
    filtered.forEach(log => {
      if (log.triggers) {
        const triggers = typeof log.triggers === 'string'
          ? log.triggers.split(',').map(t => t.trim())
          : log.triggers;

        if (Array.isArray(triggers)) {
          triggers.forEach(trigger => {
            if (trigger) {
              triggerData[trigger] = (triggerData[trigger] || 0) + 1;
            }
          });
        }
      }
    });

    const triggerChartData = Object.entries(triggerData)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5); // Top 5 triggers
    
    // Extract functionality, mood, sleep data from most recent log
    let functionalityScore = 0;
    let moodScore = 0;
    let anxietyScore = 0;
    let sleepScore = 0;
    let medication = { otc: null, prescription: null };
    let nutrition = { plantBased: null, fruitVeg: null, water: null };
    let exercise = { active: null, type: null, relaxation: null };

    if (mostRecentLog) {
      // Functionality
      functionalityScore = mostRecentLog.functionality_score || 0;
      
      // Mood and anxiety
      moodScore = mostRecentLog.mood_score || 0;
      anxietyScore = mostRecentLog.anxiety_score || 0;
      
      // Sleep
      sleepScore = mostRecentLog.sleep_score || 0;
      
      // Medication
      if (mostRecentLog.medication) {
        try {
          const medicationData = typeof mostRecentLog.medication === 'string'
            ? JSON.parse(mostRecentLog.medication)
            : mostRecentLog.medication;
          
          medication = {
            otc: medicationData.otc || false,
            otcCount: medicationData.otcCount || 0,
            prescription: medicationData.rx || false,
            rxCount: medicationData.rxCount || 0
          };
        } catch (e) {
          console.error('Error parsing medication data:', e);
        }
      }
      
      // Nutrition
      if (mostRecentLog.nutrition) {
        try {
          const nutritionData = typeof mostRecentLog.nutrition === 'string'
            ? JSON.parse(mostRecentLog.nutrition)
            : mostRecentLog.nutrition;
          
          nutrition = {
            plantBased: nutritionData.plant || false,
            fruitVeg: nutritionData.fruitVeg || false,
            fruitVegServings: nutritionData.fruitVegServings || 0,
            water: nutritionData.water || 0
          };
        } catch (e) {
          console.error('Error parsing nutrition data:', e);
        }
      }
      
      // Exercise
      if (mostRecentLog.exercise) {
        try {
          const exerciseData = typeof mostRecentLog.exercise === 'string'
            ? JSON.parse(mostRecentLog.exercise)
            : mostRecentLog.exercise;
          
          exercise = {
            active: exerciseData.exercised || false,
            type: exerciseData.exerciseType || [],
            relaxation: exerciseData.relaxation || false,
            relaxationHours: exerciseData.relaxationHours || 0
          };
        } catch (e) {
          console.error('Error parsing exercise data:', e);
        }
      }
    }

    // Generate insight summaries based on the data
    const insightSummary = [];
    if (filtered.length > 0) {
      if (painPoints.length > 0) {
        insightSummary.push(`Patient reported ${painPoints.length} pain point(s) in their most recent log.`);
      }
      
      if (anxietyScore > 7) {
        insightSummary.push('High anxiety levels reported - consider discussing mental health support options.');
      }
      
      if (sleepScore < 4) {
        insightSummary.push('Poor sleep quality reported - may be contributing to pain levels.');
      }
      
      if (exercise.active) {
        insightSummary.push('Patient is maintaining physical activity, which may help manage pain.');
      } else {
        insightSummary.push('Patient is not exercising regularly - consider gentle movement recommendations.');
      }
    } else {
      insightSummary.push('No pain logs recorded for this patient yet.');
    }

    return {
      timeSeriesData,
      locationData,
      triggerChartData,
      painPoints,
      averagePain: painLogs.length 
        ? Math.round((painLogs.reduce((sum, log) => sum + (parseInt(log.pain_level || log.rating) || 0), 0) / painLogs.length) * 10) / 10
        : 0,
      currentLog: currentLog || null,
      totalLogs: painLogs.length,
      functionality: functionalityScore,
      mood: moodScore,
      anxiety: anxietyScore,
      sleep: sleepScore,
      medication,
      nutrition,
      exercise,
      insightSummary,
      rawLogs: filtered
    };
  };

  const BodyOutlineVisualization = ({ painPoints }) => {
    return (
      <div className="body-outline-container">
        <div className="body-outline">
          <img 
            src="/body.jpg" 
            alt="Human body outline" 
            className="body-image"
          />
          {painPoints?.map((point, index) => (
            <div
              key={index}
              className="pain-point-marker"
              style={{
                left: `${point.x}%`,
                top: `${point.y}%`,
                width: `${10 + (point.intensity || 5) * 3}px`,
                height: `${10 + (point.intensity || 5) * 3}px`,
                backgroundColor: `rgba(239, 68, 68, ${0.3 + (point.intensity || 5) * 0.07})`,
                zIndex: 10
              }}
            >
              <span className="pain-intensity-badge">
                {point.intensity || '?'}/10
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="pain-analytics-container">
      {loading ? (
        <div className="loading-spinner">Loading patient data...</div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : (
        <>
          <div className="log-navigation">
            <button 
              className="nav-button" 
              onClick={() => setCurrentLogIndex(prev => Math.max(prev - 1, 0))}
              disabled={currentLogIndex <= 0}
            >
              <FaChevronLeft /> Previous Log
            </button>
            <div className="log-counter">
              Log {currentLogIndex + 1} of {painLogs.length}
            </div>
            <button 
              className="nav-button"
              onClick={() => setCurrentLogIndex(prev => Math.min(prev + 1, painLogs.length - 1))}
              disabled={currentLogIndex >= painLogs.length - 1}
            >
              Next Log <FaChevronRight />
            </button>
          </div>

          <div className="metrics-grid">
            <div className="metric-card">
              <div className="metric-label">Average Pain Level</div>
              <div className="metric-value">
                {painData.averagePain ? `${painData.averagePain}/10` : 'N/A'}
              </div>
            </div>
            <div className="metric-card">
              <div className="metric-label">Total Pain Logs</div>
              <div className="metric-value">{painLogs.length}</div>
            </div>
            <div className="metric-card">
              <div className="metric-label">Current Pain Level</div>
              <div className="metric-value">
                {painData.currentLog?.pain_level || 'N/A'}/10
              </div>
            </div>
          </div>

          <div className="section-card">
            <h3 className="section-title">Current Log</h3>
            <div className="log-details">
              <div className="log-date">
                {new Date(painData.currentLog?.created_at).toLocaleDateString()}
              </div>
              {painData.currentLog?.notes && (
                <div className="log-notes">
                  <h4>Patient Notes:</h4>
                  <p>{painData.currentLog.notes}</p>
                </div>
              )}
            </div>
          </div>

          <div className="section-card">
            <h3 className="section-title">Pain Assessment</h3>
            {painData.painPoints?.length > 0 ? (
              <div className="pain-assessment-content">
                <BodyOutlineVisualization painPoints={painData.painPoints} />
                <div className="pain-points-list">
                  {painData.painPoints.map((point, i) => (
                    <div key={i} className="pain-point-detail">
                      <span className="pain-location">{point.location || 'Body'}</span>
                      <span className="pain-level">Level {point.intensity}/10</span>
                      {point.description && (
                        <span className="pain-type">{point.description}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="no-data">No pain points recorded</div>
            )}
          </div>

          <div className="section-card">
            <h3 className="section-title">Pain Intensity Over Time</h3>
            <div className="chart-container">
              {painData.timeSeriesData?.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={painData.timeSeriesData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                    <XAxis dataKey="date" />
                    <YAxis domain={[0, 10]} />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="avgPain" 
                      stroke="#4F46E5" 
                      strokeWidth={2}
                      dot={{ fill: '#4F46E5', r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="no-data">No pain history data available</div>
              )}
            </div>
          </div>

          <div className="section-card insights">
            <h3 className="section-title">Pain Management Insights</h3>
            {painData.insightSummary?.length > 0 ? (
              <ul className="insights-list">
                {painData.insightSummary.map((insight, i) => (
                  <li key={i}>{insight}</li>
                ))}
              </ul>
            ) : (
              <div className="no-data">No insights available</div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default PainAnalytics;
