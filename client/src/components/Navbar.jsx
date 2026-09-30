import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, User, LogOut, Settings, Menu, X, Tv, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Logo from './Logo';

export default function Navbar() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('home');

  const handleLogout = async () => {
    setDropdownOpen(false);
    await logout();
    navigate('/');
  };

  const isRoomPage = location.pathname.startsWith('/room/');

  useEffect(() => {
    if (location.pathname === '/home') {
      setActiveTab('lounge');
    } else if (location.pathname === '/') {
      if (location.hash === '#how-it-works') {
        setActiveTab('how-it-works');
      } else if (location.hash === '#features') {
        setActiveTab('features');
      } else {
        setActiveTab('home');
      }
    } else {
      setActiveTab('');
    }
  }, [location.pathname, location.hash]);

  useEffect(() => {
    if (location.pathname !== '/') return;

    const handleScroll = () => {
      const scrollY = window.scrollY;
      const howItWorksEl = document.getElementById('how-it-works');
      const featuresEl = document.getElementById('features');

      if (featuresEl && scrollY >= featuresEl.offsetTop - 180) {
        setActiveTab('features');
      } else if (howItWorksEl && scrollY >= howItWorksEl.offsetTop - 180) {
        setActiveTab('how-it-works');
      } else if (scrollY < 300) {
        setActiveTab('home');
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [location.pathname]);

  if (isRoomPage) {
    return null;
  }

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const scrollToSection = (e, sectionId) => {
    if (location.pathname !== '/') {
      return;
    }
    e.preventDefault();
    setActiveTab(sectionId);
    if (sectionId === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      window.history.pushState(null, '', '/');
    } else {
      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
        window.history.pushState(null, '', `#${sectionId}`);
      }
    }
  };

  return (
    <nav className="sticky top-0 z-40 w-full bg-[#081325]/85 backdrop-blur-xl border-b border-watchmate-border shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo (Left) */}
          <Link to={currentUser ? "/home" : "/"} className="flex items-center gap-2 group shrink-0">
            <Logo size="md" />
          </Link>

          {/* Centered Navigation Links */}
          <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center gap-8 text-sm font-medium">
            {/* Home */}
            <Link
              to="/"
              onClick={(e) => scrollToSection(e, 'home')}
              className={`relative py-1 transition-colors ${
                activeTab === 'home' ? 'text-watchmate-text font-bold' : 'text-watchmate-secondaryText hover:text-watchmate-cyan'
              }`}
            >
              Home
              {activeTab === 'home' && (
                <motion.div
                  layoutId="navbar-indicator"
                  className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-watchmate-primary via-watchmate-cyan to-watchmate-gold rounded-full shadow-[0_0_10px_rgba(56,189,248,0.9)]"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
            </Link>

            {/* How it works */}
            <a
              href="/#how-it-works"
              onClick={(e) => scrollToSection(e, 'how-it-works')}
              className={`relative py-1 transition-colors ${
                activeTab === 'how-it-works' ? 'text-watchmate-text font-bold' : 'text-watchmate-secondaryText hover:text-watchmate-cyan'
              }`}
            >
              How it works
              {activeTab === 'how-it-works' && (
                <motion.div
                  layoutId="navbar-indicator"
                  className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-watchmate-primary via-watchmate-cyan to-watchmate-gold rounded-full shadow-[0_0_10px_rgba(56,189,248,0.9)]"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
            </a>

            {/* Features */}
            <a
              href="/#features"
              onClick={(e) => scrollToSection(e, 'features')}
              className={`relative py-1 transition-colors ${
                activeTab === 'features' ? 'text-watchmate-text font-bold' : 'text-watchmate-secondaryText hover:text-watchmate-cyan'
              }`}
            >
              Features
              {activeTab === 'features' && (
                <motion.div
                  layoutId="navbar-indicator"
                  className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-watchmate-primary via-watchmate-cyan to-watchmate-gold rounded-full shadow-[0_0_10px_rgba(56,189,248,0.9)]"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
            </a>

            {/* My Lounge (if logged in) */}
            {currentUser && (
              <Link
                to="/home"
                onClick={() => setActiveTab('lounge')}
                className={`relative py-1 transition-colors ${
                  activeTab === 'lounge' ? 'text-watchmate-text font-bold' : 'text-watchmate-secondaryText hover:text-watchmate-cyan'
                }`}
              >
                My Lounge
                {activeTab === 'lounge' && (
                  <motion.div
                    layoutId="navbar-indicator"
                    className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-watchmate-primary via-watchmate-cyan to-watchmate-gold rounded-full shadow-[0_0_10px_rgba(56,189,248,0.9)]"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </Link>
            )}
          </div>

          {/* Right Action Area */}
          <div className="hidden md:flex items-center gap-3.5 shrink-0">
            <Link
              to="/join"
              className="px-4 py-2 rounded-xl text-sm font-semibold text-watchmate-secondaryText bg-watchmate-surface/80 border border-watchmate-border hover:border-watchmate-cyan hover:text-white transition-all shadow-sm"
            >
              Join Room
            </Link>

            <Link
              to="/create"
              className="btn-primary flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold shadow-blue-glow transition-all hover:scale-[1.03] active:scale-[0.98]"
            >
              <Plus className="w-4 h-4 text-white" />
              <span>Create Room</span>
            </Link>

            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 p-1 rounded-full border border-watchmate-border hover:border-watchmate-cyan shadow-sm transition-all"
                >
                  {currentUser.avatar ? (
                    <img src={currentUser.avatar} alt={currentUser.name} className="w-8 h-8 rounded-full object-cover" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-watchmate-elevated flex items-center justify-center text-xs font-bold text-watchmate-cyan border border-watchmate-cyan/30">
                      {getInitials(currentUser.name)}
                    </div>
                  )}
                </button>

                {dropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
                    <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-watchmate-elevated border border-watchmate-borderLight shadow-2xl py-2 z-20">
                      <div className="px-4 py-2 border-b border-watchmate-border">
                        <p className="text-sm font-bold text-watchmate-text truncate">{currentUser.name}</p>
                        <p className="text-xs text-watchmate-muted truncate">{currentUser.email || 'Guest User'}</p>
                      </div>

                      <Link
                        to="/home"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-sm text-watchmate-text hover:bg-watchmate-surface transition-colors"
                      >
                        <Tv className="w-4 h-4 text-watchmate-cyan" />
                        <span>My Lounge</span>
                      </Link>

                      <Link
                        to="/settings"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-sm text-watchmate-text hover:bg-watchmate-surface transition-colors"
                      >
                        <Settings className="w-4 h-4 text-watchmate-muted" />
                        <span>Settings</span>
                      </Link>

                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-watchmate-error hover:bg-watchmate-surface transition-colors text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign out</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="px-3 py-2 rounded-xl text-sm font-semibold text-watchmate-secondaryText hover:text-watchmate-cyan transition-colors"
              >
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center gap-2">
            <Link
              to="/create"
              className="btn-primary px-3 py-1.5 rounded-lg text-xs font-semibold"
            >
              Create
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-watchmate-secondaryText hover:text-watchmate-text hover:bg-watchmate-surface"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-watchmate-surface border-b border-watchmate-border px-4 pt-2 pb-6 space-y-3">
          <Link
            to="/"
            onClick={(e) => { setMobileMenuOpen(false); scrollToSection(e, 'home'); }}
            className={`block py-2 text-sm font-medium ${activeTab === 'home' ? 'text-watchmate-cyan font-bold' : 'text-watchmate-text'}`}
          >
            Home
          </Link>
          <a
            href="/#how-it-works"
            onClick={(e) => { setMobileMenuOpen(false); scrollToSection(e, 'how-it-works'); }}
            className={`block py-2 text-sm font-medium ${activeTab === 'how-it-works' ? 'text-watchmate-cyan font-bold' : 'text-watchmate-text'}`}
          >
            How it works
          </a>
          <a
            href="/#features"
            onClick={(e) => { setMobileMenuOpen(false); scrollToSection(e, 'features'); }}
            className={`block py-2 text-sm font-medium ${activeTab === 'features' ? 'text-watchmate-cyan font-bold' : 'text-watchmate-text'}`}
          >
            Features
          </a>
          <Link
            to="/join"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-medium text-watchmate-text"
          >
            Join a Room
          </Link>
          <Link
            to="/create"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-medium text-watchmate-text"
          >
            Create a Room
          </Link>
          {currentUser ? (
            <>
              <Link
                to="/home"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-sm font-medium text-watchmate-text"
              >
                My Lounge
              </Link>
              <Link
                to="/settings"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-sm font-medium text-watchmate-text"
              >
                Settings
              </Link>
              <button
                onClick={() => { setMobileMenuOpen(false); handleLogout(); }}
                className="block w-full text-left py-2 text-sm font-medium text-watchmate-error"
              >
                Sign Out
              </button>
            </>
          ) : (
            <Link
              to="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-sm font-medium text-watchmate-cyan"
            >
              Sign In / Register
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
