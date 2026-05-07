export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: ['class', 'html[data-theme="dark"] &'],
  theme: {
    extend: {
      colors: {
        primary: '#0669e1',
        surface: '#f8fafc',
        accent: '#0f766e'
      }
    }
  },
  plugins: []
};
