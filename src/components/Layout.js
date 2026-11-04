import Head from 'next/head'
import Header from './Header'
import Footer from './Footer'
import StickyIcon from './StickyIcon'
import styles from './Layout.module.css'

const Layout = ({ children }) => {
  return (
    <>
      <Head>
        <title key="title">Gastón Ramos | Consultor en Estrategia y Tecnología</title>
        <meta
          key="description"
          name="description"
          content="Consultoría senior en estrategia, tecnología y transformación digital para empresas de Argentina y Latinoamérica. Conocé la trayectoria de Gastón Ramos."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="alternate icon" href="/favicon.ico" />
      </Head>
      <div className={styles.wrapper}>
        <Header />
        <main className={styles.main}>
          {children}
        </main>
        <Footer />
        <StickyIcon />
      </div>
    </>
  )
}

export default Layout
