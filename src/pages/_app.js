import '@/styles/globals.css'
import Layout from '@/components/Layout'
import { useEffect } from 'react'

export default function App({ Component, pageProps }) {
  useEffect(() => {
    // Default to Contemporary Tech Editorial dark theme (V2)
    document.documentElement.setAttribute('data-theme', 'dark')
  }, [])

  return (
    <Layout>
      <Component {...pageProps} />
    </Layout>
  )
}

