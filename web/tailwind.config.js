/** @type {import('tailwindcss').Config} */

const defaultTheme = require('tailwindcss/defaultTheme')

module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx,css,md,mdx,html,json,scss}'
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', ...defaultTheme.fontFamily.sans]
      }
    }
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('windy-radix-palette'),
    require('@tailwindcss/typography'),
    require('windy-radix-typography'),
    require('@kobalte/tailwindcss')
  ]
}
