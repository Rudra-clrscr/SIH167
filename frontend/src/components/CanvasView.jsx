import React, { useState, useRef, useEffect } from 'react';
import { Sliders, Info, Layers } from './Icons';

export default function CanvasView({ 
  selectedImages = [], 
  activeMode = 'SINGLE',
  groundingBoxes = [], 
  taskType = null, 
  onCanvasClickPoint,
  isDraggingFile
}) {
  const [viewMode, setViewMode] = useState('SWIPE'); // 'SWIPE' or 'OPACITY'
  const [swipePos, setSwipePos] = useState(50);
  const [opacityVal, setOpacityVal] = useState(0.5);
  const canvasRef = useRef(null);

  const img1 = selectedImages[0];
  const img2 = selectedImages[1];

  // Draw grounded bounding boxes on HTML5 canvas
  useEffect(() => {
    if (!img1 || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const imageObj = new Image();
    imageObj.crossOrigin = "anonymous";
    imageObj.src = img1.preview_base64;

    imageObj.onload = () => {
      canvas.width = imageObj.naturalWidth || 600;
      canvas.height = imageObj.naturalHeight || 600;

      // Draw base satellite image
      ctx.drawImage(imageObj, 0, 0, canvas.width, canvas.height);

      // Render grounded bounding boxes
      groundingBoxes.forEach((box) => {
        const [ymin, xmin, ymax, xmax] = box.bbox || [0.2, 0.2, 0.6, 0.6];
        const x = xmin * canvas.width;
        const y = ymin * canvas.height;
        const w = (xmax - xmin) * canvas.width;
        const h = (ymax - ymin) * canvas.height;

        let strokeColor = "#00f0ff";
        let fillColor = "rgba(0, 240, 255, 0.2)";

        if (box.label?.toLowerCase().includes('water')) {
          strokeColor = "#3b82f6";
          fillColor = "rgba(59, 130, 246, 0.25)";
        } else if (box.label?.toLowerCase().includes('built') || box.label?.toLowerCase().includes('urban') || box.change_type === 'URBAN_GROWTH') {
          strokeColor = "#ff2a85";
          fillColor = "rgba(255, 42, 133, 0.25)";
        } else if (box.label?.toLowerCase().includes('crop') || box.label?.toLowerCase().includes('vegetation')) {
          strokeColor = "#10b981";
          fillColor = "rgba(16, 185, 129, 0.25)";
        }

        ctx.fillStyle = fillColor;
        ctx.fillRect(x, y, w, h);

        ctx.lineWidth = Math.max(3, Math.floor(canvas.width / 160));
        ctx.strokeStyle = strokeColor;
        ctx.strokeRect(x, y, w, h);

        const labelText = `${box.label} (${Math.round((box.confidence || 0.9) * 100)}%)`;
        ctx.font = `bold ${Math.max(13, Math.floor(canvas.width / 36))}px Inter, sans-serif`;
        const textMetrics = ctx.measureText(labelText);
        const padding = 6;
        const textHeight = Math.max(18, Math.floor(canvas.width / 32));

        ctx.fillStyle = strokeColor;
        ctx.fillRect(x, y - textHeight - padding, textMetrics.width + padding * 2, textHeight + padding);

        ctx.fillStyle = "#040711";
        ctx.fillText(labelText, x + padding, y - padding);
      });
    };
  }, [img1, groundingBoxes]);

  // Click on canvas handler to inspect spatial point coordinates
  const handleCanvasClick = (e) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    const normX = (clickX / rect.width).toFixed(3);
    const normY = (clickY / rect.height).toFixed(3);

    if (onCanvasClickPoint) {
      onCanvasClickPoint({ x: normX, y: normY });
    }
  };

  return (
    <div id="tour-canvas" style={{ position: 'relative', width: '100%', height: 'calc(100vh - 88px)', background: '#040711', borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(0, 240, 255, 0.2)' }}>
      {/* View Mode & Overlay Controls (Top Floating Toolbar) */}
      {selectedImages.length >= 2 && (
        <div style={{ position: 'absolute', top: '16px', left: '16px', zIndex: 30, display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(10, 16, 36, 0.85)', padding: '6px 12px', borderRadius: '6px', border: '1px solid rgba(0, 240, 255, 0.3)', backdropFilter: 'blur(8px)' }}>
          <div style={{ display: 'flex', gap: '4px' }}>
            <button 
              onClick={() => setViewMode('SWIPE')}
              style={{ padding: '4px 10px', fontSize: '0.75rem', fontWeight: 600, fontFamily: 'var(--font-mono)', borderRadius: '4px', border: 'none', cursor: 'pointer', background: viewMode === 'SWIPE' ? '#00f0ff' : 'transparent', color: viewMode === 'SWIPE' ? '#040711' : '#94a3b8' }}
            >
              SWIPE SLIDER
            </button>
            <button 
              onClick={() => setViewMode('OPACITY')}
              style={{ padding: '4px 10px', fontSize: '0.75rem', fontWeight: 600, fontFamily: 'var(--font-mono)', borderRadius: '4px', border: 'none', cursor: 'pointer', background: viewMode === 'OPACITY' ? '#00f0ff' : 'transparent', color: viewMode === 'OPACITY' ? '#040711' : '#94a3b8' }}
            >
              OPACITY BLEND
            </button>
          </div>

          {viewMode === 'OPACITY' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: '12px' }}>
              <span style={{ fontSize: '0.725rem', color: '#94a3b8', fontFamily: 'var(--font-mono)' }}>SAR Alpha: {Math.round(opacityVal * 100)}%</span>
              <input 
                type="range" 
                min="0" 
                max="1" 
                step="0.05" 
                value={opacityVal}
                onChange={(e) => setOpacityVal(parseFloat(e.target.value))}
                style={{ width: '80px', accentColor: '#00f0ff', cursor: 'pointer' }}
              />
            </div>
          )}
        </div>
      )}

      {/* Main Canvas View Area */}
      {selectedImages.length === 0 ? (
        <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
          <div style={{ background: 'rgba(0, 240, 255, 0.05)', padding: '24px', borderRadius: '12px', border: '1px dashed rgba(0, 240, 255, 0.3)', textAlign: 'center' }}>
            <Layers size={48} color="#00f0ff" style={{ marginBottom: '12px' }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', marginBottom: '6px' }}>NO SATELLITE IMAGERY LOADED</h3>
            <p style={{ fontSize: '0.825rem', color: '#94a3b8', maxWidth: '360px', margin: '0 auto' }}>
              Click <strong>"LOAD ISRO SAMPLES"</strong> above or drag and drop GeoTIFF (.tif / .tiff) files onto this canvas to begin analysis.
            </p>
          </div>
        </div>
      ) : selectedImages.length >= 2 && viewMode === 'SWIPE' ? (
        <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden', userSelect: 'none' }}>
          {/* Background Image (Right / Underneath) */}
          <img src={img2.preview_base64} alt={img2.filename} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
          <div style={{ position: 'absolute', top: '16px', right: '16px', background: 'rgba(10, 16, 36, 0.85)', padding: '4px 10px', borderRadius: '4px', fontSize: '0.725rem', fontWeight: 600, color: '#34d399', fontFamily: 'var(--font-mono)', border: '1px solid rgba(16,185,129,0.3)' }}>
            {img2.filename} ({img2.metadata.modality})
          </div>

          {/* Foreground Image (Left / Clipped) */}
          <div style={{ position: 'absolute', top: 0, left: 0, width: `${swipePos}%`, height: '100%', overflow: 'hidden', borderRight: '2px solid #00f0ff' }}>
            <img src={img1.preview_base64} alt={img1.filename} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', maxWidth: 'none' }} />
            <div style={{ position: 'absolute', top: '16px', left: '16px', background: 'rgba(10, 16, 36, 0.85)', padding: '4px 10px', borderRadius: '4px', fontSize: '0.725rem', fontWeight: 600, color: '#00f0ff', fontFamily: 'var(--font-mono)', border: '1px solid rgba(0,240,255,0.3)' }}>
              {img1.filename} ({img1.metadata.modality})
            </div>
          </div>

          {/* Slider Control Bar */}
          <input 
            type="range" min="0" max="100" value={swipePos} 
            onChange={(e) => setSwipePos(e.target.value)}
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'ew-resize', zIndex: 20 }}
          />

          {/* Vertical Divider Indicator */}
          <div style={{ position: 'absolute', top: 0, bottom: 0, left: `${swipePos}%`, width: '2px', background: '#00f0ff', pointerEvents: 'none', boxShadow: '0 0 10px #00f0ff' }}>
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '28px', height: '28px', borderRadius: '50%', background: '#00f0ff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 15px #00f0ff' }}>
              <Sliders size={14} color="#040711" />
            </div>
          </div>
        </div>
      ) : selectedImages.length >= 2 && viewMode === 'OPACITY' ? (
        <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
          {/* Base Layer (Optical) */}
          <img src={img1.preview_base64} alt={img1.filename} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
          {/* Stacked Layer (SAR with Opacity) */}
          <img src={img2.preview_base64} alt={img2.filename} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: opacityVal, mixBlendMode: 'screen' }} />
        </div>
      ) : (
        /* Single Baseline Image Canvas */
        <div style={{ position: 'relative', width: '100%', height: '100%', cursor: 'crosshair' }} onClick={handleCanvasClick}>
          <canvas ref={canvasRef} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        </div>
      )}

      {/* Floating Heads-Up Display (HUD) Metadata Overlay (Bottom-Left) */}
      {img1 && (
        <div id="tour-hud" className="cyber-panel" style={{ position: 'absolute', bottom: '16px', left: '16px', zIndex: 30, padding: '12px 16px', maxWidth: '340px', background: 'rgba(10, 16, 36, 0.88)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', borderBottom: '1px solid rgba(0,240,255,0.15)', paddingBottom: '6px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#00f0ff', fontFamily: 'var(--font-mono)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Info size={14} /> GEOTIFF TELEMETRY HUD
            </span>
            <span className="telemetry-badge badge-cyan">{img1.metadata.modality}</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.725rem', fontFamily: 'var(--font-mono)', color: '#cbd5e1' }}>
            <div>
              <span style={{ color: 'var(--text-muted)', display: 'block' }}>CRS:</span>
              <strong>{img1.metadata.crs}</strong>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)', display: 'block' }}>GRID SIZE:</span>
              <strong>{img1.metadata.dimensions}</strong>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)', display: 'block' }}>RESOLUTION:</span>
              <strong>{img1.metadata.resolution}</strong>
            </div>
            {img1.metadata.ndvi && (
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block' }}>MEAN NDVI:</span>
                <strong style={{ color: '#34d399' }}>{img1.metadata.ndvi.mean.toFixed(3)}</strong>
              </div>
            )}
            {img1.metadata.sar_polarization && img1.metadata.sar_polarization.length > 0 && (
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block' }}>SAR POL:</span>
                <strong style={{ color: '#c77dff' }}>{img1.metadata.sar_polarization.join(', ')}</strong>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Full-Screen Drag and Drop Overlay */}
      {isDraggingFile && (
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(4, 7, 17, 0.9)', backdropFilter: 'blur(8px)', zIndex: 100, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '3px dashed #00f0ff' }}>
          <Layers size={64} color="#00f0ff" style={{ marginBottom: '16px' }} />
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', letterSpacing: '0.05em' }}>DROP GEOTIFF TO RENDER</h2>
          <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '6px' }}>Supports .tif, .tiff, .png, .jpg satellite imagery</p>
        </div>
      )}
    </div>
  );
}
