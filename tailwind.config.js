/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,js}'],
  theme: {
    extend: {
      colors: {
        'slack-dark': '#1a1d21',
        'slack-light': '#f8f9fa',
        'slack-green': '#007a5a',
        'slack-red': '#e02424',
      },
    },
  },
  plugins: [],
};
