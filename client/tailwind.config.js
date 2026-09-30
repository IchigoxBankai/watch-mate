/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        watchmate: {
          bg: '#0A1832',           // Rich royal sapphire midnight
          bgSecondary: '#0E2347',  // Deep ocean navy
          surface: '#122A50',      // Vibrant sapphire glass card
          surfaceHover: '#1A396B', // Hover sapphire
          elevated: '#183562',     // Elevated panel
          elevatedHover: '#224883',// Elevated hover
          primary: '#3B82F6',      // Electric cobalt blue
          primaryDark: '#2563EB',  // Deep royal blue
          brightBlue: '#60A5FA',   // Luminous sky blue
          cyan: '#38BDF8',         // Electric cyan
          cyanHover: '#0EA5E9',    // Vivid cyan
          gold: '#FBBF24',         // Bright warm cinema gold
          goldLight: '#FDE047',    // Vivid luminous yellow
          goldHover: '#F59E0B',    // Amber gold
          text: '#FFFFFF',         // Crisp clean white
          secondaryText: '#D1E6FF',// Soft ice-blue secondary text
          muted: '#94B8E3',        // Radiant blue-slate muted text
          border: '#234778',       // Vibrant sapphire border
          borderLight: '#3564A3',  // Luminous sky border
          borderGlow: 'rgba(56, 189, 248, 0.5)',
          online: '#4ADE80',
          error: '#FB7185'
        },
        syncora: {
          bg: '#0A1832',
          surface: '#122A50',
          elevated: '#183562',
          elevatedHover: '#224883',
          primary: '#3B82F6',
          primaryHover: '#2563EB',
          secondary: '#38BDF8',
          secondaryHover: '#60A5FA',
          text: '#FFFFFF',
          muted: '#94B8E3',
          border: '#234778',
          borderGlow: 'rgba(56, 189, 248, 0.5)',
          glowViolet: 'rgba(59, 130, 246, 0.35)'
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        display: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
      },
      backgroundImage: {
        'blue-gradient': 'linear-gradient(135deg, #2563EB 0%, #38BDF8 100%)',
        'blue-gold-gradient': 'linear-gradient(135deg, #3B82F6 0%, #38BDF8 50%, #FBBF24 100%)',
        'gold-gradient': 'linear-gradient(135deg, #FBBF24 0%, #F59E0B 100%)',
        'card-gradient': 'linear-gradient(180deg, rgba(24, 53, 98, 0.9) 0%, rgba(18, 42, 80, 0.95) 100%)',
        'hero-gradient': 'radial-gradient(ellipse at top, rgba(59, 130, 246, 0.35) 0%, rgba(56, 189, 248, 0.2) 45%, rgba(10, 24, 50, 0) 70%)',
      },
      boxShadow: {
        'blue-glow': '0 0 35px -5px rgba(59, 130, 246, 0.5)',
        'cyan-glow': '0 0 35px -5px rgba(56, 189, 248, 0.5)',
        'gold-glow': '0 0 30px -5px rgba(251, 191, 36, 0.45)',
        'card-sapphire': '0 12px 35px -10px rgba(5, 14, 30, 0.7), inset 0 1px 0 0 rgba(255, 255, 255, 0.1)',
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 4s ease-in-out infinite',
        'voice-ring': 'voiceRing 1.8s cubic-bezier(0.4, 0, 0.2, 1) infinite',
        'marquee': 'marquee 25s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        voiceRing: {
          '0%': { transform: 'scale(0.95)', opacity: '0.9', boxShadow: '0 0 0 0 rgba(56, 189, 248, 0.8)' },
          '70%': { transform: 'scale(1.15)', opacity: '0', boxShadow: '0 0 0 12px rgba(56, 189, 248, 0)' },
          '100%': { transform: 'scale(0.95)', opacity: '0', boxShadow: '0 0 0 0 rgba(56, 189, 248, 0)' },
        },
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        }
      }
    },
  },
  plugins: [],
}
