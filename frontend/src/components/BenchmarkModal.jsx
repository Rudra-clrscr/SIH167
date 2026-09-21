import React, { useState } from 'react';
import { Award, X, Play, CheckCircle2 } from './Icons';
import { runBenchmark } from '../services/api';

export default function BenchmarkModal({ isOpen, onClose }) {
  const [selectedDataset, setSelectedDataset] = useState('VRSBENCH');
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState(null);

  if (!isOpen) return null;

  const handleRun = async () => {
    setRunning(true);
    try {
      const res = await runBenchmark(selectedDataset);
      setResult(res);
    } catch (e) {
      console.error(e);
    } finally {
      setRunning(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, padding: '20px'
    }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '560px', padding: '24px', background: '#0f172a' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Award size={20} color="#fbbf24" /> Public Benchmark Evaluation Suite
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
          Evaluate SatQuery AI model backbones against prescribed test split benchmarks (VRSBench, RSVQA, CDVQA).
        </p>

        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
          {['VRSBENCH', 'RSVQA', 'CDVQA'].map((ds) => (
            <button
              key={ds}
              onClick={() => { setSelectedDataset(ds); setResult(null); }}
              className={selectedDataset === ds ? 'btn-primary' : 'btn-secondary'}
              style={{ flex: 1, fontSize: '0.8rem', justifyContent: 'center' }}
            >
              {ds}
            </button>
          ))}
        </div>

        <button 
          className="btn-primary" 
          onClick={handleRun} 
          disabled={running}
          style={{ width: '100%', justifyContent: 'center', marginBottom: '20px' }}
        >
          {running ? 'Running Benchmark Split Evaluation...' : <><Play size={16} /> Run {selectedDataset} Benchmark</>}
        </button>

        {result && (
          <div style={{ background: 'rgba(30, 41, 59, 0.6)', padding: '16px', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontWeight: 700, color: '#34d399', fontSize: '0.9rem' }}>{result.dataset}</span>
              <span className="badge badge-emerald"><CheckCircle2 size={12} /> {result.status}</span>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '12px' }}>{result.details}</p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', textAlign: 'center' }}>
              {Object.entries(result.metrics || {}).map(([k, v]) => (
                <div key={k} style={{ background: 'rgba(15, 23, 42, 0.8)', padding: '8px', borderRadius: '6px' }}>
                  <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{k.replace('_', ' ')}</p>
                  <p style={{ fontSize: '1rem', fontWeight: 800, color: '#60a5fa', marginTop: '2px' }}>{v}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
