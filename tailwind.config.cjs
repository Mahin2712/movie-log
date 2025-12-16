module.exports = {
  content: ['./index.html','./src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: { 50: '#eef2ff', 500: '#4f46e5', 600: '#4338ca' }
      },
      fontFamily: { sans: ['Inter', 'ui-sans-serif', 'system-ui'] },
      boxShadow: { card: '0 6px 18px rgba(2,6,23,0.6)' }
    }
  },
  plugins: [],
}
