/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        chako: {
          dark: '#171717',
          bg: '#FAFAF8',
          accent: '#ECF5F4',
          highlight: '#FFDDBE',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'fluid-heading':    ['clamp(1.5rem, 5vw, 2.5rem)',   { lineHeight: '1.15', fontWeight: '700' }],
        'fluid-subheading': ['clamp(1.25rem, 4vw, 2rem)',    { lineHeight: '1.2' }],
        'fluid-label':      ['clamp(0.625rem, 2vw, 0.75rem)',{ lineHeight: '1',   letterSpacing: '0.1em' }],
        'fluid-body':       ['clamp(0.875rem, 2.5vw, 1rem)', { lineHeight: '1.6' }],
      },
      animation: {
        marquee: 'marquee 30s linear infinite',
        'marquee-reverse': 'marquee-reverse 30s linear infinite',
        'fade-in': 'fade-in 0.5s ease-out',
        'slide-in-right': 'slide-in-right 0.3s ease-out',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        'marquee-reverse': {
          '0%': { transform: 'translateX(-50%)' },
          '100%': { transform: 'translateX(0%)' },
        },
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in-right': {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
      },
    },
  },
  plugins: [],
};
