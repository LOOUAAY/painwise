import React from 'react';
import bodyImage from '../assets/images/body.jpg';

export default function PainMap({ painPoints = [], style = {}, markerSize = 24 }) {
  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: 400, margin: '0 auto', ...style }}>
      <img
        src={bodyImage}
        alt="Human body outline"
        style={{ width: '100%', borderRadius: 16, filter: 'grayscale(0.2)' }}
      />
      {painPoints.map((pt, idx) => (
        <div
          key={idx}
          style={{
            position: 'absolute',
            left: `${pt.x}%`,
            top: `${pt.y}%`,
            width: markerSize,
            height: markerSize,
            background: 'red',
            borderRadius: '50%',
            border: '2.5px solid white',
            transform: 'translate(-50%, -50%)',
            zIndex: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 700,
            fontSize: 14
          }}
          title={`Rating: ${pt.rating}/10\nTypes: ${pt.types ? pt.types.join(', ') : ''}`}
        >
          {pt.rating}
        </div>
      ))}
    </div>
  );
} 