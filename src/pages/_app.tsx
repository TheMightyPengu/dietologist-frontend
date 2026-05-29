import type { AppProps } from 'next/app'
import '@/styles/tailwind.css'
import '@/styles/globals.css'
import "@/styles/leafburst.scss";
import '@/styles/rich-text-editor.scss';
import '@/styles/rich-content.scss';
import RootLayout from '@/layout/RootLayout'

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <RootLayout>
      <Component {...pageProps} />
    </RootLayout>
  )
}
