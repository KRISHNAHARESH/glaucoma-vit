import React from 'react';
import { Link } from 'react-router-dom';
import { Eye, Activity, Brain, Shield } from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="bg-teal-50 py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
            AI-Based Glaucoma Detection <br className="hidden md:block"/> from Retinal Fundus Images
          </h1>
          <p className="mt-6 text-xl text-gray-500 max-w-3xl mx-auto">
            An academic deep-learning system using Multi-Scale CNN and Vision Transformer
          </p>
          <div className="mt-10 flex justify-center gap-4">
            <Link
              to="/analyze"
              className="px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700 md:text-lg"
            >
              Analyze Fundus Image
            </Link>
            <Link
              to="/signup"
              className="px-8 py-3 border border-transparent text-base font-medium rounded-md text-teal-700 bg-teal-100 hover:bg-teal-200 md:text-lg"
            >
              Get Started
            </Link>
          </div>
        </div>
      </div>

      {/* About Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-extrabold text-gray-900">Understanding Glaucoma</h2>
          <p className="mt-4 text-lg text-gray-500 max-w-2xl mx-auto">
            Glaucoma is a group of eye conditions that damage the optic nerve, crucial for good vision. Early detection is vital to prevent irreversible vision loss.
          </p>
        </div>
      </div>

      {/* How It Works */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-12">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-md bg-teal-500 text-white mb-4">
                <Eye />
              </div>
              <h3 className="text-lg font-medium text-gray-900">1. Preprocessing</h3>
              <p className="mt-2 text-sm text-gray-500">Image enhancement and normalization for optimal analysis.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-md bg-teal-500 text-white mb-4">
                <Activity />
              </div>
              <h3 className="text-lg font-medium text-gray-900">2. Multi-Scale CNN</h3>
              <p className="mt-2 text-sm text-gray-500">Extracting local and global features at different scales.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-md bg-teal-500 text-white mb-4">
                <Brain />
              </div>
              <h3 className="text-lg font-medium text-gray-900">3. Vision Transformer</h3>
              <p className="mt-2 text-sm text-gray-500">Capturing long-range dependencies for robust prediction.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-md bg-teal-500 text-white mb-4">
                <Shield />
              </div>
              <h3 className="text-lg font-medium text-gray-900">4. Explainable AI</h3>
              <p className="mt-2 text-sm text-gray-500">Grad-CAM visualization to interpret model decisions.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="bg-gray-100 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm text-gray-600 border border-gray-300 p-4 rounded bg-white shadow-sm inline-block">
            <strong>Medical Disclaimer:</strong> This system is developed for academic and research purposes only. It is not a medical diagnostic tool and should not replace evaluation by a qualified eye-care professional.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
