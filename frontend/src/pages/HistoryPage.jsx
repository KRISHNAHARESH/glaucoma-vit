import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { 
  FileText, ShieldCheck, ShieldAlert, Search, Filter, 
  Eye, Calendar, ArrowRight, RefreshCw, AlertCircle 
} from 'lucide-react';

const HistoryPage = () => {
  const [history, setHistory] = useState([]);
  const [filteredHistory, setFilteredHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterType, setFilterType] = useState('ALL'); // ALL, NORMAL, GLAUCOMA
  const [searchQuery, setSearchQuery] = useState('');

  const fetchHistory = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/history');
      const data = response.data || [];
      setHistory(data);
      setFilteredHistory(data);
    } catch (err) {
      setError('Unable to load patient records. Please verify server connectivity.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  useEffect(() => {
    let result = [...history];

    if (filterType === 'NORMAL') {
      result = result.filter(item => 
        item.prediction?.toLowerCase().includes('non') || item.prediction?.toLowerCase() === 'normal'
      );
    } else if (filterType === 'GLAUCOMA') {
      result = result.filter(item => 
        item.prediction?.toLowerCase().includes('glaucoma') && !item.prediction?.toLowerCase().includes('non')
      );
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(item => 
        (item.prediction && item.prediction.toLowerCase().includes(q)) ||
        (item.created_at && item.created_at.toLowerCase().includes(q))
      );
    }

    setFilteredHistory(result);
  }, [filterType, searchQuery, history]);

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-100 text-cyan-800 text-xs font-semibold uppercase tracking-wider mb-2">
              <FileText className="w-3.5 h-3.5 text-cyan-600" />
              Patient Registry
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Diagnostic Scan History
            </h1>
            <p className="text-slate-600 text-sm mt-1">
              Historical archive of all evaluated fundus photography and classification outcomes.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchHistory}
              disabled={loading}
              className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-sm transition-colors"
              title="Refresh Records"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <Link
              to="/analyze"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-slate-950 bg-gradient-to-r from-cyan-400 to-teal-400 hover:from-cyan-300 hover:to-teal-300 shadow-md shadow-cyan-500/20 text-xs transition-all"
            >
              <Eye className="w-4 h-4" />
              <span>New Analysis</span>
            </Link>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
          
          {/* Filter Pills */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => setFilterType('ALL')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                filterType === 'ALL'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Scans ({history.length})
            </button>
            <button
              onClick={() => setFilterType('NORMAL')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                filterType === 'NORMAL'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
              }`}
            >
              Normal Only
            </button>
            <button
              onClick={() => setFilterType('GLAUCOMA')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                filterType === 'GLAUCOMA'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
              }`}
            >
              Glaucoma Only
            </button>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search records..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-colors"
            />
          </div>

        </div>

        {/* Records Card */}
        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200 overflow-hidden">
          {loading ? (
            <div className="py-20 text-center space-y-3">
              <RefreshCw className="w-8 h-8 text-cyan-600 animate-spin mx-auto" />
              <p className="text-sm text-slate-500">Loading diagnostic history...</p>
            </div>
          ) : error ? (
            <div className="p-8 text-center space-y-2">
              <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
              <p className="text-sm font-semibold text-rose-700">{error}</p>
              <button
                onClick={fetchHistory}
                className="mt-2 px-4 py-1.5 text-xs rounded-lg bg-rose-50 text-rose-800 border border-rose-200 hover:bg-rose-100"
              >
                Retry
              </button>
            </div>
          ) : filteredHistory.length === 0 ? (
            <div className="py-20 text-center space-y-3">
              <FileText className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="text-base font-bold text-slate-800">No Patient Records Found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {searchQuery || filterType !== 'ALL' 
                  ? 'No scans match your current filter settings. Try clearing your search.' 
                  : 'Start your clinical evaluation by analyzing your first fundus scan.'}
              </p>
              <Link
                to="/analyze"
                className="inline-flex items-center gap-2 mt-2 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800"
              >
                Analyze Fundus Scan &rarr;
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-600">
                  <tr>
                    <th className="py-4 px-6">Timestamp &amp; ID</th>
                    <th className="py-4 px-6">Classification Outcome</th>
                    <th className="py-4 px-6">ViT Confidence</th>
                    <th className="py-4 px-6 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredHistory.map((item, idx) => {
                    const isGl = item.prediction?.toLowerCase().includes('glaucoma') && !item.prediction?.toLowerCase().includes('non');
                    const conf = Math.round((item.confidence || 0.95) * 100);
                    const dateFormatted = new Date(item.created_at || item.date || Date.now()).toLocaleDateString('en-US', {
                      month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
                    });

                    return (
                      <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-4 px-6">
                          <div className="font-semibold text-slate-900 flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-slate-400" />
                            <span>{dateFormatted}</span>
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                            ID: #{item.id || idx + 101}
                          </div>
                        </td>

                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2.5">
                            <div className={`p-1.5 rounded-lg ${
                              isGl ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
                            }`}>
                              {isGl ? <ShieldAlert className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
                            </div>
                            <span className="font-bold text-slate-900">
                              {isGl ? 'GLAUCOMA' : 'NORMAL'}
                            </span>
                          </div>
                        </td>

                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-24 bg-slate-200 rounded-full h-2 overflow-hidden">
                              <div
                                className={`h-full rounded-full ${isGl ? 'bg-rose-600' : 'bg-emerald-600'}`}
                                style={{ width: `${conf}%` }}
                              ></div>
                            </div>
                            <span className="text-xs font-semibold text-slate-700">{conf}%</span>
                          </div>
                        </td>

                        <td className="py-4 px-6 text-right">
                          <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                            isGl 
                              ? 'bg-rose-100 text-rose-800 border border-rose-200' 
                              : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          }`}>
                            {isGl ? 'Risk Flagged' : 'Normal Disc'}
                          </span>
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

export default HistoryPage;
