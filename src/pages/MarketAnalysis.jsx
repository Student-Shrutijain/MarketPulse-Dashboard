import StockChart from '../components/StockChart';
import SectorHeatmap from '../components/SectorHeatmap';
import MarketMovers from '../components/MarketMovers';
import { TrendingUp } from 'lucide-react';

export default function MarketAnalysis() {
  return (
    <div className="page-container animate-fade-in">
      <div className="section-header" style={{ marginBottom: '24px' }}>
        <h1 className="dashboard-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <TrendingUp size={28} style={{ color: 'var(--accent-primary)' }} />
          Market Analysis
        </h1>
      </div>
      <MarketMovers />
      <StockChart symbol="^NSEI" name="NIFTY 50 Index" />
      <SectorHeatmap />
    </div>
  );
}
