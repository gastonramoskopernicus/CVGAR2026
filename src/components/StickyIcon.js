import { useState, useEffect } from 'react'
import styles from './StickyIcon.module.css'

const StickyIcon = () => {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 300)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <button
      className={`${styles.stickyIcon} ${visible ? styles.visible : ''}`}
      onClick={scrollToTop}
      aria-label="Volver al inicio"
      title="Volver al inicio"
    >
      <span className={styles.initials}>GAR</span>
    </button>
  )
}

export default StickyIcon
