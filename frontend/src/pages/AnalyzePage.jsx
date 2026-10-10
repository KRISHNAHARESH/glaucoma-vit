import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { 
  Upload, X, AlertTriangle, CheckCircle2, Eye, Activity, Sparkles, 
  FileText, ArrowRight, RefreshCw, Printer, ShieldAlert, ShieldCheck, Info
} from 'lucide-react';

const AnalyzePage = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [analysisStep, setAnalysisStep] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      setPreview(URL.createObjectURL(file));
      setResult(null);
      setError('');
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedImage(file);
      setPreview(URL.createObjectURL(file));
      setResult(null);
      setError('');
    }
  };

  // 1-Click Sample loader for rapid demonstrations
  const loadSample = async (samplePath, sampleName) => {
    try {
      setError('');
      setResult(null);
      const res = await fetch(samplePath);
      const blob = await res.blob();
      const file = new File([blob], sampleName, { type: 'image/jpeg' });
      setSelectedImage(file);
      setPreview(URL.createObjectURL(file));
    } catch (err) {
      setError('Could not load sample image: ' + err.message);
    }
  };

  const handleSubmit = async () => {
    if (!selectedImage) return;
    
    setLoading(true);
    setError('');
    setAnalysisStep('Pre-processing image with CLAHE and median filtration...');
    
    const formData = new FormData();
    formData.append('file', selectedImage);

    try {
      setTimeout(() => {
        setAnalysisStep('Executing Multi-Scale CNN & ViT Transformer inference...');
      }, 700);

      const response = await api.post('/predict', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setResult(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'An error occurred during inference. Please verify server connection.');
    } finally {
      setLoading(false);
      setAnalysisStep('');
    }
  };

  const resetForm = () => {
    setSelectedImage(null);
    setPreview(null);
    setResult(null);
    setError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const isGlaucoma = result?.prediction?.toLowerCase().includes('glaucoma') && !result?.prediction?.toLowerCase().includes('non');

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-100 text-cyan-800 text-xs font-semibold uppercase tracking-wider mb-2">
              <Activity className="w-3.5 h-3.5 text-cyan-600" />
              Diagnostic Workspace
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Retinal Fundus Image Analysis
            </h1>
            <p className="text-slate-600 text-sm mt-1">
              Upload high-resolution optic disc fundus photography for AI feature fusion and Grad-CAM evaluation.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/history"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 shadow-sm transition-colors"
            >
              <FileText className="w-3.5 h-3.5" />
              Scan History
            </Link>
          </div>
        </div>

        {/* Upload & Workspace Card */}
        {!result && (
          <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200/80 p-6 sm:p-8 space-y-6">
            
            {/* Quick Demo Sample Selector */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                <Sparkles className="w-4 h-4 text-cyan-600" />
                <span>Quick Test with Preloaded Clinical Samples:</span>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => loadSample('/samples/sample_normal.jpg', 'Normal_Fundus_Sample.jpg')}
                  className="flex-1 sm:flex-initial px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-300 text-xs font-semibold hover:bg-emerald-100 transition-colors"
                >
                  Load Normal Eye
                </button>
                <button
                  type="button"
                  onClick={() => loadSample('/samples/sample_glaucoma.jpg', 'Glaucoma_Fundus_Sample.jpg')}
                  className="flex-1 sm:flex-initial px-3 py-1.5 rounded-lg bg-rose-50 text-rose-700 border border-rose-300 text-xs font-semibold hover:bg-rose-100 transition-colors"
                >
                  Load Glaucoma Eye
                </button>
              </div>
            </div>

            {/* Dropzone */}
            <div 
              className={`relative border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center transition-all duration-200 ${
                preview 
                  ? 'border-cyan-400 bg-cyan-50/20' 
                  : 'border-slate-300 hover:border-cyan-500 hover:bg-slate-50/60 cursor-pointer'
              }`}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => !preview && fileInputRef.current?.click()}
            >
              <input 
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleImageChange}
              />
              
              {!preview ? (
                <div className="space-y-4">
                  <div className="mx-auto w-16 h-16 rounded-2xl bg-cyan-50 text-cyan-600 border border-cyan-100 flex items-center justify-center shadow-inner">
                    <Upload className="w-8 h-8 stroke-[2]" />
                  </div>
                  <div>
                    <p className="text-base font-semibold text-slate-800">
                      Click to choose fundus photograph or drag &amp; drop here
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      Supports JPG, PNG, JPEG up to 15MB • Centered on optic nerve head
                    </p>
                  </div>
                </div>
              ) : (
                <div className="relative inline-flex flex-col items-center">
                  <div className="p-2 rounded-xl bg-white border border-slate-200 shadow-md">
                    <img 
                      src={preview} 
                      alt="Retinal Preview" 
                      className="max-h-72 w-auto object-contain rounded-lg"
                    />
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <span className="text-xs font-medium text-slate-600 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                      {selectedImage?.name || 'Selected Fundus Scan'}
                    </span>
                    <button 
                      type="button"
                      onClick={(e) => { e.stopPropagation(); resetForm(); }}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200 hover:bg-rose-100 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                      Remove
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-xl text-sm flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-rose-900">Analysis Error</h4>
                  <p className="mt-0.5">{error}</p>
                </div>
              </div>
            )}

            {/* Submit Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100">
              <div className="text-xs text-slate-500 flex items-center gap-1.5">
                <Info className="w-4 h-4 text-cyan-600" />
                <span>Runs Multi-Scale CNN (3x3, 5x5, 7x7) + ViT-16 Grad-CAM pipeline</span>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                {selectedImage && (
                  <button
                    type="button"
                    onClick={resetForm}
                    disabled={loading}
                    className="px-4 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
                  >
                    Clear
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={!selectedImage || loading}
                  className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-8 py-3 rounded-xl font-semibold text-white shadow-lg transition-all duration-150 ${
                    !selectedImage || loading 
                      ? 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none' 
                      : 'bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 shadow-cyan-600/25 hover:shadow-cyan-600/35'
                  }`}
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>{analysisStep || 'Analyzing Scan...'}</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Run Glaucoma-ViT Analysis</span>
                    </>
                  )}
                </button>
              </div>
            </div>

          </div>
        )}

        {/* Results Screen */}
        {result && (
          <div className="space-y-8 animate-fade-in">
            
            {/* Diagnosis Summary Card */}
            <div className={`rounded-2xl p-6 sm:p-8 border shadow-xl ${
              isGlaucoma 
                ? 'bg-rose-50/90 border-rose-200 text-rose-950 shadow-rose-900/5' 
                : 'bg-emerald-50/90 border-emerald-200 text-emerald-950 shadow-emerald-900/5'
            }`}>
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                
                <div className="flex items-start gap-4">
                  <div className={`p-3.5 rounded-2xl text-white shadow-md ${
                    isGlaucoma ? 'bg-rose-600' : 'bg-emerald-600'
                  }`}>
                    {isGlaucoma ? <ShieldAlert className="w-8 h-8" /> : <ShieldCheck className="w-8 h-8" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold tracking-wider uppercase opacity-75">
                        Predicted Classification
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold uppercase ${
                        isGlaucoma ? 'bg-rose-200 text-rose-900' : 'bg-emerald-200 text-emerald-900'
                      }`}>
                        {isGlaucoma ? 'Pathological Risk Flagged' : 'Healthy Morphology'}
                      </span>
                    </div>
                    <h2 className="text-3xl sm:text-4xl font-black tracking-tight mt-1">
                      {isGlaucoma ? 'GLAUCOMA DETECTED' : 'NORMAL (NON-GLAUCOMA)'}
                    </h2>
                    <p className="text-sm mt-1.5 opacity-85 max-w-xl">
                      {isGlaucoma 
                        ? 'Features indicative of optic nerve cupping, neuroretinal rim thinning, or retinal nerve fiber layer (RNFL) loss were detected.'
                        : 'Optic disc contour, cup-to-disc proportion, and surrounding retinal vasculature exhibit normal structural characteristics.'}
                    </p>
                  </div>
                </div>

                {/* Confidence Meter Box */}
                <div className="w-full md:w-64 p-4 rounded-xl bg-white/90 border border-slate-200 shadow-sm flex flex-col justify-center">
                  <div className="flex justify-between items-center text-xs font-semibold text-slate-700 mb-1.5">
                    <span>Model Confidence</span>
                    <span className="text-sm font-bold text-slate-900">
                      {(result.confidence * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-700 ${
                        isGlaucoma ? 'bg-rose-600' : 'bg-emerald-600'
                      }`}
                      style={{ width: `${Math.min(100, Math.max(5, result.confidence * 100))}%` }}
                    ></div>
                  </div>
                  
                  {/* Probability distribution */}
                  <div className="mt-3 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                    {result.probabilities && Object.entries(result.probabilities).map(([cls, prob]) => (
                      <div key={cls} className="flex justify-between items-center">
                        <span className="truncate">{cls}:</span>
                        <span className="font-semibold text-slate-800">{(prob * 100).toFixed(1)}%</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>

            {/* Explainable AI Visualizer (Grad-CAM Studio) */}
            <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200 p-6 sm:p-8 space-y-6">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-cyan-700 uppercase tracking-wider mb-1">
                  <Sparkles className="w-4 h-4 text-cyan-600" />
                  <span>Explainable AI (XAI) Verification</span>
                </div>
                <h3 className="text-xl font-extrabold text-slate-900">
                  Grad-CAM Feature Activation Maps
                </h3>
                <p className="text-sm text-slate-600 mt-1 max-w-3xl">
                  Gradient-weighted Class Activation Mapping backpropagates from the feature fusion layer to visualize 
                  which anatomical zones of the optic disc contributed most to this classification.
                </p>
              </div>

              {/* 3 Visual Columns */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* 1. Preprocessed Original */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col items-center">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">
                    1. Input Preprocessed Fundus
                  </span>
                  <div className="w-full aspect-square bg-slate-950 rounded-lg overflow-hidden border border-slate-300 shadow-inner flex items-center justify-center">
                    <img 
                      src={preview} 
                      alt="Input Fundus" 
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 text-center mt-3">
                    Normalized RGB with contrast-limited adaptive histogram equalization.
                  </p>
                </div>

                {/* 2. Heatmap */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col items-center">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">
                    2. Grad-CAM Activation Heatmap
                  </span>
                  <div className="w-full aspect-square bg-slate-950 rounded-lg overflow-hidden border border-slate-300 shadow-inner flex items-center justify-center">
                    {result.heatmap ? (
                      <img 
                        src={`data:image/png;base64,${result.heatmap}`} 
                        alt="Grad-CAM Heatmap" 
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <span className="text-xs text-slate-400">Heatmap unavailable</span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 text-center mt-3">
                    Warmer colors (red/orange) represent maximum network attention density.
                  </p>
                </div>

                {/* 3. Anatomical Overlay */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col items-center">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">
                    3. Anatomical Overlay
                  </span>
                  <div className="w-full aspect-square bg-slate-950 rounded-lg overflow-hidden border border-slate-300 shadow-inner flex items-center justify-center">
                    {result.overlay ? (
                      <img 
                        src={`data:image/png;base64,${result.overlay}`} 
                        alt="Grad-CAM Overlay" 
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <span className="text-xs text-slate-400">Overlay unavailable</span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 text-center mt-3">
                    Fused visualization correlating model focus with optic disc morphology.
                  </p>
                </div>

              </div>

              {/* Action Toolbar */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-100">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-sm transition-colors"
                  >
                    <Printer className="w-4 h-4 text-slate-600" />
                    Print Diagnostic Report
                  </button>

                  <Link
                    to="/history"
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-slate-600 hover:text-slate-900 text-xs font-semibold hover:bg-slate-100 transition-colors"
                  >
                    View in History &rarr;
                  </Link>
                </div>

                <button
                  type="button"
                  onClick={resetForm}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-white bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 shadow-md shadow-cyan-600/20 transition-all text-sm"
                >
                  <RefreshCw className="w-4 h-4" />
                  Analyze Another Scan
                </button>
              </div>

            </div>

          </div>
        )}

        {/* Medical Regulatory Notice */}
        <div className="p-4 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-600 flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 text-slate-500 flex-shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong>Clinical Notice:</strong> This deep-learning assessment is intended solely as an investigational research aid. 
            All automated evaluations must be correlated with visual field testing, tonometry (IOP), and stereoscopic optic nerve examination by a certified ophthalmologist.
          </p>
        </div>

      </div>
    </div>
  );
};

export default AnalyzePage;
