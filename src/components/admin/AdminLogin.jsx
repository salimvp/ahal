import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import SSMOLogo from '../SSMOLogo';

export default function AdminLogin() {
  const [error, setError] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated
  if (user) {
    navigate('/admin/announcements', { replace: true });
    return null;
  }

  return (
    <div className="min-h-screen bg-dark flex flex-col items-center justify-center p-4 relative text-ink-light">
      {/* Back Link */}
      <div className="absolute top-6 left-6 z-10">
        <Link
          to="/"
          className="flex items-center gap-2 text-xs font-semibold text-ink-light-muted hover:text-white bg-dark-surface px-3.5 py-2 rounded-md border border-dark-border transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Public Portal
        </Link>
      </div>

      <div className="w-full max-w-md bg-dark-surface border border-dark-border rounded-xl p-8 sm:p-10 shadow-dark-md space-y-6">
        <div className="flex flex-col items-center text-center space-y-2">
          <SSMOLogo className="w-16 h-16" />
          <h2 className="text-xl font-bold font-sans text-white">Administrative Portal</h2>
          <p className="text-xs text-ink-light-muted">
            SSMO Teacher Training Institute, Tirurangadi
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-md bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <Auth
          supabaseClient={supabase}
          appearance={{
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: '#0a6c57',
                  brandAccent: '#08916b',
                  defaultButtonBackground: '#1a2332',
                  defaultButtonBackgroundHover: '#243044',
                  inputBackground: '#0f1724',
                  inputBorder: '#2a3548',
                  inputBorderHover: '#3d4f6a',
                  inputBorderFocus: '#0a6c57',
                  inputText: '#e2e8f0',
                  inputPlaceholder: '#64748b',
                  messageText: '#e2e8f0',
                  messageBackground: '#1a2332',
                  dividerBackground: '#2a3548',
                },
                space: {
                  buttonPadding: '12px 16px',
                  inputPadding: '12px 14px',
                },
                radii: {
                  buttonBorderRadius: '8px',
                  inputBorderRadius: '8px',
                },
                fonts: {
                  fontFamily: 'Manrope, system-ui, sans-serif',
                  fontFamilyButton: 'Manrope, system-ui, sans-serif',
                  fontFamilyLabel: 'Manrope, system-ui, sans-serif',
                  fontFamilyMessageText: 'Manrope, system-ui, sans-serif',
                },
                fontSizes: {
                  baseBodySize: '13px',
                  baseButtonSize: '13px',
                  baseInputSize: '13px',
                  baseLabelSize: '11px',
                  baseMessageSize: '12px',
                },
                fontWeights: {
                  baseBodyWeight: '500',
                  baseButtonWeight: '600',
                  baseInputWeight: '500',
                  baseLabelWeight: '600',
                },
              },
            },
          }}
          theme="dark"
          providers={[]}
          redirectTo={window.location.origin + '/admin/announcements'}
          magicLink={false}
          showLinks={false}
          view="sign_in"
        />
      </div>
    </div>
  );
}
