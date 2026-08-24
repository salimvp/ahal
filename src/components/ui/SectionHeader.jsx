import React from 'react';

export default function SectionHeader({
  eyebrow = '',
  title = '',
  description = '',
  align = 'left', // 'left' | 'center'
  theme = 'light', // 'light' | 'dark'
  action = null,
  className = ''
}) {
  const isDark = theme === 'dark';
  const isCentered = align === 'center';

  return (
    <div
      className={`flex flex-col ${
        isCentered ? 'items-center text-center mx-auto' : 'items-start text-left'
      } ${action ? 'md:flex-row md:items-end md:justify-between gap-6' : ''} mb-12 sm:mb-16 ${className}`}
    >
      <div className={`space-y-3 ${isCentered ? 'max-w-3xl' : 'max-w-2xl'}`}>
        {eyebrow && (
          <div>
            <span className={isDark ? 'eyebrow-dark' : 'eyebrow'}>
              <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
              {eyebrow}
            </span>
          </div>
        )}

        <h2
          className={`section-title ${
            isDark ? 'text-ink-light' : 'text-ink-primary'
          }`}
        >
          {title}
        </h2>

        {description && (
          <p
            className={`${
              isDark ? 'lead-text-dark' : 'lead-text'
            } ${isCentered ? 'mx-auto' : ''}`}
          >
            {description}
          </p>
        )}
      </div>

      {action && (
        <div className="shrink-0 pt-2 md:pt-0">
          {action}
        </div>
      )}
    </div>
  );
}
