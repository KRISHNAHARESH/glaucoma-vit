import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { 
  Upload, X, AlertTriangle, CheckCircle2, Eye, Activity, Sparkles, 
  FileText, ArrowRight, RefreshCw, Printer, ShieldAlert, ShieldCheck, 
  Info, Image as ImageIcon, Sliders, Layers, Search, HelpCircle
} from 'lucide-react';

const AnalyzePage = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [fileDetails, setFileDetails] = useState(null);
  const [imageDimensions, setImageDimensions] = useState(null);
  const [preview, setPreview] = useState(() => {
    return sessionStorage.getItem('glaucoma_last_preview') || null;
  });
  const [loading, setLoading] = useState(false);
  const [analysisStep, setAnalysisStep] = useState('');
  const [result, setResult] = useState(() => {
    try {
      const saved = sessionStorage.getItem('glaucoma_last_result');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  // Helper to format file size in KB or MB
  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  // Strict file format and size validation
  const validateFile = (file) => {
    const validMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/tiff', 'image/bmp'];
    const validExtensions = /\.(jpg|jpeg|png|webp|tif|tiff|bmp)$/i;

    if (!validMimes.includes(file.type) && !file.name.match(validExtensions)) {
      return {
        valid: false,
        message: 'Invalid file format. Please upload a standard retinal fundus photograph (JPEG, PNG, WEBP, or TIFF).'
      };
    }

    const maxSizeBytes = 15 * 1024 * 1024; // 15MB
    if (file.size > maxSizeBytes) {
      return {
        valid: false,
        message: `File size exceeds the 15MB limit (${formatFileSize(file.size)}). Please select an optimized fundus scan.`
      };
    }

    return { valid: true };
  };

  const processSelectedFile = (file) => {
    setError('');
    const validation = validateFile(file);
    if (!validation.valid) {
      setError(validation.message);
      return;
    }

    setSelectedImage(file);
    setFileDetails({
      name: file.name,
      size: formatFileSize(file.size),
      type: file.type || 'image/jpeg',
    });

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result;
      setPreview(base64);

      // Inspect natural image dimensions
      const img = new Image();
      img.onload = () => {
        setImageDimensions(`${img.naturalWidth} × ${img.naturalHeight} px`);
      };
      img.src = base64;

      try {
        sessionStorage.setItem('glaucoma_last_preview', base64);
      } catch (e) {
        // quota fallback
      }
    };
    reader.readAsDataURL(file);

    setResult(null);
    sessionStorage.removeItem('glaucoma_last_result');
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      processSelectedFile(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      processSelectedFile(file);
    }
  };

  // 1-Click Preloaded Benchmark Sample Loaders
  const loadSample = async (samplePath, sampleName) => {
    try {
      setError('');
      setResult(null);
      sessionStorage.removeItem('glaucoma_last_result');
      
      const res = await fetch(samplePath);
      if (!res.ok) throw new Error(`HTTP ${res.status} fetching sample`);
      const blob = await res.blob();
      const file = new File([blob], sampleName, { type: 'image/jpeg' });
      processSelectedFile(file);
    } catch (err) {
      setError('Could not load sample image: ' + err.message);
    }
  };

  // Inference execution
  const handleSubmit = async () => {
    if (!selectedImage) return;
    
    setLoading(true);
    setError('');
    setAnalysisStep('Pre-processing image: contrast enhancement & filtering...');
    
    const formData = new FormData();
    formData.append('file', selectedImage);

    try {
      const timer = setTimeout(() => {
        setAnalysisStep('Running neural network inference & Grad-CAM feature projection...');
      }, 700);

      const response = await api.post('/predict', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      clearTimeout(timer);
      
      setResult(response.data);
      try {
        sessionStorage.setItem('glaucoma_last_result', JSON.stringify(response.data));
      } catch (e) {
        // quota fallback
      }
    } catch (err) {
      const message = err.response?.data?.detail || err.message || 'Inference failed. Please check the backend connection and try again.';
      setError(message);
    } finally {
      setLoading(false);
      setAnalysisStep('');
    }
  };

  // Clear Image control before analysis
  const clearImage = () => {
    setSelectedImage(null);
    setPreview(null);
    setFileDetails(null);
    setImageDimensions(null);
    setError('');
    sessionStorage.removeItem('glaucoma_last_preview');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Analyze Another Image control after analysis
  const resetForm = () => {
    setSelectedImage(null);
    setPreview(null);
    setFileDetails(null);
    setImageDimensions(null);
    setResult(null);
    setError('');
    sessionStorage.removeItem('glaucoma_last_result');
    sessionStorage.removeItem('glaucoma_last_preview');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handlePrint = () => {
    window.print();
  };

  const isGlaucoma = result?.prediction?.toLowerCase().includes('glaucoma') && !result?.prediction?.toLowerCase().includes('non');

  // Probability formatting helper (e.g. 86.4%, never raw decimal)
  const formattedConfidence = result?.confidence != null 
    ? (result.confidence * 100).toFixed(1) + '%' 
    : '0.0%';

  const normalProb = result?.probabilities?.['Non Glaucoma'] != null
    ? (result.probabilities['Non Glaucoma'] * 100).toFixed(1) + '%'
    : null;

  const glaucomaProb = result?.probabilities?.['Glaucoma'] != null
    ? (result.probabilities['Glaucoma'] * 100).toFixed(1) + '%'
    : null;

  return (
    <div className="min-h-screen bg-[#070708] pt-28 pb-16 px-4 sm:px-6 lg:px-8 text-white font-sans selection:bg-[#B96445] selection:text-white">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Workspace Header - Softened & Muted */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.03] text-zinc-400 text-xs font-medium uppercase tracking-wider mb-2 border border-white/10 shadow-xs">
              <Activity className="w-3.5 h-3.5 text-zinc-400" />
              <span>Image Analysis Workspace</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-200 tracking-tight">
              Retinal Fundus Image Analysis
            </h1>
            <p className="text-zinc-400 text-sm mt-1 max-w-2xl font-light">
              Upload a digital color retinal fundus scan for automated feature evaluation and visual Grad-CAM explainability.
            </p>
          </div>

          <div className="flex items-center gap-2 no-print">
            <Link
              to="/about"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium text-zinc-400 bg-white/[0.025] border border-white/10 hover:bg-white/[0.06] hover:border-white/20 hover:text-zinc-200 hover:scale-105 active:scale-95 shadow-xs transition-all duration-200"
            >
              <HelpCircle className="w-3.5 h-3.5 text-zinc-500" />
              <span>Methodology</span>
            </Link>
            <Link
              to="/history"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium text-zinc-400 bg-white/[0.025] border border-white/10 hover:bg-white/[0.06] hover:border-white/20 hover:text-zinc-200 hover:scale-105 active:scale-95 shadow-xs transition-all duration-200"
            >
              <FileText className="w-3.5 h-3.5 text-zinc-500" />
              <span>History</span>
            </Link>
          </div>
        </div>

        {/* Global Error Banner */}
        {error && (
          <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-900/40 text-rose-300 text-sm flex items-start justify-between gap-3 shadow-xs">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-rose-200">Analysis Notice</p>
                <p className="text-xs text-rose-300/80 mt-0.5 leading-relaxed">{error}</p>
              </div>
            </div>
            <button
              onClick={() => setError('')}
              className="text-rose-400 hover:text-rose-200 p-1 rounded-md"
              title="Dismiss error"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* SECTION 1: Glassmorphic Upload Card (Subdued & Dull Matte Palette) */}
        {!result && (
          <div className="bg-white/[0.025] hover:bg-white/[0.04] backdrop-blur-2xl rounded-3xl shadow-[0_16px_48px_0_rgba(0,0,0,0.4)] border border-white/10 hover:border-white/15 p-6 sm:p-8 space-y-6 transition-all duration-300">
            
            {/* 1-Click Preloaded Benchmark Sample Loaders with Muted Neutral Tones */}
            <div className="p-4 rounded-2xl bg-white/[0.025] backdrop-blur-xl border border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-2 text-xs font-medium text-zinc-400">
                <Sparkles className="w-4 h-4 text-zinc-500" />
                <span>Test with Preloaded Clinical Samples (1-Click):</span>
              </div>
              <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                <button
                  type="button"
                  onClick={() => loadSample('/samples/sample_normal.jpg', 'Normal_Fundus_Sample_1.jpg')}
                  className="btn-micro px-3.5 py-1.5 rounded-full bg-white/[0.025] backdrop-blur-md border border-white/10 text-zinc-400 text-xs font-medium hover:border-white/25 hover:text-zinc-200 hover:bg-white/[0.06] shadow-xs"
                >
                  Normal Sample 1
                </button>
                <button
                  type="button"
                  onClick={() => loadSample('/samples/sample_glaucoma.jpg', 'Glaucoma_Fundus_Sample_1.jpg')}
                  className="btn-micro px-3.5 py-1.5 rounded-full bg-white/[0.025] backdrop-blur-md border border-white/10 text-zinc-400 text-xs font-medium hover:border-white/25 hover:text-zinc-200 hover:bg-white/[0.06] shadow-xs"
                >
                  Glaucoma Sample 1
                </button>
                <button
                  type="button"
                  onClick={() => loadSample('/samples/google_normal.jpg', 'Normal_Fundus_Sample_2.jpg')}
                  className="btn-micro px-3.5 py-1.5 rounded-full bg-white/[0.025] backdrop-blur-md border border-white/10 text-zinc-400 text-xs font-medium hover:border-white/25 hover:text-zinc-200 hover:bg-white/[0.06] shadow-xs"
                >
                  Normal Sample 2
                </button>
                <button
                  type="button"
                  onClick={() => loadSample('/samples/google_glaucoma.jpg', 'Glaucoma_Fundus_Sample_2.jpg')}
                  className="btn-micro px-3.5 py-1.5 rounded-full bg-white/[0.025] backdrop-blur-md border border-white/10 text-zinc-400 text-xs font-medium hover:border-white/25 hover:text-zinc-200 hover:bg-white/[0.06] shadow-xs"
                >
                  Glaucoma Sample 2
                </button>
              </div>
            </div>

            {/* Glassmorphic Drag & Drop Upload Zone - Muted Matte Finish */}
            <div 
              className={`relative overflow-hidden border-2 border-dashed rounded-3xl p-8 sm:p-12 text-center backdrop-blur-xl transition-all duration-300 ${
                preview 
                  ? 'border-white/20 bg-white/[0.02] shadow-[0_4px_24px_0_rgba(0,0,0,0.3)]' 
                  : 'border-white/10 hover:border-white/20 bg-white/[0.015] hover:bg-white/[0.03] shadow-inner'
              }`}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              {/* Animated laser scanline when analyzing */}
              {loading && <div className="animate-scan-line"></div>}

              <input 
                type="file" 
                ref={fileInputRef}
                className="hidden" 
                accept="image/jpeg,image/png,image/webp,image/tiff,image/bmp"
                onChange={handleImageChange}
              />
              
              {!preview ? (
                <div className="space-y-4">
                  <div className="mx-auto w-14 h-14 rounded-2xl bg-white/[0.04] backdrop-blur-md text-zinc-400 border border-white/10 flex items-center justify-center shadow-inner group-hover:scale-110 group-hover:-translate-y-1 transition-all duration-300">
                    <Upload className="w-7 h-7 stroke-[1.8]" />
                  </div>
                  <div className="max-w-md mx-auto space-y-1">
                    <p className="text-base font-semibold text-zinc-300">
                      Drag and drop retinal fundus photograph here
                    </p>
                    <p className="text-xs text-zinc-500 font-light">
                      Supports JPG, PNG, WEBP, or TIFF up to 15MB &bull; Centered on optic nerve head
                    </p>
                  </div>
                  <div>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="btn-micro inline-flex items-center gap-2 px-6 py-2.5 rounded-full font-medium text-xs text-zinc-300 bg-white/[0.04] hover:bg-white/[0.08] backdrop-blur-md border border-white/10 hover:border-white/20 transition-all shadow-xs"
                    >
                      <ImageIcon className="w-4 h-4 text-zinc-400" />
                      <span>Browse Files</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Image Preview Card with Frosted Glass Frame */}
                  <div className="inline-flex flex-col items-center">
                    <div className="relative p-2.5 rounded-3xl bg-white/[0.04] backdrop-blur-xl border border-white/15 shadow-2xl group/prev overflow-hidden">
                      {loading && <div className="animate-scan-line"></div>}
                      <img 
                        src={preview} 
                        alt="Selected Retinal Scan" 
                        className="max-h-72 w-auto object-contain rounded-2xl transition-transform duration-500 group-hover/prev:scale-[1.02]"
                      />
                      <button
                        type="button"
                        onClick={clearImage}
                        className="absolute -top-2.5 -right-2.5 p-1.5 rounded-full bg-black/80 hover:bg-rose-900 text-white shadow-md transition-all border border-white/15 hover:scale-110 active:scale-95"
                        title="Remove image"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* File Details Chips with Muted Frosted Glass */}
                    <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs">
                      <span className="btn-micro px-3.5 py-1.5 rounded-full bg-white/[0.03] backdrop-blur-md text-zinc-400 border border-white/10 text-xs font-medium shadow-xs">
                        File: {fileDetails?.name || selectedImage?.name || 'Selected Scan'}
                      </span>
                      {fileDetails?.size && (
                        <span className="btn-micro px-3.5 py-1.5 rounded-full bg-white/[0.03] backdrop-blur-md text-zinc-400 border border-white/10 text-xs font-medium shadow-xs">
                          Size: {fileDetails.size}
                        </span>
                      )}
                      {imageDimensions && (
                        <span className="btn-micro px-3.5 py-1.5 rounded-full bg-white/[0.04] backdrop-blur-md text-zinc-300 border border-white/15 text-xs font-medium shadow-xs">
                          Dimensions: {imageDimensions}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Action Bar - Muted Matte Design */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
              <div className="flex items-center gap-2 text-xs text-zinc-500">
                <Info className="w-4 h-4 text-zinc-500 flex-shrink-0" />
                <span>The model automatically applies green-channel CLAHE contrast enhancement during inference.</span>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                {preview && (
                  <button
                    type="button"
                    onClick={clearImage}
                    disabled={loading}
                    className="btn-micro flex-1 sm:flex-initial px-6 py-3 rounded-full border border-white/10 hover:border-white/20 text-zinc-400 hover:text-zinc-200 text-xs font-medium hover:bg-white/[0.05] transition-all duration-200"
                  >
                    Clear Image
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={!selectedImage || loading}
                  className={`btn-micro glass-sheen flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full font-semibold text-zinc-200 text-xs shadow-md transition-all duration-300 ${
                    !selectedImage || loading 
                      ? 'bg-white/5 text-zinc-600 border border-white/5 cursor-not-allowed' 
                      : 'bg-[#9c5339] hover:bg-[#8b4830] border border-[#9c5339]/50 shadow-[#9c5339]/20 hover:shadow-xl group'
                  }`}
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-zinc-300" />
                      <span>{analysisStep || 'Analyzing Scan...'}</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-zinc-300 group-hover:scale-125 group-hover:rotate-12 transition-transform duration-300" />
                      <span>Analyze Image</span>
                    </>
                  )}
                </button>
              </div>
            </div>

          </div>
        )}

        {/* SECTION 2: Results Dashboard (Visible after inference) */}
        {result && (
          <div className="space-y-8 print-area">
            
            {/* Primary Classification Summary - Softened, Dull Matte Medical Glass */}
            <div className={`rounded-3xl p-6 sm:p-7 backdrop-blur-2xl border shadow-[0_16px_48px_0_rgba(0,0,0,0.35)] transition-all ${
              isGlaucoma 
                ? 'bg-rose-950/20 border-rose-900/35 text-zinc-300' 
                : 'bg-emerald-950/20 border-emerald-900/35 text-zinc-300'
            }`}>
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                
                <div className="flex items-start gap-4">
                  <div className={`p-3.5 rounded-2xl shadow-md backdrop-blur-md border ${
                    isGlaucoma 
                      ? 'bg-rose-950/40 text-rose-300/80 border-rose-900/40' 
                      : 'bg-emerald-950/40 text-emerald-300/80 border-emerald-900/40'
                  }`}>
                    {isGlaucoma ? <ShieldAlert className="w-7 h-7" /> : <ShieldCheck className="w-7 h-7" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-medium tracking-wider uppercase text-zinc-500">
                        Predicted Class
                      </span>
                      <span className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[10px] font-medium uppercase backdrop-blur-sm border ${
                        isGlaucoma 
                          ? 'bg-rose-950/30 text-rose-300/75 border-rose-900/30' 
                          : 'bg-emerald-950/30 text-emerald-300/75 border-emerald-900/30'
                      }`}>
                        <span className="relative flex h-2 w-2">
                          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-60 ${
                            isGlaucoma ? 'bg-rose-400' : 'bg-emerald-400'
                          }`}></span>
                          <span className={`relative inline-flex rounded-full h-2 w-2 ${
                            isGlaucoma ? 'bg-rose-500/80' : 'bg-emerald-500/80'
                          }`}></span>
                        </span>
                        <span>{isGlaucoma ? 'Glaucomatous Features Flagged' : 'Normal Retinal Morphology'}</span>
                      </span>
                    </div>
                    
                    {/* Actual Model Output */}
                    <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1 text-zinc-200">
                      {isGlaucoma ? 'GLAUCOMA DETECTED' : 'NORMAL (NON-GLAUCOMA)'}
                    </h2>
                    
                    <p className="text-xs sm:text-sm mt-1 leading-relaxed text-zinc-400 font-light max-w-xl">
                      {isGlaucoma 
                        ? 'The neural network detected localized visual patterns characteristic of optic nerve head excavation, neuroretinal rim thinning, or vascular displacement.'
                        : 'Optic disc contour, neuroretinal rim thickness, and surrounding retinal vasculature align with healthy baseline characteristics.'}
                    </p>
                  </div>
                </div>

                {/* Percentage Confidence Box - Muted Glass */}
                <div className="w-full md:w-60 p-4 rounded-2xl bg-white/[0.025] backdrop-blur-xl border border-white/10 shadow-xs flex flex-col justify-center">
                  <div className="flex justify-between items-center text-xs font-medium text-zinc-400 mb-1">
                    <span>Model Confidence</span>
                    <span className="text-base font-bold text-zinc-200">
                      {formattedConfidence}
                    </span>
                  </div>
                  <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden ring-1 ring-white/5">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        isGlaucoma ? 'bg-rose-700/60' : 'bg-emerald-700/60'
                      }`}
                      style={{ width: formattedConfidence }}
                    ></div>
                  </div>
                  <span className="text-[10px] text-zinc-500 mt-1.5 text-right font-mono">
                    Derived from Softmax Logits
                  </span>
                </div>

              </div>
            </div>

            {/* Visual Explainability Comparison - Muted Frosted Glass */}
            <div className="bg-white/[0.025] backdrop-blur-2xl rounded-3xl border border-white/10 p-6 sm:p-7 shadow-[0_16px_48px_0_rgba(0,0,0,0.35)] space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-white/10">
                <div>
                  <h3 className="text-base font-semibold text-zinc-200 flex items-center gap-2">
                    <Search className="w-4 h-4 text-zinc-400" />
                    Grad-CAM Visual Explainability Comparison
                  </h3>
                  <p className="text-xs text-zinc-400 mt-0.5 font-light">
                    Side-by-side inspection of input photograph and class activation heatmap.
                  </p>
                </div>
                <div className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-white/[0.03] text-zinc-400 border border-white/10 font-mono">
                  Standardized Input: 224×224 px
                </div>
              </div>

              {/* 3 Columns Desktop / Stacked Mobile */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* 1. Preprocessed Input */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-medium text-zinc-400">
                    <span>1. Preprocessed Image</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/[0.03] text-zinc-400 border border-white/10 font-mono">Input</span>
                  </div>
                  <div className="aspect-square rounded-xl overflow-hidden bg-black/60 border border-white/10 flex items-center justify-center">
                    {preview ? (
                      <img src={preview} alt="Preprocessed Scan" className="w-full h-full object-contain" />
                    ) : (
                      <span className="text-xs text-zinc-500">Input</span>
                    )}
                  </div>
                  <p className="text-[11px] text-zinc-400 leading-relaxed font-light">
                    Contrast-adjusted green channel highlighting optic disc margins.
                  </p>
                </div>

                {/* 2. Grad-CAM Activation Heatmap */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-medium text-zinc-400">
                    <span>2. Activation Heatmap</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/[0.03] text-zinc-400 border border-white/10 font-mono font-medium">Grad-CAM</span>
                  </div>
                  <div className="aspect-square rounded-xl overflow-hidden bg-black/60 border border-white/10 flex items-center justify-center">
                    {result.heatmap ? (
                      <img 
                        src={`data:image/jpeg;base64,${result.heatmap}`} 
                        alt="Grad-CAM Heatmap" 
                        className="w-full h-full object-contain" 
                      />
                    ) : (
                      <span className="text-xs text-zinc-500">Heatmap unavailable</span>
                    )}
                  </div>
                  <p className="text-[11px] text-zinc-400 leading-relaxed font-light">
                    Class activation intensities projected back onto spatial feature maps.
                  </p>
                </div>

                {/* 3. Superimposed Overlay */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-medium text-zinc-400">
                    <span>3. Heatmap Overlay</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/[0.03] text-zinc-400 border border-white/10 font-mono font-medium">Overlay</span>
                  </div>
                  <div className="aspect-square rounded-xl overflow-hidden bg-black/60 border border-white/10 flex items-center justify-center">
                    {result.overlay ? (
                      <img 
                        src={`data:image/jpeg;base64,${result.overlay}`} 
                        alt="Grad-CAM Overlay" 
                        className="w-full h-full object-contain" 
                      />
                    ) : (
                      <span className="text-xs text-zinc-500">Overlay unavailable</span>
                    )}
                  </div>
                  <p className="text-[11px] text-zinc-400 leading-relaxed font-light">
                    Anatomical alignment showing regions that influenced the model prediction.
                  </p>
                </div>

              </div>

              {/* Heatmap Legend & Explanation - Softened Muted Tone */}
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10 space-y-2.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="text-xs font-medium text-zinc-300 flex items-center gap-1.5">
                    <Info className="w-4 h-4 text-zinc-400" />
                    Heatmap Interpretation &amp; Visual Legend
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-medium text-zinc-400">Low Influence (Cool)</span>
                    <div className="w-28 h-2 rounded-full bg-gradient-to-r from-blue-600/70 via-emerald-400/70 via-yellow-400/70 to-red-600/70 border border-white/10 opacity-80"></div>
                    <span className="text-[10px] font-medium text-zinc-400">High Influence (Warm)</span>
                  </div>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed font-light">
                  <strong className="text-zinc-300 font-medium">Important Note:</strong> Highlighted warm regions (red, orange, yellow) indicate focal areas that exerted the greatest mathematical influence on the neural network output. They provide visual explainability and assist clinicians in inspecting suspect regions, but do not represent definitive biological proof of disease on their own.
                </p>
              </div>

            </div>

            {/* Class Probability Distribution & Recommendations - Muted Matte Palette */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Actual Model Probability Distribution */}
              <div className="interactive-card glass-sheen bg-white/[0.025] backdrop-blur-2xl rounded-3xl border border-white/10 p-6 shadow-[0_16px_48px_0_rgba(0,0,0,0.35)] space-y-4 cursor-pointer">
                <h4 className="text-xs font-medium text-zinc-300 uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-white/10">
                  <Sliders className="w-4 h-4 text-zinc-400" />
                  Class Probability Breakdown
                </h4>

                <div className="space-y-3 text-xs">
                  <div>
                    <div className="flex justify-between font-medium text-zinc-400 mb-1">
                      <span>Normal Retinal Morphology</span>
                      <span className="font-semibold text-zinc-200">{normalProb || '—'}</span>
                    </div>
                    <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden ring-1 ring-white/5">
                      <div 
                        className="bg-emerald-600/70 h-full rounded-full transition-all duration-700" 
                        style={{ width: normalProb || '0%' }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between font-medium text-zinc-400 mb-1">
                      <span>Glaucomatous Features</span>
                      <span className="font-semibold text-zinc-200">{glaucomaProb || '—'}</span>
                    </div>
                    <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden ring-1 ring-white/5">
                      <div 
                        className="bg-[#9c5339]/80 h-full rounded-full transition-all duration-700" 
                        style={{ width: glaucomaProb || '0%' }}
                      ></div>
                    </div>
                  </div>
                </div>

                <div className="pt-1 text-[11px] text-zinc-500 leading-relaxed font-light">
                  Probabilities represent calibrated softmax distribution across binary diagnostic classes.
                </div>
              </div>

              {/* Recommended Next Steps */}
              <div className="interactive-card glass-sheen bg-white/[0.025] backdrop-blur-2xl rounded-3xl border border-white/10 p-6 shadow-[0_16px_48px_0_rgba(0,0,0,0.35)] space-y-3 cursor-pointer">
                <h4 className="text-xs font-medium text-zinc-300 uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-white/10">
                  <ShieldCheck className="w-4 h-4 text-zinc-400" />
                  Clinical Recommendation
                </h4>

                <div className="text-xs text-zinc-400 space-y-2 leading-relaxed font-light">
                  {isGlaucoma ? (
                    <>
                      <p className="font-medium text-rose-300/80">
                        &bull; Comprehensive Ophthalmic Evaluation Recommended.
                      </p>
                      <p>
                        &bull; Perform <strong>Optical Coherence Tomography (OCT)</strong> to quantitatively measure Retinal Nerve Fiber Layer (RNFL) thickness.
                      </p>
                      <p>
                        &bull; Order <strong>Standard Automated Perimetry (Visual Field Test)</strong> to check for functional peripheral vision loss.
                      </p>
                      <p>
                        &bull; Measure Intraocular Pressure (IOP) via Goldmann Applanation Tonometry.
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="font-medium text-emerald-300/80">
                        &bull; Retinal Structure Consistent with Normal Baseline.
                      </p>
                      <p>
                        &bull; Optic cup-to-disc proportion and neuroretinal rim contour show no acute morphological indicators of glaucoma.
                      </p>
                      <p>
                        &bull; Continue routine periodic eye health examinations according to age and risk profile.
                      </p>
                    </>
                  )}
                </div>
              </div>

            </div>

            {/* Bottom Actions: Analyze Another Image / Print Report */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-white/10 no-print">
              <button
                type="button"
                onClick={handlePrint}
                className="btn-micro w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full border border-white/10 hover:border-white/20 text-zinc-400 hover:text-zinc-200 bg-white/[0.025] hover:bg-white/[0.05] shadow-xs text-xs font-medium"
              >
                <Printer className="w-4 h-4 text-zinc-500" />
                <span>Print Diagnostic Summary</span>
              </button>

              <button
                type="button"
                onClick={resetForm}
                className="btn-micro glass-sheen w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 rounded-full font-semibold text-zinc-200 bg-[#9c5339] hover:bg-[#8b4830] border border-[#9c5339]/40 shadow-md text-xs group"
              >
                <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500 text-zinc-300" />
                <span>Analyze Another Retinal Image</span>
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};

export default AnalyzePage;
