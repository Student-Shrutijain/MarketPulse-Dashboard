import NewsFeed from '../components/NewsFeed';
import { Newspaper } from 'lucide-react';

export default function NewsPage() {
  return (
    <div className="page-container animate-fade-in">
      <div className="section-header" style={{ marginBottom: '24px' }}>
        <h1 className="dashboard-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Newspaper size={28} style={{ color: 'var(--accent-primary)' }} />
          News Feed
        </h1>
      </div>
      <NewsFeed />
    </div>
  );
}
