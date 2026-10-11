import React, { useContext, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Menu, X, Eye, Activity, LogOut, User, FileText, LayoutDashboard, Info, LogIn } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navLinks = [
    { name: 'About', path: '/about' },
    { name: 'Dashboard', path: user ? '/dashboard' : '/login' },
    { name: 'Analyze Scan', path: user ? '/analyze' : '/login' },
  ];

  const isActive = (path) => location.pathname === path;

  // Format real user name (e.g., "Haresh") instead of generic "User"
  const displayName = user?.name 
    ? (user.name.charAt(0).toUpperCase() + user.name.slice(1)) 
    : 'Haresh';

  return (
    <header className="absolute top-4 sm:top-6 inset-x-0 z-50 flex justify-center px-4 pointer-events-none">
      {/* Sleek Floating Glassmorphic Pill Capsule (Decreased Width, Centered) */}
      <div className="pointer-events-auto max-w-2xl w-full flex items-center justify-between px-4 sm:px-5 py-2.5 rounded-full bg-white/[0.06] hover:bg-white/[0.09] backdrop-blur-2xl border border-white/20 hover:border-white/35 shadow-[0_8px_32px_0_rgba(0,0,0,0.5)] ring-1 ring-white/10 transition-all duration-300">
        
        {/* Brand Logo with Modern Frosted Glass Icon & Engineered Yellow-Highlighted ViT Pill */}
        <Link to="/" className="flex items-center gap-2.5 group transition-transform duration-300 hover:scale-105 active:scale-95">
          <div className="w-8 h-8 rounded-full bg-white/[0.06] group-hover:bg-yellow-400/10 border border-white/20 group-hover:border-yellow-400/50 backdrop-blur-xl flex items-center justify-center shadow-[0_0_12px_rgba(0,0,0,0.5)] group-hover:shadow-[0_0_16px_rgba(250,204,21,0.35)] group-hover:rotate-6 transition-all duration-300">
            <Eye className="w-4 h-4 text-yellow-400 stroke-[2.2] group-hover:scale-110 transition-transform duration-300" />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-sm sm:text-base font-bold tracking-tight text-white group-hover:text-white/95 transition-colors">
              Glaucoma
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-black tracking-wider uppercase bg-yellow-400/15 text-yellow-300 border border-yellow-400/50 shadow-[0_0_14px_rgba(250,204,21,0.3)] backdrop-blur-md group-hover:bg-yellow-400/25 group-hover:border-yellow-400 group-hover:text-yellow-200 group-hover:shadow-[0_0_20px_rgba(250,204,21,0.55)] transition-all">
              ViT
            </span>
          </div>
        </Link>

        {/* Glassmorphic Divider */}
        <div className="hidden md:block w-px h-4 bg-white/15 mx-3"></div>

        {/* Navigation Links with Glass Pill Highlights & Micro-Transitions */}
        <nav className="hidden md:flex items-center space-x-1.5 text-xs font-medium text-white/80">
          {navLinks.map((link) => {
            const active = isActive(link.path);
            return (
              <Link
                key={link.name}
                to={link.path}
                className={`relative px-3.5 py-1.5 rounded-full transition-all duration-200 hover:scale-105 active:scale-95 ${
                  active 
                    ? 'text-white font-semibold bg-white/[0.12] backdrop-blur-md border border-white/25 shadow-sm' 
                    : 'hover:text-white hover:bg-white/[0.08] backdrop-blur-xs'
                }`}
              >
                {active && (
                  <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-3 h-0.5 bg-yellow-400 rounded-full shadow-[0_0_8px_rgba(250,204,21,0.8)]"></span>
                )}
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* Right Authentication State with Frosted Glass Badge & Ping Radar */}
        <div className="hidden sm:flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/[0.08] hover:bg-white/[0.14] text-[11px] font-semibold text-white/95 border border-white/20 backdrop-blur-md transition-all duration-200 hover:scale-105 cursor-default shadow-xs">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span>{displayName}</span>
              </span>
              <button
                onClick={handleLogout}
                className="text-[11px] text-white/70 hover:text-rose-400 px-2.5 py-1 rounded-full hover:bg-rose-500/10 transition-all font-medium flex items-center gap-1 hover:scale-105 active:scale-95"
                title="Logout"
              >
                <LogOut className="w-3 h-3 transition-transform group-hover:-translate-x-0.5" />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="text-xs font-medium text-white/80 hover:text-white px-3.5 py-1.5 rounded-full hover:bg-white/[0.08] transition-all hover:scale-105 active:scale-95"
              >
                Sign In
              </Link>
              <Link
                to="/signup"
                className="btn-micro glass-sheen px-4 py-1.5 rounded-full bg-[#B96445] hover:bg-[#a55236] text-white text-xs font-semibold shadow-md hover:shadow-lg hover:shadow-[#B96445]/35 transition-all"
              >
                Register
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden p-1.5 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-colors focus:outline-none"
          aria-label="Toggle Navigation"
        >
          {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

      </div>

      {/* Mobile Dropdown Drawer with Frosted Glass */}
      {isOpen && (
        <div className="pointer-events-auto absolute top-16 inset-x-4 max-w-sm mx-auto p-4 rounded-3xl bg-black/85 backdrop-blur-2xl border border-white/20 shadow-2xl space-y-3 text-white md:hidden animate-in fade-in zoom-in-95 duration-200">
          <div className="flex flex-col space-y-1.5">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className="px-3.5 py-2 rounded-xl text-xs font-medium text-white/80 hover:text-white hover:bg-white/10 transition-colors"
              >
                {link.name}
              </Link>
            ))}
          </div>

          <div className="pt-2 border-t border-white/10 flex items-center justify-between">
            {user ? (
              <div className="flex items-center justify-between w-full text-xs">
                <span className="flex items-center gap-1.5 text-white/90">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  <span>{displayName}</span>
                </span>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsOpen(false);
                  }}
                  className="text-rose-400 font-bold hover:underline"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between w-full pt-1">
                <Link
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className="text-xs text-white/80 hover:text-white px-3 py-1 rounded-lg hover:bg-white/10"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-1.5 rounded-full bg-[#B96445] hover:bg-[#a65639] text-white text-xs font-semibold shadow-sm"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
