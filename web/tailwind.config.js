/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx,css,md,mdx,html,json,scss}'
  ],
  darkMode: 'auto',
  theme: {
    extend: {}
  },
  plugins: [require('@tailwindcss/forms'), require('windy-radix-palette')]
}
