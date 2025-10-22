import type { AppProps } from 'next/app'
import '@/styles/tailwind.css'
import '@/styles/globals.css'
import RootLayout from '@/layout/RootLayout'

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <RootLayout>
      <Component {...pageProps} />
    </RootLayout>
  )
}
