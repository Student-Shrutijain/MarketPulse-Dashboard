import { Link } from 'react-router-dom';
import { useMarket } from '../context/MarketContext';
import { TrendingUp, TrendingDown } from 'lucide-react';
import MiniSparkline from './MiniSparkline';
import './HeroCards.css';

const CARD_CONFIG = {
  '^NSEI': { emoji: '📈', gradient: 'hero-gradient-indigo' },
  '^BSESN': { emoji: '🏛️', gradient: 'hero-gradient-purple' },
  'GC=F': { emoji: '🥇', gradient: 'hero-gradient-gold' },
  'USDINR=X': { emoji: '💱', gradient: 'hero-gradient-blue' },
  'EURINR=X': { emoji: '🇪🇺', gradient: 'hero-gradient-cyan' },
  'GBPINR=X': { emoji: '🇬🇧', gradient: 'hero-gradient-teal' },
};

export default function HeroCards() {
  const { indices } = useMarket();
  const items = Object.values(indices);

  return (
    <div className="hero-cards-grid" id="hero-cards">
      {items.map((item, i) => {
        const config = CARD_CONFIG[item.symbol] || { emoji: '📊', gradient: 'hero-gradient-indigo' };
        const isUp = item.change >= 0;

        return (
          <Link
            to={`/asset/${encodeURIComponent(item.symbol)}`}
            key={item.symbol}
            className={`hero-card glass-card ${config.gradient}`}
            style={{ animationDelay: `${i * 80}ms`, textDecoration: 'none', cursor: 'pointer' }}
          >
            <div className="hero-card-header">
              <div className="hero-card-label">
                <span className="hero-emoji">{config.emoji}</span>
                <span className="hero-name">{item.name}</span>
              </div>
              <div className={`hero-badge ${isUp ? 'badge-green' : 'badge-red'}`}>
                {isUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                {isUp ? '+' : ''}{item.changePercent}%
              </div>
            </div>

            <div className="hero-card-body">
              <span className={`hero-price font-mono ${item.flashDirection === 'up' ? 'price-flash-green' : item.flashDirection === 'down' ? 'price-flash-red' : ''}`}>
                {item.symbol.includes('INR') ? '' : '₹'}{item.price?.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
              </span>
              <span className={`hero-change ${isUp ? 'text-green' : 'text-red'}`}>
                {isUp ? '+' : ''}{item.change?.toFixed(2)}
              </span>
            </div>

            <div className="hero-sparkline">
              <MiniSparkline data={item.sparkline || []} color={isUp ? '#10b981' : '#ef4444'} />
            </div>

            <div className="hero-card-glow" />
          </Link>
        );
      })}
    </div>
  );
}
