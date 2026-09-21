import React, { useState, useEffect } from 'react';
import { Database, Sparkles, Check, Layers } from './Icons';
import { fetchSampleDatasets } from '../services/api';

export default function SampleGalleryModal({ isOpen, onClose, onSelectSampleSet, activeMode }) {
  const [samples, setSamples] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      fetchSampleDatasets()
        .then(res => {
          if (res.samples) {
            setSamples(res.samples);
          }
        })
        .catch(err => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const toggleSelect = (sample) => {
    if (activeMode === 'SINGLE') {
      setSelectedIds([sample.image_id]);
    } else {
      if (selectedIds.includes(sample.image_id)) {
        setSelectedIds(selectedIds.filter(id => id !== sample.image_id));
      } else {
        if (selectedIds.length >= 2) {
          setSelectedIds([selectedIds[1], sample.image_id]);
        } else {
          setSelectedIds([...selectedIds, sample.image_id]);
        }
      }
    }
  };

  const handleApply = () => {
    const chosen = samples.filter(s => selectedIds.includes(s.image_id));
    if (chosen.length > 0) {
      onSelectSampleSet(chosen);
      onClose();
    }
  };

  const loadPreset = (presetType) => {
    if (presetType === 'DERNA_FLOOD') {
      const pair = samples.filter(s => s.filename.includes('bitemporal_flood') || s.filename.includes('derna') || s.filename.includes('bitemporal_t'));
      if (pair.length >= 2) onSelectSampleSet(pair.slice(0, 2));
    } else if (presetType === 'SAR_OPTICAL_FUSION') {
      const sar = samples.find(s => s.filename.includes('sar') || s.filename.includes('radar'));
      const opt = samples.find(s => s.filename.includes('sentinel2') || s.filename.includes('optical'));
      if (sar && opt) onSelectSampleSet([opt, sar]);
    } else if (presetType === 'REAL_OPTICAL') {
      const realOpt = samples.find(s => s.filename.includes('real_sentinel2') || s.filename.includes('karnataka'));
      if (realOpt) onSelectSampleSet([realOpt]);
    }
    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'rgba(4, 7, 17, 0.85)',
      backdropFilter: 'blur(8px)',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px'
    }}>
      <div className="cyber-panel" style={{
        width: '100%',
        maxWidth: '860px',
        maxHeight: '85vh',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: '12px',
        boxShadow: '0 0 40px rgba(0, 240, 255, 0.25)',
        border: '1px solid rgba(0, 240, 255, 0.4)',
        background: '#040711',
        overflow: 'hidden'
      }}>
        {/* Modal Header */}
        <div style={{
          padding: '16px 24px',
          borderBottom: '1px solid rgba(0, 240, 255, 0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(0, 240, 255, 0.05)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Database size={20} color="#00f0ff" />
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff' }}>
              SATQUERY AI <span style={{ color: '#00f0ff' }}>SAMPLE DATASET GALLERY</span>
            </h2>
          </div>
          <button 
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '1.2rem', cursor: 'pointer' }}
          >
            ✕
          </button>
        </div>

        {/* Quick Presets */}
        <div style={{ padding: '12px 24px', background: 'rgba(255, 255, 255, 0.02)', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>DEMO PRESETS:</span>
          <button className="btn-cyber" onClick={() => loadPreset('DERNA_FLOOD')} style={{ fontSize: '0.725rem', padding: '4px 10px' }}>
            🌊 Real Derna Flood (Bi-Temporal)
          </button>
          <button className="btn-cyber" onClick={() => loadPreset('SAR_OPTICAL_FUSION')} style={{ fontSize: '0.725rem', padding: '4px 10px' }}>
            🛰️ Sentinel-1 SAR + Sentinel-2 Optical
          </button>
          <button className="btn-cyber" onClick={() => loadPreset('REAL_OPTICAL')} style={{ fontSize: '0.725rem', padding: '4px 10px' }}>
            🌾 Real Sentinel-2 Optical Land-Cover
          </button>
        </div>

        {/* Gallery Grid */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: '16px' }}>
          {loading ? (
            <div style={{ gridColumn: '1 / -1', padding: '40px', textAlign: 'center', color: '#00f0ff', fontFamily: 'var(--font-mono)' }}>
              Loading sample satellite datasets...
            </div>
          ) : samples.map(item => {
            const isSelected = selectedIds.includes(item.image_id);
            return (
              <div
                key={item.image_id}
                onClick={() => toggleSelect(item)}
                style={{
                  borderRadius: '8px',
                  border: isSelected ? '2px solid #00f0ff' : '1px solid rgba(255, 255, 255, 0.12)',
                  background: isSelected ? 'rgba(0, 240, 255, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  position: 'relative'
                }}
              >
                {isSelected && (
                  <div style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    background: '#00f0ff',
                    color: '#040711',
                    borderRadius: '50%',
                    width: '22px',
                    height: '22px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 2,
                    fontWeight: 'bold'
                  }}>
                    <Check size={14} color="#040711" />
                  </div>
                )}
                {/* Thumbnail Preview */}
                <div style={{ height: '140px', background: '#000', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {item.preview_base64 ? (
                    <img 
                      src={item.preview_base64.startsWith('data:') ? item.preview_base64 : `data:image/png;base64,${item.preview_base64}`} 
                      alt={item.filename}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>No Preview</div>
                  )}
                </div>

                {/* Metadata details */}
                <div style={{ padding: '10px' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#fff', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                    {item.filename}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#00f0ff', fontFamily: 'var(--font-mono)', marginTop: '4px' }}>
                    {item.metadata?.dimensions || '512x512'} • {item.metadata?.format || item.metadata?.file_format || 'Raster'}
                  </div>

                </div>
              </div>
            );
          })}
        </div>

        {/* Modal Footer */}
        <div style={{
          padding: '16px 24px',
          borderTop: '1px solid rgba(0, 240, 255, 0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(0, 240, 255, 0.05)'
        }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            Selected: <span style={{ color: '#00f0ff', fontWeight: 'bold' }}>{selectedIds.length} image(s)</span> (Mode: {activeMode})
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn-cyber" onClick={onClose} style={{ background: 'transparent' }}>
              Cancel
            </button>
            <button 
              className="btn-cyber" 
              onClick={handleApply}
              disabled={selectedIds.length === 0}
              style={{
                background: selectedIds.length > 0 ? '#00f0ff' : 'rgba(255, 255, 255, 0.1)',
                color: selectedIds.length > 0 ? '#040711' : 'var(--text-muted)',
                fontWeight: 700
              }}
            >
              Load Into Canvas
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
