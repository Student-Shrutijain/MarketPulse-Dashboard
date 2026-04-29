import { usePortfolio } from '../context/PortfolioContext';
import { Eye, X, TrendingUp, TrendingDown, Plus, Star } from 'lucide-react';
import './Watchlist.css';

export default function WatchlistPanel() {
  const { watchlist, removeFromWatchlist } = usePortfolio();

  return (
    <div className="watchlist-section" id="watchlist">
      <div className="section-header">
        <h2 className="section-title">
          <Eye size={20} style={{ color: 'var(--accent-primary)' }} />
          Watchlist
        </h2>
        <button className="btn btn-secondary btn-sm">
          <Plus size={14} /> Add
        </button>
      </div>

      <div className="watchlist-grid">
        {watchlist.map((item, i) => {
          const isUp = item.change >= 0;
          return (
            <div
              key={item.symbol}
              className="watchlist-item glass-card"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className="watchlist-item-header">
                <div className="watchlist-stock">
                  <Star size={14} className="watchlist-star" fill="var(--yellow)" color="var(--yellow)" />
                  <div>
                    <span className="watchlist-symbol font-mono">{item.symbol.replace('.NS', '')}</span>
                    <span className="watchlist-name">{item.name}</span>
                  </div>
                </div>
                <button className="btn-icon watchlist-remove" onClick={() => removeFromWatchlist(item.symbol)}>
                  <X size={14} />
                </button>
              </div>
              <div className="watchlist-price-row">
                <span className="watchlist-price font-mono">₹{item.price?.toLocaleString('en-IN', {maximumFractionDigits: 2})}</span>
                <span className={`watchlist-change ${isUp ? 'text-green' : 'text-red'}`}>
                  {isUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                  {isUp ? '+' : ''}{item.changePercent?.toFixed(2)}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
