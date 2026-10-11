import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { 
  Upload, X, AlertTriangle, CheckCircle2, Eye, Activity, Sparkles, 
  FileText, ArrowRight, RefreshCw, Printer, ShieldAlert, ShieldCheck, 
  Info, Image as ImageIcon, Sliders, Layers, ChevronRight, HelpCircle
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

  // Helper to format bytes into readable KB / MB
  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  // Validate image file formats and size
  const validateFile = (file) => {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/tiff', 'image/bmp'];
    if (!validTypes.includes(file.type) && !file.name.match(/\.(jpg|jpeg|png|webp|tif|tiff|bmp)$/i)) {
      return {
        valid: false,
        message: 'Invalid file format. Please upload a valid retinal fundus image in JPG, PNG, WEBP, or TIFF format.'
      };
    }
    const maxBytes = 15 * 1024 * 1024; // 15MB
    if (file.size > maxBytes) {
      return {
        valid: false,
        message: `File size exceeds the 15MB limit (${formatFileSize(file.size)}). Please upload an optimized fundus scan.`
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

      // Measure dimensions
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

  // 1-Click Preloaded Clinical Samples
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
      setError('Could not load clinical sample image: ' + err.message);
    }
  };

  // Inference execution
  const handleSubmit = async () => {
    if (!selectedImage) return;
    
    setLoading(true);
    setError('');
    setAnalysisStep('Pre-processing image with Green-Channel CLAHE & Median filter...');
    
    const formData = new FormData();
    formData.append('file', selectedImage);

    try {
      const timer = setTimeout(() => {
        setAnalysisStep('Executing Multi-Scale CNN & Vision Transformer self-attention...');
      }, 600);

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
      const message = err.response?.data?.detail || err.message || 'An error occurred during inference. Please verify server connection.';
      setError(message);
    } finally {
      setLoading(false);
      setAnalysisStep('');
    }
  };

  // Clear Image control (before analysis)
  const clearImage = () => {
    setSelectedImage(null);
    setPreview(null);
    setFileDetails(null);
    setImageDimensions(null);
    setError('');
    sessionStorage.removeItem('glaucoma_last_preview');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Analyze Another Image control (after analysis)
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

  // Probability formatting helper: formatted as e.g. 86.4%, never raw decimal
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
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8 text-slate-900">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Workspace Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 text-teal-800 text-xs font-bold uppercase tracking-wider mb-2 border border-teal-200">
              <Activity className="w-3.5 h-3.5 text-teal-600" />
              <span>Clinical Diagnostic Workspace</span>
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight sm:text-4xl">
              Retinal Fundus Image Analysis
            </h1>
            <p className="text-slate-600 text-sm mt-1 max-w-2xl">
              Upload digital ophthalmic fundus photography centered on the optic nerve head for automated ViT classification and Grad-CAM interpretability.
            </p>
          </div>

          <div className="flex items-center gap-2 no-print">
            <Link
              to="/about"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 shadow-xs transition-colors"
            >
              <HelpCircle className="w-3.5 h-3.5 text-teal-600" />
              <span>Model Specs</span>
            </Link>
            <Link
              to="/history"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 shadow-xs transition-colors"
            >
              <FileText className="w-3.5 h-3.5 text-slate-500" />
              <span>Scan Records</span>
            </Link>
          </div>
        </div>

        {/* Global Error Banner */}
        {error && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start justify-between gap-3 shadow-xs">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-rose-900">Analysis Error</p>
                <p className="text-xs text-rose-700 mt-0.5 leading-relaxed">{error}</p>
              </div>
            </div>
            <button
              onClick={() => setError('')}
              className="text-rose-500 hover:text-rose-800 p-1 rounded-md"
              title="Dismiss error"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* STEP 1: Upload Card (Visible when no result is present) */}
        {!result && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 space-y-6">
            
            {/* Quick Demo Sample Selector */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                <Sparkles className="w-4 h-4 text-teal-600" />
                <span>Instant Clinical Benchmark Samples (1-Click Test):</span>
              </div>
              <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                <button
                  type="button"
                  onClick={() => loadSample('/samples/sample_normal.jpg', 'ACRIMA_Normal_Eye.jpg')}
                  className="px-2.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-300 text-xs font-semibold hover:bg-emerald-100 transition-colors"
                >
                  ACRIMA Normal
                </button>
                <button
                  type="button"
                  onClick={() => loadSample('/samples/sample_glaucoma.jpg', 'ACRIMA_Glaucoma_Eye.jpg')}
                  className="px-2.5 py-1.5 rounded-lg bg-rose-50 text-rose-800 border border-rose-300 text-xs font-semibold hover:bg-rose-100 transition-colors"
                >
                  ACRIMA Glaucoma
                </button>
                <button
                  type="button"
                  onClick={() => loadSample('/samples/google_normal.jpg', 'Google_Normal_LeftEye.jpg')}
                  className="px-2.5 py-1.5 rounded-lg bg-teal-50 text-teal-800 border border-teal-300 text-xs font-semibold hover:bg-teal-100 transition-colors"
                >
                  Google Normal Eye
                </button>
                <button
                  type="button"
                  onClick={() => loadSample('/samples/google_glaucoma.jpg', 'Google_Glaucoma_Disc.jpg')}
                  className="px-2.5 py-1.5 rounded-lg bg-amber-50 text-amber-900 border border-amber-300 text-xs font-semibold hover:bg-amber-100 transition-colors"
                >
                  Google Glaucoma Eye
                </button>
              </div>
            </div>

            {/* Drag & Drop Upload Zone */}
            <div 
              className={`relative border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center transition-all duration-200 ${
                preview 
                  ? 'border-teal-400 bg-teal-50/20' 
                  : 'border-slate-300 hover:border-teal-500 hover:bg-slate-50/60'
              }`}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              <input 
                type="file" 
                ref={fileInputRef}
                className="hidden" 
                accept="image/jpeg,image/png,image/webp,image/tiff,image/bmp"
                onChange={handleImageChange}
              />
              
              {!preview ? (
                <div className="space-y-4">
                  <div className="mx-auto w-16 h-16 rounded-2xl bg-teal-50 text-teal-600 border border-teal-100 flex items-center justify-center shadow-xs">
                    <Upload className="w-8 h-8 stroke-[2.2]" />
                  </div>
                  <div className="max-w-md mx-auto">
                    <p className="text-base font-bold text-slate-800">
                      Drag and drop retinal fundus photograph here
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      Supports JPG, PNG, WEBP, or TIFF up to 15MB &bull; Centered on the optic disc
                    </p>
                  </div>
                  <div>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-300 transition-colors shadow-xs"
                    >
                      <ImageIcon className="w-4 h-4" />
                      <span>Browse Files</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Image Preview & Details Card */}
                  <div className="inline-flex flex-col items-center">
                    <div className="relative p-2 rounded-xl bg-white border border-slate-200 shadow-md">
                      <img 
                        src={preview} 
                        alt="Retinal Preview" 
                        className="max-h-72 w-auto object-contain rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={clearImage}
                        className="absolute -top-3 -right-3 p-1.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white shadow-md transition-colors"
                        title="Remove image"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* File Details Chips */}
                    <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs">
                      <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200 font-semibold">
                        File: {fileDetails?.name || selectedImage?.name || 'Retinal Scan'}
                      </span>
                      {fileDetails?.size && (
                        <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200 font-semibold">
                          Size: {fileDetails.size}
                        </span>
                      )}
                      {imageDimensions && (
                        <span className="px-3 py-1 rounded-full bg-teal-50 text-teal-800 border border-teal-200 font-semibold">
                          Resolution: {imageDimensions}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Upload Controls & Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Info className="w-4 h-4 text-teal-600 flex-shrink-0" />
                <span>Model standardizes input to 224×224 resolution with CLAHE contrast enhancement.</span>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                {preview && (
                  <button
                    type="button"
                    onClick={clearImage}
                    disabled={loading}
                    className="flex-1 sm:flex-initial px-5 py-3 rounded-xl border border-slate-300 text-slate-700 text-sm font-semibold hover:bg-slate-100 transition-colors"
                  >
                    Clear Image
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={!selectedImage || loading}
                  className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-8 py-3 rounded-xl font-bold text-white shadow-sm transition-all duration-150 ${
                    !selectedImage || loading 
                      ? 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none' 
                      : 'bg-teal-600 hover:bg-teal-700 shadow-teal-600/20'
                  }`}
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>{analysisStep || 'Analyzing Retinal Scan...'}</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Analyze Image</span>
                    </>
                  )}
                </button>
              </div>
            </div>

          </div>
        )}

        {/* STEP 2: Results Dashboard (Visible when result is present) */}
        {result && (
          <div className="space-y-8 animate-fade-in print-area">
            
            {/* Diagnosis Summary Card */}
            <div className={`rounded-2xl p-6 sm:p-8 border shadow-sm ${
              isGlaucoma 
                ? 'bg-rose-50/80 border-rose-300 text-rose-950' 
                : 'bg-emerald-50/80 border-emerald-300 text-emerald-950'
            }`}>
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                
                <div className="flex items-start gap-4">
                  <div className={`p-4 rounded-2xl text-white shadow-md ${
                    isGlaucoma ? 'bg-rose-600' : 'bg-emerald-600'
                  }`}>
                    {isGlaucoma ? <ShieldAlert className="w-8 h-8" /> : <ShieldCheck className="w-8 h-8" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold tracking-wider uppercase opacity-75">
                        Classification Result
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase ${
                        isGlaucoma ? 'bg-rose-200 text-rose-900' : 'bg-emerald-200 text-emerald-900'
                      }`}>
                        {isGlaucoma ? 'Pathological Risk Flagged' : 'Normal Retinal Morphology'}
                      </span>
                    </div>
                    
                    {/* Actual Model Output */}
                    <h2 className="text-2xl sm:text-4xl font-black tracking-tight mt-1.5">
                      {isGlaucoma ? 'GLAUCOMA DETECTED' : 'NORMAL (NON-GLAUCOMA)'}
                    </h2>
                    
                    <p className="text-xs sm:text-sm mt-1.5 opacity-90 max-w-xl leading-relaxed">
                      {isGlaucoma 
                        ? 'Model detected localized structural features characteristic of optic nerve cupping, neuroretinal rim thinning, or ISNT-rule vascular violation.'
                        : 'Optic disc contour, neuroretinal rim proportions, and surrounding vasculature align with healthy clinical baseline.'}
                    </p>
                  </div>
                </div>

                {/* Formatted Percentage Confidence Meter */}
                <div className="w-full md:w-64 p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-col justify-center">
                  <div className="flex justify-between items-center text-xs font-bold text-slate-700 mb-1.5">
                    <span>Model Confidence</span>
                    <span className="text-base font-extrabold text-slate-900">
                      {formattedConfidence}
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-700 ${
                        isGlaucoma ? 'bg-rose-600' : 'bg-emerald-600'
                      }`}
                      style={{ width: formattedConfidence }}
                    ></div>
                  </div>
                  <span className="text-[10px] text-slate-500 mt-1.5 text-right">
                    Calibrated Softmax Probability
                  </span>
                </div>

              </div>
            </div>

            {/* Visual Diagnostic Panels: Side-by-side on desktop, stacked on mobile */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-200">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Eye className="w-5 h-5 text-teal-600" />
                    Explainable AI Tri-View Inspection
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Preprocessed retinal input alongside Vision Transformer Grad-CAM activation mapping.
                  </p>
                </div>
                <div className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-100 text-slate-700">
                  Resolution: 224×224 px Standard
                </div>
              </div>

              {/* 3 Columns Desktop / Stacked Mobile */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* 1. Original Preprocessed */}
                <div className="flex flex-col space-y-2.5">
                  <span className="text-xs font-bold text-slate-700 flex items-center justify-between">
                    <span>1. Preprocessed Retinal Image</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-mono">CLAHE</span>
                  </span>
                  <div className="aspect-square rounded-xl overflow-hidden bg-slate-950 border border-slate-200 flex items-center justify-center shadow-xs">
                    {preview ? (
                      <img src={preview} alt="Original Scan" className="w-full h-full object-contain" />
                    ) : (
                      <span className="text-xs text-slate-400">Scan Input</span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Green-channel histogram equalized and filtered to eliminate camera artifacts.
                  </p>
                </div>

                {/* 2. Grad-CAM Activation Heatmap */}
                <div className="flex flex-col space-y-2.5">
                  <span className="text-xs font-bold text-slate-700 flex items-center justify-between">
                    <span>2. Grad-CAM Attention Heatmap</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-teal-50 text-teal-700 font-mono font-semibold">ViT CAM</span>
                  </span>
                  <div className="aspect-square rounded-xl overflow-hidden bg-slate-950 border border-slate-200 flex items-center justify-center shadow-xs">
                    {result.heatmap ? (
                      <img 
                        src={`data:image/jpeg;base64,${result.heatmap}`} 
                        alt="Grad-CAM Heatmap" 
                        className="w-full h-full object-contain" 
                      />
                    ) : (
                      <span className="text-xs text-slate-400">Heatmap unavailable</span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Class activation intensities projecting classification head weights to spatial tokens.
                  </p>
                </div>

                {/* 3. Anatomical Overlay */}
                <div className="flex flex-col space-y-2.5">
                  <span className="text-xs font-bold text-slate-700 flex items-center justify-between">
                    <span>3. Anatomical Overlay Map</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono font-semibold">Fused 50%</span>
                  </span>
                  <div className="aspect-square rounded-xl overflow-hidden bg-slate-950 border border-slate-200 flex items-center justify-center shadow-xs">
                    {result.overlay ? (
                      <img 
                        src={`data:image/jpeg;base64,${result.overlay}`} 
                        alt="Grad-CAM Overlay" 
                        className="w-full h-full object-contain" 
                      />
                    ) : (
                      <span className="text-xs text-slate-400">Overlay unavailable</span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Superimposed attention directly localizing focal defects over retinal vasculature.
                  </p>
                </div>

              </div>

              {/* Heatmap Explanation & Visual Color Legend */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Info className="w-4 h-4 text-teal-600" />
                    Heatmap Interpretation &amp; Visual Legend
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-semibold text-blue-700">Cool (Low Attention)</span>
                    <div className="w-32 h-3 rounded-full bg-gradient-to-r from-blue-600 via-emerald-400 via-yellow-400 to-red-600 border border-slate-300"></div>
                    <span className="text-[11px] font-semibold text-rose-700">Warm (High Attention)</span>
                  </div>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  <strong>Color Significance:</strong> Warm regions (red, orange, yellow) indicate focal retinal areas where the Multi-Scale CNN and Vision Transformer placed the greatest diagnostic attention — typically around the optic cup rim, lamina cribrosa, or areas of nerve fiber layer thinning. Cool regions (blue, cyan) indicate baseline background retinal vasculature.
                </p>
              </div>

            </div>

            {/* Metrics Breakdown & Clinical Recommendations Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Actual Model Probability Distribution */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-100">
                  <Sliders className="w-4 h-4 text-teal-600" />
                  Calibrated Probability Distribution
                </h4>

                <div className="space-y-3 text-xs">
                  <div>
                    <div className="flex justify-between font-semibold text-slate-700 mb-1">
                      <span>Non-Glaucoma (Normal Morphology)</span>
                      <span className="font-bold text-slate-900">{normalProb || '—'}</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                      <div 
                        className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
                        style={{ width: normalProb || '0%' }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between font-semibold text-slate-700 mb-1">
                      <span>Glaucoma (Pathological Neuropathy)</span>
                      <span className="font-bold text-slate-900">{glaucomaProb || '—'}</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                      <div 
                        className="bg-rose-500 h-full rounded-full transition-all duration-500" 
                        style={{ width: glaucomaProb || '0%' }}
                      ></div>
                    </div>
                  </div>
                </div>

                <div className="pt-2 text-[11px] text-slate-500 leading-relaxed">
                  Probabilities derived from softmax logits across 2 classes using ACRIMA benchmark decision boundaries.
                </div>
              </div>

              {/* Clinical Next Steps */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-100">
                  <ShieldCheck className="w-4 h-4 text-teal-600" />
                  Clinical Action Recommendation
                </h4>

                <div className="text-xs text-slate-700 space-y-2.5 leading-relaxed">
                  {isGlaucoma ? (
                    <>
                      <p className="font-semibold text-rose-800">
                        &bull; Immediate Comprehensive Ophthalmology Consultation Recommended.
                      </p>
                      <p>
                        &bull; Perform <strong>Optical Coherence Tomography (OCT)</strong> to quantitatively measure peripapillary Retinal Nerve Fiber Layer (RNFL) thickness.
                      </p>
                      <p>
                        &bull; Order <strong>Standard Automated Perimetry (Visual Field Test)</strong> to evaluate peripheral visual field sensitivity loss.
                      </p>
                      <p>
                        &bull; Check Intraocular Pressure (IOP) via Goldmann Applanation Tonometry.
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="font-semibold text-emerald-800">
                        &bull; Retinal Structure Appears Within Normal Morphological Limits.
                      </p>
                      <p>
                        &bull; Neuroretinal rim contour and cup-to-disc proportion exhibit healthy baseline characteristics.
                      </p>
                      <p>
                        &bull; Continue routine annual or bi-annual eye checkups as recommended for the patient age group.
                      </p>
                    </>
                  )}
                </div>
              </div>

            </div>

            {/* Primary Action Controls: Analyze Another Image / Print Report */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200 no-print">
              <button
                type="button"
                onClick={handlePrint}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-slate-300 text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-colors shadow-xs"
              >
                <Printer className="w-4 h-4 text-slate-500" />
                <span>Print Diagnostic Report</span>
              </button>

              <button
                type="button"
                onClick={resetForm}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3 rounded-xl font-bold text-white bg-teal-600 hover:bg-teal-700 shadow-sm transition-colors text-sm"
              >
                <RefreshCw className="w-4 h-4" />
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
