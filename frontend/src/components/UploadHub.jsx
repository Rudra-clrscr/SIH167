import React, { useRef } from 'react';
import { UploadCloud, Layers, Clock, AlertTriangle, CheckCircle2 } from './Icons';

export default function UploadHub({ onFilesSelected, selectedImages, compatibility, activeMode, setActiveMode }) {
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      onFilesSelected(Array.from(e.target.files));
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '20px', marginBottom: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Layers size={18} color="#3b82f6" /> Multimodal Input Selector
        </h3>

        {/* Mode Buttons */}
        <div style={{ display: 'flex', gap: '8px', background: 'rgba(15, 23, 42, 0.8)', padding: '4px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)' }}>
          <button 
            onClick={() => setActiveMode('SINGLE')} 
            style={{
              padding: '6px 12px', borderRadius: '6px', border: 'none', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer',
              background: activeMode === 'SINGLE' ? '#2563eb' : 'transparent',
              color: activeMode === 'SINGLE' ? '#fff' : 'var(--text-muted)'
            }}
          >
            Single Image Baseline
          </button>
          <button 
            onClick={() => setActiveMode('BITEMPORAL')} 
            style={{
              padding: '6px 12px', borderRadius: '6px', border: 'none', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer',
              background: activeMode === 'BITEMPORAL' ? '#2563eb' : 'transparent',
              color: activeMode === 'BITEMPORAL' ? '#fff' : 'var(--text-muted)'
            }}
          >
            Bi-Temporal Pair (T1 & T2)
          </button>
          <button 
            onClick={() => setActiveMode('CROSS_MODAL')} 
            style={{
              padding: '6px 12px', borderRadius: '6px', border: 'none', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer',
              background: activeMode === 'CROSS_MODAL' ? '#2563eb' : 'transparent',
              color: activeMode === 'CROSS_MODAL' ? '#fff' : 'var(--text-muted)'
            }}
          >
            Optical + SAR Pair
          </button>
        </div>
      </div>

      {/* Upload Zone */}
      <div 
        onClick={() => fileInputRef.current?.click()}
        style={{
          border: '2px dashed rgba(59, 130, 246, 0.3)',
          borderRadius: '10px',
          padding: '24px',
          textAlign: 'center',
          background: 'rgba(30, 41, 59, 0.3)',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          marginBottom: '16px'
        }}
        onMouseEnter={(e) => e.currentTarget.style.borderColor = '#3b82f6'}
        onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.3)'}
      >
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          multiple 
          accept=".tif,.tiff,.png,.jpg,.jpeg" 
          style={{ display: 'none' }} 
        />
        <UploadCloud size={36} color="#3b82f6" style={{ marginBottom: '8px' }} />
        <p style={{ fontWeight: 600, fontSize: '0.95rem', color: '#f1f5f9' }}>
          Click or drag GeoTIFF (.tif / .tiff) or PNG / JPEG satellite images
        </p>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
          Supports ISRO Cartosat-2S, RISAT SAR, Sentinel-1/2, VRSBench, CDVQA benchmark imagery
        </p>
      </div>

      {/* Uploaded Images List & Compatibility Badge */}
      {selectedImages.length > 0 && (
        <div style={{ marginTop: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>
              Selected Input Items ({selectedImages.length}):
            </span>
            {compatibility && (
              <span className={`badge ${compatibility.status === 'VALID' ? 'badge-emerald' : compatibility.status === 'WARNING' ? 'badge-amber' : 'badge-purple'}`}>
                {compatibility.status === 'VALID' ? <CheckCircle2 size={12} /> : <AlertTriangle size={12} />}
                Compatibility: {compatibility.status} ({compatibility.detected_mode})
              </span>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '12px' }}>
            {selectedImages.map((img, idx) => (
              <div key={idx} style={{ background: 'rgba(15, 23, 42, 0.8)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <img src={img.preview_base64} alt={img.filename} style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '6px' }} />
                <div style={{ overflow: 'hidden' }}>
                  <p style={{ fontSize: '0.8rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{img.filename}</p>
                  <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{img.metadata.modality} • {img.metadata.dimensions}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
