'use client';

import { useEffect, useState } from 'react';
import styles from './SparkleParticles.module.css';

type Particle = {
  id: number;
  animation: string;
  startX: number;
  size: number;
  depth: number;
};

const PARTICLE_COUNT = 100;

const SparkleParticles = () => {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    const generateParticle = (): Particle => {
      // مدت زمان سقوط
      const fallDuration = Math.random() * 8 + 8;

      // برای جلوگیری از تشکیل موج
      const fallDelay = -Math.random() * fallDuration;

      const animation = `${styles.fall} ${fallDuration}s linear ${fallDelay}s infinite`;

      const depth = Math.floor(Math.random() * 3) + 1;

      return {
        id: Math.random(),
        startX: Math.random() * 100,
        size: Math.random() * 4 + 2,
        depth,
        animation,
      };
    };

    setParticles(
      Array.from({ length: PARTICLE_COUNT }, generateParticle)
    );
  }, []);

  return (
    <div className={styles.particleContainer}>
      {particles.map((particle) => (
        <div
          key={particle.id}
          className={`${styles.sparkleParticle} ${
            styles[`depth${particle.depth}`]
          }`}
          style={
            {
              '--start-x': `${particle.startX}vw`,
              '--size': `${particle.size}px`,
              animation: particle.animation,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
};

export default SparkleParticles;