import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DashboardPage from './pages/DashboardPage';
import AnalyzePage from './pages/AnalyzePage';
import HistoryPage from './pages/HistoryPage';
import AboutPage from './pages/AboutPage';
import { Eye, ShieldCheck, Heart, Sparkles, ExternalLink, Activity, Info, FileText } from 'lucide-react';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-teal-600 selection:text-white">
          <Navbar />
          
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/how-it-works" element={<LandingPage defaultSection="how-it-works" />} />
              <Route path="/about" element={<AboutPage />} />
              
              {/* Public Clinical Analysis Workspace for Seamless Conference & Viva Demos */}
              <Route path="/analyze" element={<AnalyzePage />} />
              
              {/* Auth routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              
              {/* Protected Patient & Investigator Records */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              } />
              <Route path="/history" element={
                <ProtectedRoute>
                  <HistoryPage />
                </ProtectedRoute>
              } />
            </Routes>
          </main>
          
          {/* Professional Medical Research Footer */}
          <footer className="bg-white border-t border-slate-200 text-slate-600 text-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                
                {/* Brand & Academic Info */}
                <div className="md:col-span-2 space-y-3">
                  <div className="flex items-center gap-2.5 text-slate-900 font-bold text-lg">
                    <div className="w-8 h-8 rounded-lg bg-teal-50 border border-teal-200 text-teal-600 flex items-center justify-center">
                      <Eye className="w-4 h-4 stroke-[2.5]" />
                    </div>
                    <span>Glaucoma<span className="text-teal-600 font-extrabold">-ViT</span></span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-mono border border-slate-200">
                      B.Tech Research v1.0
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed max-w-md">
                    <strong>Multi-Scale Feature Fusion with Vision Transformers for Robust Glaucoma Detection from Retinal Fundus Images.</strong> 
                    An explainable computer vision framework engineered for early glaucoma screening using multi-scale CNN feature extraction, 
                    channel attention fusion, and Vision Transformer self-attention.
                  </p>
                  <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-slate-500 font-medium">
                    <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-slate-100 border border-slate-200">
                      <span className="w-2 h-2 rounded-full bg-teal-500"></span>
                      ACRIMA Benchmark Dataset
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-slate-100 border border-slate-200">
                      <span className="w-2 h-2 rounded-full bg-teal-500"></span>
                      vit_tiny_patch16_224 &bull; PyTorch
                    </span>
                  </div>
                </div>

                {/* Quick Navigation */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3.5">
                    Platform Navigation
                  </h4>
                  <ul className="space-y-2 text-xs">
                    <li>
                      <Link to="/" className="hover:text-teal-600 transition-colors">
                        Home Overview
                      </Link>
                    </li>
                    <li>
                      <Link to="/analyze" className="hover:text-teal-600 transition-colors font-medium text-teal-700">
                        Analyze Retinal Image
                      </Link>
                    </li>
                    <li>
                      <Link to="/#how-it-works" className="hover:text-teal-600 transition-colors">
                        How It Works Pipeline
                      </Link>
                    </li>
                    <li>
                      <Link to="/about" className="hover:text-teal-600 transition-colors">
                        Model Architecture &amp; Dataset
                      </Link>
                    </li>
                    <li>
                      <Link to="/history" className="hover:text-teal-600 transition-colors">
                        Patient Scan History
                      </Link>
                    </li>
                  </ul>
                </div>

                {/* Academic Project Attribution */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3.5">
                    Academic Evaluation
                  </h4>
                  <ul className="space-y-2 text-xs text-slate-600">
                    <li className="font-semibold text-slate-800">
                      Final-Year B.Tech Major Project
                    </li>
                    <li>
                      Department of Computer Science &amp; Engineering
                    </li>
                    <li>
                      Conference Demonstration Prototype
                    </li>
                    <li className="pt-2">
                      <a 
                        href="https://glaucoma-vit-main1.onrender.com/docs" 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="inline-flex items-center gap-1 text-teal-600 hover:text-teal-700 font-semibold"
                      >
                        FastAPI Swagger Documentation <ExternalLink className="w-3 h-3" />
                      </a>
                    </li>
                  </ul>
                </div>

              </div>

              {/* Prominent Medical Disclaimer Box */}
              <div className="pt-6 pb-6 border-t border-slate-200">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3 text-xs text-slate-600 leading-relaxed">
                  <Info className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" />
                  <p>
                    <strong>Medical Disclaimer:</strong> Glaucoma-ViT is an artificial intelligence research prototype developed for academic demonstration and clinical decision support. 
                    It is not an FDA or CE approved diagnostic medical device. Model outputs and Grad-CAM activations must always be evaluated in conjunction with comprehensive clinical ophthalmic examinations, 
                    tonometry (intraocular pressure), and optical coherence tomography (OCT).
                  </p>
                </div>
              </div>

              {/* Bottom Copyright */}
              <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
                <p>&copy; {new Date().getFullYear()} Glaucoma-ViT Research. All rights reserved.</p>
                <p className="flex items-center gap-1.5">
                  <span>Engineered with PyTorch &bull; Timm &bull; FastAPI &bull; React</span>
                </p>
              </div>
            </div>
          </footer>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
