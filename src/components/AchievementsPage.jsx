import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Search,
  Menu,
  X,
  Trophy,
  Star,
  Calendar,
  ArrowRight,
  Sparkles,
  Tag
} from 'lucide-react';
import { api } from '../services/api';
import Footer from './Footer';
import SSMOLogo from './SSMOLogo';
import Badge from './ui/Badge';
import AchievementModal from './AchievementModal';

const DEFAULT_FALLBACK_ACHIEVEMENTS = [
  {
    id: 'ach-1',
    title: '100% Pass in Kerala D.El.Ed Board Examinations',
    subtitle: '10th Consecutive Year of Full Pass Distinction',
    description: 'Consistent 100% board examination pass results with multiple state-level distinction ranks and academic merit laurels, demonstrating our exemplary pedagogy and dedication.',
    category: 'Academic',
    year: '2025',
    rank_badge: '100% Pass',
    image_url: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=1000&auto=format&fit=crop'
  },
  {
    id: 'ach-2',
    title: 'State 1st Rank in Elementary Teacher Education',
    subtitle: 'Government of Kerala Merit Recognition',
    description: 'Our teacher trainee bagged the prestigious State First Rank in the curriculum examinations, upholding our pedagogical excellence and institutional heritage.',
    category: 'Academic',
    year: '2024',
    rank_badge: 'State Rank #1',
    image_url: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=1000&auto=format&fit=crop'
  },
  {
    id: 'ach-3',
    title: 'Inter-Collegiate Arts & Sports Championship Trophy',
    subtitle: 'District-Level D.El.Ed Fest Winners',
    description: 'Overall champions in literary, cultural, and athletics competitions among Teacher Training Institutes across Malappuram district.',
    category: 'Arts & Sports',
    year: '2025',
    rank_badge: 'Champions',
    image_url: 'https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=1000&auto=format&fit=crop'
  },
  {
    id: 'ach-4',
    title: 'Excellence in Micro-Teaching & Smart Lab Innovation',
    subtitle: 'NCTE Recognized Model Teacher Lab',
    description: 'Recognized as a leading model institution for technology-integrated lesson planning and innovative classroom teaching simulations.',
    category: 'Institutional',
    year: '2024',
    rank_badge: 'Model Lab',
    image_url: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?q=80&w=1000&auto=format&fit=crop'
  }
];

export default function AchievementsPage() {
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeModalAchievement, setActiveModalAchievement] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    async function loadAchievements() {
      try {
        const data = await api.getAchievements();
        if (data && data.length > 0) {
          setAchievements(data);
        } else {
          setAchievements(DEFAULT_FALLBACK_ACHIEVEMENTS);
        }
      } catch (err) {
        console.error('Failed to load achievements:', err);
        setAchievements(DEFAULT_FALLBACK_ACHIEVEMENTS);
      } finally {
        setLoading(false);
      }
    }
    loadAchievements();
  }, []);

  const categories = ['All', 'Academic', 'Arts & Sports', 'Institutional', 'Faculty'];

  const filteredAchievements = achievements.filter((item) => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      q === '' ||
      item.title?.toLowerCase().includes(q) ||
      (item.subtitle && item.subtitle.toLowerCase().includes(q)) ||
      (item.description && item.description.toLowerCase().includes(q)) ||
      (item.rank_badge && item.rank_badge.toLowerCase().includes(q));
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
                Achievements
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden lg:flex items-center gap-1">
            <Link
              to="/announcements"
              className="px-3 py-1.5 rounded-sm text-xs font-medium text-ink-light-secondary hover:text-white hover:bg-white/5 transition-colors"
            >
              Announcements
            </Link>
            <Link
              to="/achievements"
              className="px-3 py-1.5 rounded-sm text-xs font-medium text-white bg-white/10"
            >
              Achievements
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
              <Link
                to="/announcements"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-sm font-medium text-ink-light hover:text-white hover:bg-white/5 rounded-md transition-colors"
              >
                Announcements
              </Link>
              <span className="block px-3 py-2 text-sm font-medium text-white bg-white/10 rounded-md">
                Achievements
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
            <Trophy className="w-3.5 h-3.5" />
            Proven Excellence & Honors
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight leading-tight">
            Milestones & Accolades
          </h1>
          <p className="text-sm sm:text-base text-ink-light-secondary max-w-2xl leading-relaxed">
            A comprehensive record of 100% board examination pass results, state rank distinctions, sports championships, and pedagogical innovations at SSMO ITE, Tirurangadi.
          </p>
        </div>
      </section>

      {/* Main Achievements Grid Section */}
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
                placeholder="Search milestones & honors..."
                className="w-full pl-10 pr-4 py-2 bg-surface border border-surface-border rounded-full text-xs text-ink-primary placeholder-ink-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
              />
            </div>
          </div>

          {/* Large Box-Shaped Achievements Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-pulse">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="h-96 bg-surface rounded-2xl border border-surface-border p-6" />
              ))}
            </div>
          ) : filteredAchievements.length === 0 ? (
            <div className="py-20 text-center bg-surface border border-surface-border rounded-2xl p-8 space-y-3">
              <Trophy className="w-10 h-10 text-ink-muted mx-auto opacity-50" />
              <h3 className="text-base font-bold text-ink-primary">No Achievements Found</h3>
              <p className="text-xs text-ink-muted max-w-sm mx-auto">
                No accolades matched your filter or search query.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredAchievements.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setActiveModalAchievement(item)}
                  className="group relative flex flex-col justify-between bg-surface border border-surface-border hover:border-accent/40 rounded-2xl overflow-hidden shadow-soft-sm hover:shadow-soft-xl transition-all duration-300 cursor-pointer"
                >
                  {/* Dominant Large Box Image Container */}
                  <div className="relative h-64 sm:h-72 w-full overflow-hidden bg-dark">
                    <img
                      src={item.image_url || 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=1000&auto=format&fit=crop'}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out filter brightness-95 group-hover:brightness-100"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-dark/75 via-dark/20 to-transparent pointer-events-none" />

                    {/* Rank Badge (Top Left) */}
                    {item.rank_badge && (
                      <div className="absolute top-4 left-4 z-10">
                        <Badge variant="gold" size="md">
                          <Star className="w-3.5 h-3.5 fill-current" />
                          <span>{item.rank_badge}</span>
                        </Badge>
                      </div>
                    )}

                    {/* Year Tag (Bottom Left) */}
                    <div className="absolute bottom-4 left-4 text-xs font-mono font-bold text-white bg-dark/80 px-2.5 py-1 rounded-md backdrop-blur-sm border border-white/10">
                      {item.year || '2025'}
                    </div>

                    {/* Category (Bottom Right) */}
                    <div className="absolute bottom-4 right-4 text-[11px] font-mono font-semibold text-accent-light bg-dark/80 px-2.5 py-1 rounded-md backdrop-blur-sm border border-white/10">
                      {item.category || 'Academic'}
                    </div>
                  </div>

                  {/* Editorial Text Block */}
                  <div className="p-6 sm:p-7 space-y-3 flex-1 flex flex-col justify-between">
                    <div className="space-y-2">
                      <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-accent">
                        {item.category || 'Academic Milestone'}
                      </span>
                      <h3 className="text-lg sm:text-xl font-bold font-sans text-ink-primary group-hover:text-accent transition-colors leading-snug line-clamp-2">
                        {item.title}
                      </h3>
                      {item.subtitle && (
                        <p className="text-xs sm:text-sm font-medium text-ink-secondary line-clamp-1">
                          {item.subtitle}
                        </p>
                      )}
                      <p className="text-xs sm:text-sm text-ink-muted leading-relaxed line-clamp-3">
                        {item.description}
                      </p>
                    </div>

                    {/* Card Action Link */}
                    <div className="pt-4 mt-4 border-t border-surface-border flex items-center justify-between">
                      <span className="text-xs text-ink-muted">Click to open full details</span>
                      <div className="text-xs font-semibold text-accent flex items-center gap-1 group-hover:gap-1.5 transition-all">
                        <span>View Details</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </section>

      {/* Footer */}
      <Footer />

      {/* Full Big Size Achievement Modal */}
      {activeModalAchievement && (
        <AchievementModal
          achievement={activeModalAchievement}
          onClose={() => setActiveModalAchievement(null)}
        />
      )}
    </div>
  );
}
