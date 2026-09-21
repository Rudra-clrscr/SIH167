import React, { useState } from 'react';
import { Send, Sparkles, Download, Terminal, Clock, CheckCircle2, Zap, Cpu, X, Layers, Sliders } from './Icons';

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
    "Use the optical and SAR images together to identify built-up and water-covered regions.",
    "Explain how Sentinel-2 NIR band and NDVI vegetation index work.",
    "What is SAR radar double-bounce backscattering?"
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

  // Extract computed image analytics if available
  const activeAnalytics = answerResult?.image_metadata?.[0]?.image_analytics || null;
  const landCover = activeAnalytics?.land_cover_breakdown || null;

  return (
    <div id="tour-copilot" className="cyber-panel" style={{ width: '100%', height: 'calc(100vh - 88px)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Copilot Header */}
      <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'transparent' }}>
        <h3 style={{ fontSize: '0.95rem', fontWeight: 300, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'var(--font-sans)' }}>
          <Sparkles size={18} color="#b983ff" /> AGENTIC COPILOT
        </h3>
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          <span className="telemetry-badge badge-purple" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Zap size={11} color="#a855f7" /> GROQ LLM
          </span>
          <span className="telemetry-badge badge-cyan">ACTIVE</span>
        </div>
      </div>

      {/* Main Scrollable Body */}
      <div style={{ flex: 1, padding: '16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Answer Panel Output */}
        {answerResult ? (
          <div style={{ background: 'rgba(255, 255, 255, 0.02)', borderRadius: '12px', padding: '16px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px', flexWrap: 'wrap', gap: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span className="telemetry-badge badge-cyan">{answerResult.task_type}</span>
                {answerResult.llm_engine && (
                  <span className="telemetry-badge badge-purple">{answerResult.llm_engine}</span>
                )}
              </div>
              <span className="telemetry-badge badge-emerald">
                Confidence: {Math.round((answerResult.confidence || 0.9) * 100)}%
              </span>
            </div>

            <div style={{ fontSize: '0.875rem', lineHeight: '1.6', color: '#f1f5f9', whiteSpace: 'pre-line', marginBottom: '14px' }}>
              {answerResult.answer}
            </div>

            {/* Computed Image Processing Analytics Bar */}
            {activeAnalytics && landCover && (
              <div style={{ background: 'rgba(255, 255, 255, 0.02)', borderRadius: '8px', padding: '12px', border: '1px solid rgba(255, 255, 255, 0.05)', marginBottom: '14px' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 500, color: '#00e5ff', marginBottom: '8px', fontFamily: 'var(--font-mono)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Sliders size={13} /> COMPUTED RASTER ARRAY ANALYTICS
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', fontSize: '0.725rem', fontFamily: 'var(--font-mono)' }}>
                  <div>🌾 Vegetation: <strong style={{ color: '#34d399' }}>{landCover.vegetation_pct}%</strong></div>
                  <div>🏢 Built-Up: <strong style={{ color: '#f43f5e' }}>{landCover.builtup_pct}%</strong></div>
                  <div>🌊 Water Surface: <strong style={{ color: '#60a5fa' }}>{landCover.water_pct}%</strong></div>
                  <div>🏜️ Bare Soil: <strong style={{ color: '#fbbf24' }}>{landCover.soil_bare_pct}%</strong></div>
                  {activeAnalytics.ndvi_index && (
                    <div style={{ gridColumn: '1 / -1', color: '#a78bfa', marginTop: '2px' }}>
                      Mean NDVI: <strong>{activeAnalytics.ndvi_index.mean}</strong> | Mean NDWI: <strong>{activeAnalytics.ndwi_index?.mean || 0.18}</strong>
                    </div>
                  )}
                </div>
              </div>
            )}

            {reportFilename && (
              <a 
                href={`/api/download-report/${reportFilename}`} 
                target="_blank" 
                rel="noreferrer" 
                className="btn-cyber"
                style={{ width: '100%', justifyContent: 'center', textDecoration: 'none' }}
              >
                <Download size={14} /> Download PDF/HTML Audit Report
              </a>
            )}
          </div>
        ) : (
          <div style={{ background: 'rgba(255, 255, 255, 0.01)', border: '1px dashed rgba(255, 255, 255, 0.15)', padding: '20px', borderRadius: '12px', textAlign: 'center', color: '#8c8fa8' }}>
            <p style={{ fontSize: '0.825rem', fontWeight: 300 }}>Select a dataset mode or ask any satellite remote sensing question below to initiate agentic multimodal reasoning.</p>
          </div>
        )}

        {/* Auditable Execution Trace Log */}
        {answerResult?.trace_log && (
          <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '16px' }}>
            <h4 style={{ fontSize: '0.8rem', fontWeight: 400, color: '#b983ff', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'var(--font-mono)' }}>
              <Terminal size={14} /> AUDITABLE EXECUTION TRACE
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {answerResult.trace_log.map((step, idx) => (
                <div key={idx} style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.04)', fontSize: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#00e5ff', fontWeight: 400, marginBottom: '2px' }}>
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
      <div id="tour-prompt" style={{ padding: '16px', background: 'transparent', borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
        {/* Suggestion Chips */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '10px' }}>
          {sampleQueries.map((q, idx) => (
            <button 
              key={idx}
              onClick={() => handleSelectChip(q)}
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#8c8fa8',
                borderRadius: '16px',
                padding: '4px 12px',
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
            placeholder="Ask AI general questions or click canvas region..."
            disabled={loading}
            style={{
              flex: 1,
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '24px',
              padding: '12px 16px',
              color: '#fff',
              fontSize: '0.85rem',
              outline: 'none',
              fontFamily: 'var(--font-sans)',
              fontWeight: 300
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

