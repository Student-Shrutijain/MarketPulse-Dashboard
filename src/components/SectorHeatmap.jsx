import { useMarket } from '../context/MarketContext';
import { Grid3X3 } from 'lucide-react';
import './SectorHeatmap.css';

export default function SectorHeatmap() {
  const { sectors } = useMarket();

  const getColor = (change) => {
    if (change >= 2.5) return '#059669';
    if (change >= 1.5) return '#10b981';
    if (change >= 0.5) return '#34d399';
    if (change >= 0) return '#6ee7b7';
    if (change >= -0.5) return '#fca5a5';
    if (change >= -1.5) return '#f87171';
    if (change >= -2.5) return '#ef4444';
    return '#dc2626';
  };

  const getTextColor = (change) => {
    return Math.abs(change) > 1 ? '#fff' : 'var(--text-primary)';
  };

  const maxVal = Math.max(...sectors.map(s => s.value));

  return (
    <div className="heatmap-section" id="sector-heatmap">
      <div className="section-header">
        <h2 className="section-title">
          <Grid3X3 size={20} style={{ color: 'var(--accent-primary)' }} />
          Sector Performance
        </h2>
      </div>
      <div className="heatmap-grid">
        {sectors.map((sector, i) => {
          const size = Math.max(0.6, sector.value / maxVal);
          return (
            <div
              key={sector.name}
              className="heatmap-cell"
              style={{
                backgroundColor: getColor(sector.change),
                flex: `${size} 1 0`,
                minWidth: `${Math.max(80, size * 140)}px`,
                animationDelay: `${i * 40}ms`,
              }}
              title={`${sector.name}: ${sector.change >= 0 ? '+' : ''}${sector.change}%`}
            >
              <span className="heatmap-name" style={{ color: getTextColor(sector.change) }}>
                {sector.name}
              </span>
              <span className="heatmap-change font-mono" style={{ color: getTextColor(sector.change) }}>
                {sector.change >= 0 ? '+' : ''}{sector.change}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
