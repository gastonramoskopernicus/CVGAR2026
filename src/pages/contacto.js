import Head from 'next/head'
import Link from 'next/link'
import { useState } from 'react'
import { motion } from 'framer-motion'
import styles from '@/styles/Contact.module.css'

const ArrowIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
)

const BackArrowIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </svg>
)

const FIELDS = {
  nombre: { label: 'Nombre', required: true, placeholder: 'Tu nombre' },
  email:  { label: 'Email',  required: true, placeholder: 'tu@email.com', type: 'email' },
  empresa: { label: 'Empresa', required: false, placeholder: 'Opcional' },
  telefono: { label: 'Teléfono', required: false, placeholder: 'Opcional' },
  mensaje: { label: 'Mensaje', required: true, placeholder: 'Contame en qué puedo ayudarte…' },
}

function validate(values) {
  const errors = {}
  if (!values.nombre.trim()) errors.nombre = 'Este campo es requerido.'
  if (!values.email.trim()) {
    errors.email = 'Este campo es requerido.'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
    errors.email = 'Ingresá un email válido.'
  }
  if (!values.mensaje.trim()) errors.mensaje = 'Este campo es requerido.'
  return errors
}

export default function Contacto() {
  const [values, setValues] = useState({
    nombre: '', email: '', empresa: '', telefono: '', mensaje: '',
  })
  const [trap, setTrap] = useState('') // honeypot
  const [touched, setTouched] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [globalError, setGlobalError] = useState('')

  const errors = validate(values)

  const handleChange = (e) => {
    const { name, value } = e.target
    setValues(prev => ({ ...prev, [name]: value }))
  }

  const handleBlur = (e) => {
    setTouched(prev => ({ ...prev, [e.target.name]: true }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setTouched({ nombre: true, email: true, mensaje: true })
    setGlobalError('')

    const errs = validate(values)
    if (Object.keys(errs).length > 0) return

    setSubmitting(true)
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...values, _trap: trap }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error desconocido')
      setSuccess(true)
    } catch (err) {
      setGlobalError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <Head>
        <title>Contacto | Gastón Alejandro Ramos</title>
        <meta name="description" content="Iniciá una conversación: consultas sobre estrategia, tecnología y seguros en LATAM." />
      </Head>

      <div className={styles.page}>
        {/* Hero */}
        <section className={styles.hero}>
          <div className="container">
            <motion.div
              className={styles.heroInner}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease: 'easeOut' }}
            >
              <div className={styles.heroLeft}>
                <h1>Hablemos</h1>
                <p>Si querés explorar una colaboración, necesitás una perspectiva estratégica sobre tecnología y seguros, o simplemente te interesa conectar — este es el lugar.</p>
              </div>

              <div className={styles.heroRight}>
                <div className={styles.contactItem}>
                  <span className={styles.contactLabel}>Email</span>
                  <a href="mailto:ramos.gaston@kopernicus.tech" className={styles.contactValue}>
                    ramos.gaston@kopernicus.tech
                  </a>
                </div>
                <div className={styles.contactItem}>
                  <span className={styles.contactLabel}>LinkedIn</span>
                  <a href="https://www.linkedin.com/in/ramosgaston/" target="_blank" rel="noopener noreferrer" className={styles.contactValue}>
                    linkedin.com/in/ramosgaston
                  </a>
                </div>
                <div className={styles.contactItem}>
                  <span className={styles.contactLabel}>Ubicación</span>
                  <span className={styles.contactValue}>Buenos Aires, Argentina</span>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Form section */}
        <section className={styles.formSection}>
          <div className="container">
            <motion.div
              className={styles.formGrid}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.12, ease: 'easeOut' }}
            >
              {/* Sidebar */}
              <div className={styles.formSidebar}>
                <p className={styles.formSidebarLabel}>Formulario de contacto</p>
                <p className={styles.formSidebarText}>
                  Respondemos dentro de las <strong>48 hs hábiles</strong>. Los campos marcados con * son obligatorios.
                </p>
              </div>

              {/* Form or Success */}
              <div>
                {success ? (
                  <div className={styles.successState}>
                    <p className={styles.successTitle}>Mensaje recibido.</p>
                    <p className={styles.successText}>Gracias, {values.nombre.split(' ')[0]}. Te contacto a la brevedad.</p>
                    <Link href="/" className={styles.backBtn}>
                      <BackArrowIcon />
                      Volver al inicio
                    </Link>
                  </div>
                ) : (
                  <form className={styles.form} onSubmit={handleSubmit} noValidate>
                    {/* Honeypot */}
                    <div className={styles.trap} aria-hidden="true">
                      <input
                        tabIndex={-1}
                        autoComplete="off"
                        name="_trap"
                        value={trap}
                        onChange={e => setTrap(e.target.value)}
                      />
                    </div>

                    {/* Nombre + Email */}
                    <div className={styles.fieldRow}>
                      <div className={styles.field}>
                        <label className={styles.label} htmlFor="nombre">
                          Nombre<span className={styles.required}>*</span>
                        </label>
                        <input
                          id="nombre"
                          name="nombre"
                          type="text"
                          autoComplete="name"
                          placeholder="Tu nombre"
                          className={`${styles.input} ${touched.nombre && errors.nombre ? styles.inputError : ''}`}
                          value={values.nombre}
                          onChange={handleChange}
                          onBlur={handleBlur}
                        />
                        {touched.nombre && errors.nombre && (
                          <span className={styles.errorMsg}>{errors.nombre}</span>
                        )}
                      </div>

                      <div className={styles.field}>
                        <label className={styles.label} htmlFor="email">
                          Email<span className={styles.required}>*</span>
                        </label>
                        <input
                          id="email"
                          name="email"
                          type="email"
                          autoComplete="email"
                          placeholder="tu@email.com"
                          className={`${styles.input} ${touched.email && errors.email ? styles.inputError : ''}`}
                          value={values.email}
                          onChange={handleChange}
                          onBlur={handleBlur}
                        />
                        {touched.email && errors.email && (
                          <span className={styles.errorMsg}>{errors.email}</span>
                        )}
                      </div>
                    </div>

                    {/* Empresa + Teléfono */}
                    <div className={styles.fieldRow}>
                      <div className={styles.field}>
                        <label className={styles.label} htmlFor="empresa">Empresa</label>
                        <input
                          id="empresa"
                          name="empresa"
                          type="text"
                          autoComplete="organization"
                          placeholder="Opcional"
                          className={styles.input}
                          value={values.empresa}
                          onChange={handleChange}
                        />
                      </div>
                      <div className={styles.field}>
                        <label className={styles.label} htmlFor="telefono">Teléfono</label>
                        <input
                          id="telefono"
                          name="telefono"
                          type="tel"
                          autoComplete="tel"
                          placeholder="Opcional"
                          className={styles.input}
                          value={values.telefono}
                          onChange={handleChange}
                        />
                      </div>
                    </div>

                    {/* Mensaje */}
                    <div className={styles.field}>
                      <label className={styles.label} htmlFor="mensaje">
                        Mensaje<span className={styles.required}>*</span>
                      </label>
                      <textarea
                        id="mensaje"
                        name="mensaje"
                        placeholder="Contame en qué puedo ayudarte…"
                        className={`${styles.textarea} ${touched.mensaje && errors.mensaje ? styles.inputError : ''}`}
                        value={values.mensaje}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        rows={6}
                      />
                      {touched.mensaje && errors.mensaje && (
                        <span className={styles.errorMsg}>{errors.mensaje}</span>
                      )}
                    </div>

                    {/* Submit row */}
                    <div className={styles.submitRow}>
                      <button
                        type="submit"
                        className={styles.submitBtn}
                        disabled={submitting}
                      >
                        {submitting ? 'Enviando…' : <>Enviar mensaje <ArrowIcon /></>}
                      </button>
                      {globalError && (
                        <span className={styles.globalError}>{globalError}</span>
                      )}
                    </div>
                  </form>
                )}
              </div>
            </motion.div>
          </div>
        </section>
      </div>
    </>
  )
}
