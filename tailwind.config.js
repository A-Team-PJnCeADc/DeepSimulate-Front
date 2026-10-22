/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        page: '#f4f5f7',
        panel: '#ffffff',
        panel2: '#f7f8fa',
        line: '#e4e7ec',
        ink: '#101828',
        muted: '#667085',
        up: '#e5342b',
        down: '#0e9f6e',
        accent: '#2563eb',
      },
      fontFamily: {
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Consolas', 'monospace'],
      },
      fontSize: {
        xxs: ['11px', '15px'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(16,24,40,0.06)',
      },
    },
  },
  plugins: [],
}
