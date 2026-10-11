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
import { Eye, ShieldCheck, Info, FileText } from 'lucide-react';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="flex flex-col min-h-screen bg-[#070708] text-slate-100 font-sans selection:bg-[#B96445] selection:text-white">
          <Navbar />
          
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/about" element={<AboutPage />} />
              
              {/* Protected Clinical Workspace - Only authenticated users can analyze retinal images */}
              <Route path="/analyze" element={
                <ProtectedRoute>
                  <AnalyzePage />
                </ProtectedRoute>
              } />
              
              {/* Authentication */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              
              {/* Protected Clinical Records */}
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
          
          {/* Professional Healthcare Dark Obsidian & Terracotta Footer */}
          <footer className="bg-[#070708] border-t border-white/10 text-white/70 text-xs">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                
                {/* Brand & Purpose */}
                <div className="md:col-span-2 space-y-2.5">
                  <div className="flex items-center gap-2.5 text-white font-bold text-base">
                    <div className="w-8 h-8 rounded-lg bg-[#B96445]/20 text-amber-300 flex items-center justify-center border border-[#B96445]/40 shadow-xs">
                      <Eye className="w-4 h-4 stroke-[2.2]" />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold tracking-tight text-white">
                        Glaucoma <span className="text-[#E89271] font-extrabold">ViT</span>
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-white/10 text-amber-300 border border-white/15">
                        CLINICAL AI
                      </span>
                    </div>
                  </div>
                  <p className="text-[11px] text-amber-300/80 font-mono">
                    Multi-Scale CNN &amp; Vision Transformer
                  </p>
                  <p className="text-xs text-white/60 leading-relaxed max-w-md">
                    A state-of-the-art diagnostic research system combining multi-scale convolutional feature fusion with self-attention Vision Transformers to detect structural optic nerve damage and deliver transparent Grad-CAM explanations.
                  </p>
                </div>

                {/* Navigation Links */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-white/90 mb-3">
                    Navigation
                  </h4>
                  <ul className="space-y-2 text-xs text-white/60">
                    <li>
                      <Link to="/" className="hover:text-amber-200 hover:translate-x-1 inline-flex transition-all duration-200">
                        Home
                      </Link>
                    </li>
                    <li>
                      <Link to="/analyze" className="hover:text-amber-200 font-medium text-amber-300 hover:translate-x-1 inline-flex transition-all duration-200">
                        Analyze Scan
                      </Link>
                    </li>
                    <li>
                      <Link to="/about" className="hover:text-amber-200 hover:translate-x-1 inline-flex transition-all duration-200">
                        Clinical Study
                      </Link>
                    </li>
                    <li>
                      <Link to="/dashboard" className="hover:text-amber-200 hover:translate-x-1 inline-flex transition-all duration-200">
                        Dashboard
                      </Link>
                    </li>
                  </ul>
                </div>

                {/* Medical System Status */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-white/90 mb-3">
                    System Status
                  </h4>
                  <ul className="space-y-2 text-xs text-white/60">
                    <li className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                      <span>ViT Inference: Online</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                      <span>Grad-CAM Visualizer: Active</span>
                    </li>
                    <li className="pt-1">
                      <Link to="/login" className="text-amber-300 hover:text-white font-semibold">
                        Sign In to Save History
                      </Link>
                    </li>
                  </ul>
                </div>

              </div>

              {/* Medical Disclaimer Callout */}
              <div className="pt-6 pb-6 border-t border-white/10">
                <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 flex items-start gap-3 text-[11px] text-white/60 leading-relaxed">
                  <Info className="w-4 h-4 text-amber-300 flex-shrink-0 mt-0.5" />
                  <p>
                    <strong>Medical Disclaimer:</strong> Glaucoma ViT is an assistive decision-support research application. Model outputs and Grad-CAM heatmaps are provided for informational and clinical review purposes only and do not replace professional medical advice, clinical diagnosis, tonometry, or evaluation by a licensed ophthalmologist.
                  </p>
                </div>
              </div>

              {/* Bottom Copyright */}
              <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-[11px] text-white/50 gap-2">
                <p>&copy; {new Date().getFullYear()} Glaucoma ViT. All rights reserved.</p>
                <p className="flex items-center gap-1 text-white/60">
                  <span>Ophthalmology Deep Learning Research</span>
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
