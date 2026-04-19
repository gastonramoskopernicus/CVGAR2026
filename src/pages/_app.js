import '@/styles/globals.css'
import Layout from '@/components/Layout'
import { useEffect } from 'react'
import { SessionProvider } from 'next-auth/react'

export default function App({ Component, pageProps: { session, ...pageProps } }) {
  useEffect(() => {
    // Default to light theme for the new redesign
    if (!document.documentElement.getAttribute('data-theme')) {
      document.documentElement.setAttribute('data-theme', 'light')
    }
  }, [])

  return (
    <SessionProvider session={session}>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </SessionProvider>
  )
}
