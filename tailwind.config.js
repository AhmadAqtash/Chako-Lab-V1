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
          // ── Backward-compat tokens (existing components keep working) ──
          dark:      '#1a1a1a',
          bg:        '#FAFAF8',
          accent:    '#ECF5F4',
          highlight: '#FFDDBE',

          // ── Phase 1: semantic base tokens ──
          cream:   '#F5F0E8',   // warm cream canvas
          ink:     '#1a1a1a',   // text / charcoal
          orange:  '#F5A623',   // brand accent
          success: '#16A34A',
          sale:    '#DC2626',

          // ── Series palettes ──
          // Each series: one bold candy color + one airy tint for surfaces
          linlin:          '#FFD100',   // LinLin kettles  — vivid yellow
          'linlin-soft':   '#FFFDE6',
          milkpod:         '#9333EA',   // Milk Pod        — purple
          'milkpod-soft':  '#F5EEFF',
          bawang:          '#F43F5E',   // Bawang cups     — rose pink
          'bawang-soft':   '#FFF0F4',
          bobo:            '#0D9488',   // BoBo tumblers   — teal
          'bobo-soft':     '#E6FAF9',
          kada:            '#F97316',   // Kada bottles    — orange/coral
          'kada-soft':     '#FFF3E8',
          pangpang:        '#EC4899',   // PangPang        — hot pink
          'pangpang-soft': '#FFF0F8',
          titanium:        '#6366F1',   // Titanium        — indigo/premium
          'titanium-soft': '#EEF2FF',
        },
      },

      fontFamily: {
        // Clash Display — bold chunky display headings
        display: ['"Clash Display"', 'system-ui', 'sans-serif'],
        // General Sans — clean warm body & UI (replaces Inter)
        sans: ['"General Sans"', 'system-ui', 'sans-serif'],
        // Arabic display — IBM Plex Sans Arabic for RTL headings
        arabic: ['"IBM Plex Sans Arabic"', '"Noto Sans Arabic"', 'system-ui', 'sans-serif'],
      },

      fontSize: {
        // ── Phase 1: fluid type scale (mobile-first clamp) ──
        // display-hero: giant statement text; Clash Display 700
        'display-hero':  ['clamp(2.75rem, 11vw, 6rem)',        { lineHeight: '0.95', fontWeight: '700', letterSpacing: '-0.02em' }],
        // display: section-level oversized headings
        'display':       ['clamp(2rem, 7vw, 4rem)',             { lineHeight: '1.0',  fontWeight: '600', letterSpacing: '-0.015em' }],
        // heading: standard H1/H2
        'heading':       ['clamp(1.5rem, 5vw, 2.5rem)',         { lineHeight: '1.1',  fontWeight: '600', letterSpacing: '-0.01em' }],
        // subheading: H3, card titles, callouts
        'subheading':    ['clamp(1.125rem, 3.5vw, 1.5rem)',     { lineHeight: '1.25', fontWeight: '500' }],
        // label: uppercase eyebrow / category chip
        'label':         ['clamp(0.6875rem, 2vw, 0.8125rem)',   { lineHeight: '1',    fontWeight: '600', letterSpacing: '0.1em' }],
        // body: comfortable reading text
        'body':          ['clamp(0.9375rem, 2.5vw, 1.0625rem)', { lineHeight: '1.6',  fontWeight: '400' }],

        // ── Backward-compat fluid sizes (existing components) ──
        'fluid-heading':    ['clamp(1.5rem, 5vw, 2.5rem)',    { lineHeight: '1.15', fontWeight: '700' }],
        'fluid-subheading': ['clamp(1.25rem, 4vw, 2rem)',     { lineHeight: '1.2' }],
        'fluid-label':      ['clamp(0.625rem, 2vw, 0.75rem)', { lineHeight: '1',   letterSpacing: '0.1em' }],
        'fluid-body':       ['clamp(0.875rem, 2.5vw, 1rem)',  { lineHeight: '1.6' }],
      },

      animation: {
        marquee:           'marquee 30s linear infinite',
        'marquee-reverse': 'marquee-reverse 30s linear infinite',
        'fade-in':         'fade-in 0.5s ease-out',
        'slide-in-right':  'slide-in-right 0.3s ease-out',
        wobble:            'wobble 0.7s ease-in-out',
      },
      keyframes: {
        // Jelly wobble — playful hover greeting (floating contact buttons)
        wobble: {
          '0%':   { transform: 'rotate(0deg) scale(1)' },
          '15%':  { transform: 'rotate(-14deg) scale(1.1)' },
          '30%':  { transform: 'rotate(10deg) scale(1.1)' },
          '45%':  { transform: 'rotate(-8deg) scale(1.06)' },
          '60%':  { transform: 'rotate(6deg) scale(1.04)' },
          '75%':  { transform: 'rotate(-3deg) scale(1.02)' },
          '100%': { transform: 'rotate(0deg) scale(1)' },
        },
        marquee: {
          '0%':   { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        'marquee-reverse': {
          '0%':   { transform: 'translateX(-50%)' },
          '100%': { transform: 'translateX(0%)' },
        },
        'fade-in': {
          '0%':   { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in-right': {
          '0%':   { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
      },
    },
  },
  plugins: [],
};
