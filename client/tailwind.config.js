export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: ['class', 'html[data-theme="dark"] &'],
  theme: {
    extend: {
      colors: {
        primary: '#0d9488',
        surface: '#f0fdfa',
        accent: '#0d9488',
      }
    }
  },
  plugins: []
};
