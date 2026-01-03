class SoundManager {
  private static ctx: AudioContext | null = null;
  private static isMuted = false;

  private static getContext() {
    // Inicializar el contexto de audio solo si estamos en el cliente
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
      }
    }
    return this.ctx;
  }

  // Ya no es necesario precargar archivos, pero mantenemos el método por compatibilidad
  static preload() {
    try {
      this.getContext();
    } catch (e) {
      console.error("AudioContext not supported");
    }
  }

  static play(type: 'pop' | 'click' | 'success' | 'magic' | 'trash' | 'open', volumeOverride?: number) {
    const ctx = this.getContext();
    if (!ctx || this.isMuted) return;

    // Política de navegadores: reanudar si está suspendido (requiere interacción previa del usuario, que ya tenemos en los clicks)
    if (ctx.state === 'suspended') {
      ctx.resume().catch(e => console.error(e));
    }

    const t = ctx.currentTime;
    
    // Volúmenes base ajustados para ser sutiles (los osciladores puros suenan fuerte)
    switch (type) {
      case 'pop':
        // Sonido tipo "Burbuja" (Sine wave con caída de pitch): Muy Pepe
        // Frecuencia: 600Hz -> 300Hz
        this.synthOsc(ctx, t, 600, 300, 0.1, 'sine', (volumeOverride ?? 0.15));
        break;
        
      case 'click':
        // Click mecánico muy corto y agudo
        this.synthOsc(ctx, t, 1200, 1200, 0.03, 'triangle', (volumeOverride ?? 0.05));
        break;
        
      case 'open':
        // Swish suave
        this.synthOsc(ctx, t, 400, 600, 0.1, 'sine', (volumeOverride ?? 0.1));
        break;
        
      case 'success':
        // Acorde Mayor Placentero (C - E - G) con un poco de "arpegio" rápido
        // Da sensación de logro positivo
        const vol = volumeOverride ?? 0.1;
        this.synthNote(ctx, t, 523.25, 0.4, 'sine', vol);        // Do (C5)
        this.synthNote(ctx, t + 0.05, 659.25, 0.4, 'sine', vol); // Mi (E5)
        this.synthNote(ctx, t + 0.10, 783.99, 0.6, 'sine', vol); // Sol (G5)
        break;
        
      case 'trash':
        // Tono descendente rápido (descarte)
        this.synthOsc(ctx, t, 150, 40, 0.2, 'sawtooth', (volumeOverride ?? 0.1));
        break;
        
      case 'magic':
        // Destellos (Sparkles): Varios tonos agudos aleatorios
        const magicVol = volumeOverride ?? 0.03; // Muy bajito como pediste
        for(let i=0; i<5; i++) {
           const freq = 1200 + Math.random() * 800; // Frecuencias altas
           const delay = i * 0.06;
           this.synthOsc(ctx, t + delay, freq, freq, 0.1, 'sine', magicVol);
        }
        break;
    }
  }

  // Generador de oscilador con rampa de frecuencia (para efectos tipo laser, gota, burbuja)
  private static synthOsc(ctx: AudioContext, t: number, freqStart: number, freqEnd: number, duration: number, type: OscillatorType, vol: number) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = type;
    osc.frequency.setValueAtTime(freqStart, t);
    osc.frequency.exponentialRampToValueAtTime(Math.max(freqEnd, 0.01), t + duration);
    
    // Envolvente (Envelope) para evitar clicks al inicio y final
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(vol, t + 0.01); // Ataque rápido
    gain.gain.exponentialRampToValueAtTime(0.001, t + duration); // Decaimiento suave
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start(t);
    osc.stop(t + duration + 0.1); // Margen de seguridad
  }

  // Generador de nota simple (para melodías o acordes)
  private static synthNote(ctx: AudioContext, t: number, freq: number, duration: number, type: OscillatorType, vol: number) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    
    // Envolvente tipo "campana" o piano suave
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(vol, t + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, t + duration);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start(t);
    osc.stop(t + duration + 0.1);
  }
}

export default SoundManager;