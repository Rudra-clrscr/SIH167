import React from 'react';
import { Radio, Database, Award, Sparkles } from './Icons';

export default function HeaderNav({ activeMode, setActiveMode, onLoadSamples, onOpenBenchmark, onOpenTour }) {
  return (
    <header className="cyber-panel" style={{ borderRadius: '0', borderLeft: 'none', borderRight: 'none', borderTop: 'none', padding: '12px 24px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      {/* Brand & Telemetry */}
      <div id="tour-brand" style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <img 
          src="/logo.png" 
          alt="SatQuery AI Logo" 
          style={{ 
            height: '42px', 
            width: '42px', 
            borderRadius: '8px', 
            objectFit: 'contain',
            border: '1px solid rgba(0, 240, 255, 0.4)',
            boxShadow: '0 0 12px rgba(0, 240, 255, 0.3)',
            background: 'rgba(4, 7, 17, 0.8)'
          }} 
        />
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={{ fontSize: '1.2rem', fontWeight: 800, letterSpacing: '-0.03em', fontFamily: 'var(--font-sans)', color: '#fff' }}>
              SATQUERY <span style={{ color: '#00f0ff' }}>AI</span>
            </h1>
            <div className="pulse-orb" />
            <span className="telemetry-badge badge-cyan">ISRO PS 26167</span>
          </div>
          <p style={{ fontSize: '0.725rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            AGENTIC VISION-LANGUAGE MULTIMODAL ASSISTANT
          </p>
        </div>
      </div>

      {/* Multimodal Input Mode Selector */}
      <div id="tour-mode-selector" style={{ display: 'flex', gap: '6px', background: 'rgba(4, 7, 17, 0.9)', padding: '4px', borderRadius: '6px', border: '1px solid rgba(0, 240, 255, 0.15)' }}>
        <button 
          onClick={() => setActiveMode('SINGLE')} 
          style={{
            padding: '6px 14px', borderRadius: '4px', fontSize: '0.775rem', fontWeight: 600, fontFamily: 'var(--font-mono)', cursor: 'pointer',
            background: activeMode === 'SINGLE' ? 'rgba(0, 240, 255, 0.2)' : 'transparent',
            color: activeMode === 'SINGLE' ? '#00f0ff' : 'var(--text-muted)',
            border: activeMode === 'SINGLE' ? '1px solid rgba(0, 240, 255, 0.4)' : '1px solid transparent'
          }}
        >
          SINGLE BASELINE
        </button>
        <button 
          onClick={() => setActiveMode('BITEMPORAL')} 
          style={{
            padding: '6px 14px', borderRadius: '4px', fontSize: '0.775rem', fontWeight: 600, fontFamily: 'var(--font-mono)', cursor: 'pointer',
            background: activeMode === 'BITEMPORAL' ? 'rgba(157, 78, 221, 0.2)' : 'transparent',
            color: activeMode === 'BITEMPORAL' ? '#c77dff' : 'var(--text-muted)',
            border: activeMode === 'BITEMPORAL' ? '1px solid rgba(157, 78, 221, 0.4)' : '1px solid transparent'
          }}
        >
          BI-TEMPORAL PAIR
        </button>
        <button 
          onClick={() => setActiveMode('CROSS_MODAL')} 
          style={{
            padding: '6px 14px', borderRadius: '4px', fontSize: '0.775rem', fontWeight: 600, fontFamily: 'var(--font-mono)', cursor: 'pointer',
            background: activeMode === 'CROSS_MODAL' ? 'rgba(16, 185, 129, 0.2)' : 'transparent',
            color: activeMode === 'CROSS_MODAL' ? '#34d399' : 'var(--text-muted)',
            border: activeMode === 'CROSS_MODAL' ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid transparent'
          }}
        >
          OPTICAL + SAR FUSION
        </button>
      </div>

      {/* Action Buttons */}
      <div id="tour-actions" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <button className="btn-cyber" onClick={onOpenTour} style={{ border: '1px solid rgba(0, 240, 255, 0.5)', background: 'rgba(0, 240, 255, 0.1)' }}>
          <Sparkles size={14} color="#00f0ff" /> Take Tour
        </button>
        <button className="btn-cyber" onClick={onLoadSamples}>
          <Database size={14} color="#00f0ff" /> Samples
        </button>
        <button className="btn-cyber" onClick={onOpenBenchmark}>
          <Award size={14} color="#f59e0b" /> Benchmarks
        </button>
      </div>
    </header>
  );
}
