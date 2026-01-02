import React, { memo } from 'react';

const Particles: React.FC = () => {
  const particleCount = 60; // Más partículas
  
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: -1 }}>
      {Array.from({ length: particleCount }).map((_, i) => {
        const size = Math.random() * 4 + 2; // Ligeramente más grandes
        const left = Math.random() * 100;
        const duration = Math.random() * 15 + 8; // Un poco más rápidas para que se noten
        const delay = Math.random() * 15;
        const isGreen = Math.random() > 0.4; // Más verdes

        return (
          <div
            key={i}
            className="particle"
            style={{
              width: `${size}px`,
              height: `${size}px`,
              left: `${left}%`,
              animationDuration: `${duration}s`,
              animationDelay: `-${delay}s`,
              backgroundColor: isGreen ? '#4ade80' : '#ffffff',
              boxShadow: isGreen ? '0 0 15px #22c55e' : '0 0 12px #ffffff',
            }}
          />
        );
      })}
    </div>
  );
};

export default memo(Particles);