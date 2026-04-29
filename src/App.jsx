import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { MarketProvider } from './context/MarketContext';
import { PortfolioProvider } from './context/PortfolioContext';

import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

import Dashboard from './pages/Dashboard';
import MarketAnalysis from './pages/MarketAnalysis';
import ChartsPage from './pages/ChartsPage';
import NewsPage from './pages/NewsPage';
import InsightsPage from './pages/InsightsPage';
import PortfolioPage from './pages/PortfolioPage';
import WatchlistPage from './pages/WatchlistPage';
import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/AdminDashboard';
import AssetDetailsPage from './pages/AssetDetailsPage';

function AppLayout({ children }) {
  return (
    <div className="app-layout">
      <div className="ambient-glow" />
      <div className="ambient-glow-2" />
      <Navbar />
      <Sidebar />
      <main className="main-content">
        {children}
      </main>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <MarketProvider>
            <PortfolioProvider>
              <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/" element={<AppLayout><Dashboard /></AppLayout>} />
                <Route path="/market" element={<AppLayout><MarketAnalysis /></AppLayout>} />
                <Route path="/charts" element={<AppLayout><ChartsPage /></AppLayout>} />
                <Route path="/news" element={<AppLayout><NewsPage /></AppLayout>} />
                <Route path="/insights" element={<AppLayout><InsightsPage /></AppLayout>} />
                <Route path="/portfolio" element={<AppLayout><PortfolioPage /></AppLayout>} />
                <Route path="/watchlist" element={<AppLayout><WatchlistPage /></AppLayout>} />
                <Route path="/admin" element={<AppLayout><AdminDashboard /></AppLayout>} />
                <Route path="/asset/:symbol" element={<AppLayout><AssetDetailsPage /></AppLayout>} />
              </Routes>
            </PortfolioProvider>
          </MarketProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
