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
  const rowWidthsRef = useRef<number[]>([]);

  const totalItems = ROWS * COLS;
  const defaultItems = Array.from({ length: totalItems }, (_, i) => `Item ${i + 1}`);
  const baseItems = items.length > 0 ? items : defaultItems;
  const paddedItems: (string | React.ReactNode)[] = Array.from(
    { length: totalItems },
    (_, i) => baseItems[i % baseItems.length]
  );

  useEffect(() => {
    gsap.ticker.lagSmoothing(0);

    // Calculate row widths after render
    setTimeout(() => {
      rowRefs.current.forEach((row, index) => {
        if (row) {
          rowWidthsRef.current[index] = row.scrollWidth / 2; // width of one set (half total)
        }
      });

      // Start continuous seamless loop for each row
      rowRefs.current.forEach((row, index) => {
        if (!row) return;

        const direction = index % 2 === 0 ? -1 : 1;
        const speed = 18 + index * 2.5;
        const oneSetWidth = rowWidthsRef.current[index] || 0;

        if (oneSetWidth === 0) return;

        // Use GSAP to animate with modulo wrapping for seamless loop
        gsap.to(row, {
          x: direction === -1 ? `-=${oneSetWidth * 2}` : `+=${oneSetWidth * 2}`,
          duration: speed * 2, // 2 full cycles
          ease: 'none',
          repeat: -1,
          modifiers: {
            x: gsap.utils.unitize(x => {
              const val = parseFloat(x);
              // Wrap position to stay within -oneSetWidth to 0
              const wrapped = ((val % oneSetWidth) + oneSetWidth) % oneSetWidth;
              return direction === -1 ? `-${wrapped}px` : `${wrapped}px`;
            })
          }
        });
      });
    }, 100);

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
              {/* Render items TWICE for seamless infinite loop */}
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
