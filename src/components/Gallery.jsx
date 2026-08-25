import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight, Maximize2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import SectionHeader from './ui/SectionHeader';

export default function Gallery({ gallery = [] }) {
  const [activeLightboxIndex, setActiveLightboxIndex] = useState(null);

  // Show only first 6 images on homepage
  const previewItems = gallery.slice(0, 6);

  const openLightbox = (index) => {
    setActiveLightboxIndex(index);
  };

  const closeLightbox = () => {
    setActiveLightboxIndex(null);
  };

  const nextLightbox = (e) => {
    e?.stopPropagation();      if (activeLightboxIndex !== null) {
      setActiveLightboxIndex((activeLightboxIndex + 1) % gallery.length);
    }
  };

  const prevLightbox = (e) => {
    e?.stopPropagation();
    if (activeLightboxIndex !== null) {
      setActiveLightboxIndex((activeLightboxIndex - 1 + gallery.length) % gallery.length);
    }
  };

  return (
    <section id="gallery" className="py-24 sm:py-32 bg-canvas-subtle relative border-t border-surface-border">
      <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
          <div className="space-y-2">
            <span className="eyebrow">
              <span className="w-1.5 h-1.5 rounded-full bg-accent" />
              Visual Archive
            </span>
            <h2 className="section-title text-ink-primary">
              Campus Life in SSMO ITE
            </h2>
          </div>
          <Link
            to="/gallery"
            className="shrink-0 inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-accent text-white text-xs font-semibold hover:bg-accent-hover transition-colors shadow-soft-sm"
          >
            View More
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Asymmetric Editorial Photo Archive Grid (Design Principle 35) */}
        {previewItems.length === 0 ? (
          <div className="text-center py-16 bg-surface rounded-lg border border-surface-border p-8 text-ink-muted text-sm">
            No photos found in this category.
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-6">
              {previewItems.map((item, index) => {
                const colSpan =
                  index % 5 === 0
                    ? 'lg:col-span-8 h-80 sm:h-96'
                    : index % 5 === 1
                    ? 'lg:col-span-4 h-80 sm:h-96'
                    : index % 5 === 2
                    ? 'lg:col-span-4 h-72 sm:h-80'
                    : index % 5 === 3
                    ? 'lg:col-span-4 h-72 sm:h-80'
                    : 'lg:col-span-4 h-72 sm:h-80';

                return (
                  <div
                    key={item.id}
                    onClick={() => openLightbox(index)}
                    className={`${colSpan} group relative rounded-lg overflow-hidden bg-surface border border-surface-border cursor-pointer shadow-soft-sm hover:shadow-soft-md transition-all duration-300`}
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
                          <p className="text-xs text-ink-light-secondary line-clamp-1 mt-0.5">
                            {item.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* View More Button */}
            {gallery.length > 6 && (
              <div className="flex justify-center mt-10">
                <Link
                  to="/gallery"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-md bg-accent text-white text-sm font-semibold hover:bg-accent-hover transition-colors shadow-soft-sm"
                >
                  View More Photos
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            )}
          </>
        )}

      </div>

      {/* Premium Uncluttered Lightbox Modal (Design Principle 37) */}
      {activeLightboxIndex !== null && gallery[activeLightboxIndex] && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8 bg-dark/95 backdrop-blur-md animate-fade-in"
          onClick={closeLightbox}
        >
          {/* Close Button */}
          <button
            onClick={closeLightbox}
            className="absolute top-6 right-6 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors z-20"
            aria-label="Close"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Navigation Arrows */}
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

          {/* Centered Image & Caption */}
          <div
            className="relative max-w-4xl max-h-[85vh] flex flex-col items-center z-10"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={gallery[activeLightboxIndex].image_url}
              alt={gallery[activeLightboxIndex].title}
              className="max-w-full max-h-[72vh] object-contain rounded-md shadow-dark-md border border-dark-border"
            />
            <div className="mt-4 text-center space-y-1 text-white">
              <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-accent-light">
                {gallery[activeLightboxIndex].category} • {activeLightboxIndex + 1} of {gallery.length}
              </span>
              <h3 className="text-base sm:text-lg font-bold font-sans">
                {gallery[activeLightboxIndex].title}
              </h3>
              {gallery[activeLightboxIndex].description && (
                <p className="text-xs text-ink-light-muted max-w-lg mx-auto">
                  {gallery[activeLightboxIndex].description}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
