export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      boxShadow: {
        soft: '0 24px 80px rgba(15, 23, 42, 0.12)',
      },
      colors: {
        surface: {
          950: '#020617',
          900: '#0b1222',
          800: '#111827',
        },
      },
    },
  },
  plugins: [],
}
