import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../api/axios';
import { 
  Activity, ShieldCheck, ShieldAlert, Eye, ArrowRight, 
  Calendar, RefreshCw, FileText, CheckCircle2, Clock
} from 'lucide-react';

const DashboardPage = () => {
  const { user } = useContext(AuthContext);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const response = await api.get('/history');
      setHistory(response.data || []);
    } catch (error) {
      console.error('Failed to fetch history', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const totalScans = history.length;
  const glaucomaScans = history.filter(item => 
    item.prediction?.toLowerCase().includes('glaucoma') && !item.prediction?.toLowerCase().includes('non')
  ).length;
  const normalScans = totalScans - glaucomaScans;
  
  // Real average confidence from actual records (never hardcoded mock)
  const avgConfidence = totalScans > 0 
    ? (history.reduce((acc, curr) => acc + (curr.confidence || 0), 0) / totalScans * 100).toFixed(1) + '%'
    : '—';

  const todayStr = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  return (
    <div className="min-h-screen bg-[#070708] pt-28 pb-16 px-4 sm:px-6 lg:px-8 text-white font-sans selection:bg-[#B96445] selection:text-white relative overflow-hidden">
      {/* Subtle ambient lighting glows to give frosted glass depth and refraction */}
      <div className="absolute top-20 right-10 w-96 h-96 bg-[#B96445]/10 rounded-full blur-3xl pointer-events-none -z-10"></div>
      <div className="absolute bottom-20 left-10 w-80 h-80 bg-teal-500/5 rounded-full blur-3xl pointer-events-none -z-10"></div>

      <div className="max-w-6xl mx-auto space-y-8 relative z-10">
        
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 sm:p-7 rounded-3xl bg-white/[0.04] hover:bg-white/[0.06] backdrop-blur-2xl border border-white/15 hover:border-white/25 shadow-[0_16px_48px_0_rgba(0,0,0,0.5)] transition-all duration-300">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-[#B96445] mb-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>{todayStr}</span>
              <span className="text-white/30">•</span>
              <span className="text-white/60">Clinical Session</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Welcome back, {user?.name ? (user.name.charAt(0).toUpperCase() + user.name.slice(1)) : 'Haresh'}
            </h1>
            <p className="text-xs sm:text-sm text-white/70 mt-0.5 font-light">
              Overview of your recorded retinal fundus evaluations and diagnostic activity.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={fetchHistory}
              disabled={loading}
              className="btn-micro p-2.5 rounded-full border border-white/15 bg-white/[0.06] hover:bg-white/[0.12] hover:border-white/30 text-white/80 hover:text-white shadow-xs backdrop-blur-md"
              title="Refresh Activity"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : 'hover:rotate-180 transition-transform duration-500'}`} />
            </button>
            <Link
              to="/analyze"
              className="btn-micro glass-sheen inline-flex items-center gap-2 px-6 py-2.5 rounded-full font-bold text-white bg-[#B96445] hover:bg-[#a65639] shadow-lg shadow-[#B96445]/25 hover:shadow-2xl hover:shadow-[#B96445]/40 text-xs group"
            >
              <Eye className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span>New Analysis</span>
              <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>
        </div>

        {/* Real Summary Metric Cards with Hover Elevation & Micro-Animations */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className="interactive-card glass-sheen group p-5 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] backdrop-blur-xl border border-white/15 hover:border-[#B96445]/50 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] flex items-center justify-between cursor-pointer">
            <div>
              <p className="text-xs font-semibold text-white/60 uppercase tracking-wider group-hover:text-white/80 transition-colors">Total Evaluated</p>
              <h3 className="text-2xl font-black text-white group-hover:text-[#E89271] transition-colors mt-1">{totalScans}</h3>
              <p className="text-[11px] text-white/40 mt-0.5">Stored database records</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-white/[0.06] group-hover:bg-[#B96445] text-[#B96445] group-hover:text-white border border-white/15 group-hover:border-[#B96445] group-hover:scale-110 group-hover:rotate-6 flex items-center justify-center shadow-inner transition-all duration-300">
              <Activity className="w-5 h-5" />
            </div>
          </div>

          <div className="interactive-card glass-sheen group p-5 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] backdrop-blur-xl border border-white/15 hover:border-emerald-500/50 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] flex items-center justify-between cursor-pointer">
            <div>
              <p className="text-xs font-semibold text-emerald-400 uppercase tracking-wider group-hover:text-emerald-300 transition-colors">Normal Cases</p>
              <h3 className="text-2xl font-black text-emerald-400 group-hover:text-emerald-300 transition-colors mt-1">{normalScans}</h3>
              <p className="text-[11px] text-white/40 mt-0.5">Healthy morphology</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-emerald-500/15 group-hover:bg-emerald-500 text-emerald-400 group-hover:text-white border border-emerald-500/30 group-hover:border-emerald-500 group-hover:scale-110 group-hover:rotate-6 flex items-center justify-center shadow-inner transition-all duration-300">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>

          <div className="interactive-card glass-sheen group p-5 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] backdrop-blur-xl border border-white/15 hover:border-rose-500/50 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] flex items-center justify-between cursor-pointer">
            <div>
              <p className="text-xs font-semibold text-rose-400 uppercase tracking-wider group-hover:text-rose-300 transition-colors">Flagged Cases</p>
              <h3 className="text-2xl font-black text-rose-400 group-hover:text-rose-300 transition-colors mt-1">{glaucomaScans}</h3>
              <p className="text-[11px] text-white/40 mt-0.5">Glaucomatous features</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-rose-500/15 group-hover:bg-rose-500 text-rose-400 group-hover:text-white border border-rose-500/30 group-rose-500 group-hover:scale-110 group-hover:rotate-6 flex items-center justify-center shadow-inner transition-all duration-300">
              <ShieldAlert className="w-5 h-5" />
            </div>
          </div>

          <div className="interactive-card glass-sheen group p-5 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] backdrop-blur-xl border border-white/15 hover:border-amber-400/50 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] flex items-center justify-between cursor-pointer">
            <div>
              <p className="text-xs font-semibold text-white/60 uppercase tracking-wider group-hover:text-amber-200 transition-colors">Avg. Confidence</p>
              <h3 className="text-2xl font-black text-white group-hover:text-amber-300 transition-colors mt-1">{avgConfidence}</h3>
              <p className="text-[11px] text-white/40 mt-0.5">Across recorded scans</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-white/[0.06] group-hover:bg-amber-500 text-amber-300 group-hover:text-black border border-white/15 group-hover:border-amber-500 group-hover:scale-110 group-hover:rotate-6 flex items-center justify-center shadow-inner transition-all duration-300">
              <FileText className="w-5 h-5" />
            </div>
          </div>

        </div>

        {/* Recent Analysis Activity Table */}
        <div className="bg-white/[0.04] backdrop-blur-2xl rounded-3xl border border-white/15 hover:border-white/25 shadow-[0_16px_48px_0_rgba(0,0,0,0.5)] transition-all duration-300 overflow-hidden">
          <div className="p-5 border-b border-white/10 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white">Recent Analysis Activity</h2>
              <p className="text-xs text-white/60 mt-0.5">Chronological record of recent evaluations</p>
            </div>
            {totalScans > 0 && (
              <Link
                to="/history"
                className="text-xs font-semibold text-amber-300 hover:text-amber-200 hover:underline flex items-center gap-1 transition-all group"
              >
                <span>View Full Registry</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-1" />
              </Link>
            )}
          </div>

          {loading ? (
            <div className="p-12 text-center text-xs text-white/60 space-y-2">
              <RefreshCw className="w-5 h-5 animate-spin mx-auto text-[#B96445]" />
              <p>Loading database records...</p>
            </div>
          ) : totalScans === 0 ? (
            <div className="p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-white/[0.04] text-white/40 mx-auto flex items-center justify-center border border-white/10">
                <FileText className="w-6 h-6 stroke-[1.8]" />
              </div>
              <div className="max-w-sm mx-auto space-y-1">
                <h3 className="text-sm font-bold text-white">No analyses recorded yet</h3>
                <p className="text-xs text-white/60 leading-relaxed font-light">
                  Your recent diagnostic evaluations will appear here automatically once you analyze an image.
                </p>
              </div>
              <div className="pt-2">
                <Link
                  to="/analyze"
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-bold text-white bg-[#B96445] hover:bg-[#a65639] transition-all duration-300 shadow-md hover:shadow-xl hover:shadow-[#B96445]/30 hover:scale-105 active:scale-95 group"
                >
                  <Eye className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                  <span>Analyze First Image</span>
                </Link>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-white/[0.03] text-white/80 font-bold uppercase tracking-wider text-[11px] border-b border-white/10">
                  <tr>
                    <th className="py-3.5 px-5">Image Identifier</th>
                    <th className="py-3.5 px-5">Diagnostic Outcome</th>
                    <th className="py-3.5 px-5">Confidence</th>
                    <th className="py-3.5 px-5">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-white/80">
                  {history.slice(0, 5).map((scan) => {
                    const isGlauc = scan.prediction?.toLowerCase().includes('glaucoma') && !scan.prediction?.toLowerCase().includes('non');
                    const conf = scan.confidence != null ? (scan.confidence * 100).toFixed(1) + '%' : '—';
                    const dateStr = scan.created_at ? new Date(scan.created_at).toLocaleString() : 'Recent';

                    return (
                      <tr key={scan.id} className="hover:bg-white/[0.05] transition-all duration-200 cursor-pointer group">
                        <td className="py-3.5 px-5 font-mono text-white font-medium group-hover:text-amber-200 transition-colors">
                          {scan.image_filename || `Scan #${scan.id}`}
                        </td>
                        <td className="py-3.5 px-5">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold transition-all group-hover:scale-105 ${
                            isGlauc 
                              ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30' 
                              : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                          }`}>
                            {isGlauc ? <ShieldAlert className="w-3 h-3" /> : <ShieldCheck className="w-3 h-3" />}
                            {scan.prediction}
                          </span>
                        </td>
                        <td className="py-3.5 px-5 font-semibold text-white group-hover:text-amber-200 transition-colors">
                          {conf}
                        </td>
                        <td className="py-3.5 px-5 text-white/50 font-mono text-[11px]">
                          {dateStr}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default DashboardPage;
