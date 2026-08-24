import React, { useState } from 'react';
import { Star, Pause, Play } from 'lucide-react';
import SectionHeader from './ui/SectionHeader';
import Badge from './ui/Badge';

export default function Achievements({ achievements = [] }) {
  const [isPaused, setIsPaused] = useState(false);
  const [activeFilter, setActiveFilter] = useState('All');

  const categories = ['All', 'Academic', 'Arts & Sports', 'Institutional', 'Pedagogy'];

  const filtered = achievements.filter(
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
          description="Consistent 100% board examination pass results, state rank distinctions, and laurels in pedagogical innovations."
          action={
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveFilter(cat)}
                  className={`px-3 py-1 rounded-sm text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                    activeFilter === cat
                      ? 'bg-accent text-white font-semibold'
                      : 'bg-surface text-ink-secondary hover:text-ink-primary border border-surface-border'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          }
        />
      </div>

      {/* Wide Editorial Carousel (Extends Wider than standard grid - Design Principle 33) */}
      <div
        className="relative w-full overflow-hidden pause-marquee py-2"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Subtle Edge Fades */}
        <div className="absolute left-0 top-0 bottom-0 w-8 sm:w-20 bg-gradient-to-r from-canvas to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-8 sm:w-20 bg-gradient-to-l from-canvas to-transparent z-10 pointer-events-none" />

        <div
          className={`flex gap-6 w-max ${
            isPaused ? '' : 'animate-marquee'
          }`}
          style={{ animationPlayState: isPaused ? 'paused' : 'running' }}
        >
          {marqueeItems.map((item, idx) => (
            <div
              key={`${item.id}-${idx}`}
              className="w-[280px] sm:w-[340px] md:w-[380px] flex-shrink-0 group rounded-lg overflow-hidden bg-surface border border-surface-border hover:border-ink-primary/30 transition-all duration-300 shadow-soft-sm hover:shadow-soft-md"
            >
              {/* Dominant Image Container (Design Principle 33: IMAGE -> YEAR -> TITLE -> DESCRIPTION) */}
              <div className="relative h-48 sm:h-56 w-full overflow-hidden bg-canvas-muted">
                <img
                  src={item.image_url || 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=1000&auto=format&fit=crop'}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500 filter brightness-95"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-dark/60 via-transparent to-transparent" />

                {/* Rank Badge */}
                {item.rank_badge && (
                  <div className="absolute top-3 left-3">
                    <Badge variant="gold" size="sm">
                      <Star className="w-3 h-3 fill-current" />
                      <span>{item.rank_badge}</span>
                    </Badge>
                  </div>
                )}

                {/* Year */}
                <div className="absolute bottom-3 left-3 text-xs font-mono font-bold text-white bg-dark/70 px-2 py-0.5 rounded-sm backdrop-blur-sm">
                  {item.year || '2025'}
                </div>
              </div>

              {/* Editorial Text Block */}
              <div className="p-5 sm:p-6 space-y-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-accent">
                  {item.category || 'Academic Milestone'}
                </span>
                <h3 className="text-base sm:text-lg font-bold font-sans text-ink-primary group-hover:text-accent transition-colors line-clamp-1">
                  {item.title}
                </h3>
                {item.subtitle && (
                  <p className="text-xs font-medium text-ink-secondary line-clamp-1">
                    {item.subtitle}
                  </p>
                )}
                <p className="text-xs text-ink-muted leading-relaxed line-clamp-2">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Controls & Marquee Indicator */}
      <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-8 mt-6 flex items-center justify-between text-xs text-ink-muted">
        <span className="text-[11px]">
          Hover to pause carousel stream
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
