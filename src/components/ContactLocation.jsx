import React, { useState } from 'react';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  Train,
  Plane,
  Bus,
  CheckCircle2,
  AlertCircle,
  ExternalLink
} from 'lucide-react';
import { api } from '../services/api';
import Button from './ui/Button';

export default function ContactLocation({ settings = {} }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'General Query',
    message: ''
  });
  const [status, setStatus] = useState({ loading: false, success: false, error: '' });

  const mapEmbedUrl =
    settings.google_map_embed ||
    'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15668.60155252877!2d75.9220002!3d11.0270002!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ba64e43b18c6449%3A0xa64b3dfba5b0f47e!2sTirurangadi%20Muslim%20Orphanage%2C%20Saudabad%2C%20Tirurangadi%2C%20Kerala%20676306!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, success: false, error: '' });

    try {
      await api.submitInquiry(formData);
      setStatus({ loading: false, success: true, error: '' });
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: 'General Query',
        message: ''
      });
    } catch (err) {
      setStatus({ loading: false, success: false, error: err.message || 'Failed to submit inquiry' });
    }
  };

  return (
    <section id="contact" className="py-24 sm:py-32 bg-dark relative overflow-hidden text-ink-light border-t border-dark-border">
      <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header (VISIT US - Design Principle 38) */}
        <div className="max-w-3xl mb-16 space-y-4">
          <span className="eyebrow-dark">
            <span className="w-1.5 h-1.5 rounded-full bg-accent-light" />
            Visit & Connect
          </span>
          <h2 className="section-title text-white">
            Campus Location & Contact
          </h2>
          <p className="lead-text-dark">
            Located in the historic town of Tirurangadi, within the serene Saudabad educational complex.
          </p>
        </div>

        {/* 2-Column Story Layout: Large Address + Transit on Left, Inquiry Form on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start mb-16">
          
          {/* Left Column: Architectural Address & Transit Guide */}
          <div className="lg:col-span-6 space-y-8">
            
            {/* Prominent Address Card */}
            <div className="p-8 rounded-xl bg-dark-surface border border-dark-border space-y-4">
              <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-accent-light">
                Official Campus Address
              </div>
              <h3 className="text-xl sm:text-2xl font-bold font-sans text-white leading-snug">
                {settings.contact_address || 'Saudabad, Tirurangadi, Malappuram District, Kerala - 676306, India'}
              </h3>
              
              <div className="pt-4 border-t border-dark-border grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1">
                  <span className="text-ink-light-muted block">Direct Helpline</span>
                  <span className="font-mono text-white font-medium">
                    {settings.contact_phone || '+91 494 2460300'}
                  </span>
                </div>
                <div className="space-y-1">
                  <span className="text-ink-light-muted block">Official Email</span>
                  <span className="text-accent-light font-medium truncate block">
                    {settings.contact_email || 'ssmottitirurangadi@gmail.com'}
                  </span>
                </div>
              </div>
            </div>

            {/* Transit Route Information */}
            <div className="p-6 rounded-xl bg-dark-surface/60 border border-dark-border space-y-4">
              <div className="text-xs font-mono font-bold uppercase tracking-wider text-ink-light-secondary">
                Transit & Accessibility
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-md bg-dark border border-dark-border space-y-1">
                  <Train className="w-4 h-4 text-accent-light" />
                  <div className="text-xs font-bold text-white">Railway</div>
                  <div className="text-[11px] text-ink-light-muted">Parappanangadi (7 km)</div>
                </div>

                <div className="p-3 rounded-md bg-dark border border-dark-border space-y-1">
                  <Plane className="w-4 h-4 text-gold-dark" />
                  <div className="text-xs font-bold text-white">Airport</div>
                  <div className="text-[11px] text-ink-light-muted">Calicut (CCJ) (14 km)</div>
                </div>

                <div className="p-3 rounded-md bg-dark border border-dark-border space-y-1">
                  <Bus className="w-4 h-4 text-accent-light" />
                  <div className="text-xs font-bold text-white">Bus Stop</div>
                  <div className="text-[11px] text-ink-light-muted">Saudabad Junction</div>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Clean Form Controls (Design Principle 46) */}
          <div className="lg:col-span-6 bg-dark-surface rounded-xl border border-dark-border p-6 sm:p-8 shadow-dark-sm space-y-6">
            <div>
              <h3 className="text-lg font-bold font-sans text-white">
                Send an Office Inquiry
              </h3>
              <p className="text-xs text-ink-light-muted mt-1">
                Submissions are sent directly to the administrative desk at ITE.
              </p>
            </div>

            {status.success && (
              <div className="p-4 rounded-md bg-accent/15 border border-accent/30 text-accent-light text-xs flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Thank you. Your inquiry has been logged successfully.</span>
              </div>
            )}

            {status.error && (
              <div className="p-4 rounded-md bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{status.error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-ink-light-secondary mb-1.5">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Mohammed Farooq"
                    className="w-full px-3.5 py-2.5 rounded-md bg-dark border border-dark-border text-white text-xs placeholder-ink-light-muted focus:outline-none focus:border-accent-light focus:ring-1 focus:ring-accent-light transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-ink-light-secondary mb-1.5">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="name@domain.com"
                    className="w-full px-3.5 py-2.5 rounded-md bg-dark border border-dark-border text-white text-xs placeholder-ink-light-muted focus:outline-none focus:border-accent-light focus:ring-1 focus:ring-accent-light transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-ink-light-secondary mb-1.5">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 ..."
                    className="w-full px-3.5 py-2.5 rounded-md bg-dark border border-dark-border text-white text-xs placeholder-ink-light-muted focus:outline-none focus:border-accent-light focus:ring-1 focus:ring-accent-light transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-ink-light-secondary mb-1.5">
                    Subject
                  </label>
                  <select
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-md bg-dark border border-dark-border text-white text-xs focus:outline-none focus:border-accent-light transition-colors"
                  >

                    <option value="Verification & Transcripts">Verification & Transcripts</option>
                    <option value="General Query">General Query</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-light-secondary mb-1.5">
                  Message / Academic Background *
                </label>
                <textarea
                  required
                  rows={3}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Specify your inquiry or +2 marks details..."
                  className="w-full px-3.5 py-2.5 rounded-md bg-dark border border-dark-border text-white text-xs placeholder-ink-light-muted focus:outline-none focus:border-accent-light focus:ring-1 focus:ring-accent-light transition-colors resize-none"
                />
              </div>

              <Button
                type="submit"
                variant="darkPrimary"
                size="md"
                className="w-full"
                loading={status.loading}
                iconComponent={Send}
              >
                Submit Message
              </Button>
            </form>
          </div>

        </div>

        {/* Clean Interactive Map Embed */}
        <div className="rounded-xl overflow-hidden border border-dark-border bg-dark-surface">
          <div className="px-6 py-3.5 border-b border-dark-border flex items-center justify-between text-xs">
            <span className="font-semibold text-white flex items-center gap-2">
              <MapPin className="w-4 h-4 text-accent-light" />
              Tirurangadi Muslim Orphanage Saudabad Campus Map
            </span>
            <a
              href="https://maps.google.com/?q=Tirurangadi+Muslim+Orphanage+Saudabad"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent-light hover:underline flex items-center gap-1"
            >
              <span>Open in Google Maps</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="h-72 sm:h-80 w-full">
            <iframe
              src={mapEmbedUrl}
              width="100%"
              height="100%"
              style={{ border: 0, filter: 'invert(90%) hue-rotate(180deg)' }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Campus Map"
            />
          </div>
        </div>

      </div>
    </section>
  );
}
