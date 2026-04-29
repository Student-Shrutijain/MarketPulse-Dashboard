import SectorHeatmap from '../components/SectorHeatmap';
import { useMarket } from '../context/MarketContext';
import { Zap, TrendingUp, TrendingDown, BarChart3, Globe } from 'lucide-react';
import './Insights.css';

export default function InsightsPage() {
  const { indices, sectors } = useMarket();

  const movingMarket = [
    { title: 'Banking stocks rally on strong Q4 results expectations', impact: 'positive', assets: ['HDFCBANK', 'ICICIBANK', 'SBIN'] },
    { title: 'Crude oil spikes to $85/barrel — energy stocks gain', impact: 'positive', assets: ['RELIANCE', 'ONGC'] },
    { title: 'IT sector faces headwinds from US recession fears', impact: 'negative', assets: ['TCS', 'INFY', 'WIPRO'] },
    { title: 'Gold safe-haven demand rising amid geopolitical tensions', impact: 'positive', assets: ['GOLD'] },
  ];

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
          {movingMarket.map((item, i) => (
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
          ))}
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
          {[
            { name: 'NIFTY 50', '1D': '+0.65%', '1W': '+1.2%', '1M': '+3.4%', '3M': '+8.2%', '6M': '+12.1%', '1Y': '+18.5%' },
            { name: 'SENSEX', '1D': '+0.65%', '1W': '+1.1%', '1M': '+3.2%', '3M': '+7.8%', '6M': '+11.5%', '1Y': '+17.8%' },
            { name: 'NIFTY Bank', '1D': '+1.8%', '1W': '+2.5%', '1M': '+5.1%', '3M': '+10.3%', '6M': '+15.2%', '1Y': '+22.4%' },
            { name: 'NIFTY IT', '1D': '-1.2%', '1W': '-2.1%', '1M': '-4.5%', '3M': '-1.8%', '6M': '+3.2%', '1Y': '+5.1%' },
            { name: 'Gold', '1D': '+0.38%', '1W': '+1.5%', '1M': '+4.2%', '3M': '+8.5%', '6M': '+15.8%', '1Y': '+22.1%' },
          ].map(row => (
            <div key={row.name} className="perf-row">
              <span className="perf-name">{row.name}</span>
              {['1D', '1W', '1M', '3M', '6M', '1Y'].map(period => (
                <span
                  key={period}
                  className={`perf-cell font-mono ${row[period].startsWith('+') ? 'text-green' : 'text-red'}`}
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
        </div>
      </div>
    </div>
  );
}
