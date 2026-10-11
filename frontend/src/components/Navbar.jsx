import React, { useContext, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Menu, X, Eye, Activity, LogOut, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';

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
    { name: 'Home', path: '/' },
    { name: 'Analyze', path: '/analyze' },
    { name: 'How It Works', path: '/#how-it-works', isAnchor: true },
    { name: 'About Model', path: '/about' },
  ];

  const handleNavClick = (link) => {
    setIsOpen(false);
    if (link.isAnchor) {
      if (location.pathname !== '/') {
        navigate('/' + link.path.replace('/', ''));
      } else {
        const el = document.getElementById(link.path.replace('/#', ''));
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }
    }
  };

  const isActive = (path) => {
    if (path.includes('#')) return false;
    return location.pathname === path;
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          
          {/* Brand Logo & Academic Tagline */}
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-teal-50 text-teal-600 border border-teal-200 shadow-sm group-hover:scale-105 transition-transform duration-200">
                <Eye className="w-5 h-5 stroke-[2.4]" />
                <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-teal-500"></span>
                </span>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold tracking-tight text-slate-900">
                    Glaucoma<span className="text-teal-600 font-extrabold">-ViT</span>
                  </span>
                  <span className="hidden sm:inline-flex px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase bg-teal-50 text-teal-700 border border-teal-200 rounded-md">
                    Medical AI
                  </span>
                </div>
                <span className="text-[11px] font-medium text-slate-500 hidden md:block">
                  Multi-Scale CNN &bull; Vision Transformer
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {navLinks.map((link) => {
              if (link.isAnchor) {
                return (
                  <a
                    key={link.name}
                    href={link.path}
                    onClick={(e) => {
                      if (location.pathname === '/') {
                        e.preventDefault();
                        const id = link.path.replace('/#', '');
                        const elem = document.getElementById(id);
                        if (elem) elem.scrollIntoView({ behavior: 'smooth' });
                      }
                    }}
                    className="px-3.5 py-2 rounded-lg text-sm font-semibold text-slate-600 hover:text-teal-700 hover:bg-slate-50 transition-colors"
                  >
                    {link.name}
                  </a>
                );
              }

              const active = isActive(link.path);
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-all duration-150 ${
                    active
                      ? 'bg-teal-50 text-teal-700 border border-teal-200 shadow-sm'
                      : 'text-slate-600 hover:text-teal-700 hover:bg-slate-50'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}

            {user && (
              <Link
                to="/history"
                className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-all duration-150 ${
                  location.pathname === '/history'
                    ? 'bg-teal-50 text-teal-700 border border-teal-200 shadow-sm'
                    : 'text-slate-600 hover:text-teal-700 hover:bg-slate-50'
                }`}
              >
                Scan History
              </Link>
            )}
          </nav>

          {/* Right Action & Authentication */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              to="/analyze"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 shadow-sm hover:shadow transition-all duration-150"
            >
              <Activity className="w-4 h-4" />
              <span>Analyze Retinal Image</span>
            </Link>

            {user ? (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                <span className="text-xs font-semibold text-slate-700 px-2 py-1 rounded bg-slate-100">
                  {user.name || 'Researcher'}
                </span>
                <button
                  onClick={handleLogout}
                  className="p-1.5 text-slate-500 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-2.5 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
              >
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile hamburger */}
          <div className="flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none"
              aria-label="Toggle Navigation Menu"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-5 space-y-2 shadow-lg">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.path}
              onClick={(e) => {
                if (link.isAnchor && location.pathname === '/') {
                  e.preventDefault();
                  handleNavClick(link);
                } else {
                  setIsOpen(false);
                }
              }}
              className="block px-3 py-2.5 rounded-lg text-base font-semibold text-slate-700 hover:text-teal-700 hover:bg-teal-50"
            >
              {link.name}
            </a>
          ))}

          {user && (
            <Link
              to="/history"
              onClick={() => setIsOpen(false)}
              className="block px-3 py-2.5 rounded-lg text-base font-semibold text-slate-700 hover:text-teal-700 hover:bg-teal-50"
            >
              Scan History
            </Link>
          )}

          <div className="pt-3 border-t border-slate-200 space-y-2">
            <Link
              to="/analyze"
              onClick={() => setIsOpen(false)}
              className="block text-center w-full px-4 py-2.5 rounded-lg text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700"
            >
              Analyze Retinal Image
            </Link>

            {user ? (
              <div className="flex items-center justify-between px-3 py-2 text-xs text-slate-600">
                <span>Signed in as <strong>{user.name}</strong></span>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsOpen(false);
                  }}
                  className="text-rose-600 font-bold hover:underline"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                onClick={() => setIsOpen(false)}
                className="block text-center px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Sign In to Save History
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
