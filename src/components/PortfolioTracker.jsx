import { useState } from 'react';
import { usePortfolio } from '../context/PortfolioContext';
import { useAuth } from '../context/AuthContext';
import { Briefcase, Plus, Trash2, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import './Portfolio.css';

export default function PortfolioTracker() {
  const { user } = useAuth();
  const { holdings, totalInvested, totalCurrent, totalPnL, totalPnLPercent, addHolding, removeHolding } = usePortfolio();
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ symbol: '', name: '', qty: '', avgPrice: '', currentPrice: '' });

  const handleAdd = () => {
    if (!form.symbol || !form.qty || !form.avgPrice) return;
    addHolding({
      symbol: form.symbol.toUpperCase() + '.NS',
      qty: Number(form.qty),
      avgPrice: Number(form.avgPrice),
    });
    setForm({ symbol: '', name: '', qty: '', avgPrice: '', currentPrice: '' });
    setShowAdd(false);
  };

  return (
    <div className="portfolio-section" id="portfolio-tracker">
      {/* Summary Cards */}
      <div className="portfolio-summary">
        <div className="summary-card glass-card-static">
          <div className="summary-icon" style={{ background: 'var(--gradient-primary)' }}>
            <DollarSign size={20} color="white" />
          </div>
          <div>
            <span className="summary-label">Invested Value</span>
            <span className="summary-value font-mono">₹{totalInvested.toLocaleString('en-IN')}</span>
          </div>
        </div>
        <div className="summary-card glass-card-static">
          <div className="summary-icon" style={{ background: 'var(--gradient-blue)' }}>
            <Briefcase size={20} color="white" />
          </div>
          <div>
            <span className="summary-label">Current Value</span>
            <span className="summary-value font-mono">₹{totalCurrent.toLocaleString('en-IN', {maximumFractionDigits: 0})}</span>
          </div>
        </div>
        <div className="summary-card glass-card-static">
          <div className="summary-icon" style={{ background: totalPnL >= 0 ? 'var(--gradient-green)' : 'var(--gradient-red)' }}>
            {totalPnL >= 0 ? <TrendingUp size={20} color="white" /> : <TrendingDown size={20} color="white" />}
          </div>
          <div>
            <span className="summary-label">Total P&L</span>
            <span className={`summary-value font-mono ${totalPnL >= 0 ? 'text-green' : 'text-red'}`}>
              {totalPnL >= 0 ? '+' : ''}₹{totalPnL.toLocaleString('en-IN', {maximumFractionDigits: 0})}
              <span className="summary-pct">({totalPnLPercent}%)</span>
            </span>
          </div>
        </div>
      </div>

      {/* Holdings Table */}
      <div className="holdings-section glass-card-static">
        <div className="section-header" style={{ padding: '20px 20px 0' }}>
          <h2 className="section-title">
            <Briefcase size={20} style={{ color: 'var(--accent-primary)' }} />
            Your Holdings
          </h2>
          {user && (
            <button className="btn btn-primary btn-sm" onClick={() => setShowAdd(!showAdd)}>
              <Plus size={14} /> Add Holding
            </button>
          )}
        </div>

        {showAdd && (
          <div className="add-holding-form animate-fade-in">
            <input className="input" placeholder="Symbol (e.g., RELIANCE)" value={form.symbol} onChange={e => setForm({...form, symbol: e.target.value})} />
            <input className="input" placeholder="Company Name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
            <input className="input" type="number" placeholder="Quantity" value={form.qty} onChange={e => setForm({...form, qty: e.target.value})} />
            <input className="input" type="number" placeholder="Avg Buy Price" value={form.avgPrice} onChange={e => setForm({...form, avgPrice: e.target.value})} />
            <button className="btn btn-primary btn-sm" onClick={handleAdd}>Add</button>
          </div>
        )}

        <div className="holdings-table-wrapper">
          <table className="holdings-table">
            <thead>
              <tr>
                <th>Stock</th>
                <th>Qty</th>
                <th>Avg Price</th>
                <th>Current</th>
                <th>Invested</th>
                <th>Current Val</th>
                <th>P&L</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {holdings.map(h => {
                const invested = h.qty * h.avgPrice;
                const current = h.qty * h.currentPrice;
                const pnl = current - invested;
                const pnlPct = ((pnl / invested) * 100).toFixed(2);
                const isUp = pnl >= 0;

                return (
                  <tr key={h.symbol} className="holding-row">
                    <td>
                      <div className="holding-stock">
                        <span className="holding-symbol font-mono">{h.symbol.replace('.NS', '')}</span>
                        <span className="holding-name">{h.name}</span>
                      </div>
                    </td>
                    <td className="font-mono">{h.qty}</td>
                    <td className="font-mono">₹{h.avgPrice.toLocaleString('en-IN')}</td>
                    <td className="font-mono">₹{h.currentPrice.toLocaleString('en-IN')}</td>
                    <td className="font-mono">₹{invested.toLocaleString('en-IN')}</td>
                    <td className="font-mono">₹{current.toLocaleString('en-IN', {maximumFractionDigits:0})}</td>
                    <td>
                      <span className={`font-mono ${isUp ? 'text-green' : 'text-red'}`}>
                        {isUp ? '+' : ''}₹{pnl.toFixed(0)}
                        <br />
                        <small>({pnlPct}%)</small>
                      </span>
                    </td>
                    <td>
                      {user && (
                        <button className="btn-icon" onClick={() => removeHolding(h.symbol)} title="Remove">
                          <Trash2 size={14} />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
