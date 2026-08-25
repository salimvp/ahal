import React from 'react';
import SSMOLogo from './SSMOLogo';

export default function LoadingScreen({ progress }) {
  const completed = Math.round(progress);
  const raySpeed = `${Math.max(0.65, 1.75 - completed / 90).toFixed(2)}s`;

  return (
    <div
      className={`loading-screen${completed === 100 ? ' loading-screen--complete' : ''}`}
      role="status"
      aria-live="polite"
      aria-label={`Loading website, ${completed}% complete`}
    >
      <div className="loading-screen__content">
        <SSMOLogo className="loading-screen__logo" />
        <div
          className="loading-screen__ray-wrap"
          style={{ '--loading-progress': `${completed}%`, '--ray-speed': raySpeed }}
          aria-hidden="true"
        >
          <span className="loading-screen__ray loading-screen__ray--left" />
          <span className="loading-screen__ray loading-screen__ray--right" />
          <span className="loading-screen__core" />
        </div>
        <p className="loading-screen__label">Preparing your experience</p>
      </div>
    </div>
  );
}
