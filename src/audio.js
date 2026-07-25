/* ==========================================================================
   KNOWLEDGE QUEST - AUDIO ENGINE
   Web Audio API synthesizer for dynamic sound effects and ambient pad loop
   ========================================================================== */

const AudioEngine = (() => {
  let ctx = null;
  let bgmNode = null;
  let bgmFilter = null;
  let isMuted = false;

  const init = () => {
    if (!ctx) {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    // Resume context if suspended (common in browsers)
    if (ctx.state === 'suspended') {
      ctx.resume();
    }
  };

  const playClick = () => {
    if (isMuted) return;
    init();
    
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(150, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.08);
    
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);
    
    osc.start();
    osc.stop(ctx.currentTime + 0.08);
  };

  const playCorrect = () => {
    if (isMuted) return;
    init();

    const now = ctx.currentTime;
    const notes = [261.63, 329.63, 392.00, 523.25]; // C4, E4, G4, C5 (C Major Arpeggio)
    
    notes.forEach((freq, index) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + index * 0.08);
      
      gain.gain.setValueAtTime(0, now);
      gain.gain.setValueAtTime(0.08, now + index * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + index * 0.08 + 0.25);
      
      osc.start(now + index * 0.08);
      osc.stop(now + index * 0.08 + 0.3);
    });
  };

  const playIncorrect = () => {
    if (isMuted) return;
    init();

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(120, now);
    osc.frequency.linearRampToValueAtTime(80, now + 0.4);
    
    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
    
    osc.start();
    osc.stop(now + 0.5);
  };

  const playCast = (element) => {
    if (isMuted) return;
    init();

    const now = ctx.currentTime;
    
    if (element === 'fire') {
      const bufferSize = ctx.sampleRate * 0.5;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800, now);
      filter.frequency.exponentialRampToValueAtTime(100, now + 0.5);
      
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
      
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      
      noise.start();
      noise.stop(now + 0.5);
    } else if (element === 'water') {
      const osc = ctx.createOscillator();
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      const gain = ctx.createGain();
      
      lfo.frequency.value = 15;
      lfoGain.gain.value = 80;
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(250, now);
      osc.frequency.exponentialRampToValueAtTime(600, now + 0.5);
      
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
      
      lfo.start();
      osc.start();
      lfo.stop(now + 0.5);
      osc.stop(now + 0.5);
    } else if (element === 'earth') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(90, now);
      osc.frequency.exponentialRampToValueAtTime(20, now + 0.6);
      
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
      
      osc.start();
      osc.stop(now + 0.65);
    } else {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.setValueAtTime(1760, now + 0.1);
      osc.frequency.setValueAtTime(440, now + 0.2);
      osc.frequency.setValueAtTime(2200, now + 0.3);
      
      gain.gain.setValueAtTime(0.06, now);
      gain.gain.setValueAtTime(0.12, now + 0.15);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
      
      osc.start();
      osc.stop(now + 0.5);
    }
  };

  const playImpact = () => {
    if (isMuted) return;
    init();

    const now = ctx.currentTime;
    const bufferSize = ctx.sampleRate * 0.3;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(250, now);
    
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    
    noise.start();
    noise.stop(now + 0.35);
  };

  const playLevelUp = () => {
    if (isMuted) return;
    init();

    const now = ctx.currentTime;
    const notes = [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88, 523.25];
    
    notes.forEach((freq, index) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + index * 0.08);
      
      gain.gain.setValueAtTime(0, now);
      gain.gain.setValueAtTime(0.08, now + index * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + index * 0.08 + 0.4);
      
      osc.start(now + index * 0.08);
      osc.stop(now + index * 0.08 + 0.45);
    });
  };

  const playCoin = () => {
    if (isMuted) return;
    init();

    const now = ctx.currentTime;
    // Fast double chime representing money
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(987.77, now); // B5
    osc.frequency.setValueAtTime(1318.51, now + 0.06); // E6
    
    gain.gain.setValueAtTime(0.06, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
    
    osc.start();
    osc.stop(now + 0.22);
  };

  const playSparkle = () => {
    if (isMuted) return;
    init();

    const now = ctx.currentTime;
    // Shimmering chime effect for pet captures
    for (let i = 0; i < 6; i++) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.type = 'sine';
      osc.frequency.value = 1000 + Math.random() * 800;
      
      gain.gain.setValueAtTime(0, now);
      gain.gain.setValueAtTime(0.05, now + i * 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.04 + 0.2);
      
      osc.start(now + i * 0.04);
      osc.stop(now + i * 0.04 + 0.22);
    }
  };

  const startBGM = () => {
    if (isMuted) return;
    init();
    if (bgmNode) return;

    const now = ctx.currentTime;
    const frequencies = [65.41, 98.00, 82.41];
    bgmNode = [];
    
    bgmFilter = ctx.createBiquadFilter();
    bgmFilter.type = 'lowpass';
    bgmFilter.frequency.value = 180;
    bgmFilter.Q.value = 1;
    
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.03, now);
    
    bgmFilter.connect(masterGain);
    masterGain.connect(ctx.destination);

    const filterLFO = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    filterLFO.frequency.value = 0.05;
    lfoGain.gain.value = 60;
    
    filterLFO.connect(lfoGain);
    lfoGain.connect(bgmFilter.frequency);
    filterLFO.start();
    
    frequencies.forEach(freq => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.value = freq;
      
      gain.gain.setValueAtTime(0.02, now);
      
      osc.connect(gain);
      gain.connect(bgmFilter);
      osc.start();
      
      bgmNode.push({ osc, gain });
    });
    
    bgmNode.push(filterLFO);
  };

  const stopBGM = () => {
    if (!bgmNode) return;
    bgmNode.forEach(item => {
      if (item.osc) {
        item.osc.stop();
      } else {
        item.stop();
      }
    });
    bgmNode = null;
    bgmFilter = null;
  };

  const toggleMute = () => {
    isMuted = !isMuted;
    if (isMuted) {
      stopBGM();
    } else {
      startBGM();
    }
    return isMuted;
  };

  const getMuteState = () => isMuted;

  return {
    init,
    playClick,
    playCorrect,
    playIncorrect,
    playCast,
    playImpact,
    playLevelUp,
    playCoin,
    playSparkle,
    startBGM,
    stopBGM,
    toggleMute,
    getMuteState
  };
})();

window.AudioEngine = AudioEngine;
