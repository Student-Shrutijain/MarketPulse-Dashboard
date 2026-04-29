import { useMarket } from '../context/MarketContext';
import HeroCards from '../components/HeroCards';
import MarketMovers from '../components/MarketMovers';
import NewsFeed from '../components/NewsFeed';
import SectorHeatmap from '../components/SectorHeatmap';
import StockChart from '../components/StockChart';
import { Clock, Zap, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import './Dashboard.css';

export default function Dashboard() {
  const { lastUpdated, marketStatus } = useMarket();

  return (
    <div className="page-container animate-fade-in">
      {/* Page Header */}
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Market Overview</h1>
          <p className="dashboard-subtitle">
            <Clock size={14} />
            Last updated: {lastUpdated.toLocaleTimeString('en-IN')}
            <span className="market-status-badge">
              <span className="live-dot" />
              {marketStatus === 'open' ? 'Market Open' : 'Market Closed'}
            </span>
          </p>
        </div>
        <div className="dashboard-quick-actions">
          <Link to="/insights" className="btn btn-secondary btn-sm">
            <Zap size={14} /> Insights
          </Link>
          <Link to="/charts" className="btn btn-primary btn-sm">
            <ArrowRight size={14} /> Open Charts
          </Link>
        </div>
      </div>

      {/* Hero Index Cards */}
      <HeroCards />

      {/* Market Movers */}
      <MarketMovers />

      {/* Two Column Layout */}
      <div className="dashboard-grid-2col">
        <div className="dashboard-main">
          {/* Quick Chart */}
          <StockChart symbol="RELIANCE.NS" name="Reliance Industries" />

          {/* Sector Heatmap */}
          <SectorHeatmap />

          {/* Market Snapshot */}
          <div className="market-snapshot glass-card-static" id="market-snapshot">
            <div className="section-header" style={{ padding: '20px 20px 0' }}>
              <h2 className="section-title">
                <Zap size={20} style={{ color: 'var(--yellow)' }} />
                Market Snapshot
              </h2>
            </div>
            <div className="snapshot-items">
              <div className="snapshot-item">
                <div className="snapshot-dot" style={{ background: 'var(--green)' }} />
                <span>Nifty 50 trading above 50-day MA → <strong className="text-green">Bullish bias</strong></span>
              </div>
              <div className="snapshot-item">
                <div className="snapshot-dot" style={{ background: 'var(--green)' }} />
                <span>Banking sector outperforming broader market by 1.8%</span>
              </div>
              <div className="snapshot-item">
                <div className="snapshot-dot" style={{ background: 'var(--yellow)' }} />
                <span>Gold prices holding steady near ₹73,400 — consolidation zone</span>
              </div>
              <div className="snapshot-item">
                <div className="snapshot-dot" style={{ background: 'var(--red)' }} />
                <span>IT sector index RSI at 38 → <strong className="text-red">Oversold territory</strong></span>
              </div>
              <div className="snapshot-item">
                <div className="snapshot-dot" style={{ background: 'var(--blue)' }} />
                <span>FII net buyers of ₹2,340 Cr in equities today</span>
              </div>
            </div>
          </div>
        </div>

        <div className="dashboard-sidebar">
          <NewsFeed compact />
        </div>
      </div>
    </div>
  );
}
