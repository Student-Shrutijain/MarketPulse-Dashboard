import { useState } from 'react';
import StockChart from '../components/StockChart';
import { BarChart3, Search } from 'lucide-react';

const POPULAR = [
  { symbol: 'RELIANCE.NS', name: 'Reliance Industries' },
  { symbol: 'TCS.NS', name: 'Tata Consultancy Services' },
  { symbol: 'HDFCBANK.NS', name: 'HDFC Bank' },
  { symbol: 'INFY.NS', name: 'Infosys' },
  { symbol: 'ICICIBANK.NS', name: 'ICICI Bank' },
  { symbol: 'SBIN.NS', name: 'State Bank of India' },
  { symbol: 'TATAMOTORS.NS', name: 'Tata Motors' },
  { symbol: 'ADANIENT.NS', name: 'Adani Enterprises' },
];

export default function ChartsPage() {
  const [selected, setSelected] = useState(POPULAR[0]);

  return (
    <div className="page-container animate-fade-in">
      <div className="section-header" style={{ marginBottom: '24px' }}>
        <h1 className="dashboard-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <BarChart3 size={28} style={{ color: 'var(--accent-primary)' }} />
          Interactive Charts
        </h1>
      </div>

      {/* Stock Selector */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {POPULAR.map(s => (
          <button
            key={s.symbol}
            className={`btn btn-sm ${selected.symbol === s.symbol ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setSelected(s)}
          >
            {s.symbol.replace('.NS', '')}
          </button>
        ))}
      </div>

      <StockChart symbol={selected.symbol} name={selected.name} />
    </div>
  );
}
