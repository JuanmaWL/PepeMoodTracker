import { useState, useEffect, useCallback } from 'react';

export function useAppSettings() {
  const [ecoMode, setEcoMode] = useState<boolean>(() => {
    try {
      return localStorage.getItem('pepe_eco_mode') === 'true';
    } catch {
      return false;
    }
  });

  const [pixelMode, setPixelMode] = useState<boolean>(() => {
    try {
      return localStorage.getItem('pepe_pixel_mode') === 'true';
    } catch {
      return false;
    }
  });

  const [particleCount, setParticleCount] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('pepe_particle_count');
      if (saved !== null) {
        const parsed = parseInt(saved, 10);
        if (!Number.isNaN(parsed)) return parsed;
      }
    } catch {
      // Ignore storage errors
    }
    return typeof window !== 'undefined' && window.innerWidth < 768 ? 40 : 150;
  });

  useEffect(() => {
    if (ecoMode) {
      document.body.classList.add('eco-mode');
    } else {
      document.body.classList.remove('eco-mode');
    }
  }, [ecoMode]);

  useEffect(() => {
    try {
      localStorage.setItem('pepe_eco_mode', String(ecoMode));
      localStorage.setItem('pepe_pixel_mode', String(pixelMode));
      localStorage.setItem('pepe_particle_count', String(particleCount));
    } catch {
      // Ignore storage errors
    }
  }, [ecoMode, pixelMode, particleCount]);

  const triggerHaptic = useCallback((type: 'light' | 'medium' | 'heavy' = 'light') => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      const patterns = {
        light: 10,
        medium: 30,
        heavy: [50, 30, 50]
      };
      navigator.vibrate(patterns[type]);
    }
  }, []);

  return {
    ecoMode,
    setEcoMode,
    pixelMode,
    setPixelMode,
    particleCount,
    setParticleCount,
    triggerHaptic
  };
}
