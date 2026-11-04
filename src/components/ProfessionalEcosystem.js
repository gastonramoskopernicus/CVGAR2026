import React from 'react'
import GARIcon from './GARIcon'
import styles from './ProfessionalEcosystem.module.css'

const brands = [
  {
    id: 'kopernicus',
    name: 'Kopernicus Tech',
    url: 'https://kopernicus.tech/',
    logo: '/images/brands/kopernicus-dark.png',
    alt: 'Kopernicus Tech',
    type: 'image',
  },
  {
    id: 'inspexiona',
    name: 'InspeXiona',
    url: 'https://inspexiona.com.ar/',
    logo: '/images/brands/inspexiona-white.png',
    alt: 'InspeXiona',
    type: 'image',
  },
  {
    id: 'techinsurance',
    name: 'Tech Insurance',
    url: 'https://techinsurance.com.ar/',
    logo: '/images/brands/techinsurance.svg',
    alt: 'Tech Insurance',
    type: 'techinsurance-lockup',
  },
  {
    id: 'kps',
    name: 'KPS Tech',
    url: 'https://www.kpstech.com.ar/',
    logo: '/images/brands/kpstech-blanco.png',
    alt: 'KPS Tech',
    type: 'image',
  },
]

export default function ProfessionalEcosystem() {
  return (
    <section
      className={styles.section}
      aria-labelledby="professional-ecosystem-heading"
    >
      <div className="container">
        <div className={styles.inner}>
          <div className={styles.header}>
            <div className={styles.titleRow}>
              <span className={styles.iconBadge}>
                <GARIcon name="ecosystem" size={22} />
              </span>
              <h2 id="professional-ecosystem-heading" className={styles.title}>
                Ecosistema profesional
              </h2>
            </div>
            <p className={styles.subtitle}>
              Empresas, plataformas e iniciativas vinculadas a mi actividad profesional.
            </p>
          </div>

          <div className={styles.brandStrip}>
            {brands.map((brand) => (
              <a
                key={brand.id}
                href={brand.url}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.brandItem}
                aria-label={`${brand.name} — Visitar sitio oficial`}
              >
                {brand.type === 'techinsurance-lockup' ? (
                  <div className={styles.techInsuranceLockup}>
                    <img
                      src={brand.logo}
                      alt={brand.alt}
                      className={styles.techInsuranceMark}
                      loading="lazy"
                    />
                    <span className={styles.techInsuranceWordmark}>
                      TECH<span className={styles.techInsuranceAccent}>INSURANCE</span>
                    </span>
                  </div>
                ) : (
                  <img
                    src={brand.logo}
                    alt={brand.alt}
                    className={`${styles.brandLogo} ${styles[`logo_${brand.id}`] || ''}`}
                    loading="lazy"
                  />
                )}
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

