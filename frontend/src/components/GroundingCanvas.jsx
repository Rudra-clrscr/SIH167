import React, { useRef, useEffect } from 'react';

export default function GroundingCanvas({ imageSrc, boxes = [], title = "Spatial Grounding & Evidence View" }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!imageSrc || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = imageSrc;

    img.onload = () => {
      canvas.width = img.naturalWidth || 600;
      canvas.height = img.naturalHeight || 600;

      // Draw base satellite image
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // Draw grounding boxes
      boxes.forEach((box, idx) => {
        const [ymin, xmin, ymax, xmax] = box.bbox || [0.2, 0.2, 0.6, 0.6];
        const x = xmin * canvas.width;
        const y = ymin * canvas.height;
        const w = (xmax - xmin) * canvas.width;
        const h = (ymax - ymin) * canvas.height;

        // Choose color based on label or change type
        let strokeColor = "#3b82f6"; // Default Cyan/Blue
        let fillColor = "rgba(59, 130, 246, 0.2)";

        if (box.label?.toLowerCase().includes('water')) {
          strokeColor = "#06b6d4";
          fillColor = "rgba(6, 182, 212, 0.25)";
        } else if (box.label?.toLowerCase().includes('built') || box.label?.toLowerCase().includes('urban') || box.change_type === 'URBAN_GROWTH') {
          strokeColor = "#f43f5e";
          fillColor = "rgba(244, 63, 94, 0.25)";
        } else if (box.label?.toLowerCase().includes('crop') || box.label?.toLowerCase().includes('vegetation')) {
          strokeColor = "#10b981";
          fillColor = "rgba(16, 185, 129, 0.25)";
        }

        // Fill region
        ctx.fillStyle = fillColor;
        ctx.fillRect(x, y, w, h);

        // Border rectangle
        ctx.lineWidth = Math.max(3, Math.floor(canvas.width / 150));
        ctx.strokeStyle = strokeColor;
        ctx.strokeRect(x, y, w, h);

        // Label pill background & text
        const labelText = `${box.label} (${Math.round((box.confidence || 0.9) * 100)}%)`;
        ctx.font = `bold ${Math.max(14, Math.floor(canvas.width / 35))}px Inter, sans-serif`;
        const textMetrics = ctx.measureText(labelText);
        const padding = 8;
        const textHeight = Math.max(20, Math.floor(canvas.width / 30));

        ctx.fillStyle = strokeColor;
        ctx.fillRect(x, y - textHeight - padding, textMetrics.width + padding * 2, textHeight + padding);

        ctx.fillStyle = "#ffffff";
        ctx.fillText(labelText, x + padding, y - padding);
      });
    };
  }, [imageSrc, boxes]);

  return (
    <div style={{ position: 'relative', width: '100%', borderRadius: '10px', overflow: 'hidden', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
      <canvas ref={canvasRef} style={{ width: '100%', height: 'auto', display: 'block' }} />
      <div style={{ position: 'absolute', bottom: '12px', left: '12px', background: 'rgba(15, 23, 42, 0.85)', padding: '6px 14px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600, color: '#f8fafc', backdropFilter: 'blur(4px)' }}>
        {title} ({boxes.length} regions grounded)
      </div>
    </div>
  );
}
