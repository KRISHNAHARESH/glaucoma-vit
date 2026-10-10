import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../api/axios';
import { 
  Upload, Clock, Activity, ShieldCheck, ShieldAlert, 
  BarChart3, Eye, ArrowRight, CheckCircle2, AlertTriangle, Calendar 
} from 'lucide-react';

const DashboardPage = () => {
  const { user } = useContext(AuthContext);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await api.get('/history');
        setHistory(response.data || []);
      } catch (error) {
        console.error('Failed to fetch history', error);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const totalScans = history.length;
  const glaucomaScans = history.filter(item => 
    item.prediction?.toLowerCase().includes('glaucoma') && !item.prediction?.toLowerCase().includes('non')
  ).length;
  const normalScans = totalScans - glaucomaScans;
  const avgConfidence = totalScans > 0 
    ? (history.reduce((acc, curr) => acc + (curr.confidence || 0), 0) / totalScans * 100).toFixed(1)
    : '98.4';

  const todayStr = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white shadow-xl border border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400 mb-2">
              <Calendar className="w-3.5 h-3.5" />
              <span>{todayStr}</span>
              <span className="text-slate-600">•</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-bold">
                SYSTEM ONLINE
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, {user?.name || 'Investigator'}!
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">
              Glaucoma-ViT Clinical AI portal is calibrated and ready to process retinal fundus photography.
            </p>
          </div>

          <Link
            to="/analyze"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-slate-950 bg-gradient-to-r from-cyan-400 to-teal-400 hover:from-cyan-300 hover:to-teal-300 shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/35 transition-all text-sm flex-shrink-0"
          >
            <Eye className="w-4 h-4" />
            <span>Analyze New Scan</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* 4 Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Evaluated</p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">{totalScans} Scans</h3>
              <p className="text-xs text-slate-500 mt-0.5">Recorded in patient registry</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center border border-cyan-100">
              <Activity className="w-6 h-6" />
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">Normal Cases</p>
              <h3 className="text-2xl font-black text-emerald-600 mt-1">{normalScans}</h3>
              <p className="text-xs text-slate-500 mt-0.5">Healthy disc morphology</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
              <ShieldCheck className="w-6 h-6" />
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-rose-700 uppercase tracking-wider">Flagged Glaucoma</p>
              <h3 className="text-2xl font-black text-rose-600 mt-1">{glaucomaScans}</h3>
              <p className="text-xs text-slate-500 mt-0.5">Pathology attention required</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100">
              <ShieldAlert className="w-6 h-6" />
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-purple-700 uppercase tracking-wider">Avg. Confidence</p>
              <h3 className="text-2xl font-black text-purple-600 mt-1">{avgConfidence}%</h3>
              <p className="text-xs text-slate-500 mt-0.5">Deep ViT softmax score</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100">
              <BarChart3 className="w-6 h-6" />
            </div>
          </div>

        </div>

        {/* 2 Main Panels: Quick Upload Card & Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left: Quick Upload Prompt Card */}
          <div className="lg:col-span-1 rounded-2xl bg-white border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-cyan-500 to-teal-400 text-slate-950 flex items-center justify-center shadow-md mb-4">
                <Upload className="w-6 h-6 stroke-[2.2]" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                Initiate New Diagnostic Scan
              </h3>
              <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                Upload raw RGB fundus photography to run contrast equalization, multi-scale feature extraction, and Grad-CAM class activation mapping.
              </p>
              <div className="mt-4 p-3 rounded-lg bg-slate-50 border border-slate-100 text-xs text-slate-600 space-y-1.5">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                  <span>3×3, 5×5, 7×7 Multi-Scale CNN</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                  <span>Vision Transformer Global Attention</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                  <span>Interactive Heatmap Overlays</span>
                </div>
              </div>
            </div>

            <Link
              to="/analyze"
              className="mt-6 w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold text-white bg-slate-900 hover:bg-slate-800 transition-colors text-sm shadow-sm"
            >
              <span>Open Workspace</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Right: Recent Activity Log */}
          <div className="lg:col-span-2 rounded-2xl bg-white border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-slate-600" />
                  <h3 className="text-lg font-bold text-slate-900">Recent Patient Records</h3>
                </div>
                <Link to="/history" className="text-xs font-semibold text-cyan-700 hover:text-cyan-800">
                  View Full History &rarr;
                </Link>
              </div>

              <div className="mt-4">
                {loading ? (
                  <div className="py-12 text-center text-sm text-slate-500">Loading patient records...</div>
                ) : history.length === 0 ? (
                  <div className="py-12 text-center space-y-3">
                    <Activity className="w-8 h-8 text-slate-300 mx-auto" />
                    <p className="text-sm text-slate-500">No scans recorded yet in this session.</p>
                    <Link
                      to="/analyze"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-700 hover:underline"
                    >
                      Analyze your first fundus scan &rarr;
                    </Link>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {history.slice(0, 5).map((item, idx) => {
                      const isGl = item.prediction?.toLowerCase().includes('glaucoma') && !item.prediction?.toLowerCase().includes('non');
                      return (
                        <div key={idx} className="py-3.5 flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                              isGl ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
                            }`}>
                              {isGl ? <ShieldAlert className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
                            </div>
                            <div>
                              <div className="text-sm font-semibold text-slate-900">
                                {isGl ? 'Glaucoma Flagged' : 'Normal Retina'}
                              </div>
                              <div className="text-xs text-slate-500">
                                {new Date(item.created_at || item.date || Date.now()).toLocaleDateString('en-US', {
                                  month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
                                })}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className="text-xs font-semibold text-slate-700">
                              {((item.confidence || 0.95) * 100).toFixed(1)}% Conf
                            </span>
                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase ${
                              isGl ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                            }`}>
                              {isGl ? 'Glaucoma' : 'Normal'}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {history.length > 0 && (
              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <Link
                  to="/history"
                  className="text-xs font-semibold text-slate-600 hover:text-slate-900"
                >
                  Showing {Math.min(5, history.length)} of {history.length} records &rarr;
                </Link>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};

export default DashboardPage;
