import React from 'react';
import styles from '../styles/About.module.css';
import { worldData } from '../data/worldData';

const ExperienceMap = () => {
  // Countries where the consultant has experience
  const highlightedCountries = ['AR', 'CL', 'UY', 'PY', 'EC', 'MX', 'US', 'ES', 'BR', 'IT'];

  // Country translations to Spanish
  const countryTranslations = {
    'Argentina': 'Argentina',
    'Chile': 'Chile',
    'Uruguay': 'Uruguay',
    'Paraguay': 'Paraguay',
    'Ecuador': 'Ecuador',
    'Mexico': 'México',
    'United States': 'Estados Unidos',
    'Spain': 'España',
    'Brazil': 'Brasil',
    'Italy': 'Italia'
  };

  return (
    <div className={styles.mapSection}>
      <h2 className={styles.mapTitle}>Experiencia Internacional</h2>
      <div className={styles.mapContainer}>
        <svg
          viewBox="0 0 2000 1001"
          className={styles.worldMap}
          xmlns="http://www.w3.org/2000/svg"
          role="img"
          aria-label="Mapa de experiencia internacional en Argentina, Chile, Uruguay, Paraguay, Ecuador, México, Estados Unidos, España, Brasil e Italia"
        >
          {worldData.map((country) => {
            const isHighlighted = highlightedCountries.includes(country.id);
            const label = countryTranslations[country.name] || country.name;
            return (
              <path
                key={country.id}
                id={country.id}
                d={country.d}
                data-highlighted={isHighlighted}
                aria-label={isHighlighted ? label : undefined}
              />
            );
          })}
        </svg>
      </div>
      <div className={styles.countryLegend}>
        {worldData.filter(c => highlightedCountries.includes(c.id)).map(c => (
          <span key={c.id} className={styles.legendItem}>{countryTranslations[c.name] || c.name}</span>
        ))}
      </div>
    </div>
  );
};

export default ExperienceMap;
