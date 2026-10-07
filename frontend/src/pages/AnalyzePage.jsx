import React, { useState, useRef } from 'react';
import api from '../api/axios';
import { Upload, X, AlertTriangle } from 'lucide-react';

const AnalyzePage = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
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

  const handleSubmit = async () => {
    if (!selectedImage) return;
    
    setLoading(true);
    setError('');
    
    const formData = new FormData();
    formData.append('file', selectedImage);

    try {
      const response = await api.post('/predict', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setResult(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'An error occurred during analysis.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedImage(null);
    setPreview(null);
    setResult(null);
    setError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Analyze Image</h1>

        {!result && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <div 
              className={`border-2 border-dashed rounded-lg p-12 text-center ${preview ? 'border-teal-300 bg-teal-50' : 'border-gray-300 hover:border-teal-500 transition-colors'}`}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => !preview && fileInputRef.current.click()}
            >
              <input 
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleImageChange}
              />
              
              {!preview ? (
                <div className="cursor-pointer">
                  <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-gray-600 font-medium">Click to upload or drag and drop</p>
                  <p className="text-sm text-gray-500 mt-2">PNG, JPG, JPEG up to 10MB</p>
                </div>
              ) : (
                <div className="relative inline-block">
                  <img src={preview} alt="Preview" className="max-h-64 rounded shadow-sm" />
                  <button 
                    onClick={(e) => { e.stopPropagation(); resetForm(); }}
                    className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full p-1 shadow hover:bg-red-600"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              )}
            </div>

            {error && (
              <div className="mt-4 bg-red-50 text-red-700 p-3 rounded text-sm flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2" />
                {error}
              </div>
            )}

            <div className="mt-6 flex justify-end">
              <button
                onClick={handleSubmit}
                disabled={!selectedImage || loading}
                className={`px-6 py-2 rounded-md font-medium text-white flex items-center ${
                  !selectedImage || loading ? 'bg-teal-400 cursor-not-allowed' : 'bg-teal-600 hover:bg-teal-700'
                }`}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Analyzing...
                  </>
                ) : 'Analyze'}
              </button>
            </div>
          </div>
        )}

        {result && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8 animate-fade-in">
            <h2 className="text-2xl font-bold mb-6 border-b pb-4">Analysis Results</h2>
            
            <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-6">
              <div className="flex-1 text-center md:text-left">
                <p className="text-gray-500 uppercase tracking-wide text-sm font-semibold mb-1">Prediction</p>
                <h3 className={`text-4xl font-extrabold ${result.prediction === 'Glaucoma' ? 'text-red-600' : 'text-green-600'}`}>
                  {result.prediction === 'Glaucoma' ? 'GLAUCOMA' : 'NORMAL'}
                </h3>
              </div>
              
              <div className="flex-1 w-full max-w-xs">
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">Confidence</span>
                  <span className="text-sm font-medium text-gray-700">{(result.confidence * 100).toFixed(2)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className={`h-2.5 rounded-full ${result.prediction === 'Glaucoma' ? 'bg-red-600' : 'bg-green-600'}`} 
                    style={{ width: `${result.confidence * 100}%` }}
                  ></div>
                </div>
                
                <div className="mt-4 text-sm text-gray-600">
                  <p>Probabilities:</p>
                  {result.probabilities && Object.entries(result.probabilities).map(([cls, prob]) => (
                    <p key={cls}>{cls}: {(prob * 100).toFixed(1)}%</p>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-8">
              <h4 className="text-lg font-medium text-gray-900 mb-4">Visual Explanations (Grad-CAM)</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-sm text-gray-500 mb-2">Original</p>
                  <img src={preview} alt="Original Preview" className="rounded shadow-sm w-full" />
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-500 mb-2">Heatmap</p>
                  {result.heatmap && (
                    <img src={`data:image/png;base64,${result.heatmap}`} alt="Heatmap" className="rounded shadow-sm w-full" />
                  )}
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-500 mb-2">Overlay</p>
                  {result.overlay && (
                    <img src={`data:image/png;base64,${result.overlay}`} alt="Overlay" className="rounded shadow-sm w-full" />
                  )}
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-center">
              <button
                onClick={resetForm}
                className="px-6 py-2 border border-teal-600 text-teal-600 rounded-md font-medium hover:bg-teal-50"
              >
                Analyze Another Image
              </button>
            </div>
          </div>
        )}

        <div className="bg-gray-100 p-4 rounded-md text-sm text-gray-600 border border-gray-200">
          <strong>Medical Disclaimer:</strong> This system is developed for academic and research purposes only. It is not a medical diagnostic tool and should not replace evaluation by a qualified eye-care professional.
        </div>
      </div>
    </div>
  );
};

export default AnalyzePage;
