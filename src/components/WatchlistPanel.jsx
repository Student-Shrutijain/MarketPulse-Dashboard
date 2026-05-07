import { useState } from 'react';
import { usePortfolio } from '../context/PortfolioContext';
import { useAuth } from '../context/AuthContext';
import { Eye, X, TrendingUp, TrendingDown, Plus, Star, Check } from 'lucide-react';
import './Watchlist.css';

export default function WatchlistPanel() {
  const { user } = useAuth();
  const { watchlist, removeFromWatchlist, addToWatchlist } = usePortfolio();
  const [isAdding, setIsAdding] = useState(false);
  const [newSymbol, setNewSymbol] = useState('');

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newSymbol.trim()) return;
    
    let formattedSymbol = newSymbol.trim().toUpperCase();
    if (!formattedSymbol.includes('.')) {
      formattedSymbol += '.NS';
    }

    await addToWatchlist({ 
      symbol: formattedSymbol 
    });
    
    setNewSymbol('');
    setIsAdding(false);
  };

  return (
    <div className="watchlist-section" id="watchlist">
      <div className="section-header">
        <h2 className="section-title">
          <Eye size={20} style={{ color: 'var(--accent-primary)' }} />
          Watchlist
        </h2>
        {user && (
          <button 
            className="btn btn-secondary btn-sm"
            onClick={() => setIsAdding(!isAdding)}
          >
            {isAdding ? <X size={14} /> : <Plus size={14} />} {isAdding ? 'Cancel' : 'Add'}
          </button>
        )}
      </div>

      {isAdding && (
        <form onSubmit={handleAdd} className="watchlist-add-form animate-fade-in" style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
          <input 
            type="text" 
            className="input" 
            placeholder="Stock Symbol (e.g., INFY)" 
            value={newSymbol}
            onChange={(e) => setNewSymbol(e.target.value)}
            autoFocus
            style={{ flex: 1 }}
          />
          <button type="submit" className="btn btn-primary btn-sm">
            <Check size={14} /> Save
          </button>
        </form>
      )}

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
                {user && (
                  <button className="btn-icon watchlist-remove" onClick={() => removeFromWatchlist(item.symbol)}>
                    <X size={14} />
                  </button>
                )}
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
