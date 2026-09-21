import React from 'react';
import { Radio, Database, Award, Sparkles } from './Icons';

export default function HeaderNav({ activeMode, setActiveMode, onLoadSamples, onOpenBenchmark, onOpenTour }) {
  return (
    <header className="cyber-panel" style={{ borderRadius: '0', borderLeft: 'none', borderRight: 'none', borderTop: 'none', padding: '12px 24px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(163, 116, 255, 0.1)' }}>
      {/* Brand & Telemetry */}
      <div id="tour-brand" style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <img 
          src="/logo.png" 
          alt="SatQuery AI Logo" 
          style={{ 
            height: '42px', 
            width: '42px', 
            borderRadius: '12px', 
            objectFit: 'contain',
            border: '1px solid rgba(185, 131, 255, 0.3)',
            boxShadow: '0 0 15px rgba(185, 131, 255, 0.2)',
            background: 'rgba(2, 0, 10, 0.6)'
          }} 
        />
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={{ fontSize: '1.2rem', fontWeight: 300, letterSpacing: '0.02em', fontFamily: 'var(--font-sans)', color: '#fff' }}>
              SATQUERY <span style={{ color: '#b983ff', fontWeight: 600 }}>AI</span>
            </h1>
            <div className="pulse-orb" />
            <span className="telemetry-badge badge-purple">ISRO PS 26167</span>
          </div>
          <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontWeight: 300 }}>
            AGENTIC VISION-LANGUAGE MULTIMODAL ASSISTANT
          </p>
        </div>
      </div>

      {/* Multimodal Input Mode Selector */}
      <div id="tour-mode-selector" style={{ display: 'flex', gap: '4px', background: 'rgba(255, 255, 255, 0.02)', padding: '4px', borderRadius: '20px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
        <button 
          onClick={() => setActiveMode('SINGLE')} 
          style={{
            padding: '6px 16px', borderRadius: '16px', fontSize: '0.75rem', fontWeight: 500, fontFamily: 'var(--font-sans)', cursor: 'pointer', transition: 'all 0.2s',
            background: activeMode === 'SINGLE' ? 'rgba(0, 229, 255, 0.1)' : 'transparent',
            color: activeMode === 'SINGLE' ? '#00e5ff' : 'var(--text-muted)',
            border: 'none'
          }}
        >
          SINGLE BASELINE
        </button>
        <button 
          onClick={() => setActiveMode('BITEMPORAL')} 
          style={{
            padding: '6px 16px', borderRadius: '16px', fontSize: '0.75rem', fontWeight: 500, fontFamily: 'var(--font-sans)', cursor: 'pointer', transition: 'all 0.2s',
            background: activeMode === 'BITEMPORAL' ? 'rgba(185, 131, 255, 0.1)' : 'transparent',
            color: activeMode === 'BITEMPORAL' ? '#b983ff' : 'var(--text-muted)',
            border: 'none'
          }}
        >
          BI-TEMPORAL PAIR
        </button>
        <button 
          onClick={() => setActiveMode('CROSS_MODAL')} 
          style={{
            padding: '6px 16px', borderRadius: '16px', fontSize: '0.75rem', fontWeight: 500, fontFamily: 'var(--font-sans)', cursor: 'pointer', transition: 'all 0.2s',
            background: activeMode === 'CROSS_MODAL' ? 'rgba(255, 71, 161, 0.1)' : 'transparent',
            color: activeMode === 'CROSS_MODAL' ? '#ff47a1' : 'var(--text-muted)',
            border: 'none'
          }}
        >
          OPTICAL + SAR FUSION
        </button>
      </div>

      {/* Action Buttons */}
      <div id="tour-actions" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <button className="btn-cyber" onClick={onOpenTour} style={{ border: '1px solid rgba(185, 131, 255, 0.3)', background: 'rgba(185, 131, 255, 0.1)' }}>
          <Sparkles size={14} color="#b983ff" /> Take Tour
        </button>
        <button className="btn-cyber" onClick={onLoadSamples}>
          <Database size={14} color="#00e5ff" /> Samples
        </button>
        <button className="btn-cyber" onClick={onOpenBenchmark}>
          <Award size={14} color="#ff47a1" /> Benchmarks
        </button>
      </div>
    </header>
  );
}
