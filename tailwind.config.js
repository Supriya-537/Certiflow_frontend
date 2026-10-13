/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: '#111827',
        slatewarm: '#f8f7f3',
        sage: '#5c7c75',
        amber: '#d97706',
        danger: '#b91c1c',
      },
    },
  },
  plugins: [],
};
