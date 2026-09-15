/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Core Neutral Palette Specification
        appBg: '#F5F6F8',
        primarySurface: '#FFFFFF',
        secondarySurface: '#F8FAFC',
        primaryText: '#1E293B',
        secondaryText: '#64748B',
        borderColor: '#E2E8F0',

        // Primary Accent Colors
        primaryAccent: {
          DEFAULT: '#4F46E5',
          hover: '#4338CA',
        },

        // Status Colors (Exclusively for badges & semantic indicators)
        statusNew: {
          DEFAULT: '#3B82F6',
          bg: '#EFF6FF',
          border: '#BFDBFE',
          text: '#1D4ED8',
        },
        statusContacted: {
          DEFAULT: '#4F46E5',
          bg: '#EEF2FF',
          border: '#C7D2FE',
          text: '#3730A3',
        },
        statusNegotiating: {
          DEFAULT: '#F59E0B',
          bg: '#FFFBEB',
          border: '#FDE68A',
          text: '#B45309',
        },
        statusClosed: {
          DEFAULT: '#10B981',
          bg: '#ECFDF5',
          border: '#A7F3D0',
          text: '#047857',
        },
        statusLost: {
          DEFAULT: '#EF4444',
          bg: '#FEF2F2',
          border: '#FECACA',
          text: '#B91C1C',
        },
      },
      borderRadius: {
        lg: '0.75rem',
        md: '0.5rem',
        sm: '0.375rem',
      },
    },
  },
  plugins: [],
};
