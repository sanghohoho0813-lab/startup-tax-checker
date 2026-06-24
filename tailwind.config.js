/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          'Pretendard',
          '-apple-system',
          'BlinkMacSystemFont',
          'system-ui',
          'Roboto',
          'Apple SD Gothic Neo',
          'Noto Sans KR',
          'Segoe UI',
          'sans-serif',
        ],
      },
      colors: {
        brand: {
          DEFAULT: '#3182f6',
          dark: '#1b64da',
        },
      },
      boxShadow: {
        card: '0 1px 3px rgba(0, 0, 0, 0.04), 0 4px 20px rgba(0, 0, 0, 0.06)',
      },
    },
  },
  plugins: [],
}
