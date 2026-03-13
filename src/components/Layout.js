import Head from 'next/head'
import Header from './Header'
import Footer from './Footer'
import styles from './Layout.module.css'

const Layout = ({ children }) => {
  return (
    <>
      <Head>
        <title>Gastón Alejandro Ramos | Insurance Technology & Strategy Advisor</title>
        <meta name="description" content="Insurance Technology & Strategy Advisor - Helping insurance companies transform through strategy, technology, and innovation." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={styles.wrapper}>
        <Header />
        <main className={styles.main}>
          {children}
        </main>
        <Footer />
      </div>
    </>
  )
}

export default Layout
