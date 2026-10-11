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
import { Eye, ShieldCheck, Heart, Sparkles, ExternalLink } from 'lucide-react';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-cyan-500 selection:text-white">
          <Navbar />
          
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/about" element={<AboutPage />} />
              
              {/* Protected Diagnostic Routes */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              } />
              <Route path="/analyze" element={
                <ProtectedRoute>
                  <AnalyzePage />
                </ProtectedRoute>
              } />
              <Route path="/history" element={
                <ProtectedRoute>
                  <HistoryPage />
                </ProtectedRoute>
              } />
            </Routes>
          </main>
          
          {/* Clinical Medical Footer */}
          <footer className="bg-slate-950 text-slate-400 border-t border-slate-800 text-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                
                {/* Brand Column */}
                <div className="md:col-span-2 space-y-3">
                  <div className="flex items-center gap-2 text-white font-bold text-lg">
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-cyan-500 to-teal-400 text-slate-950 flex items-center justify-center">
                      <Eye className="w-4 h-4 stroke-[2.5]" />
                    </div>
                    <span>Glaucoma<span className="text-cyan-400">ViT</span></span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-mono">
                      v1.0.0
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
                    Automated, explainable glaucoma detection pipeline integrating Multi-Scale Convolutional Neural Networks, 
                    Vision Transformers, and Grad-CAM for medical decision support.
                  </p>
                  <div className="flex items-center gap-2 pt-1 text-xs text-slate-500">
                    <span className="inline-block w-2 h-2 rounded-full bg-emerald-400"></span>
                    <span>FastAPI &bull; PyTorch &bull; ACRIMA Dataset</span>
                  </div>
                </div>

                {/* Quick Navigation */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-3">Diagnostic Tools</h4>
                  <ul className="space-y-2 text-xs">
                    <li><Link to="/analyze" className="hover:text-cyan-300 transition-colors">Analyze Fundus Scan</Link></li>
                    <li><Link to="/dashboard" className="hover:text-cyan-300 transition-colors">Clinical Dashboard</Link></li>
                    <li><Link to="/history" className="hover:text-cyan-300 transition-colors">Patient Scan History</Link></li>
                    <li><Link to="/about" className="hover:text-cyan-300 transition-colors">Research Rationale</Link></li>
                  </ul>
                </div>

                {/* Compliance & API */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-3">API &amp; Docs</h4>
                  <ul className="space-y-2 text-xs">
                    <li>
                      <a href="https://glaucoma-vit-main1.onrender.com/docs" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-300 transition-colors inline-flex items-center gap-1">
                        FastAPI Swagger Docs <ExternalLink className="w-3 h-3" />
                      </a>
                    </li>
                    <li>
                      <a href="https://glaucoma-vit-main1.onrender.com/health" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-300 transition-colors inline-flex items-center gap-1">
                        API Health Status <ExternalLink className="w-3 h-3" />
                      </a>
                    </li>
                    <li className="pt-2 text-[11px] text-slate-500">
                      Academic Engineering Project &bull; {new Date().getFullYear()}
                    </li>
                  </ul>
                </div>

              </div>

              {/* Bottom Bar */}
              <div className="pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
                <p>&copy; {new Date().getFullYear()} Glaucoma-ViT Academic Project. Strictly for research and educational purposes.</p>
                <p className="flex items-center gap-1">
                  <span>Engineered with PyTorch, Timm &amp; React</span>
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
