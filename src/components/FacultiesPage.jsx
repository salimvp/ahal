import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Search,
  Menu,
  X,
  Users,
  Sparkles
} from 'lucide-react';
import { api } from '../services/api';
import Footer from './Footer';
import SSMOLogo from './SSMOLogo';

export default function FacultiesPage() {
  const [faculties, setFaculties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDept, setSelectedDept] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    async function loadFaculties() {
      try {
        const data = await api.getFaculties('All', '', false);
        setFaculties(data || []);
      } catch (err) {
        console.error('Failed to load faculties:', err);
      } finally {
        setLoading(false);
      }
    }
    loadFaculties();
  }, []);

  // Dynamically extract unique typed departments
  const typedDepartments = [
    'All',
    ...Array.from(
      new Set(
        faculties
          .map((f) => f.department?.trim())
          .filter((dept) => Boolean(dept) && dept !== 'All')
      )
    )
  ];

  const filteredFaculties = faculties.filter((f) => {
    const matchesDept = selectedDept === 'All' || f.department?.trim() === selectedDept;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      f.name?.toLowerCase().includes(q) ||
      f.department?.toLowerCase().includes(q);
    return matchesDept && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-canvas text-ink-primary flex flex-col selection:bg-accent selection:text-white">
      {/* Dark Navbar */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-dark/95 backdrop-blur-md border-b border-dark-border">
        <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <SSMOLogo className="w-9 h-9 transition-transform duration-300 group-hover:scale-105" />
            <div className="flex flex-col">
              <span className="text-sm font-bold font-sans tracking-tight text-white leading-tight">
                ITE
              </span>
              <span className="text-[10px] font-medium text-ink-light-muted tracking-wider uppercase">
                Faculty Directory
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden lg:flex items-center gap-1">
            <Link
              to="/gallery"
              className="px-3 py-1.5 rounded-sm text-xs font-medium text-ink-light-secondary hover:text-white hover:bg-white/5 transition-colors"
            >
              Gallery
            </Link>
            <Link
              to="/faculties"
              className="px-3 py-1.5 rounded-sm text-xs font-medium text-white bg-white/10"
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
              className="lg:hidden p-2 rounded-md text-ink-light hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
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
                to="/gallery"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-sm font-medium text-ink-light hover:text-white hover:bg-white/5 rounded-md transition-colors"
              >
                Gallery
              </Link>
              <span className="block px-3 py-2 text-sm font-medium text-white bg-white/10 rounded-md">
                Faculties
              </span>
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

      {/* Hero Header Section */}
      <section className="pt-28 pb-16 bg-dark text-white relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div
            className="w-full h-full bg-cover bg-center filter brightness-30"
            style={{ backgroundImage: 'url(/hero-bg.png)' }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-dark via-dark/70 to-dark/80" />
        </div>
        <div className="relative z-10 max-w-content mx-auto px-4 sm:px-6 lg:px-8 space-y-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider bg-accent/20 text-accent-light border border-accent/30">
            <Sparkles className="w-3.5 h-3.5" />
            Distinguished Faculty & Mentors
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight leading-tight">
            Meet Our Educational Faculty
          </h1>
          <p className="text-sm sm:text-base text-ink-light-secondary max-w-2xl leading-relaxed">
            Dedicated educators shaping future school teachers at SSMO Institute of Teacher Education, Tirurangadi.
          </p>
        </div>
      </section>

      {/* Main Faculty Section */}
      <section className="py-12 sm:py-20 flex-1 bg-canvas">
        <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          
          {/* Department Filter Pills & Search */}
          <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between pb-6 border-b border-surface-border">
            {/* Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
              {typedDepartments.map((dept) => (
                <button
                  key={dept}
                  onClick={() => setSelectedDept(dept)}
                  className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                    selectedDept === dept
                      ? 'bg-accent text-white shadow-soft-sm scale-102'
                      : 'bg-surface hover:bg-canvas-subtle text-ink-secondary border border-surface-border'
                  }`}
                >
                  {dept}
                </button>
              ))}
            </div>

            {/* Search Box */}
            <div className="relative w-full md:w-72 shrink-0">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search faculty name or department..."
                className="w-full pl-10 pr-4 py-2 bg-surface border border-surface-border rounded-full text-xs text-ink-primary placeholder-ink-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
              />
            </div>
          </div>

          {/* Big Box-Shaped Faculty Cards Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
              {[1, 2, 3, 4].map((n) => (
                <div
                  key={n}
                  className="rounded-2xl bg-surface border border-surface-border overflow-hidden animate-pulse flex flex-col"
                >
                  <div className="aspect-[4/5] bg-canvas-subtle" />
                  <div className="p-5 space-y-2">
                    <div className="h-5 bg-canvas-subtle rounded w-3/4" />
                    <div className="h-4 bg-canvas-subtle rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredFaculties.length === 0 ? (
            <div className="py-20 text-center bg-surface border border-surface-border rounded-2xl p-8 space-y-3">
              <Users className="w-10 h-10 text-ink-muted mx-auto opacity-50" />
              <h3 className="text-base font-bold text-ink-primary">No Faculty Members Found</h3>
              <p className="text-xs text-ink-muted max-w-sm mx-auto">
                No profiles matched your filter or search query.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
              {filteredFaculties.map((faculty) => (
                <div
                  key={faculty.id}
                  className="group relative flex flex-col bg-surface border border-surface-border rounded-2xl overflow-hidden shadow-soft-sm hover:shadow-soft-xl hover:border-accent/50 transition-all duration-500"
                >
                  {/* Big Box-Shaped Image Container (Aspect 4/5) */}
                  <div className="relative w-full aspect-[4/5] bg-dark overflow-hidden">
                    <img
                      src={faculty.image_url || '/principal.jpeg'}
                      alt={faculty.name}
                      className="w-full h-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-105 filter group-hover:brightness-105"
                      onError={(e) => {
                        e.target.src = '/principal.jpeg';
                      }}
                    />

                    {/* Dark Vignette / Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-dark/95 via-dark/25 to-transparent" />

                    {/* Bottom Image Overlay (Name & Typed Department) */}
                    <div className="absolute bottom-4 left-4 right-4 z-10 space-y-1">
                      <h3 className="text-lg sm:text-xl font-bold font-sans text-white tracking-tight leading-snug drop-shadow-md">
                        {faculty.name}
                      </h3>
                      {faculty.department && (
                        <div className="inline-block px-2.5 py-0.5 rounded-md bg-accent/90 backdrop-blur-sm text-white text-[11px] font-bold uppercase tracking-wider shadow-sm">
                          {faculty.department}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Clean Bottom Card Footer */}
                  <div className="p-4 bg-surface flex items-center justify-between border-t border-surface-border/60">
                    <span className="text-xs font-bold text-ink-primary truncate">
                      {faculty.name}
                    </span>
                    {faculty.department && (
                      <span className="text-[11px] font-medium text-accent shrink-0 ml-2">
                        {faculty.department}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </section>

      <Footer />
    </div>
  );
}
