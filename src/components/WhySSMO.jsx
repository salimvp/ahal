import React, { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, ShieldCheck, Users } from 'lucide-react';

export default function WhySSMO() {
  const narrativePoints = [
    {
      number: '01',
      title: 'Decades of Dedicated Teacher Preparation',
      summary: 'Rooted in a 60-year tradition of pedagogical integrity, our curriculum goes far beyond rote textbook instruction to build true classroom mastery.'
    },
    {
      number: '02',
      title: 'Distinguished Master Educator Faculty',
      summary: 'Mentored by faculty holding advanced M.Ed, M.Phil, and doctorate credentials with deep experience in primary curriculum design.'
    },
    {
      number: '03',
      title: 'Expert Classes & TLM Workshops',
      summary: 'Interactive and engaging expert classes and hands on workshops for teaching learning materials.'
    },
    {
      number: '04',
      title: 'Extensive Practical School Internships',
      summary: 'Over 100 days of direct school immersion and micro-teaching practice across top government and aided schools.'
    }
  ];

  return (
    <section id="why-ssmo" className="py-24 sm:py-32 bg-dark relative overflow-hidden text-ink-light border-t border-dark-border">
      <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Top Header */}
        <div className="max-w-3xl mb-16 space-y-4">
          <span className="eyebrow-dark">
            <span className="w-1.5 h-1.5 rounded-full bg-accent-light" />
            Why Choose ITE
          </span>
          <h2 className="section-title text-white">
            An institution engineered specifically for exceptional primary educators.
          </h2>
          <p className="lead-text-dark">
            We don't offer generic degrees. For over six decades, our entire campus, faculty, and resources have been dedicated exclusively to teacher education.
          </p>
          <div className="pt-2">
            <Link
              to="/faculties"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-accent text-white text-xs font-semibold hover:bg-accent-hover transition-colors shadow-dark-sm"
            >
              <Users className="w-4 h-4" />
              Meet Our Faculties
            </Link>
          </div>
        </div>

        {/* Custom Visual Narrative Grid (Design Principle 34: NOT repetitive 3-box cards!) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          
          {/* Left Column: Numbered Narrative Flow with Thin Architectural Lines */}
          <div className="lg:col-span-7 divide-y divide-dark-border">
            {narrativePoints.map((item) => (
              <div
                key={item.number}
                className="py-7 sm:py-8 first:pt-0 last:pb-0 grid grid-cols-1 sm:grid-cols-12 gap-4 sm:gap-6 group"
              >
                {/* Number */}
                <div className="sm:col-span-2 font-mono text-2xl sm:text-3xl font-extrabold text-accent-light opacity-80 group-hover:opacity-100 transition-opacity">
                  {item.number}
                </div>

                {/* Content */}
                <div className="sm:col-span-10 space-y-2">
                  <h3 className="text-lg sm:text-xl font-bold font-sans text-white group-hover:text-accent-light transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-ink-light-secondary leading-relaxed">
                    {item.summary}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Right Column: Large Authentic Visual + Career Advantage Card */}
          <div className="lg:col-span-5 space-y-6">
            {/* Visual Container - Autoplaying Video */}
            <div className="relative rounded-xl overflow-hidden border border-dark-border shadow-dark-md bg-dark-surface">
              <video
                src="https://dnrfscucvxkibcswoekr.supabase.co/storage/v1/object/public/ssmo-assets/videos/why-ssmo-video.mp4"
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-72 sm:h-80 object-cover"
              />
            </div>

            {/* Structured K-TET & Career Coaching Box */}
            <div className="p-6 rounded-xl bg-dark-surface border border-dark-border space-y-4">
              <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-gold-dark">
                <ShieldCheck className="w-4 h-4 text-gold-dark" />
                Career & Competitive Support
              </div>
              <h4 className="text-base font-bold text-white">
                Integrated K-TET, CTET & Kerala PSC Guidance
              </h4>
              <p className="text-xs text-ink-light-secondary leading-relaxed">
                Comprehensive test preparation series, syllabus reviews, and mock exams for Kerala Teacher Eligibility Test (K-TET Cat I & II) to ensure swift school placements.
              </p>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
