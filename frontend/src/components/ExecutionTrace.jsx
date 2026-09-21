import React from 'react';
import { Terminal, CheckCircle2, Clock, Zap, Cpu } from './Icons';

export default function ExecutionTrace({ traceLog, totalLatency }) {
  if (!traceLog || traceLog.length === 0) return null;

  return (
    <div className="glass-panel" style={{ padding: '20px', marginTop: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Terminal size={18} color="#3b82f6" /> Auditable Controller Execution Trace
        </h3>
        {totalLatency && (
          <span className="badge badge-emerald" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Zap size={12} /> Total Pipeline Time: {totalLatency} ms
          </span>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {traceLog.map((step, idx) => (
          <div key={idx} style={{ 
            background: 'rgba(15, 23, 42, 0.6)', 
            border: '1px solid rgba(255, 255, 255, 0.06)', 
            borderRadius: '8px', 
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px'
          }}>
            <div style={{ 
              background: '#2563eb', 
              color: '#fff', 
              width: '24px', 
              height: '24px', 
              borderRadius: '50%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              fontSize: '0.75rem',
              fontWeight: 700,
              flexShrink: 0
            }}>
              {step.step}
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#60a5fa' }}>
                  {step.action}
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', fontFamily: 'var(--font-mono)' }}>
                  <Clock size={12} /> {step.latency_ms} ms
                </span>
              </div>

              {step.task_type && (
                <p style={{ fontSize: '0.8rem', color: '#e2e8f0' }}>
                  Task Classified: <span style={{ color: '#34d399', fontWeight: 600 }}>{step.task_type}</span> | Tool: <span style={{ color: '#a78bfa' }}>{step.selected_tool_id}</span>
                </p>
              )}

              {step.rationale && (
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic', marginTop: '2px' }}>
                  Rationale: {step.rationale}
                </p>
              )}

              {step.tool_name && (
                <p style={{ fontSize: '0.8rem', color: '#e2e8f0' }}>
                  Selected Tool: <strong style={{ color: '#60a5fa' }}>{step.tool_name}</strong> | Backbone: {step.adapted_backbone}
                </p>
              )}

              {step.permitted_parameters && Object.keys(step.permitted_parameters).length > 0 && (
                <div style={{ marginTop: '4px', fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', background: 'rgba(0,0,0,0.3)', padding: '6px 10px', borderRadius: '4px' }}>
                  Bound Parameters: {JSON.stringify(step.permitted_parameters)}
                </div>
              )}

              {step.details && !step.task_type && !step.tool_name && (
                <p style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>{step.details}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
