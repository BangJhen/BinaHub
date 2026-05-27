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
const DUPLICATES = 4; // Render items 4x for smooth infinite scroll

const GridMotion = ({ items = [], gradientColor = 'transparent' }: GridMotionProps) => {
  const gridRef = useRef<HTMLDivElement>(null);
  const rowRefs = useRef<(HTMLDivElement | null)[]>([]);
  const rowPositionsRef = useRef<number[]>(new Array(ROWS).fill(0));
  const itemWidthRef = useRef<number>(0);

  const totalItems = ROWS * COLS;
  const defaultItems = Array.from({ length: totalItems }, (_, i) => `Item ${i + 1}`);
  const baseItems = items.length > 0 ? items : defaultItems;
  const paddedItems: (string | React.ReactNode)[] = Array.from(
    { length: totalItems },
    (_, i) => baseItems[i % baseItems.length]
  );

  useEffect(() => {
    gsap.ticker.lagSmoothing(0);

    // Calculate item width after render
    setTimeout(() => {
      const firstItem = document.querySelector(`.${styles.rowItem}`) as HTMLElement;
      if (firstItem) {
        const rect = firstItem.getBoundingClientRect();
        itemWidthRef.current = rect.width + 19.2; // width + gap (1.2rem = 19.2px at default font)
      }

      const speeds = [25, 28, 26]; // Different speed per row
      const directions = [-1, 1, -1]; // Alternating directions

      // Continuous animation using GSAP ticker
      rowRefs.current.forEach((row, rowIndex) => {
        if (!row) return;

        const direction = directions[rowIndex];
        const speed = speeds[rowIndex];
        const pixelsPerSecond = (itemWidthRef.current * COLS) / speed;

        // Animate continuously
        gsap.to(row, {
          x: direction === -1 ? -10000 : 10000, // Large value for continuous movement
          duration: 10000 / pixelsPerSecond, // Duration based on distance and speed
          ease: 'none',
          repeat: -1,
          onUpdate: function() {
            const currentX = gsap.getProperty(row, 'x') as number;
            const oneSetWidth = itemWidthRef.current * COLS;

            // Reset position when scrolled too far
            if (direction === -1 && currentX < -oneSetWidth * 2) {
              gsap.set(row, { x: 0 });
            } else if (direction === 1 && currentX > oneSetWidth * 2) {
              gsap.set(row, { x: 0 });
            }
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
              {/* Render items MULTIPLE times for smooth infinite carousel */}
              {[...Array(DUPLICATES)].flatMap((_, setIndex) =>
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
