import { useState } from 'react'
import { motion } from 'framer-motion'
import SEOHead from '@/components/SEOHead'
import { buildMultimediaSchema } from '@/lib/schemaOrg'
import GARIcon from '@/components/GARIcon'
import Monogram from '@/components/Monogram'
import styles from '@/styles/Articles.module.css'

export default function Multimedia() {
  const [activeFilter, setActiveFilter] = useState('Todos')
  const [playingVideoId, setPlayingVideoId] = useState(null)

  const filters = [
    'Todos',
    'Disertaciones',
    'Entrevistas',
    'Artículos',
    'Videos Institucionales',
    'LinkedIn',
    'YouTube',
  ]

  const content = [
    /* --- Disertaciones y entrevistas verificadas (V2.2 con imágenes reales) --- */
    {
      id: 'posgrado-uba-2026',
      title: 'Posgrado en Derecho de Seguros 2026 — Facultad de Derecho, UBA',
      subtitleTopic: 'Tema: Insurtech y futuro de las compañías de seguros.',
      description:
        'Disertación académica sobre el impacto de Insurtech, la evolución tecnológica del mercado asegurador y los nuevos desafíos estratégicos para las compañías de seguros.',
      category: 'LinkedIn',
      date: '2026 · Facultad de Derecho, UBA',
      type: 'Disertación',
      isVideo: false,
      image: '/thumbnails/uba-posgrados.jpg',
      iconName: 'consulting',
      link: 'https://www.linkedin.com/in/ramosgaston/',
    },
    {
      id: 'seminario-latam-12',
      title: 'Mesa de Innovación Tecnológica — 12.º Seminario Latinoamericano de Seguros y Reaseguros',
      description:
        'Participación en mesa ejecutiva regional analizando la agenda de transformación digital, modernización tecnológica y nuevos modelos operativos en el sector asegurador.',
      category: 'LinkedIn',
      date: 'Seminario Latinoamericano',
      type: 'Disertación',
      isVideo: false,
      image: '/thumbnails/modernizacion-cores-seguros.jpg',
      iconName: 'strategy',
      link: 'https://www.linkedin.com/feed/update/urn:li:activity:7469802818644918272/',
    },
    {
      id: 'entrevista-cambiar-industria',
      title: 'Entrevista: Cómo cambiar la industria del seguro desde adentro — Kopernicus Tech',
      description:
        'Conversación en profundidad con Gastón Ramos sobre el proceso de modernización de cores aseguradores, integraciones complejas y la agenda digital regional.',
      category: 'YouTube',
      date: 'Destacado · 12:42 min',
      type: 'Entrevista',
      isVideo: true,
      youtubeId: 'PtV9EF4u7T4',
      image: '/thumbnails/entrevista-cambiar-industria.jpg',
      link: 'https://www.youtube.com/watch?v=PtV9EF4u7T4',
    },

    /* --- Artículos verificados (V2.2) --- */
    {
      id: 'articulo-equivocarse-menos',
      title: '¿Qué ocurre con la industria del seguro cuando el mundo empieza a equivocarse menos?',
      description:
        'Reflexión estratégica sobre la reducción de la siniestralidad por automatización y sensores predictivos, y el cambio de paradigma en el modelo asegurador.',
      category: 'LinkedIn',
      date: 'Artículo de opinión',
      type: 'Artículo',
      isVideo: false,
      image: '/thumbnails/resiliencia-transaccional-space-cloud.jpg',
      iconName: 'innovation',
      link: 'https://www.linkedin.com/feed/update/urn:li:activity:7450549959080255488/',
    },
    {
      id: 'articulo-tesla-seguros',
      title: 'Tesla, seguros y un nuevo ciclo en el desarrollo de software.',
      description:
        'Análisis sobre la convergencia entre movilidad conectada, telemetría en tiempo real, seguros embebidos y cómo el software redefine la suscripción de riesgos.',
      category: 'LinkedIn',
      date: 'Artículo de opinión',
      type: 'Artículo',
      isVideo: false,
      image: '/thumbnails/tesla-seguros-software.jpg',
      iconName: 'ai',
      link: 'https://www.linkedin.com/in/ramosgaston/',
    },
    {
      id: 'articulo-reconfiguramos-reset',
      title: 'Reconfiguramos bien el Reset?',
      description:
        'Mirada ejecutiva sobre los procesos de transformación organizacional y tecnológica: qué cambios estructurales permanecen y cómo consolidar la evolución digital.',
      category: 'LinkedIn',
      date: 'Artículo de opinión',
      type: 'Artículo',
      isVideo: false,
      image: '/thumbnails/seguro-parametrico-automatizacion-oraculos.jpg',
      iconName: 'transformation',
      link: 'https://www.linkedin.com/in/ramosgaston/',
    },
    {
      id: 'articulo-hard-reset-covid',
      title: 'Hard Reset: desafíos y oportunidades del reseteo forzado tras el Covid-19.',
      description:
        'Análisis de la aceleración digital forzada, la resiliencia operativa y las oportunidades estratégicas para repensar procesos y modelos de negocio.',
      category: 'LinkedIn',
      date: 'Artículo de opinión',
      type: 'Artículo',
      isVideo: false,
      image: '/thumbnails/y-si-el-riesgo-ya-no-fuera-incierto.jpg',
      iconName: 'operations',
      link: 'https://www.linkedin.com/in/ramosgaston/',
    },

    /* --- Contenidos existentes preservados (sin duplicar) --- */
    {
      id: 'video-seguros-sinteticos',
      title: 'El seguro como software: qué son los Seguros Sintéticos',
      description:
        'Una visión profunda sobre cómo los nuevos modelos técnicos están cambiando la industria aseguradora.',
      category: 'YouTube',
      date: 'Reciente · 4:24 min',
      type: 'Video Institucional',
      isVideo: true,
      youtubeId: 'EQJd2-HvjaQ',
      image: '/thumbnails/seguros-sinteticos.png',
      link: 'https://www.youtube.com/watch?v=EQJd2-HvjaQ',
    },
    {
      id: 'pub-formacion-continua',
      title: 'Formación Continua: Especialización en Gestión Técnica y Legal',
      description:
        'Reflexiones sobre el inicio del Posgrado en Seguros en la Universidad de San Andrés.',
      category: 'LinkedIn',
      date: 'Marzo 2026',
      type: 'Publicación',
      isVideo: false,
      image: '/thumbnails/formacion-posgrado.png',
      link: 'https://www.linkedin.com/in/ramosgaston/',
    },
    {
      id: 'video-core-urbanizar',
      title: '¿Cambiar el CORE de una compañía Aseguradora o Urbanizarlo?',
      description:
        'Análisis estratégico sobre la modernización de sistemas legados y arquitectura digital.',
      category: 'YouTube',
      date: 'Destacado · 4:25 min',
      type: 'Video Institucional',
      isVideo: true,
      youtubeId: '37LdiHUi6A8',
      image: '/thumbnails/core-change.png',
      link: 'https://www.youtube.com/watch?v=37LdiHUi6A8',
    },
    {
      id: 'video-cisnes-negros',
      title: 'Cisnes Negros en Seguros: ¿Está preparada la industria?',
      description:
        'Lecciones de resiliencia y gestión de crisis ante eventos impensados en el sector asegurador.',
      category: 'YouTube',
      date: 'Destacado · 3:05 min',
      type: 'Video Institucional',
      isVideo: true,
      youtubeId: 'I8hAyTWKriA',
      image: '/thumbnails/cisnes-negros.png',
      link: 'https://www.youtube.com/watch?v=I8hAyTWKriA',
    },
    {
      id: 'articulo-modernizacion-core',
      title: 'La tecnología aplicada a procesos críticos: Modernización de Core',
      description:
        'Cómo el despliegue de tecnología impacta directamente en la eficiencia operativa.',
      category: 'LinkedIn',
      date: 'Febrero 2026',
      type: 'Artículo',
      isVideo: false,
      image: '/thumbnails/modernizacion-core.png',
      link: 'https://www.linkedin.com/feed/update/urn:li:activity:7469802818644918272/',
    },
    {
      id: 'video-seguros-digitales',
      title: 'Seguros Digitales: la nueva experiencia del cliente',
      description:
        'Enfoque en UX y transformación omnicanal para el nuevo consumidor de seguros.',
      category: 'YouTube',
      date: 'Reciente · 3:02 min',
      type: 'Video Institucional',
      isVideo: true,
      youtubeId: 'kn1ttHHeZyU',
      image: '/thumbnails/seguros-digitales.png',
      link: 'https://www.youtube.com/watch?v=kn1ttHHeZyU',
    },
  ]

  const filteredContent =
    activeFilter === 'Todos'
      ? content
      : content.filter((item) => {
          if (activeFilter === 'Disertaciones') return item.type === 'Disertación'
          if (activeFilter === 'Entrevistas') return item.type === 'Entrevista'
          if (activeFilter === 'Artículos') return item.type === 'Artículo' || item.type === 'Publicación'
          if (activeFilter === 'Videos Institucionales') return item.type === 'Video Institucional'
          if (activeFilter === 'YouTube') return item.category === 'YouTube' || item.isVideo
          if (activeFilter === 'LinkedIn') return item.category === 'LinkedIn'
          return item.category === activeFilter
        })

  return (
    <>
      <SEOHead
        title="Multimedia, Artículos y Disertaciones | Gastón Alejandro Ramos"
        description="Conferencias, entrevistas, videos y artículos de opinión de Gastón Alejandro Ramos sobre estrategia empresarial, tecnología, transformación digital, IA y seguros."
        path="/multimedia"
        jsonLd={buildMultimediaSchema(content)}
      />

      <div className={styles.intro}>
        <div className="container">
          <div className={styles.header}>
            <h1 className={styles.title}>Multimedia / contenidos</h1>
            <p className={styles.subtitle}>
              Disertaciones académicas, entrevistas, artículos de opinión y análisis audiovisuales sobre estrategia, tecnología e innovación aseguradora.
            </p>
          </div>

          <div className={styles.filters} role="tablist" aria-label="Filtrar contenidos">
            {filters.map((filter) => (
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
            {filteredContent.map((item, index) => {
              const isPlaying = playingVideoId === item.id && item.youtubeId

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.06 }}
                  className={styles.card}
                >
                  <div className={styles.cardImageContainer}>
                    {isPlaying ? (
                      <iframe
                        className={styles.videoIframe}
                        src={`https://www.youtube.com/embed/${item.youtubeId}?autoplay=1&rel=0`}
                        title={item.title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    ) : (
                      <>
                        {item.image ? (
                          <img src={item.image} alt={item.title} className={styles.cardImage} loading="lazy" />
                        ) : (
                          <div className={styles.editorialCover} aria-hidden="true">
                            <div className={styles.editorialPattern} />
                            <div className={styles.editorialCenterIcon}>
                              <GARIcon name={item.iconName || 'strategy'} size={44} />
                            </div>
                            <div className={styles.editorialWatermark}>
                              <Monogram variant="inline" />
                            </div>
                          </div>
                        )}

                        <div className={styles.cardHeaderOverlay}>
                          <span className={styles.category}>{item.category}</span>
                          <span
                            className={`${styles.typeTag} ${
                              item.type === 'Disertación'
                                ? styles.typeDisertacion
                                : item.type === 'Entrevista'
                                ? styles.typeEntrevista
                                : item.type === 'Artículo'
                                ? styles.typeArticulo
                                : ''
                            }`}
                          >
                            {item.type}
                          </span>
                        </div>

                        {item.isVideo && (
                          <button
                            type="button"
                            className={styles.playOverlay}
                            onClick={() =>
                              item.youtubeId
                                ? setPlayingVideoId(item.id)
                                : window.open(item.link, '_blank', 'noopener,noreferrer')
                            }
                            aria-label={`Reproducir video: ${item.title}`}
                          >
                            <div className={styles.playIconInner}>▶</div>
                          </button>
                        )}
                      </>
                    )}
                  </div>

                  <div className={styles.cardBody}>
                    <h3 className={styles.cardTitle}>{item.title}</h3>
                    {item.subtitleTopic && (
                      <p className={styles.cardTopic}>{item.subtitleTopic}</p>
                    )}
                    <p className={styles.cardDescription}>{item.description}</p>
                  </div>

                  <div className={styles.cardFooter}>
                    <span className={styles.date}>{item.date}</span>
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.readMore}
                    >
                      {item.isVideo ? 'Ver en YouTube' : 'Ver en LinkedIn'}{' '}
                      <span aria-hidden="true">&rarr;</span>
                    </a>
                  </div>
                </motion.div>
              )
            })}
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
            <div className={styles.socialActions}>
              <a
                href="https://www.youtube.com/@kopernicustech"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.youtubeBtn}
              >
                Visitar Canal de YouTube
              </a>
              <a
                href="https://www.kopernicus.tech/multimedia"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.secondaryMultimediaBtn}
              >
                Multimedia Corporativa &rarr;
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
