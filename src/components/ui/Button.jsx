import React from 'react';
import { ArrowRight, Loader2 } from 'lucide-react';

export default function Button({
  children,
  variant = 'primary', // 'primary' | 'secondary' | 'outline' | 'text' | 'dark'
  size = 'md', // 'sm' | 'md' | 'lg'
  icon = true,
  iconComponent = null,
  loading = false,
  className = '',
  href = null,
  onClick = null,
  type = 'button',
  disabled = false,
  ...props
}) {
  const baseStyles = 'inline-flex items-center justify-center font-sans font-semibold transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none group';

  const sizeStyles = {
    sm: 'text-xs px-3.5 py-1.5 rounded-sm gap-1.5 h-8',
    md: 'text-xs sm:text-sm px-5 py-2.5 rounded-md gap-2 h-10',
    lg: 'text-sm sm:text-base px-6 py-3 rounded-md gap-2.5 h-12',
  };

  const variantStyles = {
    primary: 'bg-accent text-white hover:bg-accent-hover active:bg-accent-active shadow-soft-sm hover:shadow-soft-md',
    secondary: 'bg-canvas-subtle text-ink-primary hover:bg-canvas-muted border border-surface-border',
    outline: 'bg-transparent text-ink-primary border border-surface-border hover:border-ink-primary hover:bg-surface',
    dark: 'bg-dark-surface text-ink-light border border-dark-border hover:bg-dark-elevated hover:border-white/20',
    darkPrimary: 'bg-accent text-white hover:bg-accent-hover shadow-dark-sm',
    text: 'bg-transparent text-accent hover:text-accent-hover p-0 h-auto font-semibold gap-1.5 group-hover:gap-2.5',
    textDark: 'bg-transparent text-accent-light hover:text-white p-0 h-auto font-semibold gap-1.5 group-hover:gap-2.5',
  };

  const IconToRender = iconComponent || ArrowRight;

  const content = (
    <>
      {loading && <Loader2 className="w-4 h-4 animate-spin shrink-0" />}
      <span>{children}</span>
      {!loading && icon && (
        <IconToRender className="w-3.5 h-3.5 shrink-0 transition-transform duration-200 group-hover:translate-x-0.5" />
      )}
    </>
  );

  if (href) {
    return (
      <a
        href={href}
        className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
        {...props}
      >
        {content}
      </a>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {content}
    </button>
  );
}
