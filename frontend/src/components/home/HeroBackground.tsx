"use client";

import { useEffect, useState } from "react";
import styles from "./hero-background.module.css";

export function HeroBackground() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    // Run once to set initial position
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className={styles.parallaxContainer}>
      <div 
        className={styles.bgLayer}
        style={{ transform: `translateY(${scrollY * 0.4}px)` }}
      >
        <div className={styles.bgGradients} />
      </div>
      <div 
        className={styles.bgLayer}
        style={{ transform: `translateY(${scrollY * 0.25}px)` }}
      >
        <div className={styles.bgGrid} />
        <div className={styles.bgDotsTopLeft} />
        <div className={styles.bgDotsBottomRight} />
      </div>
      <div 
        className={styles.bgLayer}
        style={{ transform: `translateY(${scrollY * 0.15}px)` }}
      >
        <div className={styles.bgWaves} />
      </div>
    </div>
  );
}
