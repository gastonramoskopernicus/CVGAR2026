import Head from 'next/head'
import Image from 'next/image'
import { useState } from 'react'
import { motion } from 'framer-motion'
import styles from '@/styles/Articles.module.css'

export default function Multimedia() {
  const [activeFilter, setActiveFilter] = useState('Todos')

  const filters = ['Todos', 'LinkedIn', 'YouTube', 'Innovación', 'Estrategia']

  const content = [
    {
      title: "El seguro como software: qué son los Seguros Sintéticos",
      description: "Una visión profunda sobre cómo los nuevos modelos técnicos están cambiando la industria aseguradora.",
      category: "YouTube",
      date: "Reciente",
      type: "Video",
      isVideo: true,
      image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=800",
      link: "https://www.youtube.com/@kopernicustech"
    },
    {
      title: "Formación Continua: Especialización en Gestión Técnica y Legal",
      description: "Reflexiones sobre el inicio del Posgrado en Seguros en la Universidad de San Andrés.",
      category: "LinkedIn",
      date: "Marzo 2026",
      type: "Publicación",
      image: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=800",
      link: "https://www.linkedin.com/in/ramosgaston/"
    },
    {
      title: "¿Cambiar el CORE de una compañía Aseguradora o Urbanizarlo?",
      description: "Análisis estratégico sobre la modernización de sistemas legados y arquitectura digital.",
      category: "YouTube",
      date: "Destacado",
      type: "Video",
      isVideo: true,
      image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc4b?auto=format&fit=crop&q=80&w=800",
      link: "https://www.youtube.com/@kopernicustech"
    },
    {
      title: "Cisnes Negros en Seguros: ¿Está preparada la industria?",
      description: "Lecciones de resiliencia y gestión de crisis ante eventos impensados en el sector asegurador.",
      category: "YouTube",
      date: "Destacado",
      type: "Video",
      isVideo: true,
      image: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&q=80&w=800",
      link: "https://www.youtube.com/@kopernicustech"
    },
    {
      title: "La tecnología aplicada a procesos críticos: Modernización de Core",
      description: "Cómo el despliegue de tecnología impacta directamente en la eficiencia operativa.",
      category: "LinkedIn",
      date: "Febrero 2026",
      type: "Artículo",
      image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800",
      link: "https://www.linkedin.com/in/ramosgaston/"
    },
    {
      title: "Seguros Digitales: la nueva experiencia del cliente",
      description: "Enfoque en UX y transformación omnicanal para el nuevo consumidor de seguros.",
      category: "YouTube",
      date: "Reciente",
      type: "Video",
      isVideo: true,
      image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=800",
      link: "https://www.youtube.com/@kopernicustech"
    }
  ]

  const filteredContent = activeFilter === 'Todos' 
    ? content 
    : content.filter(item => 
        item.category === activeFilter || 
        (activeFilter === 'YouTube' && item.isVideo) ||
        (activeFilter === 'LinkedIn' && (item.type === 'Publicación' || item.type === 'Artículo'))
      )

  return (
    <>
      <Head>
        <title>Multimedia y Contenidos | Gastón Alejandro Ramos</title>
      </Head>

      <div className={styles.intro}>
        <div className="container">
          <div className={styles.header}>
            <h1 className={styles.title} style={{ color: '#000000' }}>Multimedia / contenidos</h1>
            <p className={styles.subtitle}>Explora mis últimas reflexiones, análisis y videos sobre la industria Insurtech.</p>
          </div>

          <div className={styles.filters}>
            {filters.map(filter => (
              <button
                key={filter}
                className={`${styles.filterBtn} ${activeFilter === filter ? styles.active : ''}`}
                onClick={() => setActiveFilter(filter)}
              >
                {filter}
              </button>
            ))}
          </div>

          <div className={styles.grid}>
            {filteredContent.map((item, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={styles.card}
              >
                <div className={styles.cardImageContainer}>
                  <img src={item.image} alt={item.title} className={styles.cardImage} />
                  <div className={styles.cardHeaderOverlay}>
                    <span className={styles.category}>{item.category}</span>
                    <span className={styles.typeTag}>{item.type}</span>
                  </div>
                  {item.isVideo && (
                    <div className={styles.playOverlay}>
                      <div className={styles.playIconInner}>▶</div>
                    </div>
                  )}
                </div>
                
                <div className={styles.cardBody}>
                  <h3 className={styles.cardTitle} style={{ color: '#000000' }}>{item.title}</h3>
                  <p className={styles.cardDescription} style={{ color: '#555555' }}>{item.description}</p>
                </div>

                <div className={styles.cardFooter}>
                  <span className={styles.date}>{item.date}</span>
                  <a href={item.link} target="_blank" rel="noopener noreferrer" className={styles.readMore}>
                    {item.isVideo ? 'Ver en YouTube' : 'Ver en LinkedIn'} <span>&rarr;</span>
                  </a>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <section className={styles.youtubeSocial}>
        <div className="container">
          <div className={styles.socialBox}>
            <h2 className={styles.socialTitle}>Kopernicus Tech en YouTube</h2>
            <p className={styles.socialText}>
              Subscríbete a nuestro canal para análisis estratégicos sobre tecnología, innovación y el futuro del mercado asegurador.
            </p>
            <a href="https://youtube.com/@kopernicustech" target="_blank" rel="noopener noreferrer" className={styles.youtubeBtn}>
              Visitar Canal de YouTube
            </a>
          </div>
        </div>
      </section>
    </>
  )
}
