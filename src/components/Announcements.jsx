import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, ArrowRight, ExternalLink, Calendar, Pin } from 'lucide-react';
import SectionHeader from './ui/SectionHeader';
import Badge from './ui/Badge';
import Button from './ui/Button';

export default function Announcements({ announcements = [], onSelectAnnouncement, loading = false }) {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = ['All', 'Admissions', 'Examinations', 'Notices', 'Events', 'Academic'];

  const filteredAnnouncements = announcements.filter((item) => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch =
      searchQuery.trim() === '' ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.content && item.content.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <section id="announcements" className="py-24 sm:py-32 bg-canvas relative">
      <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header with Eyebrow, Scale Variation and Lead text */}
        <SectionHeader
          eyebrow="Institutional Bulletins"
          title="Announcements & Circulars"
          description="Official notices regarding D.El.Ed admissions, board examinations, school internships, and academic schedules."
          action={
            <Link
              to="/announcements"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-accent text-white text-xs font-semibold hover:bg-accent-hover transition-colors shadow-soft-sm shrink-0"
            >
              <span>View All Bulletins</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          }
        />

        {/* Minimal Category Filter & Search Strip */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-8 pb-6 border-b border-surface-border">
          {/* Categories */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-sm text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-accent text-white font-semibold'
                    : 'bg-surface text-ink-secondary hover:text-ink-primary hover:bg-canvas-subtle border border-surface-border'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted" />
            <input
              type="text"
              placeholder="Search notices..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-1.5 bg-surface border border-surface-border rounded-md text-xs text-ink-primary placeholder-ink-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
            />
          </div>
        </div>

        {/* Announcements Notice Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-44 bg-surface-secondary rounded-lg border border-surface-border p-6" />
            ))}
          </div>
        ) : filteredAnnouncements.length === 0 ? (
          <div className="text-center py-16 bg-surface rounded-lg border border-surface-border p-8 text-ink-muted text-sm">
            No announcements found matching your criteria.
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
                  onClick={() => onSelectAnnouncement(item)}
                  className={`group relative flex flex-col justify-between p-6 sm:p-7 rounded-lg bg-surface border transition-all duration-200 cursor-pointer ${
                    item.is_pinned
                      ? 'border-accent/40 bg-surface shadow-soft-sm hover:border-accent'
                      : 'border-surface-border hover:border-ink-primary/30 hover:bg-surface-secondary shadow-soft-sm'
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

                    {/* Dominant Title (Design Principle 29) */}
                    <h3 className="text-base sm:text-lg font-sans font-bold text-ink-primary group-hover:text-accent transition-colors leading-snug line-clamp-2">
                      {item.title}
                    </h3>

                    {/* Supporting Text */}
                    {item.content && (
                      <p className="text-xs sm:text-sm text-ink-secondary line-clamp-2 leading-relaxed">
                        {item.content}
                      </p>
                    )}
                  </div>

                  {/* Card Footer (Date & Action Link) */}
                  <div className="pt-5 mt-4 border-t border-surface-border flex items-center justify-between">
                    <div className="text-xs text-ink-muted flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-ink-muted" />
                      <span>{formattedDate}</span>
                    </div>

                    <div className="text-xs font-semibold text-accent flex items-center gap-1 group-hover:gap-1.5 transition-all">
                      <span>{item.link ? 'View Document' : 'Read Notice'}</span>
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
  );
}
