import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { 
  FileText, Search, Filter, ShieldCheck, ShieldAlert, 
  Eye, RefreshCw, AlertCircle, ArrowRight
} from 'lucide-react';

const HistoryPage = () => {
  const [history, setHistory] = useState([]);
  const [filteredHistory, setFilteredHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('ALL');

  const fetchHistory = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/history');
      setHistory(response.data || []);
      setFilteredHistory(response.data || []);
    } catch (err) {
      setError('Failed to load analysis records. Please ensure the backend is connected.');
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
        item.prediction?.toLowerCase().includes('non') || item.prediction?.toLowerCase().includes('normal')
      );
    } else if (filterType === 'GLAUCOMA') {
      result = result.filter(item => 
        item.prediction?.toLowerCase().includes('glaucoma') && !item.prediction?.toLowerCase().includes('non')
      );
    }

    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      result = result.filter(item => 
        (item.image_filename && item.image_filename.toLowerCase().includes(q)) ||
        (item.prediction && item.prediction.toLowerCase().includes(q)) ||
        (item.id && item.id.toString().includes(q))
      );
    }

    setFilteredHistory(result);
  }, [filterType, searchQuery, history]);

  return (
    <div className="min-h-screen bg-[#070708] pt-28 pb-16 px-4 sm:px-6 lg:px-8 text-white font-sans selection:bg-[#B96445] selection:text-white">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-white/90 text-xs font-semibold uppercase tracking-wider mb-2 border border-white/15 shadow-xs">
              <FileText className="w-3.5 h-3.5 text-[#B96445]" />
              <span>Diagnostic Archive</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Scan History &amp; Records
            </h1>
            <p className="text-white/60 text-sm mt-1 font-light">
              Historical record of your evaluated retinal fundus photographs and outcomes.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchHistory}
              disabled={loading}
              className="p-2.5 rounded-full border border-white/10 bg-white/[0.04] hover:bg-white/[0.1] hover:border-white/30 text-white/80 hover:text-white shadow-xs hover:scale-105 active:scale-95 transition-all duration-200"
              title="Refresh Registry"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <Link
              to="/analyze"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full font-bold text-white bg-[#B96445] hover:bg-[#a65639] shadow-lg shadow-[#B96445]/25 hover:shadow-2xl hover:shadow-[#B96445]/40 text-xs transition-all duration-300 hover:scale-105 active:scale-95 group"
            >
              <Eye className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span>New Analysis</span>
            </Link>
          </div>
        </div>

        {/* Filter & Search Toolbar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-3xl bg-[#111114] hover:border-white/20 border border-white/10 shadow-xl transition-all duration-300">
          
          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search filename or outcome..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-white/10 hover:border-white/25 text-xs focus:outline-none focus:border-[#B96445] bg-white/[0.04] text-white placeholder-white/40 transition-colors"
            />
          </div>

          {/* Filter Pills with Interactive Hover States */}
          <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
            <span className="text-xs font-semibold text-white/60 mr-2 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" />
              Filter:
            </span>
            <button
              onClick={() => setFilterType('ALL')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all duration-200 hover:scale-105 active:scale-95 border ${
                filterType === 'ALL'
                  ? 'bg-[#B96445] text-white border-[#B96445] shadow-md shadow-[#B96445]/30'
                  : 'bg-white/[0.04] text-white/60 border-white/10 hover:bg-white/[0.1] hover:text-white'
              }`}
            >
              All ({history.length})
            </button>
            <button
              onClick={() => setFilterType('NORMAL')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all duration-200 hover:scale-105 active:scale-95 border ${
                filterType === 'NORMAL'
                  ? 'bg-emerald-600 text-white border-emerald-500 shadow-md shadow-emerald-600/30'
                  : 'bg-white/[0.04] text-emerald-400 border-white/10 hover:bg-emerald-500/20 hover:text-emerald-300'
              }`}
            >
              Normal
            </button>
            <button
              onClick={() => setFilterType('GLAUCOMA')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all duration-200 hover:scale-105 active:scale-95 border ${
                filterType === 'GLAUCOMA'
                  ? 'bg-rose-600 text-white border-rose-500 shadow-md shadow-rose-600/30'
                  : 'bg-white/[0.04] text-rose-400 border-white/10 hover:bg-rose-500/20 hover:text-rose-300'
              }`}
            >
              Flagged
            </button>
          </div>

        </div>

        {/* History Table or Empty State with Row Hover */}
        <div className="bg-[#111114] rounded-3xl border border-white/10 hover:border-white/20 shadow-xl transition-all duration-300 overflow-hidden">
          {loading ? (
            <div className="p-16 text-center text-xs text-white/60 space-y-2">
              <RefreshCw className="w-5 h-5 animate-spin mx-auto text-[#B96445]" />
              <p>Fetching analysis records...</p>
            </div>
          ) : error ? (
            <div className="p-10 text-center text-xs text-rose-400 space-y-2">
              <AlertCircle className="w-5 h-5 mx-auto" />
              <p>{error}</p>
            </div>
          ) : filteredHistory.length === 0 ? (
            <div className="p-16 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-white/[0.04] text-white/40 mx-auto flex items-center justify-center border border-white/10">
                <FileText className="w-6 h-6 stroke-[1.8]" />
              </div>
              <div className="max-w-sm mx-auto space-y-1">
                <h3 className="text-sm font-bold text-white">
                  {searchQuery || filterType !== 'ALL' ? 'No matching records found' : 'No scan history recorded'}
                </h3>
                <p className="text-xs text-white/60 leading-relaxed font-light">
                  {searchQuery || filterType !== 'ALL' 
                    ? 'Try adjusting your search query or filter selection.' 
                    : 'Evaluated fundus scans will be archived here once you run an analysis.'}
                </p>
              </div>
              <div className="pt-2">
                <Link
                  to="/analyze"
                  className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-full text-xs font-bold text-white bg-[#B96445] hover:bg-[#a65639] transition-all duration-300 shadow-md hover:shadow-xl hover:shadow-[#B96445]/30 hover:scale-105 active:scale-95"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Analyze an Image</span>
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
                    <th className="py-3.5 px-5">Confidence Score</th>
                    <th className="py-3.5 px-5">Recorded Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-white/80">
                  {filteredHistory.map((scan) => {
                    const isGlauc = scan.prediction?.toLowerCase().includes('glaucoma') && !scan.prediction?.toLowerCase().includes('non');
                    const conf = scan.confidence != null ? (scan.confidence * 100).toFixed(1) + '%' : '—';
                    const dateStr = scan.created_at ? new Date(scan.created_at).toLocaleString() : 'Recent';

                    return (
                      <tr key={scan.id} className="hover:bg-white/[0.05] transition-all duration-200 cursor-pointer group">
                        <td className="py-3.5 px-5 font-mono text-white font-medium group-hover:text-amber-200 transition-colors">
                          {scan.image_filename || `Record #${scan.id}`}
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
                        <td className="py-3.5 px-5 font-bold text-white group-hover:text-amber-200 transition-colors">
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

export default HistoryPage;
