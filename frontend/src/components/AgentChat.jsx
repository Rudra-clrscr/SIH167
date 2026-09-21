import React, { useState } from 'react';
import { Send, Sparkles, Download, CheckCircle } from './Icons';

export default function AgentChat({ onAnalyze, loading, answerResult, reportFilename }) {
  const [query, setQuery] = useState('');

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

  const handleSelectSample = (q) => {
    setQuery(q);
    onAnalyze(q);
  };

  return (
    <div className="glass-panel" style={{ padding: '20px', marginBottom: '20px' }}>
      <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#f8fafc', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Sparkles size={18} color="#06b6d4" /> Agentic Query Assistant
      </h3>

      {/* Query Input Bar */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '10px', marginBottom: '14px' }}>
        <input 
          type="text" 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask a question about the uploaded satellite imagery..."
          disabled={loading}
          style={{
            flex: 1,
            background: 'rgba(15, 23, 42, 0.8)',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            borderRadius: '8px',
            padding: '12px 16px',
            color: '#fff',
            fontSize: '0.95rem',
            outline: 'none'
          }}
        />
        <button type="submit" className="btn-primary" disabled={loading || !query.trim()}>
          {loading ? 'Orchestrating Agent...' : <><Send size={16} /> Run Analysis</>}
        </button>
      </form>

      {/* Sample Query Suggestions */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', alignSelf: 'center' }}>
          Representative PS Queries:
        </span>
        {sampleQueries.map((q, idx) => (
          <button 
            key={idx}
            onClick={() => handleSelectSample(q)}
            style={{
              background: 'rgba(30, 41, 59, 0.6)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              color: '#93c5fd',
              borderRadius: '20px',
              padding: '4px 12px',
              fontSize: '0.75rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            "{q.length > 45 ? q.substring(0, 45) + '...' : q}"
          </button>
        ))}
      </div>

      {/* Answer Output Box */}
      {answerResult && (
        <div style={{ background: 'rgba(15, 23, 42, 0.9)', borderRadius: '10px', padding: '18px', border: '1px solid rgba(59, 130, 246, 0.3)', marginTop: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="badge badge-blue">{answerResult.task_type}</span>
              <span className="badge badge-purple">{answerResult.selected_tool?.name || 'Specialist Model'}</span>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span className="badge badge-emerald">
                Confidence: {Math.round((answerResult.confidence || 0.9) * 100)}%
              </span>
              {reportFilename && (
                <a 
                  href={`/api/download-report/${reportFilename}`} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="btn-secondary"
                  style={{ padding: '4px 10px', fontSize: '0.75rem', textDecoration: 'none' }}
                >
                  <Download size={14} /> Download PDF/HTML Report
                </a>
              )}
            </div>
          </div>

          <div style={{ fontSize: '0.95rem', lineHeight: '1.6', color: '#f1f5f9', whiteSpace: 'pre-line' }}>
            {answerResult.answer}
          </div>
        </div>
      )}
    </div>
  );
}
