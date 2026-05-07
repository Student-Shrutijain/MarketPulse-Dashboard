import { useState, useEffect } from 'react';
import axios from 'axios';
import SectorHeatmap from '../components/SectorHeatmap';
import { useMarket } from '../context/MarketContext';
import { useAuth } from '../context/AuthContext';
import { Zap, TrendingUp, TrendingDown, BarChart3, Globe, Lock } from 'lucide-react';
import './Insights.css';

export default function InsightsPage() {
  const { user } = useAuth();
  const { gainers, losers, sectors } = useMarket();
  const [performance, setPerformance] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPerformance = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        const { data } = await axios.get('/api/market/performance');
        setPerformance(data);
      } catch (error) {
        console.error('Failed to fetch performance:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPerformance();
  }, [user]);

  const movingMarket = [];
  if (gainers && gainers.length > 0) {
    movingMarket.push({
      title: 'Strong buying momentum in top gainers',
      impact: 'positive',
      assets: gainers.slice(0, 3).map(g => g.symbol.replace('.NS', ''))
    });
  }
  if (sectors && sectors.length > 0) {
    const sortedSectors = [...sectors].sort((a,b) => b.change - a.change);
    const topSector = sortedSectors[0];
    const bottomSector = sortedSectors[sortedSectors.length - 1];
    
    if (topSector && topSector.change > 0) {
      movingMarket.push({
        title: `${topSector.name} sector leads the market rally`,
        impact: 'positive',
        assets: [topSector.name]
      });
    }
    if (bottomSector && bottomSector.change < 0) {
      movingMarket.push({
        title: `${bottomSector.name} sector dragging down overall sentiment`,
        impact: 'negative',
        assets: [bottomSector.name]
      });
    }
  }
  if (losers && losers.length > 0) {
    movingMarket.push({
      title: 'Selling pressure observed in underperforming stocks',
      impact: 'negative',
      assets: losers.slice(0, 3).map(l => l.symbol.replace('.NS', ''))
    });
  }

  return (
    <div className="page-container animate-fade-in">
      <div className="section-header" style={{ marginBottom: '24px' }}>
        <h1 className="dashboard-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Zap size={28} style={{ color: 'var(--yellow)' }} />
          Market Insights
        </h1>
      </div>

      {/* What's Moving the Market */}
      <div className="insights-section glass-card-static" style={{ padding: '24px', marginBottom: '24px' }}>
        <h2 className="section-title" style={{ marginBottom: '16px' }}>
          <Globe size={20} style={{ color: 'var(--accent-primary)' }} />
          What's Moving the Market Today
        </h2>
        <div className="moving-items">
          {movingMarket.length > 0 ? movingMarket.map((item, i) => (
            <div key={i} className="moving-item" style={{ animationDelay: `${i * 80}ms` }}>
              <div className="moving-indicator">
                {item.impact === 'positive' ? (
                  <TrendingUp size={16} className="text-green" />
                ) : (
                  <TrendingDown size={16} className="text-red" />
                )}
              </div>
              <div className="moving-content">
                <p className="moving-title">{item.title}</p>
                <div className="moving-assets">
                  {item.assets.map(a => (
                    <span key={a} className="badge badge-neutral">{a}</span>
                  ))}
                </div>
              </div>
            </div>
          )) : (
            <p className="text-muted" style={{ fontSize: '0.875rem' }}>Gathering live market data...</p>
          )}
        </div>
      </div>

      {/* Sector Heatmap */}
      <SectorHeatmap />

      {/* Historical Trends */}
      <div className="insights-section glass-card-static" style={{ padding: '24px' }}>
        <h2 className="section-title" style={{ marginBottom: '16px' }}>
          <BarChart3 size={20} style={{ color: 'var(--accent-primary)' }} />
          Historical Performance Summary
        </h2>
        <div className="perf-grid">
          {loading ? (
            <p className="text-muted" style={{ fontSize: '0.875rem', padding: '20px' }}>Loading historical data...</p>
          ) : !user ? (
            <div className="flex-center" style={{ padding: '40px', flexDirection: 'column', gap: '12px' }}>
              <Lock size={24} style={{ color: 'var(--text-tertiary)' }} />
              <p className="text-muted" style={{ fontSize: '0.9rem' }}>Historical performance is restricted to members.</p>
              <button className="btn btn-primary btn-sm" onClick={() => window.location.href='/login'}>Sign In to View</button>
            </div>
          ) : performance.length > 0 ? (
            <>
              {performance.map(row => (
                <div key={row.name} className="perf-row">
                  <span className="perf-name">{row.name}</span>
                  {['1D', '1W', '1M', '3M', '6M', '1Y'].map(period => (
                    <span
                      key={period}
                      className={`perf-cell font-mono ${row[period].startsWith('+') ? 'text-green' : row[period].startsWith('-') ? 'text-red' : ''}`}
                    >
                      {row[period]}
                    </span>
                  ))}
                </div>
              ))}
              <div className="perf-header">
                <span></span>
                {['1D', '1W', '1M', '3M', '6M', '1Y'].map(p => (
                  <span key={p} className="perf-period">{p}</span>
                ))}
              </div>
            </>
          ) : (
            <p className="text-muted" style={{ fontSize: '0.875rem', padding: '20px' }}>No performance data available.</p>
          )}
        </div>
      </div>
    </div>
  );
}
