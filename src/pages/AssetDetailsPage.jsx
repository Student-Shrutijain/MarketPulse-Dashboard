import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, TrendingUp, TrendingDown } from 'lucide-react';
import StockChart from '../components/StockChart';
import StockNews from '../components/StockNews';
import './AssetDetailsPage.css';

export default function AssetDetailsPage() {
  const { symbol } = useParams();
  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAssetData = async () => {
      setLoading(true);
      try {
        const quoteRes = await axios.get(`http://localhost:5001/api/market/quote/${symbol}`);
        setQuote(quoteRes.data);
      } catch (err) {
        console.error('Failed to fetch asset details:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAssetData();
  }, [symbol]);

  if (loading) {
    return <div className="page-container flex-center">Loading {symbol}...</div>;
  }

  if (!quote) {
    return <div className="page-container flex-center">Asset not found.</div>;
  }

  const isUp = quote.change >= 0;

  return (
    <div className="page-container asset-details-page fade-in">
      <div className="asset-header">
        <Link to="/" className="back-link">
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>
        <div className="asset-title-row">
          <div>
            <h1 className="asset-symbol font-mono">{quote.symbol.replace('.NS', '')}</h1>
            <span className="asset-name">{quote.name || quote.symbol}</span>
          </div>
          <div className="asset-price-col">
            <span className={`asset-price font-mono ${isUp ? 'text-green' : 'text-red'}`}>
              ₹{quote.price?.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
            </span>
            <div className={`asset-change badge ${isUp ? 'badge-green' : 'badge-red'}`}>
              {isUp ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              {isUp ? '+' : ''}{quote.change?.toFixed(2)} ({quote.changePercent?.toFixed(2)}%)
            </div>
          </div>
        </div>
      </div>

      <div className="asset-content-grid">
        <div className="asset-main-col">
          <StockChart symbol={quote.symbol} name={quote.name || quote.symbol} />
          
          <div className="asset-stats-grid">
            <div className="stat-card glass-card">
              <span className="stat-label">Open</span>
              <span className="stat-value font-mono">₹{quote.open?.toLocaleString('en-IN')}</span>
            </div>
            <div className="stat-card glass-card">
              <span className="stat-label">Day High</span>
              <span className="stat-value font-mono text-green">₹{quote.high?.toLocaleString('en-IN')}</span>
            </div>
            <div className="stat-card glass-card">
              <span className="stat-label">Day Low</span>
              <span className="stat-value font-mono text-red">₹{quote.low?.toLocaleString('en-IN')}</span>
            </div>
            <div className="stat-card glass-card">
              <span className="stat-label">Volume</span>
              <span className="stat-value font-mono">{quote.volume?.toLocaleString('en-IN')}</span>
            </div>
            <div className="stat-card glass-card">
              <span className="stat-label">52W High</span>
              <span className="stat-value font-mono text-green">₹{quote.week52High?.toLocaleString('en-IN')}</span>
            </div>
            <div className="stat-card glass-card">
              <span className="stat-label">52W Low</span>
              <span className="stat-value font-mono text-red">₹{quote.week52Low?.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        <div className="asset-side-col">
          <StockNews symbol={quote.symbol} name={quote.name || quote.symbol} />
        </div>
      </div>
    </div>
  );
}
