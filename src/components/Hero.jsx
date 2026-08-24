import React from 'react';
import SSMOLogo from './SSMOLogo';
import Button from './ui/Button';

export default function Hero({ settings = {} }) {
  const heroImage = settings.hero_poster_image || '/hero-bg.png';

  return (
    <section id="hero" className="relative min-h-[95vh] lg:min-h-screen flex flex-col justify-between pt-24 sm:pt-32 pb-10 bg-dark text-white overflow-hidden">
      {/* Background Full-Bleed Image */}
      <div className="absolute inset-0 z-0">
        <div
          className="w-full h-full bg-cover bg-center filter brightness-45 contrast-105"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
        {/* Dark Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-dark via-dark/50 to-dark/80" />
      </div>

      {/* Hero Core Content Composition */}
      <div className="relative z-10 max-w-content mx-auto px-4 sm:px-6 lg:px-8 w-full flex-1 flex flex-col justify-center items-center text-center my-auto">
        
        {/* ITE Logo */}
        <div className="mb-4 sm:mb-6">
          <SSMOLogo className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 transition-transform duration-500 hover:scale-103 drop-shadow-2xl" />
        </div>

        {/* Main Headline */}
        <div className="space-y-3 max-w-4xl mx-auto">
          <div className="text-base sm:text-lg md:text-xl font-bold tracking-[0.18em] text-accent-light uppercase font-mono">
            Seethi Sahib Memorial Orphanage
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
            INSTITUTE OF TEACHER EDUCATION
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl font-serif italic text-gold-dark font-normal">
            Tirurangadi, Malappuram, Kerala
          </p>
        </div>

        {/* Tagline */}
        <p className="mt-4 sm:mt-5 max-w-xl mx-auto text-sm sm:text-base text-ink-light-secondary font-normal leading-relaxed">
          {settings.tagline || 'Learn With Passion, Live With Purpose'}
        </p>

        {/* CTA Buttons */}
        <div className="mt-6 sm:mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
          <Button
            href="#announcements"
            variant="darkPrimary"
            size="lg"
          >
            View Announcements
          </Button>


        </div>
      </div>

      {/* Statistics Strip */}
      <div className="relative z-10 max-w-content mx-auto px-4 sm:px-6 lg:px-8 w-full pt-6 mt-4 border-t border-dark-border">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 text-center md:text-left">
          <div className="space-y-0.5">
            <span className="text-xl sm:text-2xl font-bold font-sans text-white tracking-tight">60+ Years</span>
            <p className="text-[11px] sm:text-xs text-ink-light-muted">Pedagogical Heritage</p>
          </div>
          <div className="space-y-0.5 border-l border-dark-border pl-4 sm:pl-6">
            <span className="text-xl sm:text-2xl font-bold font-sans text-accent-light tracking-tight">100% Pass</span>
            <p className="text-[11px] sm:text-xs text-ink-light-muted">D.El.Ed Board Exam Record</p>
          </div>
          <div className="space-y-0.5 border-l border-dark-border pl-4 sm:pl-6">
            <span className="text-xl sm:text-2xl font-bold font-sans text-white tracking-tight">5,000+</span>
            <p className="text-[11px] sm:text-xs text-ink-light-muted">Alumni Educators</p>
          </div>
          <div className="space-y-0.5 border-l border-dark-border pl-4 sm:pl-6">
            <span className="text-xl sm:text-2xl font-bold font-sans text-gold-dark tracking-tight">NCTE</span>
            <p className="text-[11px] sm:text-xs text-ink-light-muted">Govt. of Kerala Approved</p>
          </div>
        </div>
      </div>
    </section>
  );
}
