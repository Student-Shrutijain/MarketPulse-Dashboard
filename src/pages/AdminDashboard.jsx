import { useState, useEffect } from 'react';
import axios from 'axios';
import { Shield, Users, Newspaper, Database, BarChart3, Check, X, Trash2, RefreshCw, Eye, Briefcase, Star } from 'lucide-react';
import { useMarket } from '../context/MarketContext';
import socket from '../services/socket';
import './Admin.css';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [pendingNews, setPendingNews] = useState([]);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const { mostActive, fetchMarketData } = useMarket();

  useEffect(() => {
    // Join admin room for real-time stats
    socket.emit('join-admin');
    
    socket.on('stats-update', (data) => {
      setStats(data);
    });

    const fetchInitialData = async () => {
      try {
        const [statsRes, usersRes, newsRes] = await Promise.all([
          axios.get('/api/admin/stats'),
          axios.get('/api/admin/users'),
          axios.get('/api/admin/news/pending')
        ]);
        setStats(statsRes.data);
        setUsers(usersRes.data);
        setPendingNews(newsRes.data);
      } catch (e) {
        console.error('Error fetching admin data', e);
      }
    };
    fetchInitialData();

    return () => {
      socket.off('stats-update');
    };
  }, []);

  const moderateNews = async (id, status) => {
    try {
      await axios.post('/api/admin/news/moderate', { id, status });
      setPendingNews(prev => prev.filter(n => n._id !== id));
    } catch (err) {
      console.error('Failed to moderate news', err);
    }
  };

  const tabs = [
    { key: 'overview', label: 'Overview', icon: BarChart3 },
    { key: 'users', label: 'Users', icon: Users },
    { key: 'news', label: 'News Moderation', icon: Newspaper },
    { key: 'data', label: 'Data Controls', icon: Database },
  ];

  const analyticsDisplay = stats ? [
    { label: 'Total Users', value: stats.totalUsers, change: '+1', icon: Users },
    { label: 'Active Today', value: stats.activeToday, change: '+1', icon: Eye },
    { label: 'News Published', value: stats.newsPublished, change: '+4.1%', icon: Newspaper },
    { label: 'API Calls (Real-time)', value: stats.apiCalls?.toLocaleString() || '0', change: 'LIVE', icon: Database },
  ] : [];

  return (
    <div className="page-container animate-fade-in">
      <div className="admin-header">
        <h1 className="dashboard-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Shield size={28} style={{ color: 'var(--accent-primary)' }} />
          Admin Dashboard
        </h1>
      </div>

      <div className="tabs" style={{ marginBottom: '24px', width: 'fit-content' }}>
        {tabs.map(tab => (
          <button
            key={tab.key}
            className={`tab ${activeTab === tab.key ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            <tab.icon size={14} style={{ marginRight: '4px' }} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview */}
      {activeTab === 'overview' && (
        <div className="admin-overview animate-fade-in">
          <div className="admin-stats-grid">
            {stats ? analyticsDisplay.map((stat, i) => (
              <div key={stat.label} className="admin-stat-card glass-card-static" style={{ animationDelay: `${i * 60}ms` }}>
                <div className="admin-stat-icon">
                  <stat.icon size={20} />
                </div>
                <div className="admin-stat-info">
                  <span className="admin-stat-label">{stat.label}</span>
                  <span className="admin-stat-value font-mono">{stat.value}</span>
                  <span className={`admin-stat-change ${stat.change.startsWith('+') || stat.change === 'LIVE' ? 'text-green' : 'text-red'}`}>
                    {stat.change}
                  </span>
                </div>
              </div>
            )) : (
              <p className="text-muted">Loading stats...</p>
            )}
          </div>

          <div className="admin-grid-2">
            <div className="glass-card-static" style={{ padding: '20px' }}>
              <h3 className="section-title" style={{ marginBottom: '16px' }}>
                <Eye size={18} style={{ color: 'var(--accent-primary)' }} />
                Most Active Stocks
              </h3>
              {mostActive && mostActive.length > 0 ? mostActive.map((stock, i) => (
                <div key={stock.symbol} className="admin-stock-row">
                  <span className="admin-rank">{i + 1}</span>
                  <span className="admin-stock-symbol font-mono">{stock.symbol.replace('.NS', '')}</span>
                  <div className="admin-stock-bar">
                    <div className="admin-stock-bar-fill" style={{ width: `${(stock.volume / mostActive[0].volume) * 100}%` }} />
                  </div>
                  <span className="admin-stock-views font-mono">{(stock.volume / 1000000).toFixed(1)}M Vol</span>
                </div>
              )) : (
                <p className="text-muted">Loading market data...</p>
              )}
            </div>

            <div className="glass-card-static" style={{ padding: '20px' }}>
              <h3 className="section-title" style={{ marginBottom: '16px' }}>
                <Newspaper size={18} style={{ color: 'var(--yellow)' }} />
                Pending News ({pendingNews.length})
              </h3>
              {pendingNews.map(item => (
                <div key={item._id} className="admin-news-item">
                  <div>
                    <p className="admin-news-title">{item.title}</p>
                    <span className="badge badge-yellow">
                      {item.submittedBy?.name || 'User'}
                    </span>
                  </div>
                  <div className="admin-news-actions">
                    <button className="btn-icon text-green" onClick={() => moderateNews(item._id, 'approved')} title="Approve">
                      <Check size={16} />
                    </button>
                    <button className="btn-icon text-red" onClick={() => moderateNews(item._id, 'rejected')} title="Reject">
                      <X size={16} />
                    </button>
                  </div>
                </div>
              ))}
              {pendingNews.length === 0 && (
                <p className="text-muted" style={{ textAlign: 'center', padding: '20px', fontSize: '0.875rem' }}>
                  All caught up! No pending news.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Users */}
      {activeTab === 'users' && (
        <div className="admin-users-view animate-fade-in">
          <div className="glass-card-static" style={{ overflow: 'hidden', marginBottom: '24px' }}>
            <div className="holdings-table-wrapper">
              <table className="holdings-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Joined</th>
                    <th>Portfolio</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length > 0 ? users.map(u => (
                    <tr key={u.id} className={`holding-row ${selectedUser?.id === u.id ? 'row-selected' : ''}`}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div className="avatar" style={{ width: '30px', height: '30px', fontSize: '0.7rem' }}>
                            {u.name.charAt(0)}
                          </div>
                          <span style={{ fontWeight: 600 }}>{u.name}</span>
                        </div>
                      </td>
                      <td style={{ color: 'var(--text-secondary)' }}>{u.email}</td>
                      <td>
                        <span className={`badge ${u.role === 'admin' ? 'badge-blue' : 'badge-neutral'}`}>{u.role}</span>
                      </td>
                      <td style={{ color: 'var(--text-muted)' }}>{u.joined}</td>
                      <td>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          {u.holdings?.length || 0} Assets · {u.watchlist?.length || 0} Watch
                        </span>
                      </td>
                      <td>
                        <button 
                          className={`btn-icon ${selectedUser?.id === u.id ? 'text-accent' : ''}`}
                          onClick={() => setSelectedUser(u)}
                          title="View Details"
                        >
                          <Eye size={14} />
                        </button>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="6" className="text-center" style={{ padding: '20px' }}>No users found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {selectedUser && (
            <div className="user-detail-panel glass-card-static animate-slide-up" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 className="section-title">
                  <Briefcase size={18} style={{ color: 'var(--accent-primary)' }} />
                  {selectedUser.name}'s Real-time Portfolio
                </h3>
                <button className="btn-icon" onClick={() => setSelectedUser(null)}><X size={18} /></button>
              </div>
              
              <div className="grid-2">
                <div>
                  <h4 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Briefcase size={14} /> Current Holdings
                  </h4>
                  {selectedUser.holdings?.length > 0 ? (
                    <div className="admin-mini-list">
                      {selectedUser.holdings.map(h => (
                        <div key={h.symbol} className="admin-mini-item">
                          <span className="font-mono" style={{ fontWeight: 600 }}>{h.symbol.replace('.NS','')}</span>
                          <span className="text-muted">{h.qty} shares</span>
                          <span className="font-mono" style={{ marginLeft: 'auto' }}>₹{h.currentPrice.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  ) : <p className="text-muted" style={{ fontSize: '0.85rem' }}>No holdings found.</p>}
                </div>
                <div>
                  <h4 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Star size={14} /> Watchlist
                  </h4>
                  {selectedUser.watchlist?.length > 0 ? (
                    <div className="admin-mini-list">
                      {selectedUser.watchlist.map(w => (
                        <div key={w.symbol} className="admin-mini-item">
                          <span className="font-mono" style={{ fontWeight: 600 }}>{w.symbol.replace('.NS','')}</span>
                          <span className="text-muted">{w.name}</span>
                          <span className="font-mono" style={{ marginLeft: 'auto' }}>₹{w.price.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  ) : <p className="text-muted" style={{ fontSize: '0.85rem' }}>Watchlist is empty.</p>}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* News Moderation */}
      {activeTab === 'news' && (
        <div className="animate-fade-in">
          <div className="glass-card-static" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 className="section-title" style={{ margin: 0 }}>Pending Review</h3>
              <button 
                className="btn btn-secondary btn-sm" 
                onClick={async () => {
                  try {
                    const res = await axios.post('/api/admin/news/sync');
                    const newsRes = await axios.get('/api/admin/news/pending');
                    setPendingNews(newsRes.data);
                    alert(`Sync successful! Found ${res.data.count} new items.`);
                  } catch (e) {
                    alert('Failed to sync news');
                  }
                }}
              >
                <RefreshCw size={14} /> Sync External News
              </button>
            </div>
            {pendingNews.length === 0 ? (
              <p className="text-muted" style={{ textAlign: 'center', padding: '40px', fontSize: '0.875rem' }}>
                ✅ All news items have been reviewed
              </p>
            ) : (
              pendingNews.map(item => (
                <div key={item._id} className="admin-news-item" style={{ padding: '16px' }}>
                  <div style={{ flex: 1 }}>
                    <p className="admin-news-title">{item.title}</p>
                    <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                      <span className="badge badge-neutral">{item.submittedBy?.name || 'User'} ({item.submittedBy?.email})</span>
                      {item.symbol && <span className="badge badge-blue">{item.symbol}</span>}
                    </div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '8px', lineHeight: 1.5 }}>
                      {item.content}
                    </p>
                  </div>
                  <div className="admin-news-actions" style={{ gap: '8px' }}>
                    <button className="btn btn-sm btn-primary" onClick={() => moderateNews(item._id, 'approved')}>
                      <Check size={14} /> Approve & Publish
                    </button>
                    <button className="btn btn-sm btn-secondary text-red" onClick={() => moderateNews(item._id, 'rejected')}>
                      <Trash2 size={14} /> Reject
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Data Controls */}
      {activeTab === 'data' && (
        <div className="admin-data-controls animate-fade-in">
          <div className="grid-2">
            {[
              { label: 'Market Data', desc: 'Refresh live stock prices & indices', lastRefresh: '30 sec ago', action: fetchMarketData },
              { label: 'News Feed', desc: 'Re-fetch news from all sources', lastRefresh: '5 min ago', action: fetchMarketData },
              { label: 'Currency Rates', desc: 'Update forex exchange rates', lastRefresh: '1 min ago', action: fetchMarketData },
              { label: 'Gold Prices', desc: 'Refresh gold & commodity rates', lastRefresh: '2 min ago', action: fetchMarketData },
            ].map(item => (
              <div key={item.label} className="glass-card-static" style={{ padding: '20px' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '4px' }}>{item.label}</h3>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '12px' }}>{item.desc}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Last: {item.lastRefresh}</span>
                  <button className="btn btn-secondary btn-sm" onClick={item.action}>
                    <RefreshCw size={14} /> Refresh
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
