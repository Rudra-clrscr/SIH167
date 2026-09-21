import React, { useState, useEffect } from 'react';
import HeaderNav from './components/HeaderNav';
import CanvasView from './components/CanvasView';
import CopilotSidebar from './components/CopilotSidebar';
import BenchmarkModal from './components/BenchmarkModal';
import GuidedTourModal from './components/GuidedTourModal';
import SampleGalleryModal from './components/SampleGalleryModal';
import { uploadImages, checkCompatibility, analyzeQuery, fetchSampleDatasets } from './services/api';

export default function App() {
  const [selectedImages, setSelectedImages] = useState([]);
  const [activeMode, setActiveMode] = useState('SINGLE');
  const [compatibility, setCompatibility] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isBenchmarkOpen, setIsBenchmarkOpen] = useState(false);
  const [isTourOpen, setIsTourOpen] = useState(false);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [clickedPoint, setClickedPoint] = useState(null);
  const [isDraggingFile, setIsDraggingFile] = useState(false);

  // Auto-run compatibility check when image selection changes
  useEffect(() => {
    if (selectedImages.length > 0) {
      const ids = selectedImages.map(img => img.image_id);
      checkCompatibility(ids)
        .then(res => setCompatibility(res))
        .catch(err => console.error(err));
    } else {
      setCompatibility(null);
    }
  }, [selectedImages]);

  const handleFilesSelected = async (files) => {
    try {
      const res = await uploadImages(files);
      if (res.uploaded_images) {
        setSelectedImages(res.uploaded_images);
        setAnalysisResult(null);
      }
    } catch (e) {
      alert('Error uploading files: ' + e.message);
    }
  };

  const handleLoadSamples = async () => {
    try {
      const res = await fetchSampleDatasets();
      if (res.samples && res.samples.length > 0) {
        if (activeMode === 'BITEMPORAL') {
          const bitemp = res.samples.filter(s => s.filename.includes('t1') || s.filename.includes('t2'));
          setSelectedImages(bitemp.length >= 2 ? bitemp.slice(0, 2) : res.samples.slice(0, 2));
        } else if (activeMode === 'CROSS_MODAL') {
          const opt = res.samples.find(s => s.filename.includes('optical'));
          const sar = res.samples.find(s => s.filename.includes('sar'));
          if (opt && sar) {
            setSelectedImages([opt, sar]);
          } else {
            setSelectedImages(res.samples.slice(0, 2));
          }
        } else {
          setSelectedImages([res.samples[0]]);
        }
        setAnalysisResult(null);
      }
    } catch (e) {
      alert('Failed to load sample datasets: ' + e.message);
    }
  };

  const handleAnalyze = async (queryText) => {
    if (selectedImages.length === 0) {
      alert('Please upload satellite imagery or load sample datasets first.');
      return;
    }
    setAnalyzing(true);
    try {
      const ids = selectedImages.map(img => img.image_id);
      const result = await analyzeQuery(ids, queryText);
      setAnalysisResult(result);
    } catch (e) {
      alert('Analysis error: ' + e.message);
    } finally {
      setAnalyzing(false);
    }
  };

  // Drag and drop event handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDraggingFile(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDraggingFile(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDraggingFile(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFilesSelected(Array.from(e.dataTransfer.files));
    }
  };

  return (
    <div 
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
    >
      <HeaderNav 
        activeMode={activeMode}
        setActiveMode={setActiveMode}
        onLoadSamples={() => setIsGalleryOpen(true)}
        onOpenBenchmark={() => setIsBenchmarkOpen(true)}
        onOpenTour={() => setIsTourOpen(true)}
      />

      {/* Main 70 / 30 Canvas-First Grid */}
      <main style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 380px', gap: '12px', padding: '12px', height: 'calc(100vh - 64px)' }}>
        {/* Left 70% Canvas Viewport */}
        <CanvasView 
          selectedImages={selectedImages}
          activeMode={activeMode}
          groundingBoxes={analysisResult?.grounding_boxes || []}
          taskType={analysisResult?.task_type}
          onCanvasClickPoint={(point) => setClickedPoint(point)}
          isDraggingFile={isDraggingFile}
        />

        {/* Right 30% Copilot Sidebar */}
        <CopilotSidebar 
          onAnalyze={handleAnalyze}
          loading={analyzing}
          answerResult={analysisResult}
          reportFilename={analysisResult?.report_filename}
          clickedPoint={clickedPoint}
        />
      </main>

      <BenchmarkModal 
        isOpen={isBenchmarkOpen} 
        onClose={() => setIsBenchmarkOpen(false)} 
      />

      <GuidedTourModal
        isOpen={isTourOpen}
        onClose={() => setIsTourOpen(false)}
        onSelectMode={(mode) => setActiveMode(mode)}
      />

      <SampleGalleryModal
        isOpen={isGalleryOpen}
        onClose={() => setIsGalleryOpen(false)}
        activeMode={activeMode}
        onSelectSampleSet={(samples) => {
          setSelectedImages(samples);
          setAnalysisResult(null);
        }}
      />
    </div>
  );
}
