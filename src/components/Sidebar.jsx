import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, TrendingUp, Newspaper, BarChart3, Briefcase, Eye,
  Settings, ChevronLeft, ChevronRight, Zap, Shield
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Sidebar.css';

const NAV_ITEMS = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/market', icon: TrendingUp, label: 'Market Analysis' },
  { path: '/charts', icon: BarChart3, label: 'Charts' },
  { path: '/news', icon: Newspaper, label: 'News Feed' },
  { path: '/insights', icon: Zap, label: 'Insights' },
  { path: '/portfolio', icon: Briefcase, label: 'Portfolio' },
  { path: '/watchlist', icon: Eye, label: 'Watchlist' },
];

const ADMIN_ITEMS = [
  { path: '/admin', icon: Shield, label: 'Admin Panel' },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { user } = useAuth();
  const location = useLocation();

  return (
    <>
      <aside className={`sidebar ${collapsed ? 'sidebar-collapsed' : ''}`} id="main-sidebar">
        <div className="sidebar-content">
          <div className="sidebar-nav">
            <div className="nav-section">
              <span className="nav-section-label">{collapsed ? '—' : 'MAIN'}</span>
              {NAV_ITEMS.map(item => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) => `nav-item ${isActive ? 'nav-item-active' : ''}`}
                  end={item.path === '/'}
                  title={item.label}
                >
                  <item.icon size={20} />
                  {!collapsed && <span>{item.label}</span>}
                  {!collapsed && location.pathname === item.path && (
                    <div className="nav-active-indicator" />
                  )}
                </NavLink>
              ))}
            </div>

            {user?.role === 'admin' && (
              <div className="nav-section">
                <span className="nav-section-label">{collapsed ? '—' : 'ADMIN'}</span>
                {ADMIN_ITEMS.map(item => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) => `nav-item ${isActive ? 'nav-item-active' : ''}`}
                    title={item.label}
                  >
                    <item.icon size={20} />
                    {!collapsed && <span>{item.label}</span>}
                  </NavLink>
                ))}
              </div>
            )}
          </div>

          <div className="sidebar-footer">
            {!collapsed && (
              <div className="market-status-card">
                <div className="market-status-dot live-dot" />
                <div>
                  <p className="market-status-text">Market Open</p>
                  <p className="market-status-time">Mon-Fri 9:15 AM – 3:30 PM</p>
                </div>
              </div>
            )}
            <button className="collapse-btn btn-icon" onClick={() => setCollapsed(!collapsed)} id="sidebar-toggle">
              {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="mobile-nav" id="mobile-nav">
        {NAV_ITEMS.slice(0, 5).map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `mobile-nav-item ${isActive ? 'mobile-nav-active' : ''}`}
            end={item.path === '/'}
          >
            <item.icon size={20} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </>
  );
}
