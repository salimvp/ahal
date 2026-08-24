import React from 'react';
import { ArrowUpRight, Award, Compass, Sparkles } from 'lucide-react';
import Button from './ui/Button';

export default function Heritage() {
  const milestones = [
    {
      year: '1963',
      title: 'Foundational Vision',
      detail: 'Established under the visionary leadership of the Tirurangadi Muslim Orphanage Committee to pioneer teacher education in Malabar.'
    },
    {
      year: '1985',
      title: 'Pedagogical Expansion',
      detail: 'Expanded teacher training laboratories, dedicated psychology centers, and community teaching practice across Malappuram district.'
    },
    {
      year: '2002',
      title: 'NCTE Recognition',
      detail: 'Accredited with highest standards by the National Council for Teacher Education (NCTE) & Government of Kerala.'
    },
    {
      year: 'Present',
      title: 'Digital & Value Leadership',
      detail: 'Over 5,000 alumni educators shaping classrooms with modern ICT, AI tools, and compassionate pedagogy.'
    }
  ];

  return (
    <section id="heritage" className="py-24 sm:py-32 bg-dark relative overflow-hidden text-ink-light border-t border-dark-border">
      {/* Subtle architectural grid lines */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />

      <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Top Eyebrow & Headline */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-16 pb-12 border-b border-dark-border">
          <div className="lg:col-span-5 space-y-4">
            <span className="eyebrow-dark">
              <span className="w-1.5 h-1.5 rounded-full bg-accent-light" />
              Heritage & Foundation
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-sans font-bold text-white tracking-tight leading-tight">
              Six decades of shaping minds that shape the future.
            </h2>
          </div>

          <div className="lg:col-span-7 space-y-5 text-ink-light-secondary text-sm sm:text-base leading-relaxed max-w-prose-editorial">
            <p>
              Founded in Saudabad, Tirurangadi, SSMO Teacher Training Institute emerged not simply as a training school, but as a social movement. Guided by the humanitarian ethos of the Tirurangadi Muslim Orphanage Committee, it opened doors of opportunity for generations of aspiring primary educators.
            </p>
            <p className="text-xs sm:text-sm text-ink-light-muted">
              Today, SSMO alumni lead classrooms in government and aided schools throughout Kerala, upholding an unbroken tradition of moral integrity, pedagogical mastery, and social commitment.
            </p>
          </div>
        </div>

        {/* Oversized Year Typographic Anchor (Design Principle 32) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center mb-16">
          
          {/* Oversized Typographic Anchor */}
          <div className="lg:col-span-4 flex flex-col justify-center">
            <span className="text-[5rem] sm:text-[7.5rem] lg:text-[8.5rem] font-sans font-extrabold text-white/10 leading-none tracking-tighter select-none font-mono">
              1963
            </span>
            <div className="text-xs uppercase tracking-[0.2em] text-accent-light font-semibold -mt-2 sm:-mt-4">
              Year of Inception • Saudabad
            </div>
          </div>

          {/* Timeline Milestones Columns with Thin Dividers */}
          <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-6 lg:gap-8">
            {milestones.map((item, idx) => (
              <div
                key={idx}
                className="p-6 rounded-lg bg-dark-surface border border-dark-border space-y-3 group hover:border-accent-light/40 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-accent-light tracking-wider">
                    {item.year}
                  </span>
                  <span className="text-[10px] text-ink-light-muted uppercase tracking-widest font-mono">
                    0{idx + 1}
                  </span>
                </div>
                <h3 className="text-base font-bold text-white group-hover:text-accent-light transition-colors">
                  {item.title}
                </h3>
                <p className="text-xs text-ink-light-secondary leading-relaxed">
                  {item.detail}
                </p>
              </div>
            ))}
          </div>

        </div>

      </div>
    </section>
  );
}
