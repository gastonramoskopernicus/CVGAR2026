import Link from 'next/link'
import { useRouter } from 'next/router'
import { motion } from 'framer-motion'
import styles from './Header.module.css'

const Header = () => {
  const router = useRouter()
  const navItems = [
    { name: 'Inicio', path: '/' },
    { name: 'Sobre Mí', path: '/about' },
    { name: 'Capacidades', path: '/capabilities' },
    { name: 'Multimedia/contenidos', path: '/multimedia' },
    { name: 'Pasatiempos e intereses', path: '/hobbies' },
  ]

  return (
    <header className={styles.header}>
      <div className="container">
        <nav className={styles.nav}>
          {/* Navigation Links - Left side */}
          <ul className={styles.navList}>
            {navItems.map((item) => (
              <li key={item.path}>
                <Link 
                  href={item.path} 
                  className={`${styles.navLink} ${router.pathname === item.path ? styles.active : ''}`}
                  style={{ color: '#000000' }}
                >
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>

          {/* Centered Logo */}
          <Link href="/" className={styles.logoContainer}>
            <div className={styles.logoCircle}>
              <span className={styles.logoText}>GAR</span>
            </div>
          </Link>

          {/* Social Icons - Right side */}
          <div className={styles.socials}>
            <a href="https://www.linkedin.com/in/ramosgaston/" target="_blank" rel="noopener noreferrer" className={styles.socialLink} aria-label="LinkedIn" style={{ color: '#000000' }}>
              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
            </a>
            <a href="mailto:ramos.gaston@kopernicus.tech" className={styles.socialLink} aria-label="Email" style={{ color: '#000000' }}>
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
            </a>
            <button className={styles.socialLink} aria-label="Toggle Theme" style={{ color: '#000000' }}>
              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M12 3c.132 0 .263 0 .393.007a9 9 0 0 0 10.511 10.511A9.003 9.003 0 1 1 12 3z"/></svg>
            </button>
          </div>
        </nav>
      </div>
    </header>
  )
}

export default Header
