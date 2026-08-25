import React, { useState } from 'react';
import { X, ExternalLink, Calendar, Copy, Check, FileText } from 'lucide-react';
import Badge from './ui/Badge';
import Button from './ui/Button';

export default function AnnouncementModal({ announcement, onClose }) {
  const [copied, setCopied] = useState(false);

  if (!announcement) return null;

  const handleCopyLink = () => {
    const url = announcement.link || window.location.href;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formattedDate = announcement.created_at
    ? new Date(announcement.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : 'Recent Notice';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-dark/75 backdrop-blur-sm animate-fade-in">
      {/* Backdrop */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal Container */}
      <div className="relative w-full max-w-2xl bg-surface border border-surface-border rounded-xl shadow-soft-lg overflow-hidden z-10 flex flex-col max-h-[88vh]">
        
        {/* Header */}
        <div className="bg-canvas-subtle p-6 sm:p-7 border-b border-surface-border flex items-start justify-between gap-4">
          <div className="space-y-2.5">
            <div className="flex flex-wrap items-center gap-2">
              {announcement.badge && (
                <Badge variant={announcement.badge === 'IMPORTANT' ? 'warning' : 'accent'}>
                  {announcement.badge}
                </Badge>
              )}
              <Badge variant="neutral">
                {announcement.category || 'Official Notice'}
              </Badge>
              <span className="text-xs text-ink-muted flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-ink-muted" />
                {formattedDate}
              </span>
            </div>

            <h3 className="text-xl sm:text-2xl font-sans font-bold text-ink-primary tracking-tight leading-snug">
              {announcement.title}
            </h3>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-md text-ink-muted hover:text-ink-primary hover:bg-canvas-muted transition-colors shrink-0"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-7 overflow-y-auto space-y-6 text-ink-secondary text-sm sm:text-base leading-relaxed">
          {announcement.content ? (
            <div className="whitespace-pre-line bg-canvas p-5 rounded-md border border-surface-border text-ink-primary leading-relaxed font-sans">
              {announcement.content}
            </div>
          ) : (
            <p className="text-sm text-ink-muted italic">
              Please refer to the official link below for complete details.
            </p>
          )}

          {/* Attached Link Card */}
          {announcement.link && (
            <div className="bg-canvas-subtle border border-surface-border rounded-md p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded bg-surface text-accent border border-surface-border">
                  <FileText className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-ink-primary">Official Link / Reference</div>
                  <div className="text-xs text-ink-muted truncate max-w-xs sm:max-w-sm">
                    {announcement.link}
                  </div>
                </div>
              </div>

              <Button
                href={announcement.link}
                target="_blank"
                rel="noopener noreferrer"
                variant="primary"
                size="sm"
                className="w-full sm:w-auto shrink-0"
                iconComponent={ExternalLink}
              >
                Open Link
              </Button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-canvas-subtle px-6 py-4 border-t border-surface-border flex items-center justify-between gap-3">
          <button
            onClick={handleCopyLink}
            className="text-xs font-semibold text-ink-secondary hover:text-ink-primary flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-accent" />
                <span className="text-accent">Link copied to clipboard</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Notice Link</span>
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
