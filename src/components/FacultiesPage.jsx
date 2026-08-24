import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Users, Award, BookOpen, Menu, X } from 'lucide-react';
import Footer from './Footer';
import SSMOLogo from './SSMOLogo';

const faculties = [
  {
    name: 'Dr. A. Basheer',
    designation: 'Senior Lecturer, Pedagogy',
    qualification: 'M.Ed, Ph.D',
    image: '/principal.jpeg',
    expertise: 'Child Psychology & Curriculum Design'
  },
  {
    name: 'Shanavas Paravannur',
    designation: 'Principal',
    qualification: 'M.Ed, M.Phil',
    image: '/principal.jpeg',
    expertise: 'Educational Leadership & Administration'
  },
  {
    name: 'MK Bava Sahib',
    designation: 'Manager',
    qualification: 'M.A, B.Ed',
    image: '/manager.jpeg',
    expertise: 'Institutional Management'
  }
];

export default function FacultiesPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-canvas text-ink-primary flex flex-col selection:bg-accent selection:text-white">

      {/* Custom Navbar - Dark (matching Gallery page) */}
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
                Faculties
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
              className="lg:hidden p-2 rounded-md text-ink-light hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu - Dark */}
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

      {/* Hero Banner */}
      <section className="pt-24 pb-16 bg-dark text-white relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="w-full h-full bg-cover bg-center filter brightness-30" style={{ backgroundImage: 'url(/hero-bg.png)' }} />
          <div className="absolute inset-0 bg-gradient-to-t from-dark via-dark/60 to-dark/80" />
        </div>
        <div className="relative z-10 max-w-content mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white leading-tight">
            Meet Our Faculties
          </h1>
          <p className="mt-3 text-sm sm:text-base text-ink-light-secondary max-w-xl">
            Dedicated educators and administrators committed to shaping the next generation of school teachers.
          </p>
        </div>
      </section>

      {/* Faculties Grid */}
      <section className="py-16 sm:py-24 flex-1">
        <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {faculties.map((faculty, idx) => (
              <div
                key={idx}
                className="group p-6 rounded-xl bg-surface border border-surface-border hover:border-accent/40 hover:shadow-soft-md transition-all duration-300"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-surface-border group-hover:border-accent/50 transition-colors">
                    <img
                      src={faculty.image}
                      alt={faculty.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-ink-primary group-hover:text-accent transition-colors">
                      {faculty.name}
                    </h4>
                    <p className="text-xs text-accent font-medium">
                      {faculty.designation}
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs text-ink-secondary">
                    <BookOpen className="w-3.5 h-3.5 text-accent shrink-0" />
                    <span>{faculty.qualification}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-ink-secondary">
                    <Award className="w-3.5 h-3.5 text-gold-dark shrink-0" />
                    <span>{faculty.expertise}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
