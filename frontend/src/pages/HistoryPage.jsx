import React, { useEffect, useState } from 'react';
import api from '../api/axios';

const HistoryPage = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await api.get('/history');
        setHistory(response.data);
      } catch (err) {
        setError('Failed to load history');
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Prediction History</h1>

        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          {loading ? (
            <div className="p-6 text-center text-gray-500">Loading history...</div>
          ) : error ? (
            <div className="p-6 text-center text-red-500">{error}</div>
          ) : history.length === 0 ? (
            <div className="p-6 text-center text-gray-500">No predictions found.</div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {history.map((item, index) => (
                <li key={index}>
                  <div className="px-4 py-4 flex items-center sm:px-6">
                    <div className="min-w-0 flex-1 sm:flex sm:items-center sm:justify-between">
                      <div className="truncate">
                        <div className="flex text-sm">
                          <p className="font-medium text-teal-600 truncate">{new Date(item.date).toLocaleString()}</p>
                        </div>
                      </div>
                      <div className="mt-4 flex-shrink-0 sm:mt-0 sm:ml-5">
                        <div className="flex space-x-4 items-center">
                          <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${item.prediction === 'GLAUCOMA' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                            {item.prediction}
                          </p>
                          <p className="text-sm text-gray-500">
                            Conf: {(item.confidence * 100).toFixed(1)}%
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default HistoryPage;
