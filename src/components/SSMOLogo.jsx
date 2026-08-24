import React from 'react';

export default function SSMOLogo({ className = "w-20 h-20", showText = false }) {
  return (
    <div className={`inline-flex items-center gap-3 ${showText ? 'flex-row' : ''}`}>
      <div className="relative flex items-center justify-center">
        {/* Ambient Glow */}
        <div className="absolute inset-0 bg-brand-500/20 rounded-full blur-xl animate-pulse"></div>
        
        {/* Logo Image */}
        <img
          src="/ssmo-logo.png"
          alt="ITE Logo"
          className={`${className} relative z-10`}
        />
      </div>

      {showText && (
        <div className="flex flex-col text-left">
          <span className="text-xl md:text-2xl font-serif font-black tracking-wide text-white leading-tight">
            I.T.E
          </span>
          <span className="text-xs md:text-sm font-semibold tracking-wider text-brand-400 uppercase">
            Tirurangadi, Kerala
          </span>
          <span className="text-[10px] text-slate-400 tracking-tight hidden sm:block">
            Under Tirurangadi Muslim Orphanage Committee
          </span>
        </div>
      )}
    </div>
  );
}
