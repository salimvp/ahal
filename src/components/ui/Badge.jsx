import React from 'react';

export default function Badge({
  children,
  variant = 'accent', // 'accent' | 'neutral' | 'dark' | 'gold' | 'warning' | 'error'
  size = 'md', // 'sm' | 'md'
  className = ''
}) {
  const sizeStyles = {
    sm: 'text-[10px] px-2 py-0.5 font-medium tracking-wide',
    md: 'text-xs px-2.5 py-0.5 font-semibold tracking-wide',
  };

  const variantStyles = {
    accent: 'bg-accent-subtle text-accent border border-accent/15',
    neutral: 'bg-canvas-subtle text-ink-secondary border border-surface-border',
    dark: 'bg-dark-surface text-ink-light-secondary border border-dark-border',
    gold: 'bg-gold-subtle text-gold hover:text-gold-hover border border-gold/20',
    warning: 'bg-amber-50 text-amber-800 border border-amber-200',
    error: 'bg-rose-50 text-rose-800 border border-rose-200',
  };

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-sm uppercase ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}>
      {children}
    </span>
  );
}
