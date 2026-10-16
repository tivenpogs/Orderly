/** Design tokens taken from the Figma screens. */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        maroon: '#2E0505', // header, footer, headings
        cream: '#FFF8F0', // page background
        brand: '#CC1B1B', // primary actions, prices
        gold: '#C4883C', // secondary actions, borders, accents
        rust: '#8B3A1E', // supporting accent
        sand: '#F5E4D3', // soft panels, status pills
        line: '#E8D5C0', // card borders
      },
      fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'] },
    },
  },
  plugins: [],
};
