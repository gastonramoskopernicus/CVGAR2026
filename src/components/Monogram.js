import React from 'react'
import styles from './Monogram.module.css'

/**
 * Identidad visual única reutilizable GAR.
 * Mantiene las siglas GAR con el punto amarillo distintivo.
 */
export default function Monogram({
  variant = 'header', // 'header' | 'footer' | 'sticky' | 'inline'
  className = '',
}) {
  return (
    <span
      className={`${styles.monogram} ${styles[variant] || ''} ${className}`.trim()}
      aria-hidden="true"
    >
      GAR<span className={styles.dot}>.</span>
    </span>
  )
}
