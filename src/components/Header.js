import Link from 'next/link'
import { useRouter } from 'next/router'
import { useState, useEffect } from 'react'
import styles from './Header.module.css'

const navItems = [
  { name: 'Inicio',       path: '/' },
  { name: 'Perfil',       path: '/about' },
  { name: 'Capacidades',  path: '/capabilities' },
  { name: 'Multimedia',   path: '/multimedia' },
  { name: 'Intereses',    path: '/hobbies' },
]

const LinkedInIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
  </svg>
)

const EmailIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
    <polyline points="22,6 12,13 2,6"/>
  </svg>
)

const Header = () => {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => { setIsOpen(false) }, [router.pathname])

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  // Detect active route — also match sub-paths (e.g. /hobbies/sport → /hobbies)
  const isActive = (path) =>
    path === '/'
      ? router.pathname === '/'
      : router.pathname === path || router.pathname.startsWith(path + '/')

  return (
    <header className={styles.header}>
      <div className="container">
        <nav className={styles.nav} aria-label="Navegación principal">

          {/* Logo — left */}
          <Link href="/" className={styles.logo} aria-label="Inicio — Gastón Alejandro Ramos">
            <div className={styles.logoCircle}>
              <span className={styles.logoText}>GAR</span>
            </div>
          </Link>

          {/* Desktop nav — right */}
          <ul className={styles.navList} role="list">
            {navItems.map((item) => (
              <li key={item.path}>
                <Link
                  href={item.path}
                  className={`${styles.navLink} ${isActive(item.path) ? styles.navLinkActive : ''}`}
                >
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>

          {/* Desktop social icons */}
          <div className={styles.socials}>
            <a
              href="https://www.linkedin.com/in/ramosgaston/"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.socialLink}
              aria-label="LinkedIn"
            >
              <LinkedInIcon />
            </a>
            <a
              href="mailto:ramos.gaston@kopernicus.tech"
              className={styles.socialLink}
              aria-label="Email"
            >
              <EmailIcon />
            </a>
          </div>

          {/* Hamburger — mobile only */}
          <button
            className={`${styles.hamburger} ${isOpen ? styles.hamburgerOpen : ''}`}
            onClick={() => setIsOpen(!isOpen)}
            aria-label={isOpen ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={isOpen}
            aria-controls="mobile-menu"
          >
            <span className={styles.bar} />
            <span className={styles.bar} />
            <span className={styles.bar} />
          </button>
        </nav>
      </div>

      {/* Mobile drawer */}
      <div
        id="mobile-menu"
        className={`${styles.drawer} ${isOpen ? styles.drawerOpen : ''}`}
        aria-hidden={!isOpen}
        inert={!isOpen ? '' : undefined}
      >
        <ul className={styles.drawerList} role="list">
          {navItems.map((item) => (
            <li key={item.path}>
              <Link
                href={item.path}
                className={`${styles.drawerLink} ${isActive(item.path) ? styles.drawerLinkActive : ''}`}
                onClick={() => setIsOpen(false)}
              >
                {item.name}
              </Link>
            </li>
          ))}
        </ul>

        <div className={styles.drawerSocials}>
          <a href="https://www.linkedin.com/in/ramosgaston/" target="_blank" rel="noopener noreferrer" className={styles.socialLink} aria-label="LinkedIn">
            <LinkedInIcon />
          </a>
          <a href="mailto:ramos.gaston@kopernicus.tech" className={styles.socialLink} aria-label="Email">
            <EmailIcon />
          </a>
        </div>
      </div>
    </header>
  )
}

export default Header
