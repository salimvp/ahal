import React from 'react';
import { BookOpen, CheckCircle2 } from 'lucide-react';
import SectionHeader from './ui/SectionHeader';

export default function Courses() {
  const highlights = [
    { label: 'Program Name', value: 'Diploma in Elementary Education (D.El.Ed)' },
    { label: 'Duration', value: '2 Academic Years (4 Semesters)' },
    { label: 'Recognition', value: 'National Council for Teacher Education (NCTE) & Govt. of Kerala' },
    { label: 'Eligibility', value: 'Higher Secondary (+2) or equivalent with minimum 50% marks' },
    { label: 'Medium', value: 'Malayalam' },
    { label: 'Career Pathway', value: 'Primary & Upper Primary School Teacher (LPSA / UPSA)' }
  ];

  const modules = [
    'Childhood & The Growing Child (Developmental Psychology)',
    'Pedagogy of Primary Language Education (Malayalam, English, Arabic)',
    'Mathematics & Environmental Studies Pedagogy',
    'ICT in Education & Modern Learning Technologies',
    'Art, Craft & TLM (Teaching Learning Material) Creation',
    'Physical Education, Health & Community Outreach',
    '100+ Days Intensive School Internship & Micro-Teaching',
    'Educational Action Research & Reflective Journaling'
  ];

  return (
    <section id="courses" className="py-24 sm:py-32 bg-canvas relative border-t border-surface-border">
      <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-8">
        
        <SectionHeader
          eyebrow="Academic Programs"
          title="Diploma in Elementary Education"
          description="A rigorous two-year professional teacher training program designed to prepare confident, creative, and compassionate elementary educators."
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* Left Column: Program Specifications */}
          <div className="lg:col-span-7 bg-surface rounded-xl border border-surface-border p-6 sm:p-8 shadow-soft-sm space-y-6">
            <h3 className="text-lg font-bold font-sans text-ink-primary flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-accent" />
              Program Overview & Structure
            </h3>

            <div className="divide-y divide-surface-border">
              {highlights.map((item, idx) => (
                <div
                  key={idx}
                  className="py-3.5 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-4"
                >
                  <span className="text-xs font-semibold text-ink-secondary">
                    {item.label}
                  </span>
                  <span className="text-xs sm:text-sm font-medium text-ink-primary sm:text-right">
                    {item.value}
                  </span>
                </div>
              ))}
            </div>


          </div>

          {/* Right Column: Pedagogical Modules */}
          <div className="lg:col-span-5 bg-surface rounded-xl border border-surface-border p-6 sm:p-8 shadow-soft-sm space-y-6">
            <h3 className="text-lg font-bold font-sans text-ink-primary">
              Curriculum & Practical Focus
            </h3>

            <div className="space-y-2.5">
              {modules.map((mod, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2.5 p-2.5 rounded-md bg-canvas text-xs text-ink-primary border border-surface-border"
                >
                  <CheckCircle2 className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                  <span className="leading-snug">{mod}</span>
                </div>
              ))}
            </div>


          </div>

        </div>

      </div>
    </section>
  );
}
