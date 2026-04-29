import { useState } from 'react';
import { useMarket } from '../context/MarketContext';
import { Newspaper, ExternalLink, Shield, ShieldCheck, Clock, Filter } from 'lucide-react';
import './NewsFeed.css';

const FILTERS = ['All', 'Stocks', 'Commodities', 'Forex', 'Economy'];

export default function NewsFeed({ compact = false }) {
  const { news } = useMarket();
  const [activeFilter, setActiveFilter] = useState('All');

  const filtered = activeFilter === 'All'
    ? news
    : news.filter(n => n.category === activeFilter.toLowerCase());

  const getSentimentColor = (s) => {
    if (s === 'positive') return 'badge-green';
    if (s === 'negative') return 'badge-red';
    return 'badge-neutral';
  };

  const getSentimentDot = (s) => {
    if (s === 'positive') return 'var(--green)';
    if (s === 'negative') return 'var(--red)';
    return 'var(--text-muted)';
  };

  const displayNews = compact ? filtered.slice(0, 5) : filtered;

  return (
    <div className={`news-feed ${compact ? 'news-compact' : ''}`} id="news-feed">
      <div className="section-header">
        <h2 className="section-title">
          <Newspaper size={20} style={{ color: 'var(--accent-primary)' }} />
          {compact ? 'Latest News' : 'News Feed'}
        </h2>
        {!compact && (
          <div className="news-filters">
            {FILTERS.map(f => (
              <button
                key={f}
                className={`tab ${activeFilter === f ? 'active' : ''}`}
                onClick={() => setActiveFilter(f)}
              >
                {f}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="news-list">
        {displayNews.map((item, i) => (
          <article
            key={item.id}
            className="news-item glass-card"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <div className="news-sentiment-dot" style={{ background: getSentimentDot(item.sentiment) }} />
            <div className="news-content">
              <div className="news-top-row">
                <div className="news-meta">
                  <span className="news-source">{item.source}</span>
                  <span className="news-sep">·</span>
                  <span className="news-time">
                    <Clock size={11} /> 
                    {item.time.includes('T') ? new Date(item.time).toLocaleTimeString('en-US', {hour: '2-digit', minute: '2-digit'}) : item.time}
                  </span>
                </div>
                <div className="news-tags">
                  <span className={`badge badge-sm ${getSentimentColor(item.sentiment)}`}>
                    {item.sentiment}
                  </span>
                  {item.verified && (
                    <span className="badge badge-sm badge-blue">
                      <ShieldCheck size={10} /> Verified
                    </span>
                  )}
                </div>
              </div>
              <h3 className="news-title">{item.title}</h3>
              <a 
                href={item.url} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="news-read-more"
                style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
              >
                Read more <ExternalLink size={12} />
              </a>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
