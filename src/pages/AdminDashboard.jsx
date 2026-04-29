import { useState } from 'react';
import { Shield, Users, Newspaper, Database, BarChart3, Check, X, Trash2, RefreshCw, Eye } from 'lucide-react';
import './Admin.css';

const DEMO_USERS = [
  { id: 1, name: 'Rahul Sharma', email: 'rahul@example.com', role: 'user', joined: '2026-03-15', lastActive: '2 hrs ago' },
  { id: 2, name: 'Priya Patel', email: 'priya@example.com', role: 'user', joined: '2026-03-20', lastActive: '5 min ago' },
  { id: 3, name: 'Amit Kumar', email: 'amit@example.com', role: 'user', joined: '2026-04-01', lastActive: '1 day ago' },
  { id: 4, name: 'Shreya Gupta', email: 'shreya@example.com', role: 'admin', joined: '2026-02-10', lastActive: 'Online' },
];

const DEMO_PENDING_NEWS = [
  { id: 101, title: 'Adani Group announces $5B investment in green energy', source: 'User Submit', status: 'pending' },
  { id: 102, title: 'Crypto regulations in India expected by Q3 2026', source: 'Unverified', status: 'pending' },
  { id: 103, title: 'Market crash predicted by renowned analyst', source: 'Social Media', status: 'flagged' },
];

const ANALYTICS = [
  { label: 'Total Users', value: '12,450', change: '+8.2%', icon: Users },
  { label: 'Active Today', value: '3,240', change: '+12.5%', icon: Eye },
  { label: 'News Published', value: '1,856', change: '+4.1%', icon: Newspaper },
  { label: 'API Calls Today', value: '45.2K', change: '-2.3%', icon: Database },
];

const TOP_STOCKS = [
  { symbol: 'RELIANCE', views: 8500 },
  { symbol: 'TCS', views: 6200 },
  { symbol: 'HDFCBANK', views: 5800 },
  { symbol: 'INFY', views: 4900 },
  { symbol: 'TATAMOTORS', views: 4200 },
];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [pendingNews, setPendingNews] = useState(DEMO_PENDING_NEWS);

  const approveNews = (id) => setPendingNews(prev => prev.filter(n => n.id !== id));
  const deleteNews = (id) => setPendingNews(prev => prev.filter(n => n.id !== id));

  const tabs = [
    { key: 'overview', label: 'Overview', icon: BarChart3 },
    { key: 'users', label: 'Users', icon: Users },
    { key: 'news', label: 'News Moderation', icon: Newspaper },
    { key: 'data', label: 'Data Controls', icon: Database },
  ];

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
            {ANALYTICS.map((stat, i) => (
              <div key={stat.label} className="admin-stat-card glass-card-static" style={{ animationDelay: `${i * 60}ms` }}>
                <div className="admin-stat-icon">
                  <stat.icon size={20} />
                </div>
                <div className="admin-stat-info">
                  <span className="admin-stat-label">{stat.label}</span>
                  <span className="admin-stat-value font-mono">{stat.value}</span>
                  <span className={`admin-stat-change ${stat.change.startsWith('+') ? 'text-green' : 'text-red'}`}>
                    {stat.change}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="admin-grid-2">
            <div className="glass-card-static" style={{ padding: '20px' }}>
              <h3 className="section-title" style={{ marginBottom: '16px' }}>
                <Eye size={18} style={{ color: 'var(--accent-primary)' }} />
                Most Viewed Stocks
              </h3>
              {TOP_STOCKS.map((stock, i) => (
                <div key={stock.symbol} className="admin-stock-row">
                  <span className="admin-rank">{i + 1}</span>
                  <span className="admin-stock-symbol font-mono">{stock.symbol}</span>
                  <div className="admin-stock-bar">
                    <div className="admin-stock-bar-fill" style={{ width: `${(stock.views / TOP_STOCKS[0].views) * 100}%` }} />
                  </div>
                  <span className="admin-stock-views font-mono">{stock.views.toLocaleString()}</span>
                </div>
              ))}
            </div>

            <div className="glass-card-static" style={{ padding: '20px' }}>
              <h3 className="section-title" style={{ marginBottom: '16px' }}>
                <Newspaper size={18} style={{ color: 'var(--yellow)' }} />
                Pending News ({pendingNews.length})
              </h3>
              {pendingNews.map(item => (
                <div key={item.id} className="admin-news-item">
                  <div>
                    <p className="admin-news-title">{item.title}</p>
                    <span className={`badge ${item.status === 'flagged' ? 'badge-red' : 'badge-yellow'}`}>
                      {item.status}
                    </span>
                  </div>
                  <div className="admin-news-actions">
                    <button className="btn-icon text-green" onClick={() => approveNews(item.id)} title="Approve">
                      <Check size={16} />
                    </button>
                    <button className="btn-icon text-red" onClick={() => deleteNews(item.id)} title="Delete">
                      <Trash2 size={16} />
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
        <div className="glass-card-static animate-fade-in" style={{ overflow: 'hidden' }}>
          <div className="holdings-table-wrapper">
            <table className="holdings-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Joined</th>
                  <th>Last Active</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {DEMO_USERS.map(u => (
                  <tr key={u.id} className="holding-row">
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
                      <span className={u.lastActive === 'Online' ? 'text-green' : 'text-muted'}>
                        {u.lastActive}
                      </span>
                    </td>
                    <td>
                      <button className="btn-icon"><Eye size={14} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* News Moderation */}
      {activeTab === 'news' && (
        <div className="animate-fade-in">
          <div className="glass-card-static" style={{ padding: '24px' }}>
            <h3 className="section-title" style={{ marginBottom: '16px' }}>Pending Review</h3>
            {pendingNews.length === 0 ? (
              <p className="text-muted" style={{ textAlign: 'center', padding: '40px', fontSize: '0.875rem' }}>
                ✅ All news items have been reviewed
              </p>
            ) : (
              pendingNews.map(item => (
                <div key={item.id} className="admin-news-item" style={{ padding: '16px' }}>
                  <div style={{ flex: 1 }}>
                    <p className="admin-news-title">{item.title}</p>
                    <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                      <span className="badge badge-neutral">{item.source}</span>
                      <span className={`badge ${item.status === 'flagged' ? 'badge-red' : 'badge-yellow'}`}>{item.status}</span>
                    </div>
                  </div>
                  <div className="admin-news-actions" style={{ gap: '8px' }}>
                    <button className="btn btn-sm btn-primary" onClick={() => approveNews(item.id)}>
                      <Check size={14} /> Approve & Verify
                    </button>
                    <button className="btn btn-sm btn-secondary text-red" onClick={() => deleteNews(item.id)}>
                      <Trash2 size={14} /> Delete
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
              { label: 'Market Data', desc: 'Refresh live stock prices & indices', lastRefresh: '30 sec ago' },
              { label: 'News Feed', desc: 'Re-fetch news from all sources', lastRefresh: '5 min ago' },
              { label: 'Currency Rates', desc: 'Update forex exchange rates', lastRefresh: '1 min ago' },
              { label: 'Gold Prices', desc: 'Refresh gold & commodity rates', lastRefresh: '2 min ago' },
            ].map(item => (
              <div key={item.label} className="glass-card-static" style={{ padding: '20px' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '4px' }}>{item.label}</h3>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '12px' }}>{item.desc}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Last: {item.lastRefresh}</span>
                  <button className="btn btn-secondary btn-sm">
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
