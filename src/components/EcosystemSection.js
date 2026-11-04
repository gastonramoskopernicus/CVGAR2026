import React from 'react'
import { ecosystemEntities } from '@/data/ecosystemData'
import styles from './EcosystemSection.module.css'

/**
 * Componente visual extensible para el Ecosistema de empresas, productos e iniciativas.
 * Renderiza únicamente entidades con `published: true` para evitar publicar
 * textos comerciales ficticios o atribuciones societarias no verificadas.
 */
export default function EcosystemSection({
  title = 'Ecosistema',
  subtitle = 'Empresas, plataformas e iniciativas vinculadas.',
  items = ecosystemEntities,
}) {
  const visibleItems = (items || []).filter((item) => item.published)

  if (visibleItems.length === 0) {
    return null
  }

  return (
    <section className={styles.section} aria-label={title}>
      <div className="container">
        <div className={styles.header}>
          <span className={styles.kicker}>Ecosistema</span>
          <h2 className={styles.title}>{title}</h2>
          {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        </div>

        <div className={styles.grid}>
          {visibleItems.map((entity, index) => {
            const CardTag = entity.url ? 'a' : 'div'
            const linkProps = entity.url
              ? {
                  href: entity.url,
                  target: '_blank',
                  rel: 'noopener noreferrer',
                }
              : {}

            return (
              <CardTag key={entity.id} className={styles.card} {...linkProps}>
                <div className={styles.cardTop}>
                  {entity.category && (
                    <span className={styles.badge}>{entity.category}</span>
                  )}
                  <span className={styles.index}>
                    {String(index + 1).padStart(2, '0')}
                  </span>
                </div>

                <h3 className={styles.name}>{entity.name}</h3>

                {entity.description && (
                  <p className={styles.description}>{entity.description}</p>
                )}

                {entity.url && (
                  <div className={styles.action}>
                    <span>Explorar</span>
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.75"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <line x1="7" y1="17" x2="17" y2="7" />
                      <polyline points="7 7 17 7 17 17" />
                    </svg>
                  </div>
                )}
              </CardTag>
            )
          })}
        </div>
      </div>
    </section>
  )
}

