import React, { useEffect, useRef } from 'react';
import styles from './ToolStack.module.css';
import { toolStackCategories } from '@/data/toolStack';

export default function ToolStack() {
  const cardsRef = useRef([]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      cardsRef.current.forEach(card => {
        if (!card) return;
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        card.style.setProperty('--mouse-x', `${x}px`);
        card.style.setProperty('--mouse-y', `${y}px`);
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div className={styles.toolStackSection}>
      <div className={styles.sectionHeader}>
        <h2>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="28" height="28">
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.492-3.396m-2.492 3.396l-3.607 3.607c-.4.4-1.04.4-1.44 0-.4-.4-.4-1.04 0-1.44l3.607-3.607m2.492-3.396l-2.492-3.396M13.912 11.774l-3.396-2.492M11.42 8.378l2.492-3.396M10.518 5.886l3.396-2.492c.4-.4 1.04-.4 1.44 0 .4.4.4 1.04 0 1.44l-2.492 3.396m-2.492 3.396L8.378 11.42" />
          </svg>
          AI / Web3 / Automation Toolkit
        </h2>
        <p>Biblioteca de herramientas, plataformas y modelos utilizados en mi stack diario.</p>
      </div>

      {toolStackCategories.map((category) => (
        <div key={category.id} className={styles.categoryBlock}>
          <div className={styles.categoryHeader}>
            <h3 className={styles.categoryTitle}>{category.title}</h3>
            <p className={styles.categoryDesc}>{category.description}</p>
          </div>
          
          <div className={styles.toolsGrid}>
            {category.tools.map((tool, index) => (
              <a 
                key={`${category.id}-${index}`}
                href={tool.url}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.toolCard}
                ref={el => { cardsRef.current.push(el) }}
              >
                <div className={styles.cardHeader}>
                  <h4 className={styles.toolName}>{tool.name}</h4>
                  <div className={styles.badges}>
                    {tool.type && <span className={styles.badge}>{tool.type}</span>}
                    {tool.featured && <span className={`${styles.badge} ${styles.badgeFeatured}`}>Pro</span>}
                  </div>
                </div>
                
                <p className={styles.toolDesc}>{tool.description}</p>
                
                <div className={styles.cardFooter}>
                  <div className={styles.tags}>
                    {tool.tags.map(tag => (
                      <span key={tag} className={styles.tag}>#{tag}</span>
                    ))}
                  </div>
                  <div className={styles.openLink}>
                    Abrir
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
                    </svg>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
