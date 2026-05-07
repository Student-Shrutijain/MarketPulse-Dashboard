import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useMarket } from '../context/MarketContext';
import { Sun, Moon, Bell, Search, User, LogOut, ChevronDown, X, TrendingUp, TrendingDown } from 'lucide-react';
import './Navbar.css';

const STOCK_SUGGESTIONS = [
  { symbol: 'RELIANCE.NS', name: 'Reliance Industries' },
  { symbol: 'TCS.NS', name: 'Tata Consultancy Services' },
  { symbol: 'HDFCBANK.NS', name: 'HDFC Bank' },
  { symbol: 'INFY.NS', name: 'Infosys' },
  { symbol: 'ICICIBANK.NS', name: 'ICICI Bank' },
  { symbol: 'SBIN.NS', name: 'State Bank of India' },
  { symbol: 'WIPRO.NS', name: 'Wipro' },
  { symbol: 'TATAMOTORS.NS', name: 'Tata Motors' },
  { symbol: 'ADANIENT.NS', name: 'Adani Enterprises' },
  { symbol: 'BAJFINANCE.NS', name: 'Bajaj Finance' },
];

export default function Navbar({ onSearch }) {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const { indices } = useMarket();
  const navigate = useNavigate();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, text: 'RELIANCE.NS hit 52-week high at ₹2,960', time: '5 min ago', color: 'var(--green)' },
    { id: 2, text: 'TCS.NS dropped below SMA(50)', time: '12 min ago', color: 'var(--red)' },
    { id: 3, text: 'RBI Policy Update: Repo rate unchanged', time: '1 hr ago', color: 'var(--yellow)' }
  ]);
  const searchRef = useRef(null);
  const profileRef = useRef(null);
  const notifRef = useRef(null);
  const debounceTimer = useRef(null);

  // Real-time Yahoo Finance search via backend
  useEffect(() => {
    if (searchQuery.trim().length < 1) {
      setSuggestions([]);
      return;
    }
    clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const res = await fetch(`/api/market/search?q=${encodeURIComponent(searchQuery)}`);
        const data = await res.json();
        setSuggestions(data || []);
      } catch {
        setSuggestions([]);
      } finally {
        setSearchLoading(false);
      }
    }, 300);
  }, [searchQuery]);

  // Navigate to asset page on suggestion click
  const handleSelectSymbol = (symbol) => {
    setSearchOpen(false);
    setSearchQuery('');
    setSuggestions([]);
    navigate(`/asset/${encodeURIComponent(symbol)}`);
  };

  // Handle Enter key
  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter' && suggestions.length > 0) {
      handleSelectSymbol(suggestions[0].symbol);
    }
    if (e.key === 'Escape') {
      setSearchOpen(false);
      setSearchQuery('');
    }
  };


  useEffect(() => {
    const handleClick = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSearchOpen(false);
        setSearchQuery('');
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const tickerItems = Object.values(indices);

  return (
    <nav className="navbar" id="main-navbar">
      <div className="navbar-inner">
        {/* Logo */}
        <div className="navbar-logo">
          <div className="logo-icon">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <rect width="28" height="28" rx="8" fill="url(#logo-grad)" />
              <path d="M7 18L11 12L15 15L21 8" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              <defs>
                <linearGradient id="logo-grad" x1="0" y1="0" x2="28" y2="28">
                  <stop stopColor="#6366f1" />
                  <stop offset="1" stopColor="#8b5cf6" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <span className="logo-text">MarketPulse</span>
        </div>

        {/* Live Market Ticker */}
        <div className="navbar-ticker">
          {tickerItems.map(item => (
            <div key={item.symbol} className="ticker-item">
              <span className="ticker-name">{item.name}</span>
              <span className={`ticker-price font-mono ${item.flashDirection === 'up' ? 'price-flash-green' : item.flashDirection === 'down' ? 'price-flash-red' : ''}`}>
                {item.price?.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
              </span>
              <span className={`ticker-change ${item.change >= 0 ? 'text-green' : 'text-red'}`}>
                {item.change >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                {item.change >= 0 ? '+' : ''}{item.changePercent}%
              </span>
            </div>
          ))}
        </div>

        {/* Right Actions */}
        <div className="navbar-actions">
          {/* Search */}
          <div className="search-container" ref={searchRef}>
            <button className="btn-icon" onClick={() => setSearchOpen(!searchOpen)} id="search-toggle">
              <Search size={18} />
            </button>
            {searchOpen && (
              <div className="search-dropdown glass-card-static animate-fade-in">
                <div className="search-input-wrapper">
                  <Search size={16} className="search-icon" />
                  <input
                    type="text"
                    className="search-input"
                    placeholder="Search stocks, indices, ETFs..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={handleSearchKeyDown}
                    autoFocus
                  />
                  <button className="search-close" onClick={() => { setSearchOpen(false); setSearchQuery(''); }}>
                    <X size={14} />
                  </button>
                </div>
                {searchLoading && (
                  <div style={{ padding: '10px 16px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>🔍 Searching...</div>
                )}
                {!searchLoading && suggestions.length > 0 && (
                  <div className="search-suggestions">
                    {suggestions.map(s => (
                      <button key={s.symbol} className="search-suggestion" onClick={() => handleSelectSymbol(s.symbol)}>
                        <span className="suggestion-symbol font-mono">{s.symbol.replace('.NS','').replace('=X','').replace('=F','')}</span>
                        <span className="suggestion-name">{s.name}</span>
                        {s.exchange && <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginLeft: 'auto' }}>{s.exchange}</span>}
                      </button>
                    ))}
                  </div>
                )}
                {!searchLoading && searchQuery.length > 0 && suggestions.length === 0 && (
                  <div style={{ padding: '10px 16px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>No results for "{searchQuery}"</div>
                )}
              </div>
            )}
          </div>

          {/* Theme Toggle */}
          <button className="btn-icon theme-toggle" onClick={toggleTheme} id="theme-toggle" title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}>
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* Notifications */}
          <div className="notif-wrapper" ref={notifRef}>
            <button className="btn-icon" onClick={() => setNotifOpen(!notifOpen)} id="notif-toggle">
              <Bell size={18} />
              {notifications.length > 0 && <span className="notif-badge">{notifications.length}</span>}
            </button>
            {notifOpen && (
              <div className="notif-dropdown glass-card-static animate-fade-in">
                <div className="notif-header">
                  <span>Notifications</span>
                  {notifications.length > 0 && (
                    <button className="text-accent" style={{fontSize:'0.75rem'}} onClick={() => setNotifications([])}>
                      Mark all read
                    </button>
                  )}
                </div>
                {notifications.length > 0 ? (
                  notifications.map(notif => (
                    <div key={notif.id} className="notif-item">
                      <div className="notif-dot" style={{background: notif.color}} />
                      <div>
                        <p className="notif-text">{notif.text}</p>
                        <span className="notif-time">{notif.time}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="notif-item" style={{justifyContent: 'center', color: 'var(--text-muted)'}}>
                    <p>No new notifications</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Profile */}
          <div className="profile-wrapper" ref={profileRef}>
            <button className="profile-btn" onClick={() => setProfileOpen(!profileOpen)} id="profile-toggle">
              <div className="avatar">
                {user ? user.name?.charAt(0).toUpperCase() : 'G'}
              </div>
              <ChevronDown size={14} />
            </button>
            {profileOpen && (
              <div className="profile-dropdown glass-card-static animate-fade-in">
                <div className="profile-info">
                  <div className="avatar avatar-lg">
                    {user ? user.name?.charAt(0).toUpperCase() : 'G'}
                  </div>
                  <div>
                    <p className="profile-name">{user?.name || 'Guest User'}</p>
                    <p className="profile-email">{user?.email || 'Sign in for full access'}</p>
                  </div>
                </div>
                <div className="profile-divider" />
                {user ? (
                  <button className="profile-action" onClick={() => { logout(); setProfileOpen(false); }}>
                    <LogOut size={16} />
                    <span>Sign Out</span>
                  </button>
                ) : (
                  <button className="profile-action" onClick={() => { navigate('/login'); setProfileOpen(false); }}>
                    <User size={16} />
                    <span>Sign In</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
