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
const DUPLICATES = 3; // Render items 3x

const GridMotion = ({ items = [], gradientColor = 'transparent' }: GridMotionProps) => {
  const gridRef = useRef<HTMLDivElement>(null);
  const rowRefs = useRef<(HTMLDivElement | null)[]>([]);
  const animationsRef = useRef<gsap.core.Tween[]>([]);

  const totalItems = ROWS * COLS;
  const defaultItems = Array.from({ length: totalItems }, (_, i) => `Item ${i + 1}`);
  const baseItems = items.length > 0 ? items : defaultItems;
  const paddedItems: (string | React.ReactNode)[] = Array.from(
    { length: totalItems },
    (_, i) => baseItems[i % baseItems.length]
  );

  useEffect(() => {
    gsap.ticker.lagSmoothing(0);

    // Wait for DOM to render, then calculate dimensions
    const timer = setTimeout(() => {
      rowRefs.current.forEach((row, rowIndex) => {
        if (!row) return;

        // Calculate one set width (7 items + gaps)
        const items = row.querySelectorAll(`.${styles.rowItem}`);
        if (items.length < COLS) return;

        let oneSetWidth = 0;
        for (let i = 0; i < COLS; i++) {
          const item = items[i] as HTMLElement;
          oneSetWidth += item.offsetWidth + 19.2; // width + gap
        }
        oneSetWidth -= 19.2; // Remove last gap

        const direction = rowIndex % 2 === 0 ? -1 : 1;
        const speed = 25 + rowIndex * 2;

        // Kill previous animation if exists
        animationsRef.current[rowIndex]?.kill();

        // Create seamless loop animation
        // Animate exactly one set width, then repeat
        const tween = gsap.to(row, {
          x: direction === -1 ? -oneSetWidth : oneSetWidth,
          duration: speed,
          ease: 'none',
          repeat: -1,
          repeatDelay: 0,
          onRepeat: function() {
            // Reset position instantly when repeat starts (seamless because items are duplicated)
            gsap.set(row, { x: 0 });
          }
        });

        animationsRef.current[rowIndex] = tween;
      });
    }, 150);

    return () => {
      clearTimeout(timer);
      animationsRef.current.forEach(tween => tween?.kill());
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
              {/* Render items 3x for seamless loop */}
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
