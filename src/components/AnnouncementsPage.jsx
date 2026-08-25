import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Search,
  Menu,
  X,
  Bell,
  Calendar,
  Pin,
  ExternalLink,
  ArrowRight,
  FileText
} from 'lucide-react';
import { api } from '../services/api';
import Footer from './Footer';
import SSMOLogo from './SSMOLogo';
import Badge from './ui/Badge';
import AnnouncementModal from './AnnouncementModal';

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeModalAnnouncement, setActiveModalAnnouncement] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    async function loadAnnouncements() {
      try {
        const data = await api.getAnnouncements('All', '', false);
        setAnnouncements(data || []);
      } catch (err) {
        console.error('Failed to load announcements:', err);
      } finally {
        setLoading(false);
      }
    }
    loadAnnouncements();
  }, []);

  const categories = ['All', 'Admissions', 'Examinations', 'Notices', 'Events', 'Academic'];

  const filteredAnnouncements = announcements.filter((item) => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      q === '' ||
      item.title?.toLowerCase().includes(q) ||
      (item.content && item.content.toLowerCase().includes(q));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-canvas text-ink-primary flex flex-col selection:bg-accent selection:text-white">
      {/* Dark Navbar */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-dark/95 backdrop-blur-md border-b border-dark-border">
        <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <SSMOLogo className="w-9 h-9 transition-transform duration-300 group-hover:scale-105" />
            <div className="flex flex-col">
              <span className="text-sm font-bold font-sans tracking-tight text-white leading-tight">
                ITE
              </span>
              <span className="text-[10px] font-medium text-ink-light-muted tracking-wider uppercase">
                Announcements
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden lg:flex items-center gap-1">
            <Link
              to="/announcements"
              className="px-3 py-1.5 rounded-sm text-xs font-medium text-white bg-white/10"
            >
              Announcements
            </Link>
            <Link
              to="/gallery"
              className="px-3 py-1.5 rounded-sm text-xs font-medium text-ink-light-secondary hover:text-white hover:bg-white/5 transition-colors"
            >
              Gallery
            </Link>
            <Link
              to="/faculties"
              className="px-3 py-1.5 rounded-sm text-xs font-medium text-ink-light-secondary hover:text-white hover:bg-white/5 transition-colors"
            >
              Faculties
            </Link>
          </div>

          {/* Back to Home + Mobile Menu */}
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="hidden sm:inline-flex items-center gap-2 px-4 py-1.5 rounded-md bg-accent text-white text-xs font-semibold hover:bg-accent-hover transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Home
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-md text-ink-light hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-dark-border bg-dark/95 backdrop-blur-md">
            <div className="px-4 py-4 space-y-2">
              <span className="block px-3 py-2 text-sm font-medium text-white bg-white/10 rounded-md">
                Announcements
              </span>
              <Link
                to="/gallery"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-sm font-medium text-ink-light hover:text-white hover:bg-white/5 rounded-md transition-colors"
              >
                Gallery
              </Link>
              <Link
                to="/faculties"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-sm font-medium text-ink-light hover:text-white hover:bg-white/5 rounded-md transition-colors"
              >
                Faculties
              </Link>
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-sm font-medium text-accent-light hover:text-white hover:bg-white/5 rounded-md transition-colors"
              >
                ← Back to Home
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Hero Banner Section */}
      <section className="pt-28 pb-16 bg-dark text-white relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div
            className="w-full h-full bg-cover bg-center filter brightness-30"
            style={{ backgroundImage: 'url(/hero-bg.png)' }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-dark via-dark/70 to-dark/80" />
        </div>
        <div className="relative z-10 max-w-content mx-auto px-4 sm:px-6 lg:px-8 space-y-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider bg-accent/20 text-accent-light border border-accent/30">
            <Bell className="w-3.5 h-3.5" />
            Institutional Bulletins
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight leading-tight">
            Announcements & Circulars
          </h1>
          <p className="text-sm sm:text-base text-ink-light-secondary max-w-2xl leading-relaxed">
            Official circulars, notifications, examination schedules, and academic bulletins from SSMO Institute of Teacher Education, Tirurangadi.
          </p>
        </div>
      </section>

      {/* Main Announcements Section */}
      <section className="py-12 sm:py-20 flex-1 bg-canvas">
        <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          
          {/* Category Filter Pills & Search */}
          <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between pb-6 border-b border-surface-border">
            {/* Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-accent text-white shadow-soft-sm scale-102'
                      : 'bg-surface hover:bg-canvas-subtle text-ink-secondary border border-surface-border'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Search Box */}
            <div className="relative w-full md:w-72 shrink-0">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search notices..."
                className="w-full pl-10 pr-4 py-2 bg-surface border border-surface-border rounded-full text-xs text-ink-primary placeholder-ink-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
              />
            </div>
          </div>

          {/* Announcements Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="h-52 bg-surface rounded-xl border border-surface-border p-6" />
              ))}
            </div>
          ) : filteredAnnouncements.length === 0 ? (
            <div className="py-20 text-center bg-surface border border-surface-border rounded-2xl p-8 space-y-3">
              <FileText className="w-10 h-10 text-ink-muted mx-auto opacity-50" />
              <h3 className="text-base font-bold text-ink-primary">No Announcements Found</h3>
              <p className="text-xs text-ink-muted max-w-sm mx-auto">
                No circulars or notices matched your filter or search query.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAnnouncements.map((item) => {
                const formattedDate = item.created_at
                  ? new Date(item.created_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })
                  : 'Recent';

                return (
                  <div
                    key={item.id}
                    onClick={() => setActiveModalAnnouncement(item)}
                    className={`group relative flex flex-col justify-between p-6 sm:p-7 rounded-xl bg-surface border transition-all duration-200 cursor-pointer ${
                      item.is_pinned
                        ? 'border-accent/40 bg-surface shadow-soft-sm hover:border-accent hover:shadow-soft-md'
                        : 'border-surface-border hover:border-ink-primary/30 hover:bg-surface-secondary shadow-soft-sm hover:shadow-soft-md'
                    }`}
                  >
                    {/* Top Metadata */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          {item.badge && (
                            <Badge variant={item.badge === 'IMPORTANT' ? 'warning' : 'accent'} size="sm">
                              {item.badge}
                            </Badge>
                          )}
                          <span className="text-[11px] font-medium text-ink-muted">
                            {item.category || 'Notice'}
                          </span>
                        </div>

                        {item.is_pinned === 1 && (
                          <span className="text-[10px] font-semibold text-gold flex items-center gap-1">
                            <Pin className="w-3 h-3" /> Pinned
                          </span>
                        )}
                      </div>

                      {/* Dominant Title */}
                      <h3 className="text-base sm:text-lg font-sans font-bold text-ink-primary group-hover:text-accent transition-colors leading-snug line-clamp-2">
                        {item.title}
                      </h3>

                      {/* Supporting Content Preview */}
                      {item.content && (
                        <p className="text-xs sm:text-sm text-ink-secondary line-clamp-3 leading-relaxed">
                          {item.content}
                        </p>
                      )}
                    </div>

                    {/* Card Footer */}
                    <div className="pt-5 mt-4 border-t border-surface-border flex items-center justify-between">
                      <div className="text-xs text-ink-muted flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-ink-muted" />
                        <span>{formattedDate}</span>
                      </div>

                      <div className="text-xs font-semibold text-accent flex items-center gap-1 group-hover:gap-1.5 transition-all">
                        <span>{item.link ? 'View Document' : 'View Full Details'}</span>
                        {item.link ? (
                          <ExternalLink className="w-3.5 h-3.5" />
                        ) : (
                          <ArrowRight className="w-3.5 h-3.5" />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <Footer />

      {/* Full Details Modal */}
      {activeModalAnnouncement && (
        <AnnouncementModal
          announcement={activeModalAnnouncement}
          onClose={() => setActiveModalAnnouncement(null)}
        />
      )}
    </div>
  );
}
