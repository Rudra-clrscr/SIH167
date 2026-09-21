import React, { useState } from 'react';
import { Send, Sparkles, Download, Terminal, Clock, CheckCircle2, Zap, Cpu, X, Layers } from './Icons';

export default function CopilotSidebar({ onAnalyze, loading, answerResult, reportFilename, clickedPoint }) {
  const [query, setQuery] = useState('');

  // Update query input when user clicks on canvas point
  React.useEffect(() => {
    if (clickedPoint) {
      setQuery(`Analyze land cover and spectral response at spatial grid point (${clickedPoint.x}, ${clickedPoint.y})`);
    }
  }, [clickedPoint]);

  const sampleQueries = [
    "Describe the land-cover and major objects visible in this image.",
    "Highlight the water body and agricultural region referred to in the query.",
    "What changed between these two dates, and where did the change occur?",
    "Use the optical and SAR images together to identify built-up and water-covered regions."
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim() && !loading) {
      onAnalyze(query.trim());
    }
  };

  const handleSelectChip = (q) => {
    setQuery(q);
    onAnalyze(q);
  };

  return (
    <div id="tour-copilot" className="cyber-panel" style={{ width: '100%', height: 'calc(100vh - 88px)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Copilot Header */}
      <div style={{ padding: '14px 18px', borderBottom: '1px solid rgba(0, 240, 255, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(4, 7, 17, 0.6)' }}>
        <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'var(--font-sans)' }}>
          <Sparkles size={18} color="#00f0ff" /> AGENTIC COPILOT
        </h3>
        <span className="telemetry-badge badge-cyan">REGISTRY ACTIVE</span>
      </div>

      {/* Main Scrollable Body */}
      <div style={{ flex: 1, padding: '16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Answer Panel Output */}
        {answerResult ? (
          <div style={{ background: 'rgba(10, 16, 36, 0.9)', borderRadius: '8px', padding: '16px', border: '1px solid rgba(0, 240, 255, 0.3)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px', flexWrap: 'wrap', gap: '6px' }}>
              <span className="telemetry-badge badge-cyan">{answerResult.task_type}</span>
              <span className="telemetry-badge badge-emerald">
                Confidence: {Math.round((answerResult.confidence || 0.9) * 100)}%
              </span>
            </div>

            <p style={{ fontSize: '0.875rem', lineHeight: '1.6', color: '#f1f5f9', whiteSpace: 'pre-line', marginBottom: '14px' }}>
              {answerResult.answer}
            </p>

            {reportFilename && (
              <a 
                href={`/api/download-report/${reportFilename}`} 
                target="_blank" 
                rel="noreferrer" 
                className="btn-cyber"
                style={{ width: '100%', justifyContent: 'center', textDecoration: 'none' }}
              >
                <Download size={14} /> Download PDF/HTML Report
              </a>
            )}
          </div>
        ) : (
          <div style={{ background: 'rgba(0, 240, 255, 0.03)', border: '1px dashed rgba(0, 240, 255, 0.2)', padding: '20px', borderRadius: '8px', textAlign: 'center', color: '#94a3b8' }}>
            <p style={{ fontSize: '0.825rem' }}>Select an input mode and click a query chip below to initiate agentic multimodal reasoning.</p>
          </div>
        )}

        {/* Auditable Execution Trace Log */}
        {answerResult?.trace_log && (
          <div style={{ borderTop: '1px solid rgba(0,240,255,0.1)', paddingTop: '12px' }}>
            <h4 style={{ fontSize: '0.8rem', fontWeight: 700, color: '#00f0ff', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'var(--font-mono)' }}>
              <Terminal size={14} /> AUDITABLE EXECUTION TRACE
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {answerResult.trace_log.map((step, idx) => (
                <div key={idx} style={{ background: 'rgba(4, 7, 17, 0.8)', padding: '10px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.06)', fontSize: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#60a5fa', fontWeight: 700, marginBottom: '2px' }}>
                    <span>Step {step.step}: {step.action}</span>
                    <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>{step.latency_ms}ms</span>
                  </div>
                  {step.tool_name && <p style={{ color: '#cbd5e1' }}>Tool: {step.tool_name}</p>}
                  {step.task_type && <p style={{ color: '#34d399' }}>Task: {step.task_type}</p>}
                  {step.details && <p style={{ color: '#94a3b8' }}>{step.details}</p>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Floating Query Suggestion Chips & Prompt Input Bar */}
      <div id="tour-prompt" style={{ padding: '12px 16px', background: 'rgba(4, 7, 17, 0.95)', borderTop: '1px solid rgba(0, 240, 255, 0.15)' }}>
        {/* Suggestion Chips */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '10px' }}>
          {sampleQueries.map((q, idx) => (
            <button 
              key={idx}
              onClick={() => handleSelectChip(q)}
              style={{
                background: 'rgba(0, 240, 255, 0.08)',
                border: '1px solid rgba(0, 240, 255, 0.2)',
                color: '#93c5fd',
                borderRadius: '16px',
                padding: '3px 10px',
                fontSize: '0.7rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: '220px'
              }}
            >
              "{q.substring(0, 32)}..."
            </button>
          ))}
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '8px' }}>
          <input 
            type="text" 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask AI or click canvas region..."
            disabled={loading}
            style={{
              flex: 1,
              background: 'rgba(10, 16, 36, 0.9)',
              border: '1px solid rgba(0, 240, 255, 0.3)',
              borderRadius: '6px',
              padding: '10px 12px',
              color: '#fff',
              fontSize: '0.85rem',
              outline: 'none',
              fontFamily: 'var(--font-sans)'
            }}
          />
          <button type="submit" className="btn-cyber-primary" disabled={loading || !query.trim()} style={{ padding: '10px 14px' }}>
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}
