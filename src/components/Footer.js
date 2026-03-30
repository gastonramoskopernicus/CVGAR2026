import Link from 'next/link'
import styles from './Footer.module.css'

const Footer = () => {
  const navItems = [
    { name: 'Inicio',      path: '/' },
    { name: 'Perfil',      path: '/about' },
    { name: 'Capacidades', path: '/capabilities' },
    { name: 'Multimedia',  path: '/multimedia' },
    { name: 'Intereses',   path: '/hobbies' },
    { name: 'Contacto',    path: '/contacto' },
  ]

  const year = new Date().getFullYear()

  return (
    <footer className={styles.footer}>
      <div className="container">
        <div className={styles.footerGrid}>

          {/* Bloque 1 — Marca */}
          <div className={styles.brand}>
            <div className={styles.brandLogo}>
              <span className={styles.brandLogoText}>GAR</span>
            </div>
            <p className={styles.brandName}>Gastón Alejandro Ramos</p>
            <p className={styles.brandTagline}>
              Consultor Senior en Estrategia y Tecnología para Empresas
            </p>
            <p className={styles.brandDescription}>
              Liderando la convergencia entre el negocio asegurador y las plataformas tecnológicas de vanguardia para el mercado latinoamericano.
            </p>
          </div>

          {/* Bloque 2 — Secciones */}
          <div className={styles.block}>
            <h4 className={styles.blockTitle}>Navegación</h4>
            <ul className={styles.blockList}>
              {navItems.map((item) => (
                <li key={item.path}>
                  <Link href={item.path} className={styles.blockLink}>
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Bloque 3 — Redes Sociales */}
          <div className={styles.block}>
            <h4 className={styles.blockTitle}>Conectemos</h4>
            <ul className={styles.blockList}>
              <li>
                <a
                  href="https://www.linkedin.com/in/ramosgaston/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.socialItem}
                >
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                  </svg>
                  LinkedIn
                </a>
              </li>
              <li>
                <a
                  href="mailto:ramos.gaston@kopernicus.tech"
                  className={styles.socialItem}
                >
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                  ramos.gaston@kopernicus.tech
                </a>
              </li>
              <li>
                <a
                  href="https://kopernicus.com.ar"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.socialItem}
                >
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="2" y1="12" x2="22" y2="12"/>
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                  </svg>
                  kopernicus.com.ar
                </a>
              </li>
            </ul>
          </div>

          {/* Bloque 4 — Legal / Contacto */}
          <div className={styles.block}>
            <h4 className={styles.blockTitle}>Legal & Contacto</h4>
            <ul className={styles.blockList}>
              <li>
                <Link href="/contacto" className={styles.blockLink}>
                  Formulario de contacto
                </Link>
              </li>
              <li>
                <Link href="/politica-de-privacidad" className={styles.blockLink}>
                  Política de privacidad
                </Link>
              </li>
              <li>
                <Link href="/terminos-y-condiciones" className={styles.blockLink}>
                  Términos y condiciones
                </Link>
              </li>
              <li className={styles.locationItem}>
                <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
                Buenos Aires, Argentina
              </li>
            </ul>
          </div>

        </div>

        {/* Divider */}
        <div className={styles.divider} />

        {/* Footer Bottom */}
        <div className={styles.footerBottom}>
          <p className={styles.copy}>
            &copy; {year} Gastón Alejandro Ramos. Todos los derechos reservados.
          </p>
          <p className={styles.copyMuted}>
            Estrategia · Tecnología · Seguros
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
