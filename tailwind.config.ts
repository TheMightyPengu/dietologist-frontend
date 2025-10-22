import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
    './src/layout/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        ink: 'var(--ink)',
        brand: 'var(--brand)',
        sage: 'var(--sage)',
        peach: 'var(--peach)'
      },
      borderRadius: {
        xl: 'var(--radius)'
      },
      container: {
        center: true,
        padding: '1rem'
      }
    }
  },
  plugins: []
}

export default config
