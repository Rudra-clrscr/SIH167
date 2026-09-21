import React, { useState } from 'react';
import { Sliders } from './Icons';

export default function ImageSplitSlider({ img1Src, img2Src, label1 = "T1 (Before)", label2 = "T2 (After)" }) {
  const [sliderPos, setSliderPos] = useState(50);

  return (
    <div style={{ position: 'relative', width: '100%', height: '360px', overflow: 'hidden', borderRadius: '10px', border: '1px solid rgba(59, 130, 246, 0.3)', userSelect: 'none' }}>
      {/* Background Image (Right / Underneath) */}
      <img 
        src={img2Src} 
        alt={label2} 
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }} 
      />
      <div style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(0,0,0,0.7)', padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600, color: '#60a5fa' }}>
        {label2}
      </div>

      {/* Foreground Image (Left / Clipped) */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: `${sliderPos}%`, height: '100%', overflow: 'hidden', borderRight: '2px solid #3b82f6' }}>
        <img 
          src={img1Src} 
          alt={label1} 
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', maxWidth: 'none' }} 
        />
        <div style={{ position: 'absolute', top: '10px', left: '10px', background: 'rgba(0,0,0,0.7)', padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600, color: '#34d399' }}>
          {label1}
        </div>
      </div>

      {/* Slider Control Bar */}
      <input 
        type="range" 
        min="0" 
        max="100" 
        value={sliderPos} 
        onChange={(e) => setSliderPos(e.target.value)}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          opacity: 0,
          cursor: 'ew-resize',
          zIndex: 10
        }}
      />

      {/* Visual Vertical Divider Line */}
      <div style={{
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: `${sliderPos}%`,
        width: '3px',
        background: '#3b82f6',
        pointerEvents: 'none',
        boxShadow: '0 0 10px #3b82f6'
      }}>
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '28px',
          height: '28px',
          borderRadius: '50%',
          background: '#2563eb',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '2px solid #fff'
        }}>
          <Sliders size={14} color="#fff" />
        </div>
      </div>
    </div>
  );
}
