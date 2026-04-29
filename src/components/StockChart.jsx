import { useState, useMemo, useEffect } from 'react';
import axios from 'axios';
import {
  ResponsiveContainer, ComposedChart, Line, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Area, ReferenceLine
} from 'recharts';
import { BarChart3, TrendingUp, Activity, Loader2 } from 'lucide-react';
import './StockChart.css';

const TIMEFRAMES = ['1D', '5D', '1M', '3M', '6M', '1Y', 'Max'];
const INDICATORS = ['SMA', 'EMA', 'RSI', 'MACD', 'Volume'];

// No longer need generateData, will fetch from backend

function calcSMA(data, period) {
  return data.map((d, i) => {
    if (i < period - 1) return { ...d, sma: null };
    const sum = data.slice(i - period + 1, i + 1).reduce((s, v) => s + v.close, 0);
    return { ...d, sma: +(sum / period).toFixed(2) };
  });
}

function calcEMA(data, period) {
  const k = 2 / (period + 1);
  let ema = data[0].close;
  return data.map((d, i) => {
    if (i === 0) return { ...d, ema: +ema.toFixed(2) };
    ema = d.close * k + ema * (1 - k);
    return { ...d, ema: +ema.toFixed(2) };
  });
}

function calcRSI(data, period = 14) {
  let gains = 0, losses = 0;
  return data.map((d, i) => {
    if (i === 0) return { ...d, rsi: 50 };
    const change = d.close - data[i - 1].close;
    if (i <= period) {
      if (change > 0) gains += change; else losses -= change;
      if (i === period) {
        const avgGain = gains / period;
        const avgLoss = losses / period;
        const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
        return { ...d, rsi: +(100 - 100 / (1 + rs)).toFixed(2) };
      }
      return { ...d, rsi: null };
    }
    const avgGain = (gains * (period - 1) + Math.max(change, 0)) / period;
    const avgLoss = (losses * (period - 1) + Math.max(-change, 0)) / period;
    gains = avgGain; losses = avgLoss;
    const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    return { ...d, rsi: +(100 - 100 / (1 + rs)).toFixed(2) };
  });
}

const CandlestickShape = (props) => {
  const { x, y, width, height, payload } = props;
  const isUp = payload.close >= payload.open;
  const color = isUp ? '#10b981' : '#ef4444';
  
  const priceRange = payload.high - payload.low;
  if (priceRange === 0) {
    return (
      <rect x={x} y={y} width={width} height={1} fill={color} />
    );
  }
  
  const ratio = height / priceRange;
  
  const openY = y + (payload.high - payload.open) * ratio;
  const closeY = y + (payload.high - payload.close) * ratio;
  
  const bodyTop = Math.min(openY, closeY);
  const bodyBottom = Math.max(openY, closeY);
  const bodyHeight = Math.max(bodyBottom - bodyTop, 1);
  
  const xCenter = x + width / 2;
  
  return (
    <g stroke={color} fill={color}>
      <line x1={xCenter} y1={y} x2={xCenter} y2={y + height} />
      <rect x={x} y={bodyTop} width={width} height={bodyHeight} />
    </g>
  );
};

export default function StockChart({ symbol = 'RELIANCE.NS', name = 'Reliance Industries' }) {
  const [timeframe, setTimeframe] = useState('1M');
  const [chartType, setChartType] = useState('area');
  const [activeIndicators, setActiveIndicators] = useState(['Volume']);
  const [showRSI, setShowRSI] = useState(false);
  
  const [rawData, setRawData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`http://localhost:5001/api/market/history/${symbol}?range=${timeframe}`);
        if (isMounted && res.data && res.data.data) {
          const formatted = res.data.data.map(d => {
            const dt = new Date(d.date);
            return {
              ...d,
              date: dt.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
              time: dt.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
              customCandle: [d.low, d.high]
            };
          });
          setRawData(formatted);
        }
      } catch (err) {
        console.error('Error fetching chart data:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchData();
    return () => { isMounted = false; };
  }, [symbol, timeframe]);

  const data = useMemo(() => {
    let d = [...rawData];
    if (activeIndicators.includes('SMA')) d = calcSMA(d, 20);
    if (activeIndicators.includes('EMA')) d = calcEMA(d, 12);
    if (activeIndicators.includes('RSI') || showRSI) d = calcRSI(d);
    return d;
  }, [rawData, activeIndicators, showRSI]);

  const toggleIndicator = (ind) => {
    if (ind === 'RSI') {
      setShowRSI(!showRSI);
      return;
    }
    setActiveIndicators(prev =>
      prev.includes(ind) ? prev.filter(i => i !== ind) : [...prev, ind]
    );
  };

  const lastPrice = data[data.length - 1]?.close || 0;
  const firstPrice = data[0]?.close || 0;
  const priceChange = lastPrice - firstPrice;
  const priceChangePercent = firstPrice > 0 ? ((priceChange / firstPrice) * 100).toFixed(2) : 0;
  const isUp = priceChange >= 0;

  // Stats
  const highPrice = Math.max(...data.map(d => d.high));
  const lowPrice = Math.min(...data.map(d => d.low));
  const avgVolume = Math.floor(data.reduce((s, d) => s + d.volume, 0) / data.length);

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    const d = payload[0].payload;
    return (
      <div className="chart-tooltip glass-card-static">
        <div className="tooltip-date">{d.date} {d.time || ''}</div>
        <div className="tooltip-grid">
          <span className="tooltip-label">O</span><span className="tooltip-val font-mono">₹{d.open?.toLocaleString('en-IN')}</span>
          <span className="tooltip-label">H</span><span className="tooltip-val font-mono text-green">₹{d.high?.toLocaleString('en-IN')}</span>
          <span className="tooltip-label">L</span><span className="tooltip-val font-mono text-red">₹{d.low?.toLocaleString('en-IN')}</span>
          <span className="tooltip-label">C</span><span className="tooltip-val font-mono">₹{d.close?.toLocaleString('en-IN')}</span>
          <span className="tooltip-label">Vol</span><span className="tooltip-val font-mono">{d.volume?.toLocaleString('en-IN')}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="stock-chart-container glass-card-static" id="stock-chart">
      {/* Header */}
      <div className="chart-header">
        <div className="chart-info">
          <h2 className="chart-symbol font-mono">{symbol.replace('.NS', '')}</h2>
          <span className="chart-name">{name}</span>
          <span className={`chart-price font-mono ${isUp ? 'text-green' : 'text-red'}`}>
            ₹{lastPrice.toLocaleString('en-IN')}
          </span>
          <span className={`chart-change ${isUp ? 'badge-green' : 'badge-red'} badge`}>
            {isUp ? '+' : ''}{priceChange.toFixed(2)} ({priceChangePercent}%)
          </span>
        </div>
        <div className="chart-controls">
          <div className="chart-type-toggle">
            <button className={`btn-sm btn-ghost ${chartType === 'area' ? 'active' : ''}`} onClick={() => setChartType('area')}>
              <Activity size={14} /> Area
            </button>
            <button className={`btn-sm btn-ghost ${chartType === 'candle' ? 'active' : ''}`} onClick={() => setChartType('candle')}>
              <BarChart3 size={14} /> Candle
            </button>
          </div>
        </div>
      </div>

      {/* Timeframes */}
      <div className="chart-timeframes">
        <div className="tabs">
          {TIMEFRAMES.map(tf => (
            <button
              key={tf}
              className={`tab ${timeframe === tf ? 'active' : ''}`}
              onClick={() => setTimeframe(tf)}
            >
              {tf}
            </button>
          ))}
        </div>
        <div className="chart-indicators">
          {INDICATORS.map(ind => (
            <button
              key={ind}
              className={`indicator-btn ${activeIndicators.includes(ind) || (ind === 'RSI' && showRSI) ? 'indicator-active' : ''}`}
              onClick={() => toggleIndicator(ind)}
            >
              {ind}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="chart-body" style={{ position: 'relative' }}>
        {loading && (
          <div style={{ position: 'absolute', top: 8, right: 8, zIndex: 10, display: 'flex', alignItems: 'center', gap: 6, background: 'var(--bg-glass)', backdropFilter: 'blur(8px)', padding: '4px 10px', borderRadius: 20, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            <Loader2 size={14} className="spinner" /> Loading...
          </div>
        )}
        <ResponsiveContainer width="100%" height={380}>
          <ComposedChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-primary)" />
            <XAxis
              dataKey={timeframe === '1D' ? 'time' : 'date'}
              tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
              tickLine={false}
              axisLine={{ stroke: 'var(--border-primary)' }}
              interval="preserveStartEnd"
            />
            <YAxis
              domain={['auto', 'auto']}
              tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={v => `₹${v}`}
            />
            {activeIndicators.includes('Volume') && (
              <YAxis
                yAxisId="volume"
                orientation="right"
                tick={false}
                axisLine={false}
                domain={[0, 'dataMax * 4']}
              />
            )}
            <Tooltip content={<CustomTooltip />} />

            {activeIndicators.includes('Volume') && (
              <Bar
                yAxisId="volume"
                dataKey="volume"
                fill="var(--accent-primary)"
                opacity={0.15}
                radius={[2, 2, 0, 0]}
              />
            )}

            {chartType === 'area' ? (
              <>
                <defs>
                  <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={isUp ? '#10b981' : '#ef4444'} stopOpacity={0.3} />
                    <stop offset="100%" stopColor={isUp ? '#10b981' : '#ef4444'} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="close"
                  stroke={isUp ? '#10b981' : '#ef4444'}
                  strokeWidth={2}
                  fill="url(#areaGrad)"
                  dot={false}
                  activeDot={{ r: 4, stroke: isUp ? '#10b981' : '#ef4444', strokeWidth: 2, fill: 'var(--bg-primary)' }}
                />
              </>
            ) : (
              <Bar
                dataKey="customCandle"
                shape={<CandlestickShape />}
                isAnimationActive={false}
              />
            )}

            {activeIndicators.includes('SMA') && (
              <Line type="monotone" dataKey="sma" stroke="#f59e0b" strokeWidth={1.5} dot={false} strokeDasharray="5 3" />
            )}
            {activeIndicators.includes('EMA') && (
              <Line type="monotone" dataKey="ema" stroke="#8b5cf6" strokeWidth={1.5} dot={false} />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* RSI Sub-chart */}
      {showRSI && (
        <div className="rsi-chart">
          <div className="rsi-label">RSI(14)</div>
          <ResponsiveContainer width="100%" height={100}>
            <ComposedChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-primary)" />
              <XAxis dataKey={timeframe === '1D' ? 'time' : 'date'} tick={false} axisLine={false} />
              <YAxis domain={[0, 100]} tick={{ fill: 'var(--text-muted)', fontSize: 10 }} ticks={[30, 50, 70]} axisLine={false} tickLine={false} />
              <ReferenceLine y={70} stroke="var(--red)" strokeDasharray="3 3" opacity={0.5} />
              <ReferenceLine y={30} stroke="var(--green)" strokeDasharray="3 3" opacity={0.5} />
              <Area type="monotone" dataKey="rsi" stroke="#8b5cf6" fill="rgba(139,92,246,0.1)" strokeWidth={1.5} dot={false} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Stats Panel */}
      <div className="chart-stats">
        <div className="stat-item tooltip-wrapper">
          <span className="stat-label">Open</span>
          <span className="stat-value font-mono">₹{data[data.length-1]?.open?.toLocaleString('en-IN')}</span>
          <div className="tooltip">Opening price for the session</div>
        </div>
        <div className="stat-item tooltip-wrapper">
          <span className="stat-label">High</span>
          <span className="stat-value font-mono text-green">₹{highPrice?.toLocaleString('en-IN')}</span>
          <div className="tooltip">Period high</div>
        </div>
        <div className="stat-item tooltip-wrapper">
          <span className="stat-label">Low</span>
          <span className="stat-value font-mono text-red">₹{lowPrice?.toLocaleString('en-IN')}</span>
          <div className="tooltip">Period low</div>
        </div>
        <div className="stat-item tooltip-wrapper">
          <span className="stat-label">Volume</span>
          <span className="stat-value font-mono">{data[data.length-1]?.volume?.toLocaleString('en-IN')}</span>
          <div className="tooltip">Latest bar volume</div>
        </div>
        <div className="stat-item tooltip-wrapper">
          <span className="stat-label">52W High</span>
          <span className="stat-value font-mono text-green">₹{(highPrice * 1.05).toLocaleString('en-IN', {maximumFractionDigits:2})}</span>
          <div className="tooltip">52-week highest price</div>
        </div>
        <div className="stat-item tooltip-wrapper">
          <span className="stat-label">52W Low</span>
          <span className="stat-value font-mono text-red">₹{(lowPrice * 0.85).toLocaleString('en-IN', {maximumFractionDigits:2})}</span>
          <div className="tooltip">52-week lowest price</div>
        </div>
        <div className="stat-item tooltip-wrapper">
          <span className="stat-label">Avg Vol</span>
          <span className="stat-value font-mono">{avgVolume?.toLocaleString('en-IN')}</span>
          <div className="tooltip">Average volume over period</div>
        </div>
      </div>
    </div>
  );
}
