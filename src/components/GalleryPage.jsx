import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { X, ChevronLeft, ChevronRight, Maximize2, ArrowLeft, Menu } from 'lucide-react';
import Footer from './Footer';
import SSMOLogo from './SSMOLogo';
import { api } from '../services/api';

export default function GalleryPage() {
  const [gallery, setGallery] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activeLightboxIndex, setActiveLightboxIndex] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    async function loadData() {
      try {
        const galRes = await api.getGallery();
        setGallery(galRes || []);
      } catch (err) {
        console.error('Error loading gallery data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const categories = ['All', 'Campus', 'Academic', 'Arts & Sports', 'Internship', 'Community'];

  const filteredItems = gallery.filter(
    (item) => selectedCategory === 'All' || item.category === selectedCategory
  );

  const openLightbox = (index) => setActiveLightboxIndex(index);
  const closeLightbox = () => setActiveLightboxIndex(null);

  const nextLightbox = (e) => {
    e?.stopPropagation();
    if (activeLightboxIndex !== null) {
      setActiveLightboxIndex((activeLightboxIndex + 1) % filteredItems.length);
    }
  };

  const prevLightbox = (e) => {
    e?.stopPropagation();
    if (activeLightboxIndex !== null) {
      setActiveLightboxIndex((activeLightboxIndex - 1 + filteredItems.length) % filteredItems.length);
    }
  };

  const scrollToSection = (id) => {
    setMobileMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-canvas text-ink-primary flex flex-col selection:bg-accent selection:text-white">

      {/* Custom Gallery Navbar */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-dark/95 backdrop-blur-md border-b border-dark-border">
        <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <SSMOLogo className="w-9 h-9 transition-transform duration-300 group-hover:scale-105" />
            <div className="flex flex-col">
              <span className="text-sm font-bold font-sans tracking-tight text-white leading-tight">
                I.T.E
              </span>
              <span className="text-[10px] font-medium text-ink-light-muted tracking-wider uppercase">
                Gallery
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden lg:flex items-center gap-1">
            <Link
              to="/announcements"
              className="px-3 py-1.5 rounded-sm text-xs font-medium text-ink-light-secondary hover:text-white hover:bg-white/5 transition-colors"
            >
              Announcements
            </Link>
            <Link
              to="/achievements"
              className="px-3 py-1.5 rounded-sm text-xs font-medium text-ink-light-secondary hover:text-white hover:bg-white/5 transition-colors"
            >
              Achievements
            </Link>
            <button
              onClick={() => scrollToSection('gallery')}
              className="px-3 py-1.5 rounded-sm text-xs font-medium text-white bg-white/10"
            >
              Photos
            </button>
            <Link
              to="/faculties"
              className="px-3 py-1.5 rounded-sm text-xs font-medium text-ink-light-secondary hover:text-white hover:bg-white/5 transition-colors"
            >
              Faculties
            </Link>
          </div>

          {/* Back to Home + Mobile Menu */}
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="hidden sm:inline-flex items-center gap-2 px-4 py-1.5 rounded-md bg-accent text-white text-xs font-semibold hover:bg-accent-hover transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Home
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-md text-ink-light hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-dark-border bg-dark/95 backdrop-blur-md">
            <div className="px-4 py-4 space-y-2">
              <Link
                to="/announcements"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-sm font-medium text-ink-light hover:text-white hover:bg-white/5 rounded-md transition-colors"
              >
                Announcements
              </Link>
              <Link
                to="/achievements"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-sm font-medium text-ink-light hover:text-white hover:bg-white/5 rounded-md transition-colors"
              >
                Achievements
              </Link>
              <button
                onClick={() => scrollToSection('gallery')}
                className="block w-full text-left px-3 py-2 text-sm font-medium text-white bg-white/10 rounded-md transition-colors cursor-pointer"
              >
                Photos
              </button>
              <Link
                to="/faculties"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-sm font-medium text-ink-light hover:text-white hover:bg-white/5 rounded-md transition-colors"
              >
                Faculties
              </Link>
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-sm font-medium text-accent-light hover:text-white hover:bg-white/5 rounded-md transition-colors"
              >
                ← Back to Home
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Hero Banner */}
      <section className="pt-24 pb-16 bg-dark text-white relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="w-full h-full bg-cover bg-center filter brightness-30" style={{ backgroundImage: 'url(/hero-bg.png)' }} />
          <div className="absolute inset-0 bg-gradient-to-t from-dark via-dark/60 to-dark/80" />
        </div>
        <div className="relative z-10 max-w-content mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white leading-tight">
            Campus Life & Photo Archive
          </h1>
          <p className="mt-3 text-sm sm:text-base text-ink-light-secondary max-w-xl">
            A visual record of teacher trainees engaged in smart classroom sessions, micro-teaching labs, cultural events, and community outreach.
          </p>
        </div>
      </section>

      {/* Gallery Section */}
      <section id="gallery" className="py-16 sm:py-24 bg-canvas-subtle relative">
        <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-8">

          {/* Category Filters */}
          <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto pb-4 mb-8 border-b border-surface-border scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 text-xs font-medium transition-all cursor-pointer whitespace-nowrap rounded-sm ${
                  selectedCategory === cat
                    ? 'bg-accent text-white font-bold'
                    : 'text-ink-muted hover:text-ink-primary bg-surface border border-surface-border'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* All Gallery Images */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-64 bg-surface rounded-lg border border-surface-border" />
              ))}
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-16 bg-surface rounded-lg border border-surface-border p-8 text-ink-muted text-sm">
              No photos found in this category.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredItems.map((item, index) => (
                <div
                  key={item.id}
                  onClick={() => openLightbox(index)}
                  className="group relative rounded-lg overflow-hidden bg-surface border border-surface-border cursor-pointer shadow-soft-sm hover:shadow-soft-md transition-all duration-300 aspect-[4/3]"
                >
                  <img
                    src={item.image_url}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500 filter brightness-95"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-dark/80 via-dark/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-5 text-white">
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-dark/70 px-2 py-0.5 rounded-sm backdrop-blur-sm text-accent-light">
                        {item.category}
                      </span>
                      <Maximize2 className="w-4 h-4 text-white/80" />
                    </div>
                    <div>
                      <h4 className="text-sm sm:text-base font-bold font-sans text-white leading-snug">
                        {item.title}
                      </h4>
                      {item.description && (
                        <p className="text-xs text-ink-light-secondary line-clamp-2 mt-0.5">
                          {item.description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>



      <Footer />

      {/* Lightbox */}
      {activeLightboxIndex !== null && filteredItems[activeLightboxIndex] && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8 bg-dark/95 backdrop-blur-md animate-fade-in"
          onClick={closeLightbox}
        >
          <button
            onClick={closeLightbox}
            className="absolute top-6 right-6 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors z-20"
            aria-label="Close"
          >
            <X className="w-6 h-6" />
          </button>

          <button
            onClick={prevLightbox}
            className="absolute left-6 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors z-20 hidden sm:block"
            aria-label="Previous image"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <button
            onClick={nextLightbox}
            className="absolute right-6 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors z-20 hidden sm:block"
            aria-label="Next image"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          <div
            className="relative max-w-4xl max-h-[85vh] flex flex-col items-center z-10"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={filteredItems[activeLightboxIndex].image_url}
              alt={filteredItems[activeLightboxIndex].title}
              className="max-w-full max-h-[72vh] object-contain rounded-md shadow-dark-md border border-dark-border"
            />
            <div className="mt-4 text-center space-y-1 text-white">
              <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-accent-light">
                {filteredItems[activeLightboxIndex].category} • {activeLightboxIndex + 1} of {filteredItems.length}
              </span>
              <h3 className="text-base sm:text-lg font-bold font-sans">
                {filteredItems[activeLightboxIndex].title}
              </h3>
              {filteredItems[activeLightboxIndex].description && (
                <p className="text-xs text-ink-light-muted max-w-lg mx-auto">
                  {filteredItems[activeLightboxIndex].description}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
