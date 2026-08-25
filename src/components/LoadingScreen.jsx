import React from 'react';
import SSMOLogo from './SSMOLogo';
import BarLoader from './ui/BarLoader';

export default function LoadingScreen({ progress }) {
  const completed = Math.round(progress);
  const loaderSpeed = Math.max(0.65, 1.75 - completed / 90);

  return (
    <div
      className={`loading-screen${completed === 100 ? ' loading-screen--complete' : ''}`}
      role="status"
      aria-live="polite"
      aria-label={`Loading website, ${completed}% complete`}
    >
      <div className="loading-screen__content">
        <SSMOLogo className="loading-screen__logo" />
        <BarLoader
          bars={10}
          barWidth={7}
          barHeight={38}
          speed={loaderSpeed}
          className="loading-screen__bars"
        />
        <p className="loading-screen__label">Preparing your experience</p>
      </div>
    </div>
  );
}
