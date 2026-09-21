import React, { useState, useEffect } from 'react';
import { Sparkles, ArrowRight, ArrowLeft, CheckCircle2, X, Compass, Layers, Sliders, Info, Terminal, Award } from './Icons';

export default function GuidedTourModal({ isOpen, onClose, onSelectMode, onLoadSamples }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState(null);

  const tourSteps = [
    {
      targetId: "tour-brand",
      title: "SatQuery AI Telemetry & Branding",
      subtitle: "ISRO SIH 2026 - Problem Statement 26167",
      icon: <Sparkles size={24} color="#00f0ff" />,
      content: "SatQuery AI is an interactive agentic vision-language assistant. It validates remote-sensing inputs, executes specialist tools, and provides auditable execution tracing.",
      badge: "STEP 1 / 6",
      popoverPos: "bottom"
    },
    {
      targetId: "tour-mode-selector",
      title: "Multimodal Input Mode Selector",
      subtitle: "Single, Bi-Temporal & Optical-SAR Pairs",
      icon: <Layers size={24} color="#c77dff" />,
      content: "Switch between input configurations:\n• SINGLE BASELINE: VQA, Scene Captioning & Text Grounding\n• BI-TEMPORAL PAIR: T1 & T2 Change Understanding\n• OPTICAL + SAR FUSION: Joint spectral & radar reasoning",
      badge: "STEP 2 / 6",
      popoverPos: "bottom",
      action: "LOAD_SAMPLES"
    },
    {
      targetId: "tour-actions",
      title: "Sample Dataset & Benchmark Launcher",
      subtitle: "Pre-Loaded GeoTIFFs & Evaluation Suite",
      icon: <Award size={24} color="#f59e0b" />,
      content: "Load sample satellite imagery instantly or run evaluation benchmarks against prescribed public test splits (VRSBench, RSVQA, CDVQA).",
      badge: "STEP 3 / 6",
      popoverPos: "bottom"
    },
    {
      targetId: "tour-canvas",
      title: "70% Interactive Satellite Viewport",
      subtitle: "Swipe Comparison & Opacity Blending",
      icon: <Sliders size={24} color="#3b82f6" />,
      content: "Visual imagery dominates the workspace!\n• Swipe Slider: Drag divider handle left/right to compare before/after images\n• Opacity Blend: Stack SAR radar structural backscatter over Optical RGB\n• Click Canvas: Click any coordinate to auto-trigger region queries!",
      badge: "STEP 4 / 6",
      popoverPos: "right"
    },
    {
      targetId: "tour-hud",
      title: "Floating GeoTIFF Telemetry HUD",
      subtitle: "CRS, Bounds & Mean NDVI Metrics",
      icon: <Info size={24} color="#00f0ff" />,
      content: "Inspect spatial metadata in real-time in the bottom-left Heads-Up Display (HUD). Displays Coordinate Reference System (CRS), grid resolution, dimensions, SAR polarizations, and mean NDVI.",
      badge: "STEP 5 / 6",
      popoverPos: "right"
    },
    {
      targetId: "tour-copilot",
      title: "30% Agentic Copilot & Execution Trace",
      subtitle: "Query Assistant & PDF Reports",
      icon: <Terminal size={24} color="#ff2a85" />,
      content: "Ask questions, click floating query suggestion chips, inspect model confidence, download HTML/PDF audit reports, and view step-by-step tool execution logs.",
      badge: "STEP 6 / 6",
      popoverPos: "left"
    }
  ];

  const step = tourSteps[currentStep];

  // Update target bounding box rectangle on step change or window resize
  const updateTargetPosition = () => {
    if (!isOpen) return;
    const el = document.getElementById(step.targetId);
    if (el) {
      const rect = el.getBoundingClientRect();
      setTargetRect({
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height
      });
    } else {
      setTargetRect(null);
    }
  };

  useEffect(() => {
    updateTargetPosition();
    window.addEventListener('resize', updateTargetPosition);
    window.addEventListener('scroll', updateTargetPosition);
    return () => {
      window.removeEventListener('resize', updateTargetPosition);
      window.removeEventListener('scroll', updateTargetPosition);
    };
  }, [currentStep, isOpen]);

  if (!isOpen) return null;

  const handleNext = () => {
    if (step.action === 'LOAD_SAMPLES' && onLoadSamples) {
      onLoadSamples();
    }
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Compute position for floating popover tooltip
  const getPopoverStyle = () => {
    if (!targetRect) return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };

    const padding = 16;
    if (step.popoverPos === 'bottom') {
      return {
        top: `${targetRect.top + targetRect.height + padding}px`,
        left: `${Math.max(16, targetRect.left)}px`,
      };
    } else if (step.popoverPos === 'left') {
      return {
        top: `${targetRect.top + 20}px`,
        right: `${window.innerWidth - targetRect.left + padding}px`,
      };
    } else if (step.popoverPos === 'right') {
      return {
        top: `${targetRect.top + 60}px`,
        left: `${targetRect.left + 20}px`,
      };
    }
    return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 2000, pointerEvents: 'none' }}>
      {/* Target Spotlight Highlight Ring */}
      {targetRect && (
        <div style={{
          position: 'absolute',
          top: `${targetRect.top - 4}px`,
          left: `${targetRect.left - 4}px`,
          width: `${targetRect.width + 8}px`,
          height: `${targetRect.height + 8}px`,
          borderRadius: '8px',
          border: '2px solid #00f0ff',
          boxShadow: '0 0 0 9999px rgba(4, 7, 17, 0.85), 0 0 25px #00f0ff, inset 0 0 15px rgba(0, 240, 255, 0.4)',
          transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          pointerEvents: 'none',
          zIndex: 2001
        }} />
      )}

      {/* Floating Anchored Tooltip Card */}
      <div 
        className="cyber-panel" 
        style={{
          position: 'absolute',
          width: '420px',
          padding: '20px',
          background: '#0a0f24',
          border: '1px solid #00f0ff',
          boxShadow: '0 0 30px rgba(0, 240, 255, 0.4)',
          zIndex: 2002,
          pointerEvents: 'auto',
          transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          ...getPopoverStyle()
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ background: 'rgba(0, 240, 255, 0.1)', padding: '8px', borderRadius: '6px', border: '1px solid rgba(0, 240, 255, 0.3)' }}>
              {step.icon}
            </div>
            <div>
              <span className="telemetry-badge badge-cyan">{step.badge}</span>
              <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#fff', marginTop: '2px', letterSpacing: '-0.02em' }}>{step.title}</h4>
              <p style={{ fontSize: '0.7rem', color: '#00f0ff', fontFamily: 'var(--font-mono)' }}>{step.subtitle}</p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div style={{ background: 'rgba(4, 7, 17, 0.8)', padding: '14px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.06)', marginBottom: '18px', fontSize: '0.825rem', lineHeight: '1.5', color: '#cbd5e1', whiteSpace: 'pre-line' }}>
          {step.content}
        </div>

        {/* Footer controls */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Progress dots */}
          <div style={{ display: 'flex', gap: '5px' }}>
            {tourSteps.map((_, idx) => (
              <div 
                key={idx} 
                onClick={() => setCurrentStep(idx)}
                style={{ 
                  width: idx === currentStep ? '20px' : '6px', 
                  height: '6px', 
                  borderRadius: '3px', 
                  background: idx === currentStep ? '#00f0ff' : 'rgba(255,255,255,0.2)',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer'
                }} 
              />
            ))}
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            {currentStep > 0 && (
              <button className="btn-cyber" onClick={handlePrev} style={{ padding: '6px 12px', fontSize: '0.775rem' }}>
                <ArrowLeft size={14} /> Back
              </button>
            )}
            <button className="btn-cyber-primary" onClick={handleNext} style={{ padding: '6px 14px', fontSize: '0.775rem' }}>
              {currentStep === tourSteps.length - 1 ? (
                <>Finish Tour <CheckCircle2 size={14} /></>
              ) : (
                <>Next Step <ArrowRight size={14} /></>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
