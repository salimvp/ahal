import React, { useState, useEffect } from 'react';
import { X, Star, Calendar, Copy, Check, Trophy, Tag } from 'lucide-react';
import Badge from './ui/Badge';
import Button from './ui/Button';

export default function AchievementModal({ achievement, onClose }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!achievement) return null;

  const handleCopyDetails = () => {
    const text = `${achievement.title}\n${achievement.subtitle ? achievement.subtitle + '\n' : ''}${achievement.description || ''}\nSSMO Institute of Teacher Education`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formattedDate = achievement.created_at
    ? new Date(achievement.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-dark/80 backdrop-blur-md animate-fade-in">
      {/* Backdrop */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal Container — Big Size with Full Details */}
      <div className="relative w-full max-w-3xl bg-surface border border-surface-border rounded-2xl shadow-soft-lg overflow-hidden z-10 flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="bg-canvas-subtle p-5 sm:p-6 border-b border-surface-border flex items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              {achievement.rank_badge && (
                <Badge variant="gold" size="md">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <span>{achievement.rank_badge}</span>
                </Badge>
              )}
              <Badge variant="accent" size="md">
                <Tag className="w-3.5 h-3.5" />
                <span>{achievement.category || 'Academic Milestone'}</span>
              </Badge>
              {achievement.year && (
                <span className="text-xs font-mono font-bold text-ink-secondary bg-surface px-2.5 py-1 rounded-sm border border-surface-border flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-accent" />
                  {achievement.year}
                </span>
              )}
            </div>

            <h2 className="text-xl sm:text-2xl md:text-3xl font-sans font-bold text-ink-primary tracking-tight leading-snug">
              {achievement.title}
            </h2>
            {achievement.subtitle && (
              <p className="text-sm sm:text-base font-medium text-accent">
                {achievement.subtitle}
              </p>
            )}
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg text-ink-muted hover:text-ink-primary hover:bg-canvas-muted transition-colors shrink-0 cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Modal Body */}
        <div className="p-5 sm:p-7 overflow-y-auto space-y-6 text-ink-secondary">
          
          {/* Big Featured Image */}
          {achievement.image_url && (
            <div className="relative w-full h-64 sm:h-80 md:h-96 rounded-xl overflow-hidden bg-dark border border-surface-border shadow-soft-sm group">
              <img
                src={achievement.image_url}
                alt={achievement.title}
                className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-dark/60 via-transparent to-transparent pointer-events-none" />

              {/* Floating Rank Badge on Image */}
              {achievement.rank_badge && (
                <div className="absolute bottom-4 left-4">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-gold text-white text-xs font-bold font-mono shadow-md backdrop-blur-sm">
                    <Trophy className="w-4 h-4 fill-current" />
                    <span>{achievement.rank_badge}</span>
                  </span>
                </div>
              )}

              {achievement.year && (
                <div className="absolute bottom-4 right-4 text-xs font-mono font-bold text-white bg-dark/80 px-3 py-1.5 rounded-md backdrop-blur-sm">
                  Academic Year: {achievement.year}
                </div>
              )}
            </div>
          )}

          {/* Full Description Block */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-ink-muted flex items-center gap-1.5">
              <Trophy className="w-3.5 h-3.5 text-accent" />
              Achievement Overview & Details
            </h4>
            
            <div className="whitespace-pre-line bg-canvas p-5 sm:p-6 rounded-xl border border-surface-border text-ink-primary text-sm sm:text-base leading-relaxed font-sans shadow-soft-sm">
              {achievement.description || 'No additional description provided for this milestone.'}
            </div>
          </div>

          {/* Metadata info */}
          {formattedDate && (
            <div className="text-xs text-ink-muted flex items-center gap-2 pt-2">
              <span>Recorded: {formattedDate}</span>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-canvas-subtle px-6 py-4 border-t border-surface-border flex items-center justify-between gap-3">
          <button
            onClick={handleCopyDetails}
            className="text-xs font-semibold text-ink-secondary hover:text-ink-primary flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-accent" />
                <span className="text-accent">Details copied to clipboard</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Details</span>
              </>
            )}
          </button>

          <Button
            onClick={onClose}
            variant="secondary"
            size="sm"
            icon={false}
          >
            Close
          </Button>
        </div>

      </div>
    </div>
  );
}
