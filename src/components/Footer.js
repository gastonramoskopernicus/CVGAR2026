import styles from './Footer.module.css'

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className="container">
        <div className={styles.footerBottom}>
          <p className={styles.copy}>&copy; {new Date().getFullYear()} Gastón Alejandro Ramos. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
