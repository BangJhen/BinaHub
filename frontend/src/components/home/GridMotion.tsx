"use client";

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import styles from './grid-motion.module.css';

interface GridMotionProps {
  items?: (string | React.ReactNode)[];
  gradientColor?: string;
}

const ROWS = 6;
const COLS = 7;

const GridMotion = ({ items = [], gradientColor = 'transparent' }: GridMotionProps) => {
  const gridRef = useRef<HTMLDivElement>(null);
  const rowRefs = useRef<(HTMLDivElement | null)[]>([]);

  const totalItems = ROWS * COLS;
  const defaultItems = Array.from({ length: totalItems }, (_, i) => `Item ${i + 1}`);
  // Pad items to fill all slots
  const baseItems = items.length > 0 ? items : defaultItems;
  const paddedItems: (string | React.ReactNode)[] = Array.from(
    { length: totalItems },
    (_, i) => baseItems[i % baseItems.length]
  );

  useEffect(() => {
    gsap.ticker.lagSmoothing(0);

    rowRefs.current.forEach((row, index) => {
      if (!row) return;

      // Alternate direction per row for visual interest
      const direction = index % 2 === 0 ? -1 : 1;
      // Vary speed slightly per row
      const speed = 18 + index * 2.5;

      // fromTo: animate exactly -50% (one set of items), repeat seamlessly
      // Items are rendered twice so -50% = exactly one full set
      gsap.fromTo(
        row,
        { x: direction === -1 ? '0%' : '-50%' },
        {
          x: direction === -1 ? '-50%' : '0%',
          duration: speed,
          ease: 'none',
          repeat: -1,
        }
      );
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
            // Each row renders items TWICE for seamless infinite loop
            <div
              key={rowIndex}
              className={styles.row}
              ref={el => { rowRefs.current[rowIndex] = el; }}
            >
              {[0, 1].flatMap((setIndex) =>
                [...Array(COLS)].map((_, itemIndex) => {
                  const content = paddedItems[rowIndex * COLS + itemIndex];
                  return (
                    <div key={`${setIndex}-${itemIndex}`} className={styles.rowItem}>
                      <div className={styles.rowItemInner}>
                        {typeof content === 'string' && content.startsWith('http') ? (
                          <div
                            className={styles.rowItemImg}
                            style={{ backgroundImage: `url(${content})` }}
                          />
                        ) : (
                          <div className={styles.rowItemContent}>{content}</div>
                        )}
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
