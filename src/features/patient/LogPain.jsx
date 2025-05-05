import React, { useState } from 'react';
import bodyImage from '../../assets/images/body.jpg';
import './LogPainModern.css';
import { FaUserMd, FaRegSmile, FaBed, FaPills, FaAppleAlt, FaDumbbell, FaHeartbeat, FaChartLine } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';

const MAX_POINTS = 4;

const PAIN_RATINGS = [
  { value: 10, color: '#a60000', desc: 'As bad as it could be, nothing else matters' },
  { value: 9, color: '#d35400', desc: 
"Can't bear the pain, unable to do anything" },
  { value: 8, color: '#f39c12', desc: 'Awful, hard to do anything' },
  { value: 7, color: '#c49a00', desc: 'Focus of attention, prevents doing daily activities' },
  { value: 6, color: '#218c3a', desc: 'Hard to ignore, avoid usual activities' },
  { value: 5, color: '#1abc9c', desc: 'Interrupts some activities' },
  { value: 4, color: '#16a085', desc: 'Distracts me, can do usual activities' },
  { value: 3, color: '#2980b9', desc: 'Sometimes distracts me' },
  { value: 2, color: '#6c5ce7', desc: 'Notice pain, does not interfere with activities' },
  { value: 1, color: '#6c3483', desc: 'Hardly notice pain' },
  { value: 0, color: '#000', desc: 'No pain' },
];

const PAIN_TYPES = [
  'Dull', 'Sharp', 'Radiating', 'Continuous', 'Intermittent', 'Tingling', 'Aching', 'Numb', 'Stabbing'
];

const FUNCTIONALITY_QUESTIONS = [
  {
    label: 'This week, were you able to perform functions of daily living (including work, time with family or friends, completing errands)?',
  },
  {
    label: 'What is your level of physical activity?',
  },
  {
    label: 'How are your relationships with friends and family?',
  },
];

const MOOD_QUESTIONS = [
  { left: 'Hopeless', right: 'Hopeful' },
  { left: 'Worthless', right: 'Valuable' },
  { left: 'Depressed', right: 'Happy' },
  { left: 'Disconnected', right: 'Involved' },
  { left: 'Unsafe', right: 'Safe' },
];

const ANXIETY_QUESTIONS = [
  { left: 'Hopeless', right: 'Hopeful' },
  { left: 'Worthless', right: 'Valuable' },
  { left: 'Depressed', right: 'Happy' },
  { left: 'Disconnected', right: 'Involved' },
  { left: 'Unsafe', right: 'Safe' },
];

const SLEEP_QUESTIONS = [
  { left: 'Sleepless', right: 'Rested' },
  { left: 'Tired', right: 'Energetic' },
  { left: 'Sleepy', right: 'Alert' },
  { left: 'Distracted', right: 'Focused', center: 'How is your sleep impacting your daily living?' },
];

const TOTAL_STEPS = 9;

const LogPain = () => {
  const [step, setStep] = useState(1); // 1: pain area, 2: functionality, 3: mood, 4: anxiety, 5: sleep
  const [painPoints, setPainPoints] = useState([]); // {x, y, rating, types}
  const [modalStep, setModalStep] = useState(null); // null | 'rating' | 'type'
  const [currentPoint, setCurrentPoint] = useState(null); // {x, y}
  const [selectedRating, setSelectedRating] = useState(null);
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [functionality, setFunctionality] = useState([0, 0, 0]);
  const [mood, setMood] = useState([0, 0, 0, 0, 0]);
  const [anxiety, setAnxiety] = useState([0, 0, 0, 0, 0]);
  const [sleep, setSleep] = useState([0, 0, 0, 0]);
  // Pill Count state
  const [pillCount, setPillCount] = useState({ otc: null, otcCount: 0, rx: null, rxCount: 0 });
  // Nutrition state
  const [nutrition, setNutrition] = useState({
    plant: null,
    fruitVeg: null,
    fruitVegServings: 0,
    water: null,
    waterOunces: 0,
    caffeine: null,
    caffeineDrinks: 0,
    sugar: null,
    sugarGrams: '',
    tobacco: null
  });
  // Exercise state
  const [exercise, setExercise] = useState({
    exercised: null,
    exerciseType: [],
    relaxation: null,
    relaxationHours: 0
  });
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null); // 'success', 'error', or null
  const { user } = useAuth();

  // Show warning if no doctor is assigned
  if (!user.doctor_id) {
    return (
      <div style={{
        padding: '2rem',
        textAlign: 'center',
        background: '#fff3cd',
        color: '#856404',
        borderRadius: '8px',
        margin: '2rem auto',
        maxWidth: '600px'
      }}>
        <h2 style={{ marginBottom: '1rem' }}>⚠️ No Doctor Assigned</h2>
        <p>You need to be assigned to a doctor before you can log your pain. Please contact your administrator to get assigned to a doctor.</p>
      </div>
    );
  }

  // Handle click on body image
  const handleBodyClick = (e) => {
    if (painPoints.length >= MAX_POINTS) return;
    const rect = e.target.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setCurrentPoint({ x, y });
    setModalStep('rating');
    setSelectedRating(null);
    setSelectedTypes([]);
  };

  // Handle rating selection
  const handleRatingSelect = (value) => {
    setSelectedRating(value);
    setModalStep('type');
  };

  // Handle pain type toggle
  const handleTypeToggle = (type) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  // Handle submit pain point
  const handleSubmitPainPoint = () => {
    setPainPoints((prev) => [
      ...prev,
      { ...currentPoint, rating: selectedRating, types: selectedTypes }
    ]);
    setModalStep(null);
    setCurrentPoint(null);
    setSelectedRating(null);
    setSelectedTypes([]);
  };
  


  // Modal for pain rating
  const PainRatingModal = () => (
    <div style={modalStyle}>
      <h2 style={{ color: 'white', textAlign: 'center', marginBottom: 24 }}>How Would You Rate Your Pain?</h2>
      {PAIN_RATINGS.map((r) => (
        <div
          key={r.value}
          onClick={() => handleRatingSelect(r.value)}
          style={{
            display: 'flex',
            alignItems: 'center',
            background: 'white',
            borderRadius: 24,
            margin: '12px 0',
            padding: '8px 24px',
            cursor: 'pointer',
            fontWeight: 500,
            fontSize: 18,
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
          }}
        >
          <span style={{
            background: r.color,
            color: 'white',
            borderRadius: '50%',
            width: 36,
            height: 36,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: 22,
            marginRight: 18
          }}>{r.value}</span>
          <span>{r.desc}</span>
        </div>
      ))}
    </div>
  );

  // Modal for pain type
  const PainTypeModal = () => (
    <div style={modalStyle}>
      <div style={{ display: 'flex', alignItems: 'center', background: 'white', borderRadius: 24, padding: '8px 24px', fontWeight: 500, fontSize: 18, marginBottom: 16 }}>
        <span style={{
          background: PAIN_RATINGS.find(r => r.value === selectedRating)?.color || '#000',
          color: 'white',
          borderRadius: '50%',
          width: 36,
          height: 36,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 700,
          fontSize: 22,
          marginRight: 18
        }}>{selectedRating}</span>
        <span>{PAIN_RATINGS.find(r => r.value === selectedRating)?.desc}</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 16 }}>
        {PAIN_TYPES.map((type) => (
          <label key={type} style={{ color: 'white', fontSize: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <input
              type="checkbox"
              checked={selectedTypes.includes(type)}
              onChange={() => handleTypeToggle(type)}
              style={{ width: 18, height: 18 }}
            />
            {type}
          </label>
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 16 }}>
        <button onClick={() => { setModalStep(null); setCurrentPoint(null); }} style={modalBtnStyle}>Cancel</button>
        <button onClick={handleSubmitPainPoint} style={{ ...modalBtnStyle, background: '#001056', color: 'white' }} disabled={!selectedRating}>Submit</button>
      </div>
    </div>
  );

  // Modal overlay
  const ModalOverlay = ({ children }) => (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.7)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      {children}
    </div>
  );

  // Modal styles
  const modalStyle = {
    background: '#001056',
    borderRadius: 24,
    padding: 32,
    minWidth: 350,
    maxWidth: 420,
    boxShadow: '0 4px 32px rgba(0,0,0,0.25)',
    color: 'white',
    margin: 16
  };
  const modalBtnStyle = {
    background: 'white',
    color: '#001056',
    border: 'none',
    borderRadius: 8,
    padding: '0.5rem 1.5rem',
    fontWeight: 600,
    fontSize: 16,
    cursor: 'pointer',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
  };

  // Functionality sliders page
  const FunctionalitySliders = () => (
    <div style={cardStyle}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24 }}>
        <FaChartLine className="logpain-section-icon" />
        <h2 style={sectionHeaderStyle}>Functionality</h2>
      </div>
      <div style={questionStyle}>Move the slider left or right, on a scale of 0 (low) to 10 (high)</div>
      {FUNCTIONALITY_QUESTIONS.map((q, idx) => (
        <div key={idx} style={{ margin: '32px 0' }}>
          <div style={questionStyle}>{q.label}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <input
              type="range"
              min={0}
              max={10}
              value={functionality[idx]}
              onChange={e => {
                const val = parseInt(e.target.value);
                setFunctionality(f => f.map((v, i) => i === idx ? val : v));
              }}
              style={sliderStyle}
            />
            <span style={{ width: 32, display: 'inline-block', textAlign: 'center', fontWeight: 600 }}>{functionality[idx]}</span>
          </div>
        </div>
      ))}
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 32, marginTop: 32 }}>
        <button style={navBtnStyleAlt} onClick={() => setStep(1)}>Previous</button>
        <span style={{ fontSize: 20 }}>{step} / {TOTAL_STEPS}</span>
        <button style={navBtnStyle} onClick={() => { if (validateStep(2)) setStep(3); }}>Next</button>
      </div>
    </div>
  );

  // Pain and Mood sliders page
  const MoodSliders = () => (
    <div style={cardStyle}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24 }}>
        <FaRegSmile className="logpain-section-icon" />
        <h2 style={sectionHeaderStyle}>Pain and Mood</h2>
      </div>
      <div style={questionStyle}>How do you feel emotionally ?</div>
      {MOOD_QUESTIONS.map((q, idx) => (
        <div key={idx} style={{ margin: '32px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 16, marginBottom: 8 }}>
            <span>{q.left}</span>
            <span>{q.right}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <input
              type="range"
              min={0}
              max={10}
              value={mood[idx]}
              onChange={e => {
                const val = parseInt(e.target.value);
                setMood(f => f.map((v, i) => i === idx ? val : v));
              }}
              style={sliderStyle}
            />
            <span style={{ width: 32, display: 'inline-block', textAlign: 'center', fontWeight: 600 }}>{mood[idx]}</span>
          </div>
        </div>
      ))}
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 32, marginTop: 32 }}>
        <button style={navBtnStyleAlt} onClick={() => setStep(2)}>Previous</button>
        <span style={{ fontSize: 20 }}>{step} / {TOTAL_STEPS}</span>
        <button style={navBtnStyle} onClick={() => { if (validateStep(3)) setStep(4); }}>Next</button>
      </div>
    </div>
  );

  // Anxiety sliders page
  const AnxietySliders = () => (
    <div style={cardStyle}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24 }}>
        <FaHeartbeat className="logpain-section-icon" />
        <h2 style={sectionHeaderStyle}>Anxiety</h2>
      </div>
      <div style={questionStyle}>How anxious do you feel?</div>
      {ANXIETY_QUESTIONS.map((q, idx) => (
        <div key={idx} style={{ margin: '32px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 16, marginBottom: 8 }}>
            <span>{q.left}</span>
            <span>{q.right}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <input
              type="range"
              min={0}
              max={10}
              value={anxiety[idx]}
              onChange={e => {
                const val = parseInt(e.target.value);
                setAnxiety(f => f.map((v, i) => i === idx ? val : v));
              }}
              style={sliderStyle}
            />
            <span style={{ width: 32, display: 'inline-block', textAlign: 'center', fontWeight: 600 }}>{anxiety[idx]}</span>
          </div>
        </div>
      ))}
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 32, marginTop: 32 }}>
        <button style={navBtnStyleAlt} onClick={() => setStep(3)}>Previous</button>
        <span style={{ fontSize: 20 }}>{step} / {TOTAL_STEPS}</span>
        <button style={navBtnStyle} onClick={() => { if (validateStep(4)) setStep(5); }}>Next</button>
      </div>
    </div>
  );

  // Sleep sliders page
  const SleepSliders = () => (
    <div style={cardStyle}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24 }}>
        <FaBed className="logpain-section-icon" />
        <h2 style={sectionHeaderStyle}>Sleep</h2>
      </div>
      <div style={questionStyle}>How is your sleep?</div>
      {SLEEP_QUESTIONS.map((q, idx) => (
        <div key={idx} style={{ margin: '32px 0' }}>
          {q.center && <div style={{ fontSize: 16, marginBottom: 8 }}>{q.center}</div>}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 16, marginBottom: 8 }}>
            <span>{q.left}</span>
            <span>{q.right}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <input
              type="range"
              min={0}
              max={10}
              value={sleep[idx]}
              onChange={e => {
                const val = parseInt(e.target.value);
                setSleep(f => f.map((v, i) => i === idx ? val : v));
              }}
              style={sliderStyle}
            />
            <span style={{ width: 32, display: 'inline-block', textAlign: 'center', fontWeight: 600 }}>{sleep[idx]}</span>
          </div>
        </div>
      ))}
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 32, marginTop: 32 }}>
        <button style={navBtnStyleAlt} onClick={() => setStep(4)}>Previous</button>
        <span style={{ fontSize: 20 }}>{step} / {TOTAL_STEPS}</span>
        <button style={navBtnStyle} onClick={() => { if (validateStep(5)) setStep(6); }}>Next</button>
      </div>
    </div>
  );

  // Pill Count Step
  const PillCountStep = () => (
    <div style={cardStyle}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24 }}>
        <FaPills className="logpain-section-icon" />
        <h2 style={sectionHeaderStyle}>Pill Count</h2>
      </div>
      <div style={questionStyle}>Have you taken any over-the-counter pain medications this week?</div>
      <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginBottom: 16 }}>
        <button style={pillBtnStyle(pillCount.otc === false)} onClick={() => setPillCount(pc => ({ ...pc, otc: false }))}>NO</button>
        <button style={pillBtnStyle(pillCount.otc === true)} onClick={() => setPillCount(pc => ({ ...pc, otc: true }))}>YES</button>
      </div>
      {pillCount.otc === true && (
        <>
          <div style={questionStyle}>How many per day?</div>
          <input
            type="range"
            min={0}
            max={10}
            value={pillCount.otcCount}
            onChange={e => setPillCount(pc => ({ ...pc, otcCount: parseInt(e.target.value) }))}
            style={sliderStyle}
          />
          <div style={{ marginBottom: 16 }}>{pillCount.otcCount}</div>
        </>
      )}
      <div style={questionStyle}>
        <span>Have you taken prescription pain pills this week? <span title="Includes any prescription pain medication.">ℹ️</span></span>
      </div>
      <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginBottom: 16 }}>
        <button style={pillBtnStyle(pillCount.rx === false)} onClick={() => setPillCount(pc => ({ ...pc, rx: false }))}>NO</button>
        <button style={pillBtnStyle(pillCount.rx === true)} onClick={() => setPillCount(pc => ({ ...pc, rx: true }))}>YES</button>
      </div>
      {pillCount.rx === true && (
        <>
          <div style={questionStyle}>How many per day?</div>
          <input
            type="range"
            min={0}
            max={10}
            value={pillCount.rxCount}
            onChange={e => setPillCount(pc => ({ ...pc, rxCount: parseInt(e.target.value) }))}
            style={sliderStyle}
          />
          <div style={{ marginBottom: 16 }}>{pillCount.rxCount}</div>
        </>
      )}
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 32, marginTop: 32 }}>
        <button style={navBtnStyleAlt} onClick={() => setStep(5)}>Previous</button>
        <span style={{ fontSize: 20 }}>{step} / {TOTAL_STEPS}</span>
        <button style={navBtnStyle} onClick={() => { if (validateStep(6)) setStep(7); }}>Next</button>
      </div>
    </div>
  );

  // Nutrition Step
  const NutritionStep = () => (
    <div style={cardStyle}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24 }}>
        <FaAppleAlt className="logpain-section-icon" />
        <h2 style={sectionHeaderStyle}>Nutrition</h2>
      </div>
      <div style={questionStyle}>Have you eaten unprocessed plant based foods this week?</div>
      <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginBottom: 16 }}>
        <button style={pillBtnStyle(nutrition.plant === false)} onClick={() => setNutrition(n => ({ ...n, plant: false }))}>NO</button>
        <button style={pillBtnStyle(nutrition.plant === true)} onClick={() => setNutrition(n => ({ ...n, plant: true }))}>YES</button>
      </div>
      <div style={questionStyle}>Have you eaten a variety of fruit and vegetables this week?</div>
      <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginBottom: 16 }}>
        <button style={pillBtnStyle(nutrition.fruitVeg === false)} onClick={() => setNutrition(n => ({ ...n, fruitVeg: false }))}>NO</button>
        <button style={pillBtnStyle(nutrition.fruitVeg === true)} onClick={() => setNutrition(n => ({ ...n, fruitVeg: true }))}>YES</button>
      </div>
      {nutrition.fruitVeg === true && (
        <>
          <div style={questionStyle}>How many servings per day?</div>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            {[...Array(8)].map((_, i) => (
              <span 
                key={i} 
                style={{ 
                  fontSize: 28, 
                  cursor: 'pointer',
                  opacity: i < nutrition.fruitVegServings ? 1 : 0.5,
                  transition: 'all 0.2s'
                }}
                onClick={() => setNutrition(n => ({ ...n, fruitVegServings: i + 1 }))}
              >
                {i < nutrition.fruitVegServings ? '🍏' : '🍎'}
              </span>
            ))}
            <span style={{ marginLeft: 8, fontWeight: 500 }}>{nutrition.fruitVegServings} servings</span>
          </div>
        </>
      )}
      <div style={questionStyle}>Did you drink plenty of water?</div>
      <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginBottom: 16 }}>
        <button style={pillBtnStyle(nutrition.water === false)} onClick={() => setNutrition(n => ({ ...n, water: false }))}>NO</button>
        <button style={pillBtnStyle(nutrition.water === true)} onClick={() => setNutrition(n => ({ ...n, water: true }))}>YES</button>
      </div>
      {nutrition.water === true && (
        <>
          <div style={questionStyle}>How many ounces of water per day?</div>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            {[...Array(8)].map((_, i) => (
              <span 
                key={i} 
                style={{ 
                  fontSize: 28, 
                  cursor: 'pointer',
                  opacity: i < nutrition.waterOunces ? 1 : 0.5,
                  transition: 'all 0.2s'
                }}
                onClick={() => setNutrition(n => ({ ...n, waterOunces: i + 1 }))}
              >
                🥤
              </span>
            ))}
            <span style={{ marginLeft: 8, fontWeight: 500 }}>{nutrition.waterOunces} Ounces</span>
          </div>
        </>
      )}
      <div style={questionStyle}>Did you consume caffeinated beverages this week?</div>
      <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginBottom: 16 }}>
        <button style={pillBtnStyle(nutrition.caffeine === false)} onClick={() => setNutrition(n => ({ ...n, caffeine: false }))}>NO</button>
        <button style={pillBtnStyle(nutrition.caffeine === true)} onClick={() => setNutrition(n => ({ ...n, caffeine: true }))}>YES</button>
      </div>
      {nutrition.caffeine === true && (
        <>
          <div style={questionStyle}>On average how many caffeinated beverages did you drink per day?</div>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            {[...Array(8)].map((_, i) => (
              <span 
                key={i} 
                style={{ 
                  fontSize: 28, 
                  cursor: 'pointer',
                  opacity: i < nutrition.caffeineDrinks ? 1 : 0.5,
                  transition: 'all 0.2s'
                }}
                onClick={() => setNutrition(n => ({ ...n, caffeineDrinks: i + 1 }))}
              >
                ☕
              </span>
            ))}
            <span style={{ marginLeft: 8, fontWeight: 500 }}>{nutrition.caffeineDrinks} Caffeinated Beverages</span>
          </div>
        </>
      )}
      <div style={questionStyle}>On average how much sugar did you consume per day? <span title="Estimate your daily sugar intake.">ℹ️</span></div>
      <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginBottom: 16 }}>
        {['0-5 GRAMS', '6-10 GRAMS', '10+ GRAMS'].map(g => (
          <button
            key={g}
            style={pillBtnStyle(nutrition.sugarGrams === g)}
            onClick={() => setNutrition(n => ({ ...n, sugarGrams: g }))}
          >{g}</button>
        ))}
      </div>
      <div style={questionStyle}>Did you use tobacco this week?</div>
      <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginBottom: 16 }}>
        <button style={pillBtnStyle(nutrition.tobacco === false)} onClick={() => setNutrition(n => ({ ...n, tobacco: false }))}>NO</button>
        <button style={pillBtnStyle(nutrition.tobacco === true)} onClick={() => setNutrition(n => ({ ...n, tobacco: true }))}>YES</button>
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 32, marginTop: 32 }}>
        <button style={navBtnStyleAlt} onClick={() => setStep(6)}>Previous</button>
        <span style={{ fontSize: 20 }}>{step} / {TOTAL_STEPS}</span>
        <button style={navBtnStyle} onClick={() => { if (validateStep(7)) setStep(8); }}>Next</button>
      </div>
    </div>
  );

  // Exercise Step
  const ExerciseStep = () => (
    <div style={cardStyle}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24 }}>
        <FaDumbbell className="logpain-section-icon" />
        <h2 style={sectionHeaderStyle}>Exercise</h2>
      </div>
      <div style={questionStyle}>Exercise</div>
      <div style={questionStyle}>Did you exercise this week?</div>
      <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginBottom: 16 }}>
        <button style={pillBtnStyle(exercise.exercised === false)} onClick={() => setExercise(e => ({ ...e, exercised: false }))}>NO</button>
        <button style={pillBtnStyle(exercise.exercised === true)} onClick={() => setExercise(e => ({ ...e, exercised: true }))}>YES</button>
      </div>
      {exercise.exercised === true && (
        <>
          <div style={questionStyle}>What Type of Exercise?</div>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginBottom: 16 }}>
            {['Cardiovascular', 'Weight Lifting', 'Stretching'].map(type => (
              <button
                key={type}
                style={pillBtnStyle(exercise.exerciseType.includes(type))}
                onClick={() => setExercise(e => ({
                  ...e,
                  exerciseType: e.exerciseType.includes(type)
                    ? e.exerciseType.filter(t => t !== type)
                    : [...e.exerciseType, type]
                }))}
              >{type}</button>
            ))}
          </div>
        </>
      )}
      <div style={questionStyle}>Did you practice any relaxation techniques this week? <span title="Includes meditation, yoga, etc.">ℹ️</span></div>
      <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginBottom: 16 }}>
        <button style={pillBtnStyle(exercise.relaxation === false)} onClick={() => setExercise(e => ({ ...e, relaxation: false }))}>NO</button>
        <button style={pillBtnStyle(exercise.relaxation === true)} onClick={() => setExercise(e => ({ ...e, relaxation: true }))}>YES</button>
      </div>
      {exercise.relaxation === true && (
        <>
          <div style={questionStyle}>Number of hours?</div>
          <input
            type="range"
            min={0}
            max={20}
            value={exercise.relaxationHours}
            onChange={e => setExercise(ex => ({ ...ex, relaxationHours: parseInt(e.target.value) }))}
            style={sliderStyle}
          />
          <div style={{ marginBottom: 16 }}>{exercise.relaxationHours} hours</div>
        </>
      )}
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 32, marginTop: 32 }}>
        <button style={navBtnStyleAlt} onClick={() => setStep(7)}>Previous</button>
        <span style={{ fontSize: 20 }}>{step} / {TOTAL_STEPS}</span>
        <button style={navBtnStyle} onClick={() => { if (validateStep(8)) setStep(9); }}>Next</button>
      </div>
    </div>
  );

  // Helper for pill/nutrition/exercise buttons
  function pillBtnStyle(active) {
    return {
      background: active ? '#2d3a4a' : '#f5f6fa',
      color: active ? 'white' : '#2d3a4a',
      border: '1.5px solid #eaeaea',
      borderRadius: 24,
      padding: '0.5rem 2rem',
      fontWeight: 600,
      fontSize: 18,
      cursor: 'pointer',
      minWidth: 120,
      margin: '0 0.5rem',
      boxShadow: active ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
      outline: 'none',
      transition: 'background 0.2s, color 0.2s',
    };
  }

  // Validation for each step
  function validateStep(currentStep) {
    setError('');
    switch (currentStep) {
      case 1:
        if (painPoints.length === 0) {
          setError('Please select at least one pain area.');
          return false;
        }
        return true;
      case 2:
        if (functionality.some(f => f === null || f === undefined)) {
          setError('Please answer all functionality questions.');
          return false;
        }
        return true;
      case 3:
        if (mood.some(f => f === null || f === undefined)) {
          setError('Please answer all mood questions.');
          return false;
        }
        return true;
      case 4:
        if (anxiety.some(f => f === null || f === undefined)) {
          setError('Please answer all anxiety questions.');
          return false;
        }
        return true;
      case 5:
        if (sleep.some(f => f === null || f === undefined)) {
          setError('Please answer all sleep questions.');
          return false;
        }
        return true;
      case 6:
        if (pillCount.otc === null || pillCount.rx === null) {
          setError('Please answer both pill count questions.');
          return false;
        }
        if ((pillCount.otc && pillCount.otcCount === 0) || (pillCount.rx && pillCount.rxCount === 0)) {
          setError('Please specify how many pills per day if you answered YES.');
          return false;
        }
        return true;
      case 7:
        if ([nutrition.plant, nutrition.fruitVeg, nutrition.water, nutrition.caffeine, nutrition.sugarGrams, nutrition.tobacco].some(v => v === null || v === '')) {
          setError('Please answer all nutrition questions.');
          return false;
        }
        if ((nutrition.fruitVeg && nutrition.fruitVegServings === 0) || (nutrition.water && nutrition.waterOunces === 0) || (nutrition.caffeine && nutrition.caffeineDrinks === 0)) {
          setError('Please specify servings, ounces, or beverages if you answered YES.');
          return false;
        }
        return true;
      case 8:
        if (exercise.exercised === null || exercise.relaxation === null) {
          setError('Please answer both exercise questions.');
          return false;
        }
        if (exercise.exercised && exercise.exerciseType.length === 0) {
          setError('Please select at least one exercise type.');
          return false;
        }
        if (exercise.relaxation && exercise.relaxationHours === 0) {
          setError('Please specify number of hours for relaxation.');
          return false;
        }
        return true;
      default:
        return true;
    }
  }

  // Handle final submission of pain log
  const handleSubmit = async () => {
    if (submitted) return;
    
    setSubmitted(true);
    setError('');
    setSubmitStatus(null);
    
    try {
      // Calculate averages for more accurate data
      const avgPainRating = painPoints.length > 0 
        ? Math.round((painPoints.reduce((sum, p) => sum + p.rating, 0) / painPoints.length) * 10) / 10 
        : 0;
      
      const avgFunctionality = functionality.length > 0 
        ? Math.round((functionality.reduce((sum, f) => sum + f, 0) / functionality.length) * 10) / 10 
        : 0;
        
      const avgMood = mood.length > 0 
        ? Math.round((mood.reduce((sum, m) => sum + m, 0) / mood.length) * 10) / 10 
        : 0;
        
      const avgAnxiety = anxiety.length > 0 
        ? Math.round((anxiety.reduce((sum, a) => sum + a, 0) / anxiety.length) * 10) / 10 
        : 0;
        
      const avgSleep = sleep.length > 0 
        ? Math.round((sleep.reduce((sum, s) => sum + s, 0) / sleep.length) * 10) / 10 
        : 0;

      // Match the actual database structure we've discovered
      const painLogData = {
        patient_id: user.id,
        pain_level: avgPainRating,
        pain_points: painPoints,
        functionality: avgFunctionality,
        mood: avgMood,
        anxiety: avgAnxiety,
        sleep: avgSleep,
        medication: {
          otc: pillCount.otc,
          otc_count: pillCount.otcCount,
          rx: pillCount.rx,
          rx_count: pillCount.rxCount
        },
        nutrition: {
          plant_based: nutrition.plant,
          fruit_veg_servings: nutrition.fruitVegServings,
          water_ounces: nutrition.waterOunces,
          caffeine_drinks: nutrition.caffeineDrinks,
          sugar_grams: nutrition.sugarGrams,
          tobacco: nutrition.tobacco
        },
        exercise: {
          exercised: exercise.exercised,
          exercise_type: exercise.exerciseType,
          relaxation_hours: exercise.relaxationHours
        },
        log_time: new Date().toISOString() // log_time instead of timestamp
      };
      
      console.log('Submitting pain log data:', painLogData);
      
      // Submit to API using the API service
      const response = await api.savePainLog(painLogData);
      
      if (response.success) {
        setSubmitStatus('success');
        
        // Reset form after 3 seconds
        setTimeout(() => {
          setPainPoints([]);
          setFunctionality([0, 0, 0]);
          setMood([0, 0, 0, 0, 0]);
          setAnxiety([0, 0, 0, 0, 0]);
          setSleep([0, 0, 0, 0]);
          setPillCount({ otc: null, otcCount: 0, rx: null, rxCount: 0 });
          setNutrition({
            plant: null,
            fruitVeg: null,
            fruitVegServings: 0,
            water: null,
            waterOunces: 0,
            caffeine: null,
            caffeineDrinks: 0,
            sugar: null,
            sugarGrams: '',
            tobacco: null
          });
          setExercise({
            exercised: null,
            exerciseType: [],
            relaxation: null,
            relaxationHours: 0
          });
          setStep(1);
          setSubmitted(false);
        }, 3000); // Reset after 3 seconds
      } else {
        throw new Error(response.error || 'Failed to save pain log');
      }
    } catch (err) {
      console.error('Error submitting pain log:', err);
      setError(err.message || 'Failed to submit pain log. Please try again.');
      setSubmitStatus('error');
      setSubmitted(false);
    }
  };

  // Helper functions for analytics
  function getAvg(arr) {
    if (!arr.length) return 0;
    return Math.round((arr.reduce((a, b) => a + b, 0) / arr.length) * 10) / 10;
  }
  const avgPain = painPoints.length ? Math.round((painPoints.reduce((sum, p) => sum + p.rating, 0) / painPoints.length) * 10) / 10 : 0;
  const avgSleep = getAvg(sleep);
  const avgMood = getAvg(mood);

  // Helper for color-coded badge
  function getBadge(score) {
    if (score >= 7) return { label: 'Good', color: '#22c55e' };
    if (score >= 4) return { label: 'Moderate', color: '#eab308' };
    return { label: 'Needs Attention', color: '#ef4444' };
  }

  // Mini card style
  const miniCardStyle = {
    display: 'flex', alignItems: 'center', gap: 10, background: '#f4f6fb', borderRadius: 10, padding: '0.5rem 1.1rem', fontWeight: 600, fontSize: 16, color: '#222', boxShadow: '0 1px 4px rgba(60,60,120,0.06)', marginLeft: 12
  };

  const badgeStyle = color => ({
    background: color, color: 'white', borderRadius: 8, padding: '0.2rem 0.8rem', fontWeight: 700, fontSize: 15, marginLeft: 12
  });

  // Circular progress bar
  function CircularProgress({ value, max = 10, color = '#6366f1', size = 54, label }) {
    const r = 22;
    const c = 2 * Math.PI * r;
    const pct = Math.max(0, Math.min(1, value / max));
    return (
      <svg width={size} height={size} style={{ marginRight: 10 }}>
        <circle cx={size/2} cy={size/2} r={r} fill="#f4f6fb" stroke="#e5e7eb" strokeWidth={6} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={6} strokeDasharray={c} strokeDashoffset={c * (1-pct)} strokeLinecap="round" style={{ transition: 'stroke-dashoffset 0.4s' }} />
        <text x="50%" y="54%" textAnchor="middle" fontSize={15} fontWeight={700} fill={color}>{value}</text>
        {label && <text x="50%" y={size-8} textAnchor="middle" fontSize={12} fill="#64748b">{label}</text>}
      </svg>
    );
  }

  // Summary Step
  const SummaryStep = () => (
    <div className="logpain-summary-full">
      {/* Summary Stats Row */}
      <div style={{
        display: 'flex',
        gap: '2.5rem',
        justifyContent: 'center',
        alignItems: 'center',
        margin: '2.5rem 0 2rem 0',
        flexWrap: 'wrap',
      }}>
        <div style={summaryStatCardStyle}><FaHeartbeat style={summaryStatIconStyle} /><div><div style={summaryStatLabelStyle}>Pain Points</div><div style={summaryStatValueStyle}>{painPoints.length}</div></div></div>
        <div style={summaryStatCardStyle}><FaHeartbeat style={summaryStatIconStyle} /><div><div style={summaryStatLabelStyle}>Avg. Pain</div><div style={summaryStatValueStyle}>{avgPain}</div></div></div>
        <div style={summaryStatCardStyle}><FaBed style={summaryStatIconStyle} /><div><div style={summaryStatLabelStyle}>Avg. Sleep</div><div style={summaryStatValueStyle}>{avgSleep}</div></div></div>
        <div style={summaryStatCardStyle}><FaRegSmile style={summaryStatIconStyle} /><div><div style={summaryStatLabelStyle}>Avg. Mood</div><div style={summaryStatValueStyle}>{avgMood}</div></div></div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24 }}>
        <FaUserMd className="logpain-section-icon" />
        <h2 style={sectionHeaderStyle}>Summary</h2>
      </div>

      {/* Pain Points Section */}
      <div style={{ maxWidth: 600, margin: '0 auto', padding: '2.5rem 0 1.5rem', position: 'relative', width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', paddingLeft: 24 }}>
          <FaHeartbeat style={{ color: '#ef4444', fontSize: '2rem' }} />
          <h3 style={{ fontSize: '1.7rem', fontWeight: 700, color: '#1e293b', margin: 0 }}>Pain Assessment</h3>
        </div>
        <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
          <div style={{ maxWidth: 600, width: '100%', position: 'relative' }}>
            <img
              src={bodyImage}
              alt="Human body outline"
              style={{ width: '100%', borderRadius: 24, filter: 'grayscale(0.2)' }}
            />
            {painPoints.map((pt, idx) => (
              <div
                key={idx}
                style={{
                  position: 'absolute',
                  left: `${pt.x}%`,
                  top: `${pt.y}%`,
                  width: 24,
                  height: 24,
                  background: 'red',
                  borderRadius: '50%',
                  border: '2.5px solid white',
                  transform: 'translate(-50%, -50%)',
                  zIndex: 10,
                  cursor: 'pointer',
                }}
                onMouseEnter={e => {
                  const tooltip = document.getElementById(`pain-tooltip-${idx}`);
                  if (tooltip) tooltip.style.opacity = 1;
                }}
                onMouseLeave={e => {
                  const tooltip = document.getElementById(`pain-tooltip-${idx}`);
                  if (tooltip) tooltip.style.opacity = 0;
                }}
              >
                <div
                  id={`pain-tooltip-${idx}`}
                  style={{
                    position: 'absolute',
                    left: '50%',
                    top: '-70px',
                    transform: 'translateX(-50%)',
                    background: 'rgba(30, 41, 59, 0.97)',
                    color: 'white',
                    padding: '0.8rem 1.2rem',
                    borderRadius: 12,
                    fontSize: 15,
                    fontWeight: 500,
                    whiteSpace: 'nowrap',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.13)',
                    pointerEvents: 'none',
                    opacity: 0,
                    transition: 'opacity 0.2s',
                    zIndex: 100,
                  }}
                >
                  <div style={{ fontWeight: 700, marginBottom: 2 }}>Pain #{idx + 1}</div>
                  <div>Rating: <span style={{ color: '#f87171', fontWeight: 600 }}>{pt.rating}/10</span></div>
                  <div>Types: <span style={{ color: '#fbbf24' }}>{pt.types.join(', ')}</span></div>
                  <div style={{ color: '#a3e635' }}>({pt.x.toFixed(1)}%, {pt.y.toFixed(1)}%)</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ maxWidth: 700, margin: '2.5rem auto 0', display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          {painPoints.map((pt, idx) => (
            <div key={idx} style={painPointStyle}>
              <div style={painPointHeaderStyle}>
                <span style={painPointNumberStyle}>#{idx + 1}</span>
                <span style={painPointRatingStyle}>
                  Rating: <strong>{pt.rating}/10</strong>
                </span>
              </div>
              <div style={painPointTypesStyle}>
                {pt.types.map((type, typeIdx) => (
                  <span key={typeIdx} style={painTypeTagStyle}>{type}</span>
                ))}
              </div>
              <div style={painPointLocationStyle}>
                Location: ({pt.x.toFixed(1)}%, {pt.y.toFixed(1)}%)
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Functionality Section */}
      <div style={summarySectionStyle}>
        <div style={summaryHeaderStyle}>
          <FaChartLine style={{ color: '#3b82f6', fontSize: '1.5rem' }} />
          <h3 style={summaryTitleStyle}>Functionality</h3>
          {(() => { const avg = getAvg(functionality); const badge = getBadge(avg); return <span style={badgeStyle(badge.color)}>{badge.label}</span>; })()}
          <span style={miniCardStyle}><FaChartLine style={{ color: '#3b82f6', fontSize: 20 }} />{getAvg(functionality)}</span>
        </div>
        <div style={summaryContentStyle}>
          {functionality.map((f, idx) => (
            <div key={idx} style={functionalityItemStyle}>
              <div style={functionalityLabelStyle}>{FUNCTIONALITY_QUESTIONS[idx].label}</div>
              <div style={functionalityBarStyle}>
                <div 
                  style={{
                    ...functionalityBarFillStyle,
                    width: `${(f / 10) * 100}%`,
                    background: f >= 7 ? '#22c55e' : f >= 4 ? '#eab308' : '#ef4444'
                  }}
                />
              </div>
              <span style={functionalityValueStyle}>{f}/10</span>
            </div>
          ))}
        </div>
      </div>

      {/* Mental Health Section */}
      <div style={summarySectionStyle}>
        <div style={summaryHeaderStyle}>
          <FaRegSmile style={{ color: '#8b5cf6', fontSize: '1.5rem' }} />
          <h3 style={summaryTitleStyle}>Mental Health</h3>
          {(() => { const avg = getAvg(mood); const badge = getBadge(avg); return <span style={badgeStyle(badge.color)}>{badge.label}</span>; })()}
          <span style={miniCardStyle}><FaRegSmile style={{ color: '#8b5cf6', fontSize: 20 }} />{getAvg(mood)}</span>
        </div>
        <div style={summaryContentStyle}>
          <div style={mentalHealthGridStyle}>
            <div style={mentalHealthSectionStyle}>
              <h4 style={mentalHealthSubtitleStyle}>Mood</h4>
              {mood.map((m, idx) => (
                <div key={idx} style={mentalHealthItemStyle}>
                  <span style={mentalHealthLabelStyle}>
                    {MOOD_QUESTIONS[idx].left} → {MOOD_QUESTIONS[idx].right}
                  </span>
                  <div style={mentalHealthBarStyle}>
                    <div style={{...mentalHealthBarFillStyle, width: `${(m / 10) * 100}%`}} />
                  </div>
                </div>
              ))}
            </div>
            <div style={mentalHealthSectionStyle}>
              <h4 style={mentalHealthSubtitleStyle}>Anxiety</h4>
              {(() => { const avg = getAvg(anxiety); const badge = getBadge(avg); return <span style={badgeStyle(badge.color)}>{badge.label}</span>; })()}
              <span style={miniCardStyle}><FaHeartbeat style={{ color: '#ef4444', fontSize: 20 }} />{getAvg(anxiety)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sleep Section */}
      <div style={summarySectionStyle}>
        <div style={summaryHeaderStyle}>
          <FaBed style={{ color: '#0ea5e9', fontSize: '1.5rem' }} />
          <h3 style={summaryTitleStyle}>Sleep Quality</h3>
          {(() => { const avg = getAvg(sleep); const badge = getBadge(avg); return <span style={badgeStyle(badge.color)}>{badge.label}</span>; })()}
          <span style={miniCardStyle}><FaBed style={{ color: '#0ea5e9', fontSize: 20 }} />{getAvg(sleep)}</span>
        </div>
        <div style={summaryContentStyle}>
          {sleep.map((s, idx) => (
            <div key={idx} style={sleepItemStyle}>
              <span style={sleepLabelStyle}>
                {SLEEP_QUESTIONS[idx].left} → {SLEEP_QUESTIONS[idx].right}
              </span>
              <div style={sleepBarStyle}>
                <div style={{...sleepBarFillStyle, width: `${(s / 10) * 100}%`}} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Medication Section */}
      <div style={summarySectionStyle}>
        <div style={summaryHeaderStyle}>
          <FaPills style={{ color: '#f59e0b', fontSize: '1.5rem' }} />
          <h3 style={summaryTitleStyle}>Medication</h3>
        </div>
        <div style={summaryContentStyle}>
          <div style={medicationGridStyle}>
            <div style={medicationItemStyle}>
              <span style={medicationLabelStyle}>OTC Medication</span>
              <span style={medicationValueStyle}>
                {pillCount.otc ? `${pillCount.otcCount} per day` : 'None'}
              </span>
            </div>
            <div style={medicationItemStyle}>
              <span style={medicationLabelStyle}>Prescription Medication</span>
              <span style={medicationValueStyle}>
                {pillCount.rx ? `${pillCount.rxCount} per day` : 'None'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Lifestyle Section */}
      <div style={summarySectionStyle}>
        <div style={summaryHeaderStyle}>
          <FaAppleAlt style={{ color: '#10b981', fontSize: '1.5rem' }} />
          <h3 style={summaryTitleStyle}>Lifestyle</h3>
        </div>
        <div style={summaryContentStyle}>
          <div style={{ display: 'flex', gap: 32, marginBottom: 24, flexWrap: 'wrap', justifyContent: 'center' }}>
            <CircularProgress value={nutrition.waterOunces} max={8} color="#0ea5e9" label="Water" />
            <CircularProgress value={nutrition.fruitVegServings} max={8} color="#10b981" label="Fruit/Veg" />
            <CircularProgress value={exercise.relaxationHours} max={20} color="#8b5cf6" label="Relaxation" />
          </div>
          <div style={lifestyleGridStyle}>
            <div style={lifestyleSectionStyle}>
              <h4 style={lifestyleSubtitleStyle}>Nutrition</h4>
              <div style={lifestyleItemStyle}>
                <span style={lifestyleLabelStyle}>Plant-based Diet</span>
                <span style={lifestyleValueStyle}>{nutrition.plant ? 'Yes' : 'No'}</span>
              </div>
              <div style={lifestyleItemStyle}>
                <span style={lifestyleLabelStyle}>Fruits & Vegetables</span>
                <span style={lifestyleValueStyle}>
                  {nutrition.fruitVeg ? `${nutrition.fruitVegServings} servings/day` : 'None'}
                </span>
              </div>
              <div style={lifestyleItemStyle}>
                <span style={lifestyleLabelStyle}>Water Intake</span>
                <span style={lifestyleValueStyle}>
                  {nutrition.water ? `${nutrition.waterOunces} oz/day` : 'None'}
                </span>
              </div>
            </div>
            <div style={lifestyleSectionStyle}>
              <h4 style={lifestyleSubtitleStyle}>Exercise</h4>
              <div style={lifestyleItemStyle}>
                <span style={lifestyleLabelStyle}>Exercise Type</span>
                <span style={lifestyleValueStyle}>
                  {exercise.exercised ? exercise.exerciseType.join(', ') : 'None'}
                </span>
              </div>
              <div style={lifestyleItemStyle}>
                <span style={lifestyleLabelStyle}>Relaxation</span>
                <span style={lifestyleValueStyle}>
                  {exercise.relaxation ? `${exercise.relaxationHours} hours/week` : 'None'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 32, marginTop: 32 }}>
        <button style={navBtnStyleAlt} onClick={() => setStep(8)}>Previous</button>
        <span style={{ fontSize: 20 }}>{TOTAL_STEPS} / {TOTAL_STEPS}</span>
        <button style={navBtnStyle} onClick={handleSubmit} disabled={submitted}>{submitted ? 'Submitting...' : 'Submit'}</button>
      </div>
      {submitStatus === 'success' && (
        <div style={{ color: '#10b981', background: '#ecfdf5', padding: '10px 16px', borderRadius: 8, marginTop: 16, textAlign: 'center' }}>
          Pain log submitted successfully! Your doctor will be able to view this information.
        </div>
      )}
      {submitStatus === 'error' && (
        <div style={{ color: '#ef4444', background: '#fef2f2', padding: '10px 16px', borderRadius: 8, marginTop: 16, textAlign: 'center' }}>
          {error || 'There was an error submitting your pain log. Please try again.'}
        </div>
      )}
    </div>
  );

  // Summary Styles
  const summarySectionStyle = {
    background: 'white',
    borderRadius: 12,
    padding: '1.5rem',
    marginBottom: '1.5rem',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    border: '1px solid #f1f5f9'
  };

  const summaryHeaderStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    marginBottom: '1rem',
    paddingBottom: '0.75rem',
    borderBottom: '2px solid #f1f5f9'
  };

  const summaryTitleStyle = {
    fontSize: '1.25rem',
    fontWeight: 600,
    color: '#1e293b',
    margin: 0
  };

  const summaryContentStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem'
  };

  // Pain Points Styles
  const painPointStyle = {
    background: '#f8fafc',
    borderRadius: 8,
    padding: '1rem',
    border: '1px solid #e2e8f0'
  };

  const painPointHeaderStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.5rem'
  };

  const painPointNumberStyle = {
    background: '#ef4444',
    color: 'white',
    padding: '0.25rem 0.75rem',
    borderRadius: 12,
    fontSize: '0.875rem',
    fontWeight: 600
  };

  const painPointRatingStyle = {
    color: '#64748b',
    fontSize: '0.875rem'
  };

  const painPointTypesStyle = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.5rem',
    marginBottom: '0.5rem'
  };

  const painTypeTagStyle = {
    background: '#f1f5f9',
    color: '#475569',
    padding: '0.25rem 0.75rem',
    borderRadius: 12,
    fontSize: '0.875rem'
  };

  const painPointLocationStyle = {
    color: '#64748b',
    fontSize: '0.875rem'
  };

  // Functionality Styles
  const functionalityItemStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem'
  };

  const functionalityLabelStyle = {
    color: '#475569',
    fontSize: '0.875rem'
  };

  const functionalityBarStyle = {
    height: 8,
    background: '#f1f5f9',
    borderRadius: 4,
    overflow: 'hidden'
  };

  const functionalityBarFillStyle = {
    height: '100%',
    borderRadius: 4,
    transition: 'width 0.3s ease'
  };

  const functionalityValueStyle = {
    color: '#64748b',
    fontSize: '0.875rem',
    textAlign: 'right'
  };

  // Mental Health Styles
  const mentalHealthGridStyle = {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1.5rem'
  };

  const mentalHealthSectionStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem'
  };

  const mentalHealthSubtitleStyle = {
    fontSize: '1rem',
    fontWeight: 600,
    color: '#475569',
    margin: 0
  };

  const mentalHealthItemStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem'
  };

  const mentalHealthLabelStyle = {
    color: '#64748b',
    fontSize: '0.875rem'
  };

  const mentalHealthBarStyle = {
    height: 6,
    background: '#f1f5f9',
    borderRadius: 3,
    overflow: 'hidden'
  };

  const mentalHealthBarFillStyle = {
    height: '100%',
    background: '#8b5cf6',
    borderRadius: 3,
    transition: 'width 0.3s ease'
  };

  // Sleep Styles
  const sleepItemStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem'
  };

  const sleepLabelStyle = {
    color: '#64748b',
    fontSize: '0.875rem'
  };

  const sleepBarStyle = {
    height: 6,
    background: '#f1f5f9',
    borderRadius: 3,
    overflow: 'hidden'
  };

  const sleepBarFillStyle = {
    height: '100%',
    background: '#0ea5e9',
    borderRadius: 3,
    transition: 'width 0.3s ease'
  };

  // Medication Styles
  const medicationGridStyle = {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1.5rem'
  };

  const medicationItemStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem'
  };

  const medicationLabelStyle = {
    color: '#475569',
    fontSize: '0.875rem'
  };

  const medicationValueStyle = {
    color: '#64748b',
    fontSize: '0.875rem',
    fontWeight: 500
  };

  // Lifestyle Styles
  const lifestyleGridStyle = {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1.5rem'
  };

  const lifestyleSectionStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem'
  };

  const lifestyleSubtitleStyle = {
    fontSize: '1rem',
    fontWeight: 600,
    color: '#475569',
    margin: 0
  };

  const lifestyleItemStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.5rem 0',
    borderBottom: '1px solid #f1f5f9'
  };

  const lifestyleLabelStyle = {
    color: '#64748b',
    fontSize: '0.875rem'
  };

  const lifestyleValueStyle = {
    color: '#475569',
    fontSize: '0.875rem',
    fontWeight: 500
  };

  // Add styles for summary stat cards
  const summaryStatCardStyle = {
    background: 'linear-gradient(90deg, #e0e7ff 0%, #f8fafc 100%)',
    borderRadius: 16,
    boxShadow: '0 2px 8px rgba(60,60,120,0.08)',
    padding: '1.1rem 2.2rem',
    display: 'flex',
    alignItems: 'center',
    gap: '1.1rem',
    minWidth: 120,
  };
  const summaryStatIconStyle = {
    fontSize: 32,
    color: '#6366f1',
  };
  const summaryStatLabelStyle = {
    fontSize: 15,
    color: '#64748b',
    fontWeight: 500,
  };
  const summaryStatValueStyle = {
    fontSize: 26,
    fontWeight: 700,
    color: '#1e293b',
    marginTop: 2,
  };

  // Progress bar component
  const ProgressBar = () => (
    <div className="logpain-progress">
      <div className="logpain-progress-bar">
        <div
          className="logpain-progress-bar-inner"
          style={{ width: `${(step - 1) / (TOTAL_STEPS - 1) * 100}%` }}
        />
      </div>
      <div className="logpain-progress-label">
        Step {step} / {TOTAL_STEPS}
      </div>
    </div>
  );

  const cardStyle = {
    background: 'white',
    borderRadius: 18,
    boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
    padding: '2.5rem 2rem',
    maxWidth: 600,
    margin: '2rem auto',
    fontFamily: 'Inter, Arial, sans-serif',
    color: '#222',
  };
  const sectionHeaderStyle = {
    fontSize: 22,
    fontWeight: 700,
    margin: '1.5rem 0 1rem',
    color: '#2d3a4a',
    borderBottom: '2px solid #eaeaea',
    paddingBottom: 8,
    letterSpacing: 0.5,
  };
  const questionStyle = {
    fontSize: 18,
    fontWeight: 500,
    margin: '1.5rem 0 0.5rem',
    color: '#2d3a4a',
  };
  const navBtnStyle = {
    background: '#2d3a4a',
    color: 'white',
    border: 'none',
    borderRadius: 8,
    padding: '0.75rem 2.5rem',
    fontWeight: 600,
    fontSize: 18,
    cursor: 'pointer',
    margin: '0 0.5rem',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    transition: 'background 0.2s, color 0.2s',
  };
  const navBtnStyleAlt = {
    ...navBtnStyle,
    background: 'white',
    color: '#2d3a4a',
    border: '1px solid #eaeaea',
  };
  const sliderStyle = {
    width: '100%',
    accentColor: '#2d3a4a',
    margin: '0.5rem 0',
  };

  return (
    <>
      <div className="logpain-overlay" />
      <div className="logpain-center">
        <div className="logpain-card">
          <ProgressBar />
          {step === 1 && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24 }}>
                <FaUserMd className="logpain-section-icon" />
                <h2 style={sectionHeaderStyle}>Pain Area Selection</h2>
              </div>
              <div style={{ maxWidth: 400, margin: '0 auto', position: 'relative' }}>
                <img
                  src={bodyImage}
                  alt="Human body outline"
                  style={{ width: '100%', borderRadius: 16, cursor: painPoints.length < MAX_POINTS ? 'crosshair' : 'not-allowed' }}
                  onClick={handleBodyClick}
                />
                {/* Red dots for selected pain points */}
                {painPoints.map((pt, idx) => (
                  <div
                    key={idx}
                    style={{
                      position: 'absolute',
                      left: `${pt.x}%`,
                      top: `${pt.y}%`,
                      width: 18,
                      height: 18,
                      background: 'red',
                      borderRadius: '50%',
                      border: '2px solid white',
                      transform: 'translate(-50%, -50%)',
                      zIndex: 10
                    }}
                  />
                ))}
              </div>
              {/* Next button at the bottom */}
              <div style={{ textAlign: 'center', marginTop: 32 }}>
                <button
                  style={{
                    background: 'white',
                    color: '#001056',
                    border: 'none',
                    borderRadius: 8,
                    padding: '0.75rem 2rem',
                    fontWeight: 600,
                    fontSize: 18,
                    cursor: painPoints.length === 0 ? 'not-allowed' : 'pointer',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                  }}
                  disabled={painPoints.length === 0}
                  onClick={() => setStep(2)}
                >
                  Next
                </button>
              </div>
            </>
          )}
          {step === 2 && <FunctionalitySliders />}
          {step === 3 && <MoodSliders />}
          {step === 4 && <AnxietySliders />}
          {step === 5 && <SleepSliders />}
          {step === 6 && <PillCountStep />}
          {step === 7 && <NutritionStep />}
          {step === 8 && <ExerciseStep />}
          {step === 9 && <SummaryStep />}
          {error && <div style={{ color: 'red', textAlign: 'center', margin: 16 }}>{error}</div>}
          {/* Modal logic */}
          {modalStep === 'rating' && (
            <ModalOverlay><PainRatingModal /></ModalOverlay>
          )}
          {modalStep === 'type' && (
            <ModalOverlay><PainTypeModal /></ModalOverlay>
          )}
        </div>
      </div>
    </>
  );
};

export default LogPain;