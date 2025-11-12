'use client';

import { useEffect, useState } from 'react';
import styles from './SparkleParticles.module.css';

type Particle = {
  id: number;
  animation: string;
  startX: number;
  size: number;
  blur: number;
  depth: number;
};

const SparkleParticles = () => {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    const generateParticle = (): Particle => {
      const fallDuration = Math.random() * 10 + 7;
      const fallDelay = Math.random() * 2;
      const animationString = `${styles.fall} ${fallDuration}s linear ${fallDelay}s infinite`;

      const depth = Math.floor(Math.random() * 3) + 1;

      return {
        id: Math.random(),
        startX: Math.random() * 100,
        size: Math.random() * 3 + 1.5 * (4 - depth),
        blur: Math.random() * 2.5 + depth * 0.5,
        depth,
        animation: animationString,
      };
    };

    setParticles(Array.from({ length: 200 }, generateParticle));
  }, []);

  return (
    <div className={styles.particleContainer}>
      {particles.map((p) => (
        <div
          key={p.id}
          className={`${styles.sparkleParticle} ${styles[`depth${p.depth}`]}`}
          style={
            {
              '--start-x': `${p.startX}vw`,
              '--size': `${p.size}px`,
              '--blur': `${p.blur}px`,
              animation: p.animation,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
};

export default SparkleParticles;
