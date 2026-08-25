/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Semantic Canvas & Surface Tokens (Light)
        canvas: {
          DEFAULT: '#f8f7f4', // Warm architectural off-white
          subtle: '#f1efe9',  // Tonal section contrast
          muted: '#e8e5dc',   // Deeper neutral surface
          pure: '#ffffff',
        },
        surface: {
          DEFAULT: '#ffffff',
          secondary: '#fbfaf8',
          elevated: '#ffffff',
          border: '#e6e3da',
          'border-subtle': 'rgba(17, 22, 34, 0.07)',
        },
        // Semantic Dark Tokens (Cinematic / Architectural)
        dark: {
          DEFAULT: '#0b1019',       // Deep blue-charcoal base
          surface: '#131a26',       // Slightly lighter surface
          elevated: '#1a2332',      // Floating surface
          border: 'rgba(255, 255, 255, 0.08)',
          'border-subtle': 'rgba(255, 255, 255, 0.05)',
        },
        // Semantic Typography
        ink: {
          primary: '#111622',
          secondary: '#4d5668',
          muted: '#7b8599',
          light: '#f4f5f8',
          'light-secondary': '#adb5c7',
          'light-muted': '#727c93',
        },
        // Institutional Accent (Earthen Emerald & Amber Bronze)
        accent: {
          DEFAULT: '#0a6c57',       // Restrained deep forest emerald
          hover: '#085444',
          subtle: '#eaf4f0',        // 5% tint for badges
          active: '#053e32',
          glow: 'rgba(10, 108, 87, 0.15)',
          light: '#2dd4bf',         // Bright mint on dark backgrounds
        },
        gold: {
          DEFAULT: '#b88628',
          hover: '#9e711e',
          subtle: '#faf5ea',
          dark: '#e0c588',
        }
      },
      fontFamily: {
        sans: ['Manrope', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        serif: ['Newsreader', 'Playfair Display', 'Georgia', 'serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      borderRadius: {
        'sm': '8px',
        'md': '12px',
        'lg': '16px',
        'xl': '20px',
        '2xl': '28px',
      },
      boxShadow: {
        'soft-sm': '0 1px 3px 0 rgba(17, 22, 34, 0.03), 0 1px 2px 0 rgba(17, 22, 34, 0.02)',
        'soft-md': '0 4px 20px -2px rgba(17, 22, 34, 0.05), 0 2px 6px -1px rgba(17, 22, 34, 0.02)',
        'soft-lg': '0 16px 36px -4px rgba(17, 22, 34, 0.08), 0 4px 12px -2px rgba(17, 22, 34, 0.03)',
        'dark-sm': '0 2px 8px rgba(0, 0, 0, 0.3)',
        'dark-md': '0 8px 24px -4px rgba(0, 0, 0, 0.5)',
      },
      maxWidth: {
        'content': '1320px',
        'prose-editorial': '68ch',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        barLoader: {
          '0%, 100%': { transform: 'scaleY(0.1)', opacity: '0.2' },
          '50%': { transform: 'scaleY(1)', opacity: '1' },
        }
      },
      animation: {
        marquee: 'marquee 40s linear infinite',
        'fade-in': 'fadeIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'bar-loader': 'barLoader 1.2s ease-in-out infinite',
      }
    },
  },
  plugins: [],
}
