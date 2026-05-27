"use client";

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import styles from './grid-motion.module.css';

interface GridMotionProps {
  items?: (string | React.ReactNode)[];
  gradientColor?: string;
}

const ROWS = 3;
const COLS = 7;

const GridMotion = ({ items = [], gradientColor = 'transparent' }: GridMotionProps) => {
  const gridRef = useRef<HTMLDivElement>(null);
  const rowRefs = useRef<(HTMLDivElement | null)[]>([]);

  const totalItems = ROWS * COLS;
  const defaultItems = Array.from({ length: totalItems }, (_, i) => `Item ${i + 1}`);
  const baseItems = items.length > 0 ? items : defaultItems;
  const paddedItems: (string | React.ReactNode)[] = Array.from(
    { length: totalItems },
    (_, i) => baseItems[i % baseItems.length]
  );

  useEffect(() => {
    gsap.ticker.lagSmoothing(0);

    // Start seamless carousel loop for each row
    rowRefs.current.forEach((row, index) => {
      if (!row) return;

      const direction = index % 2 === 0 ? -1 : 1;
      // Speed for carousel effect
      const speed = 25 + index * 2;

      // Seamless carousel: items are rendered twice, so we animate exactly 50% (one set)
      // When animation completes, it resets to start, but looks identical due to duplication
      if (direction === -1) {
        // Left-moving rows: animate from 0 to -50%
        gsap.fromTo(
          row,
          { x: '0%' },
          {
            x: '-50%',
            duration: speed,
            ease: 'none',
            repeat: -1,
            repeatDelay: 0 // No delay between repeats for smooth loop
          }
        );
      } else {
        // Right-moving rows: animate from -50% to 0%
        gsap.fromTo(
          row,
          { x: '-50%' },
          {
            x: '0%',
            duration: speed,
            ease: 'none',
            repeat: -1,
            repeatDelay: 0
          }
        );
      }
    });

    return () => {
      gsap.killTweensOf(rowRefs.current);
    };
  }, []);

  return (
    <div className={`${styles.noscroll} ${styles.loading}`} ref={gridRef}>
      <section
        className={styles.intro}
        style={{
          background: `radial-gradient(circle, ${gradientColor} 0%, transparent 100%)`
        }}
      >
        <div className={styles.gridMotionContainer}>
          {[...Array(ROWS)].map((_, rowIndex) => (
            <div
              key={rowIndex}
              className={styles.row}
              ref={el => { rowRefs.current[rowIndex] = el; }}
            >
              {/* Render items TWICE for seamless infinite carousel loop */}
              {[0, 1].flatMap((setIndex) =>
                [...Array(COLS)].map((_, itemIndex) => {
                  const content = paddedItems[rowIndex * COLS + itemIndex];
                  return (
                    <div key={`${setIndex}-${itemIndex}`} className={styles.rowItem}>
                      <div className={styles.rowItemInner}>
                        <div className={styles.rowItemContent}>{content}</div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          ))}
        </div>
        <div className={styles.fullview} />
      </section>
    </div>
  );
};

export default GridMotion;
