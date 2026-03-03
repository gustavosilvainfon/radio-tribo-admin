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
        primary: {
          DEFAULT: '#DC143C', // Vermelho
          dark: '#8B0000',
        },
        secondary: {
          DEFAULT: '#9370DB', // Roxo
          dark: '#6A5ACD',
        },
        accent: {
          DEFAULT: '#FFD700', // Dourado
        },
      },
      backgroundImage: {
        'gradient-admin': 'linear-gradient(135deg, #000000 0%, #DC143C 50%, #9370DB 100%)',
        'gradient-admin-hover': 'linear-gradient(135deg, #1a1a1a 0%, #FF1744 50%, #AB82FF 100%)',
      },
    },
  },
  plugins: [],
}


