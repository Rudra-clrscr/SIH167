import React from 'react';
import { Info } from './Icons';

export default function MetadataCard({ metadata }) {
  if (!metadata || metadata.length === 0) return null;

  return (
    <div className="glass-panel" style={{ padding: '16px', marginBottom: '20px' }}>
      <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#f8fafc', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Info size={16} color="#3b82f6" /> GeoTIFF Spatial Metadata Inspector
      </h4>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
        {metadata.map((meta, idx) => (
          <div key={idx} style={{ background: 'rgba(30, 41, 59, 0.4)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', fontSize: '0.8rem' }}>
            <p style={{ fontWeight: 700, color: '#60a5fa', marginBottom: '6px' }}>
              Image {idx + 1}: {meta.filename}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', color: '#cbd5e1' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Modality:</span>
                <span className="badge badge-blue" style={{ fontSize: '0.65rem' }}>{meta.modality}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Grid Size:</span>
                <span style={{ fontFamily: 'var(--font-mono)' }}>{meta.dimensions}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>CRS:</span>
                <span>{meta.crs}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Resolution:</span>
                <span>{meta.resolution}</span>
              </div>
              {meta.sar_polarization && meta.sar_polarization.length > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>SAR Polarizations:</span>
                  <span className="badge badge-purple" style={{ fontSize: '0.65rem' }}>{meta.sar_polarization.join(', ')}</span>
                </div>
              )}
              {meta.ndvi && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Mean NDVI:</span>
                  <span style={{ color: '#34d399', fontWeight: 600 }}>{meta.ndvi.mean.toFixed(3)}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
