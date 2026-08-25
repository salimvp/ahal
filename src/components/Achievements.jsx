import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, Pause, Play, ArrowRight, Trophy, Maximize2 } from 'lucide-react';
import SectionHeader from './ui/SectionHeader';
import Badge from './ui/Badge';

const DEFAULT_FALLBACK_ACHIEVEMENTS = [
  {
    id: 'ach-1',
    title: '100% Pass in Kerala D.El.Ed Board Examinations',
    subtitle: '10th Consecutive Year of Full Pass Distinction',
    description: 'Consistent 100% board examination pass results with multiple state-level distinction ranks and academic merit laurels.',
    category: 'Academic',
    year: '2025',
    rank_badge: '100% Pass',
    image_url: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=1000&auto=format&fit=crop'
  },
  {
    id: 'ach-2',
    title: 'State 1st Rank in Elementary Teacher Education',
    subtitle: 'Government of Kerala Merit Recognition',
    description: 'Our teacher trainee bagged the prestigious State First Rank in the curriculum examinations, upholding our pedagogical excellence.',
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

export default function Achievements({ achievements = [], onSelectAchievement }) {
  const [isPaused, setIsPaused] = useState(false);
  const [activeFilter, setActiveFilter] = useState('All');

  const categories = ['All', 'Academic', 'Arts & Sports', 'Institutional'];

  const displayList = achievements.length > 0 ? achievements : DEFAULT_FALLBACK_ACHIEVEMENTS;

  const filtered = displayList.filter(
    (item) => activeFilter === 'All' || item.category === activeFilter
  );

  const marqueeItems = [...filtered, ...filtered];

  return (
    <section id="achievements" className="py-24 sm:py-32 bg-canvas relative overflow-hidden">
      
      {/* Container Header */}
      <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <SectionHeader
          eyebrow="Proven Excellence"
          title="Milestones & Accolades"
          description="Consistent 100% board examination pass results, state rank distinctions, and laurels in educational innovations."
          action={
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-2 sm:pb-0 scrollbar-none">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveFilter(cat)}
                    className={`px-3.5 py-1.5 rounded-sm text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                      activeFilter === cat
                        ? 'bg-accent text-white font-semibold'
                        : 'bg-surface text-ink-secondary hover:text-ink-primary border border-surface-border'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Corrected Link to /achievements */}
              <Link
                to="/achievements"
                className="shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-accent text-white text-xs font-semibold hover:bg-accent-hover transition-colors shadow-soft-sm"
              >
                <span>View More</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          }
        />
      </div>

      {/* Wide Editorial Carousel — Significantly Increased Box & Image Size */}
      <div
        className="relative w-full overflow-hidden pause-marquee py-4 cursor-pointer select-none"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Edge Fades */}
        <div className="absolute left-0 top-0 bottom-0 w-10 sm:w-24 bg-gradient-to-r from-canvas to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-10 sm:w-24 bg-gradient-to-l from-canvas to-transparent z-10 pointer-events-none" />

        <div
          className={`flex gap-8 w-max ${
            isPaused ? '' : 'animate-marquee'
          }`}
          style={{ animationPlayState: isPaused ? 'paused' : 'running' }}
        >
          {marqueeItems.map((item, idx) => (
            <div
              key={`${item.id}-${idx}`}
              onDoubleClick={(e) => {
                e.stopPropagation();
                onSelectAchievement?.(item);
              }}
              className="w-[320px] sm:w-[420px] md:w-[480px] flex-shrink-0 group rounded-2xl overflow-hidden bg-surface border border-surface-border hover:border-accent/40 transition-all duration-500 shadow-soft-md hover:shadow-soft-xl flex flex-col justify-between"
            >
              {/* Dominant Increased Size Image Container */}
              <div className="relative h-64 sm:h-76 md:h-84 w-full overflow-hidden bg-dark">
                <img
                  src={item.image_url || 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=1000&auto=format&fit=crop'}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out filter brightness-95 group-hover:brightness-100"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-dark/80 via-dark/20 to-transparent" />

                {/* Rank Badge (Top Left) */}
                {item.rank_badge && (
                  <div className="absolute top-4 left-4 z-10">
                    <Badge variant="gold" size="md">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      <span>{item.rank_badge}</span>
                    </Badge>
                  </div>
                )}

                {/* Expand Full Details Quick Button (Top Right) */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectAchievement?.(item);
                  }}
                  className="absolute top-4 right-4 z-10 p-2 rounded-lg bg-dark/70 hover:bg-accent text-white backdrop-blur-sm transition-colors opacity-90 group-hover:opacity-100 shadow-sm"
                  title="View full details"
                  aria-label="View full details"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>

                {/* Year Pill (Bottom Left) */}
                <div className="absolute bottom-4 left-4 text-xs font-mono font-bold text-white bg-dark/80 px-3 py-1 rounded-md backdrop-blur-sm border border-white/10">
                  {item.year || '2025'}
                </div>

                {/* Category Pill (Bottom Right) */}
                <div className="absolute bottom-4 right-4 text-xs font-mono font-semibold text-accent-light bg-dark/80 px-3 py-1 rounded-md backdrop-blur-sm border border-white/10">
                  {item.category || 'Academic Milestone'}
                </div>
              </div>

              {/* Editorial Text Block */}
              <div className="p-6 sm:p-7 space-y-3 flex-1 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-accent">
                      {item.category || 'Academic Milestone'}
                    </span>
                    <span className="text-[10px] text-ink-muted italic hidden sm:inline">
                      Double-click to expand
                    </span>
                  </div>
                  
                  <h3 className="text-lg sm:text-xl font-bold font-sans text-ink-primary group-hover:text-accent transition-colors leading-snug line-clamp-2">
                    {item.title}
                  </h3>
                  {item.subtitle && (
                    <p className="text-xs sm:text-sm font-medium text-ink-secondary line-clamp-1">
                      {item.subtitle}
                    </p>
                  )}
                  <p className="text-xs sm:text-sm text-ink-muted leading-relaxed line-clamp-2">
                    {item.description}
                  </p>
                </div>

                {/* Bottom Action Strip */}
                <div className="pt-4 border-t border-surface-border flex items-center justify-between">
                  <span className="text-xs text-ink-muted">Double-click or tap details</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectAchievement?.(item);
                    }}
                    className="text-xs font-semibold text-accent hover:text-accent-hover flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <span>Full Details</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Controls & Marquee Indicator */}
      <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-8 mt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-ink-muted">
        <span className="text-[11px]">
          Hover or tap to pause stream • Double click any card to open full details
        </span>
        <button
          onClick={() => setIsPaused(!isPaused)}
          className="flex items-center gap-1.5 text-xs text-ink-secondary hover:text-ink-primary transition-colors cursor-pointer"
        >
          {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
          <span>{isPaused ? 'Resume Carousel' : 'Pause Carousel'}</span>
        </button>
      </div>

    </section>
  );
}
