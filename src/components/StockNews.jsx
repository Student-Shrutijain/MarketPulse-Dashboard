import { useState, useEffect } from 'react';
import axios from 'axios';
import { Newspaper, ExternalLink, Clock, Loader2, RefreshCw } from 'lucide-react';

export default function StockNews({ symbol, name }) {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastFetched, setLastFetched] = useState(null);

  const fetchNews = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`/api/news/${encodeURIComponent(symbol)}`);
      setNews(res.data || []);
      setLastFetched(new Date());
    } catch (err) {
      setError('Failed to load news. Please try again.');
      console.error('StockNews error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (symbol) fetchNews();
  }, [symbol]);

  const formatTime = (iso) => {
    try {
      return new Date(iso).toLocaleString('en-IN', {
        day: '2-digit', month: 'short',
        hour: '2-digit', minute: '2-digit',
      });
    } catch {
      return iso;
    }
  };

  return (
    <div className="stock-news glass-card-static" style={{ borderRadius: 16, overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-primary)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8, fontSize: '1rem' }}>
          <Newspaper size={18} style={{ color: 'var(--accent-primary)' }} />
          Latest News · <span style={{ color: 'var(--accent-primary)', fontFamily: 'monospace' }}>{symbol.replace('.NS','')}</span>
        </h3>
        <button
          onClick={fetchNews}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.8rem', padding: '4px 8px', borderRadius: 8, transition: 'color 0.2s' }}
          title="Refresh news"
        >
          <RefreshCw size={13} /> Refresh
        </button>
      </div>

      {/* Body */}
      <div style={{ maxHeight: 560, overflowY: 'auto', padding: '8px 0' }}>
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, padding: 40, color: 'var(--text-muted)' }}>
            <Loader2 size={20} className="spinner" /> Fetching live news…
          </div>
        ) : error ? (
          <div style={{ padding: 24, textAlign: 'center', color: 'var(--red)', fontSize: '0.9rem' }}>{error}</div>
        ) : news.length === 0 ? (
          <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)' }}>No news found for {name || symbol}.</div>
        ) : (
          news.map((item, i) => (
            <a
              key={item.id || i}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{ textDecoration: 'none', display: 'block' }}
            >
              <div
                className="news-item"
                style={{
                  padding: '12px 20px',
                  borderBottom: '1px solid var(--border-primary)',
                  cursor: 'pointer',
                  transition: 'background 0.15s',
                  display: 'flex',
                  gap: 12,
                  alignItems: 'flex-start',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-glass)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                {/* Thumbnail */}
                {item.thumbnail && (
                  <img
                    src={item.thumbnail}
                    alt=""
                    style={{ width: 64, height: 48, objectFit: 'cover', borderRadius: 8, flexShrink: 0, background: 'var(--bg-secondary)' }}
                    onError={e => e.target.style.display = 'none'}
                  />
                )}

                {/* Text */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: '0 0 6px', fontSize: '0.88rem', fontWeight: 500, lineHeight: 1.4, color: 'var(--text-primary)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {item.title}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    <span style={{ fontWeight: 600, color: 'var(--accent-primary)' }}>{item.source}</span>
                    <span>·</span>
                    <Clock size={10} />
                    <span>{formatTime(item.time)}</span>
                    <ExternalLink size={10} style={{ marginLeft: 'auto' }} />
                  </div>
                </div>
              </div>
            </a>
          ))
        )}
      </div>

      {lastFetched && !loading && (
        <div style={{ padding: '8px 20px', fontSize: '0.72rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border-primary)' }}>
          ✓ Updated {lastFetched.toLocaleTimeString('en-IN')} · Source: Yahoo Finance
        </div>
      )}
    </div>
  );
}
