import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Eye, Mail, Lock, User, ArrowRight, ShieldCheck, AlertTriangle } from 'lucide-react';

const SignupPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register, login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      return setError('Password must be at least 6 characters long');
    }

    if (password !== confirmPassword) {
      return setError('Passwords do not match');
    }

    setLoading(true);
    try {
      await register(name, email, password, confirmPassword);
      try {
        await login(email, password);
        navigate('/dashboard');
      } catch {
        navigate('/login');
      }
    } catch (err) {
      const detail = err.response?.data?.detail;
      if (Array.isArray(detail)) {
        setError(detail.map(d => d.msg).join(', '));
      } else {
        setError(detail || 'Registration failed. Please check your information.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070708] flex flex-col justify-center pt-28 pb-16 px-4 sm:px-6 lg:px-8 text-white font-sans selection:bg-[#B96445] selection:text-white relative overflow-hidden">
      {/* Subtle ambient lighting glows to give frosted glass depth and refraction */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#B96445]/10 rounded-full blur-3xl pointer-events-none -z-10"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center relative z-10">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-white/[0.06] hover:bg-white/[0.12] text-amber-300 border border-white/20 hover:border-white/35 backdrop-blur-xl shadow-lg hover:shadow-[#B96445]/20 hover:scale-110 transition-all duration-300 mb-3 cursor-pointer">
          <Eye className="w-6 h-6 stroke-[2.2]" />
        </div>
        <h2 className="text-3xl font-extrabold text-white tracking-tight">
          Create an Account
        </h2>
        <p className="mt-1 text-xs text-white/70">
          Sign up to save scan histories on Glaucoma <span className="text-[#E89271] font-semibold hover:text-amber-200 transition-colors">ViT</span>
        </p>
      </div>

      <div className="mt-7 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0 relative z-10">
        <div className="bg-white/[0.04] hover:bg-white/[0.06] backdrop-blur-2xl py-8 px-6 sm:px-8 shadow-[0_16px_48px_0_rgba(0,0,0,0.5)] hover:shadow-[#B96445]/10 rounded-3xl border border-white/15 hover:border-white/25 transition-all duration-300">
          <form className="space-y-4" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-rose-950/40 border border-rose-800/80 text-rose-300 p-3 rounded-xl text-xs flex items-start gap-2 shadow-xs">
                <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                <p>{error}</p>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-white/80 uppercase tracking-wider mb-1">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Dr. Jane Smith"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-white/10 hover:border-white/25 focus:border-[#B96445] text-xs text-white focus:outline-none bg-white/[0.04] placeholder-white/40 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-white/80 uppercase tracking-wider mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="doctor@example.com"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-white/10 hover:border-white/25 focus:border-[#B96445] text-xs text-white focus:outline-none bg-white/[0.04] placeholder-white/40 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-white/80 uppercase tracking-wider mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-white/10 hover:border-white/25 focus:border-[#B96445] text-xs text-white focus:outline-none bg-white/[0.04] placeholder-white/40 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-white/80 uppercase tracking-wider mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-white/10 hover:border-white/25 focus:border-[#B96445] text-xs text-white focus:outline-none bg-white/[0.04] placeholder-white/40 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-full font-bold text-white text-xs shadow-md transition-all duration-300 ${
                loading 
                  ? 'bg-white/10 text-white/40 cursor-not-allowed' 
                  : 'bg-[#B96445] hover:bg-[#a65639] shadow-lg shadow-[#B96445]/25 hover:shadow-2xl hover:shadow-[#B96445]/50 hover:scale-[1.02] active:scale-[0.98] group'
              }`}
            >
              <span>{loading ? 'Creating Account...' : 'Register Account'}</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
            </button>
          </form>

          <div className="mt-5 pt-4 border-t border-white/10 text-center">
            <p className="text-xs text-white/60">
              Already have an account?{' '}
              <Link to="/login" className="font-bold text-amber-300 hover:text-amber-200 underline-offset-4 hover:underline transition-all">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
