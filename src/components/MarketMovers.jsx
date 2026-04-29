import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useMarket } from '../context/MarketContext';
import { TrendingUp, TrendingDown, Flame, ChevronLeft, ChevronRight } from 'lucide-react';
import './MarketMovers.css';

export default function MarketMovers() {
  const { gainers, losers, mostActive } = useMarket();
  const [activeTab, setActiveTab] = useState('gainers');
  const scrollRef = useRef(null);

  const tabs = [
    { key: 'gainers', label: 'Top Gainers', icon: TrendingUp, color: 'var(--green)' },
    { key: 'losers', label: 'Top Losers', icon: TrendingDown, color: 'var(--red)' },
    { key: 'active', label: 'Most Active', icon: Flame, color: 'var(--yellow)' },
  ];

  const data = activeTab === 'gainers' ? gainers : activeTab === 'losers' ? losers : mostActive;

  const scroll = (dir) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: dir * 280, behavior: 'smooth' });
    }
  };

  const formatVolume = (vol) => {
    if (vol >= 10000000) return `${(vol / 10000000).toFixed(1)}Cr`;
    if (vol >= 100000) return `${(vol / 100000).toFixed(1)}L`;
    if (vol >= 1000) return `${(vol / 1000).toFixed(1)}K`;
    return vol;
  };

  return (
    <div className="movers-section" id="market-movers">
      <div className="section-header">
        <h2 className="section-title">
          <Flame size={20} style={{ color: 'var(--yellow)' }} />
          Live Market Movers
        </h2>
        <div className="movers-nav">
          <button className="btn-icon" onClick={() => scroll(-1)}><ChevronLeft size={18} /></button>
          <button className="btn-icon" onClick={() => scroll(1)}><ChevronRight size={18} /></button>
        </div>
      </div>

      <div className="tabs" style={{ marginBottom: '16px', width: 'fit-content' }}>
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

      <div className="movers-scroll" ref={scrollRef}>
        {data.map((item, i) => {
          const isUp = item.change >= 0;
          return (
            <Link
              to={`/asset/${encodeURIComponent(item.symbol)}`}
              key={item.symbol}
              className={`mover-card glass-card ${item.flashDirection === 'up' ? 'price-flash-green' : item.flashDirection === 'down' ? 'price-flash-red' : ''}`}
              style={{ animationDelay: `${i * 60}ms`, textDecoration: 'none', cursor: 'pointer' }}
            >
              <div className="mover-header">
                <div>
                  <span className="mover-symbol font-mono">{item.symbol.replace('.NS', '')}</span>
                  <span className="mover-name">{item.name}</span>
                </div>
                <div className={`mover-badge ${isUp ? 'badge-green' : 'badge-red'}`}>
                  {isUp ? '+' : ''}{item.changePercent?.toFixed(2)}%
                </div>
              </div>
              <div className="mover-price-row">
                <span className="mover-price font-mono">₹{item.price?.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                <span className={`mover-change ${isUp ? 'text-green' : 'text-red'}`}>
                  {isUp ? '+' : ''}₹{item.change?.toFixed(2)}
                </span>
              </div>
              <div className="mover-volume">
                <span className="mover-vol-label">Vol</span>
                <span className="mover-vol-value font-mono">{formatVolume(item.volume)}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
