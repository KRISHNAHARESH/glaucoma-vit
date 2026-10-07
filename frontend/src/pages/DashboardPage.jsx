import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../api/axios';
import { Upload, Clock } from 'lucide-react';

const DashboardPage = () => {
  const { user } = useContext(AuthContext);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await api.get('/history');
        setHistory(response.data.slice(0, 5)); // Last 5
      } catch (error) {
        console.error('Failed to fetch history', error);
      }
    };
    fetchHistory();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Welcome back, {user?.name || 'User'}!</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Analyze Action Card */}
          <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-teal-600 col-span-1 md:col-span-2 flex flex-col justify-center items-center text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Ready to analyze a new image?</h2>
            <p className="text-gray-500 mb-6 max-w-md">Upload a retinal fundus image to get an AI-powered assessment using our Glaucoma-ViT model.</p>
            <Link
              to="/analyze"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-teal-600 hover:bg-teal-700"
            >
              <Upload className="mr-2 h-5 w-5" />
              Analyze New Image
            </Link>
          </div>

          {/* Quick Stats / Info */}
          <div className="bg-white rounded-lg shadow-sm p-6 flex flex-col">
            <div className="flex items-center mb-4">
              <Clock className="h-6 w-6 text-teal-600 mr-2" />
              <h2 className="text-lg font-medium text-gray-900">Recent Activity</h2>
            </div>
            <div className="flex-1 overflow-y-auto">
              {history.length > 0 ? (
                <ul className="space-y-4">
                  {history.map((item, index) => (
                    <li key={index} className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">{new Date(item.date).toLocaleDateString()}</span>
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${item.prediction === 'GLAUCOMA' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                        {item.prediction}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 text-sm">No recent analysis history.</p>
              )}
            </div>
            {history.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <Link to="/history" className="text-teal-600 text-sm hover:text-teal-500 font-medium">View all history &rarr;</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
