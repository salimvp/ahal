import React from 'react';

export default function BarLoader({
  bars = 8,
  barWidth = 10,
  barHeight = 48,
  color = 'bg-accent-light',
  speed = 1.2,
  className = ''
}) {
  return (
    <div
      className={`relative flex items-end justify-center gap-1 ${className}`}
      aria-hidden="true"
    >
      {Array.from({ length: bars }, (_, index) => (
        <span
          key={index}
          className={`${color} origin-bottom rounded-t-xl animate-bar-loader`}
          style={{
            width: `${barWidth}px`,
            height: `${barHeight}px`,
            animationDelay: `${(index + 1) * 0.1}s`,
            animationDuration: `${speed}s`
          }}
        />
      ))}
    </div>
  );
}
