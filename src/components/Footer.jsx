import React from 'react';
import { MapPin, Phone, Mail } from 'lucide-react';
import SSMOLogo from './SSMOLogo';

export default function Footer({ settings = {} }) {
  const currentYear = new Date().getFullYear();

  const sisterInstitutions = [
    'P.S.M.O. College, Tirurangadi',
    'Oriental Higher Secondary School',
    'Tirurangadi Yatheem Khana',
    'MKH School of Nursing & Hospital',
    'SSMO Industrial Training Institute'
  ];

  return (
    <footer className="bg-[#080c14] border-t border-dark-border text-ink-light-muted relative overflow-hidden">
      
      {/* Substantial Typographic Branding Strip (Design Principle 39) */}
      <div className="border-b border-dark-border py-12 sm:py-16">
        <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-start md:items-end justify-between gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <SSMOLogo className="w-12 h-12" />
              <div>
                <span className="text-3xl sm:text-4xl font-sans font-extrabold text-white tracking-tight leading-none block">
                  I.T.E
                </span>
                <span className="text-xs font-mono uppercase tracking-widest text-accent-light">
                  Tirurangadi • Estd 1961
                </span>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-ink-light-secondary max-w-lg leading-relaxed">
              Seethi Sahib Memorial Orphanage Teacher Training Institute. Recognized by NCTE & Government of Kerala under the Tirurangadi Muslim Orphanage Committee.
            </p>
          </div>


        </div>
      </div>

      {/* Main Multi-Column Links */}
      <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12 text-xs">
          
          {/* Col 1: Overview */}
          <div className="space-y-3">
            <div className="font-mono uppercase font-bold text-ink-light tracking-wider text-[11px]">
              About Institution
            </div>
            <p className="text-ink-light-secondary leading-relaxed">
              A premier teacher preparation institute committed to academic distinction, inclusive values, and instructional mastery for elementary education in Kerala.
            </p>
            <div className="text-accent-light font-medium pt-1">
              • NCTE Order Code: F.KL/ELE/2000
            </div>
          </div>

          {/* Col 2: Navigation */}
          <div className="space-y-3">
            <div className="font-mono uppercase font-bold text-ink-light tracking-wider text-[11px]">
              Index Navigation
            </div>
            <ul className="space-y-2 text-ink-light-secondary">
              <li><a href="/#hero" className="hover:text-white transition-colors">01. Home & Identity</a></li>
              <li><a href="/#announcements" className="hover:text-white transition-colors">02. Announcements & Circulars</a></li>
              <li><a href="/#about" className="hover:text-white transition-colors">03. Our Story & Leadership</a></li>
              <li><a href="/#achievements" className="hover:text-white transition-colors">04. Achievements & Accolades</a></li>
              <li><a href="/#why-ssmo" className="hover:text-white transition-colors">05. Why ITE</a></li>
              <li><a href="/#courses" className="hover:text-white transition-colors">06. D.El.Ed Course Details</a></li>
              <li><a href="/gallery" className="hover:text-white transition-colors">07. Photo & Media Archive</a></li>
              <li><a href="/faculties" className="hover:text-white transition-colors">08. Meet Our Faculties</a></li>
              <li><a href="/#contact" className="hover:text-white transition-colors">09. Visit Us & Location</a></li>
            </ul>
          </div>

          {/* Col 3: Orphanage Committee Sister Institutions */}
          <div className="space-y-3">
            <div className="font-mono uppercase font-bold text-ink-light tracking-wider text-[11px]">
              T.M.O. Committee Institutions
            </div>
            <ul className="space-y-2 text-ink-light-secondary">
              {sisterInstitutions.map((inst, idx) => (
                <li key={idx} className="hover:text-white transition-colors">
                  {inst}
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4: Campus Contact */}
          <div className="space-y-3">
            <div className="font-mono uppercase font-bold text-ink-light tracking-wider text-[11px]">
              Campus Office
            </div>
            <div className="space-y-2 text-ink-light-secondary">
              <div className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-accent-light shrink-0 mt-0.5" />
                <span>{settings.contact_address || 'Saudabad, Tirurangadi, Malappuram, Kerala - 676306'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-accent-light shrink-0" />
                <span>{settings.contact_phone || '+91 494 2460300'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-accent-light shrink-0" />
                <span className="truncate">{settings.contact_email || 'ssmottitirurangadi@gmail.com'}</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-dark-border py-6 bg-[#06090f]">
        <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-ink-light-muted">
          <div>
            © {currentYear} Institute of Teacher Education Tirurangadi. All Rights Reserved.
          </div>
          <div className="flex items-center gap-4">
            <span>Govt. Order: G.O.(MS) No. 120/85/G.Edn</span>
            <span>•</span>
            <span>NCTE Code: KL-TTI-024</span>
          </div>
        </div>
      </div>

    </footer>
  );
}
