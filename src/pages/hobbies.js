import Head from 'next/head'
import { motion } from 'framer-motion'
import styles from '@/styles/About.module.css'

export default function Hobbies() {
  const hobbies = [
    { 
      title: "Tecnología e Innovación", 
      icon: "🚀",
      description: "Explorar constantemente las tendencias disruptivas que están dando forma al futuro digital."
    },
    { 
      title: "Deporte y Bienestar", 
      icon: "🏃",
      description: "Comprometido con un estilo de vida activo y saludable como pilar del alto rendimiento profesional."
    },
    { 
      title: "Liderazgo y Mentoría", 
      icon: "🤝",
      description: "Apasionado por compartir conocimientos y guiar a nuevas generaciones de líderes tecnológicos."
    },
    { 
      title: "Viajes de Negocios y Cultura", 
      icon: "🌍",
      description: "Curiosidad por entender diferentes mercados y culturas, ampliando la visión estratégica global."
    }
  ]

  return (
    <>
      <Head>
        <title>Pasatiempos e Intereses | Gastón Alejandro Ramos</title>
      </Head>

      <div className={styles.intro}>
        <div className="container">
          <div className={styles.header}>
            <h1 className={styles.title} style={{ color: '#000000' }}>Pasatiempos e intereses</h1>
            <p className={styles.subtitle}>Más allá de la estrategia: los pilares que impulsan mi visión personal y profesional.</p>
          </div>

          <div className={styles.hobbiesGrid}>
            {hobbies.map((hobby, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={styles.hobbyCard}
              >
                <span className={styles.hobbyIcon}>{hobby.icon}</span>
                <h3 className={styles.hobbyTitle}>{hobby.title}</h3>
                <p style={{ color: '#666', marginTop: '1rem', fontSize: '0.95rem' }}>{hobby.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <section className={styles.howIWork}>
        <div className="container">
          <div className={styles.workBox}>
            <h2 className={styles.workTitle}>Equilibrio y Enfoque</h2>
            <p className={styles.workText}>
              Creo firmemente que la excelencia profesional nace de un equilibrio integral. Mis intereses personales no son solo escapes, sino fuentes de inspiración y resiliencia que aplico en cada desafío estratégico.
            </p>
          </div>
        </div>
      </section>
    </>
  )
}
