import React from 'react';
import { Radio, Database, Cpu, Award, FileText } from './Icons';

export default function Header({ onOpenBenchmark, onLoadSamples }) {
  return (
    <header className="glass-panel" style={{ borderRadius: '0 0 16px 16px', padding: '16px 32px', marginBottom: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ 
            background: 'linear-gradient(135deg, #2563eb, #06b6d4)', 
            padding: '12px', 
            borderRadius: '12px',
            boxShadow: '0 0 20px rgba(37, 99, 235, 0.4)'
          }}>
            <Radio size={28} color="#ffffff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h1 style={{ fontSize: '1.4rem', fontWeight: 800, letterSpacing: '-0.02em', background: 'linear-gradient(to right, #ffffff, #93c5fd)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                SatQuery AI
              </h1>
              <span className="badge badge-blue">ISRO / SIH 2026</span>
              <span className="badge badge-purple">PS 26167</span>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              Interactive Vision-Language Assistant for Multimodal Remote Sensing Image Analysis
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button className="btn-secondary" onClick={onLoadSamples} style={{ fontSize: '0.875rem' }}>
            <Database size={16} color="#38bdf8" /> Load ISRO Samples
          </button>
          <button className="btn-secondary" onClick={onOpenBenchmark} style={{ fontSize: '0.875rem' }}>
            <Award size={16} color="#fbbf24" /> Benchmark Suite
          </button>
          <div style={{ borderLeft: '1px solid rgba(255,255,255,0.1)', height: '24px', margin: '0 4px' }}></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#34d399', background: 'rgba(16,185,129,0.1)', padding: '6px 12px', borderRadius: '8px', border: '1px solid rgba(16,185,129,0.2)' }}>
            <Cpu size={14} /> Agentic Registry Active
          </div>
        </div>
      </div>
    </header>
  );
}
