import React, { useState, useEffect } from 'react';
import { Menu, X, ArrowUpRight } from 'lucide-react';
import SSMOLogo from './SSMOLogo';

export default function Navbar({ announcements = [], onOpenAnnouncementModal }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', href: '/#hero' },
    { name: 'Announcements', href: '/#announcements', badge: announcements.length > 0 ? announcements.length : null },
    { name: 'Our Story', href: '/#about' },
    { name: 'Achievements', href: '/#achievements' },
    { name: 'Why SSMO', href: '/#why-ssmo' },
    { name: 'D.El.Ed', href: '/#courses' },
    { name: 'Gallery', href: '/gallery' },
    { name: 'Faculties', href: '/faculties' },
    { name: 'Visit Us', href: '/#contact' },
  ];

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300">
        {/* Main Navigation Bar */}
        <nav
          className={`transition-all duration-300 ${
            isScrolled
              ? 'bg-dark/90 backdrop-blur-md border-b border-dark-border py-3 shadow-dark-sm'
              : 'bg-transparent py-4 sm:py-5'
          }`}
        >
          <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
            {/* Logo & Institution Identity */}
            <a href="#hero" className="flex items-center gap-3.5 group">
              <SSMOLogo className="w-10 h-10 sm:w-12 sm:h-12 transition-transform duration-300 group-hover:scale-102" />
              <div className="flex flex-col">
                <span className="text-sm sm:text-base font-bold font-sans tracking-tight text-white leading-tight">
                  I.T.E
                </span>
                <span className="text-[10px] sm:text-[11px] font-medium text-ink-light-muted tracking-wider uppercase">
                  Tirurangadi, Kerala
                </span>
              </div>
            </a>

            {/* Desktop Navigation Links */}
            <div className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="px-3 py-1.5 rounded-sm text-xs font-medium text-ink-light-secondary hover:text-white hover:bg-white/5 transition-colors relative flex items-center gap-1.5"
                >
                  <span>{link.name}</span>
                  {link.badge && (
                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-accent text-white">
                      {link.badge}
                    </span>
                  )}
                </a>
              ))}
            </div>

            {/* Mobile Trigger */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-md text-ink-light hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Toggle navigation"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </nav>
      </header>        {/* Full-Screen Mobile Navigation Overlay (Design Principle 44) */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 bg-black backdrop-blur-xl flex flex-col justify-between p-6 sm:p-10 animate-fade-in lg:hidden">
          <div className="flex items-center justify-between pb-6 border-b border-dark-border">
            <div className="flex items-center gap-3">
              <SSMOLogo className="w-10 h-10" />
              <div>
                <div className="text-base font-bold text-white">ITE</div>
                <div className="text-xs text-ink-light-muted">Tirurangadi</div>
              </div>
            </div>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 rounded-full bg-white/5 text-white hover:bg-white/10 transition-colors"
              aria-label="Close menu"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Large Typographic Links */}
          <div className="flex flex-col space-y-4 my-auto py-8">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-2xl sm:text-3xl font-sans font-bold text-ink-light hover:text-accent-light transition-colors flex items-center justify-between group"
              >
                <span>{link.name}</span>
                <ArrowUpRight className="w-6 h-6 text-ink-light-muted group-hover:text-accent-light transition-colors" />
              </a>
            ))}
          </div>

          <div className="pt-6 border-t border-dark-border flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-ink-light-muted">
            <div>Under Tirurangadi Muslim Orphanage Committee</div>
            <div className="text-accent-light font-medium">NCTE Recognized • Estd 1961</div>
          </div>
        </div>
      )}
    </>
  );
}
