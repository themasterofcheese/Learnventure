/* ==========================================================================
   KNOWLEDGE QUEST - HIGGSFIELD AI SIMULATOR
   Generative neural pipeline logs, motion vectors, and custom deck equipment
   ========================================================================== */

const HiggsfieldEngine = (() => {
  let activeCustomSpell = null;
  let previewAnimId = null;

  const init = () => {
    const form = document.getElementById('lab-generator-form');
    if (form) form.addEventListener('submit', handleGenerate);

    const equipBtn = document.getElementById('equip-custom-spell-btn');
    if (equipBtn) equipBtn.addEventListener('click', equipSpellToDeck);
  };

  const handleGenerate = (e) => {
    e.preventDefault();
    if (window.AudioEngine) window.AudioEngine.playClick();

    const prompt = document.getElementById('spell-prompt').value.trim();
    const element = document.getElementById('spell-element').value;
    const camera = document.querySelector('input[name="camera"]:checked').value;
    const motion = parseInt(document.getElementById('motion-slider').value);
    const style = document.getElementById('spell-style').value;

    // Transition UI states
    document.getElementById('lab-empty-state').classList.add('hidden');
    document.getElementById('lab-preview-state').classList.add('hidden');
    
    const genState = document.getElementById('lab-generating-state');
    genState.classList.remove('hidden');

    const consoleLog = document.getElementById('pipeline-log-console');
    consoleLog.innerHTML = ''; // Clear logs

    // Stop any existing preview loop
    if (previewAnimId) {
      cancelAnimationFrame(previewAnimId);
      previewAnimId = null;
    }

    // Math metrics based on choices
    const powerMap = [0, 30, 38, 45, 52];
    const costMap = [0, 8, 12, 18, 25];
    
    activeCustomSpell = {
      name: parseSpellName(prompt),
      prompt: prompt,
      element: element,
      camera: camera,
      motion: motion,
      style: style,
      power: powerMap[motion],
      cost: costMap[motion]
    };

    // Run pipeline logs simulation
    let progress = 0;
    const percentTxt = document.getElementById('pipeline-percent');
    const stepTxt = document.getElementById('pipeline-step-title');

    const logs = [
      { prg: 5, msg: "[SYSTEM] Connecting to Higgsfield GPU Node clusters..." },
      { prg: 15, msg: `[TOKENIZER] Prompt compiled: "${prompt}"` },
      { prg: 30, msg: `[CAMERA] Initializing camera matrix transformation: ${camera.toUpperCase()}` },
      { prg: 45, msg: `[STYLE] Fetching style layers weights: ${style.toUpperCase()}` },
      { prg: 65, msg: `[INTERPOLATE] Generating frame vectors with Motion Severity: Lvl ${motion}` },
      { prg: 80, msg: "[RENDER] Compiling raw frames into 24fps WebM H.264 wrapper..." },
      { prg: 95, msg: "[BUFFER] Optimizing textures, finalizing color grades..." },
      { prg: 100, msg: "[SUCCESS] Neural render completed successfully." }
    ];

    let logIdx = 0;
    const interval = setInterval(() => {
      progress += Math.floor(Math.random() * 5) + 3;
      if (progress > 100) progress = 100;
      
      percentTxt.innerText = `${progress}%`;

      // Print logs matching progress thresholds
      while (logIdx < logs.length && progress >= logs[logIdx].prg) {
        addConsoleLog(logs[logIdx].msg);
        stepTxt.innerText = logs[logIdx].msg.replace(/\[\w+\]\s*/, '');
        logIdx++;
      }

      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(showRenderPreview, 600);
      }
    }, 150);
  };

  const addConsoleLog = (msg) => {
    const consoleLog = document.getElementById('pipeline-log-console');
    const line = document.createElement('div');
    line.className = 'pipeline-log-line';
    
    // Highlight syntax
    if (msg.includes("[SUCCESS]")) {
      line.style.color = '#10b981';
      line.style.fontWeight = 'bold';
    } else if (msg.includes("[RENDER]")) {
      line.style.color = '#3b82f6';
    } else if (msg.includes("[SYSTEM]")) {
      line.style.color = '#a855f7';
    } else {
      line.style.color = '#cbd5e1';
    }

    line.innerText = msg;
    consoleLog.appendChild(line);
    consoleLog.scrollTop = consoleLog.scrollHeight;
  };

  const parseSpellName = (prompt) => {
    // Generate a spell name from the prompt
    const words = prompt.split(/\s+/).filter(w => w.length > 3);
    if (words.length >= 2) {
      const cap = (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
      return `${cap(words[0])} ${cap(words[1])}`;
    }
    return "Custom Aether";
  };

  const showRenderPreview = () => {
    if (window.AudioEngine) window.AudioEngine.playCorrect();

    document.getElementById('lab-generating-state').classList.add('hidden');
    const previewState = document.getElementById('lab-preview-state');
    previewState.classList.remove('hidden');

    document.getElementById('preview-spell-name').innerText = activeCustomSpell.name;
    document.getElementById('preview-cam-text').innerText = activeCustomSpell.camera.toUpperCase();
    document.getElementById('preview-stat-class').innerText = activeCustomSpell.element.toUpperCase();
    
    // Configure statistics values
    const equipBtn = document.getElementById('equip-custom-spell-btn');
    equipBtn.innerText = "Equip to active deck";
    equipBtn.disabled = false;

    // Start canvas camera animation simulation
    const canvas = document.getElementById('preview-overlay-canvas');
    runPreviewCameraSimulation(canvas, activeCustomSpell.camera, activeCustomSpell.style, activeCustomSpell.element);
  };

  // Preview Loop on Canvas to simulate camera controls panning/scaling
  const runPreviewCameraSimulation = (canvas, camera, style, element) => {
    const ctx = canvas.getContext('2d');
    const width = canvas.width = 640;
    const height = canvas.height = 360;

    let frame = 0;
    const particles = [];
    
    const getElColor = () => {
      if (element === 'fire') return 'rgba(239, 68, 68, 0.4)';
      if (element === 'water') return 'rgba(59, 130, 246, 0.4)';
      if (element === 'earth') return 'rgba(16, 185, 129, 0.4)';
      return 'rgba(217, 70, 239, 0.4)';
    };

    const drawLoop = () => {
      frame++;
      ctx.clearRect(0, 0, width, height);

      ctx.save();

      // Camera Matrix translation
      if (camera === 'zoom') {
        const scale = 1 + Math.sin(frame * 0.03) * 0.05;
        ctx.translate(width/2, height/2);
        ctx.scale(scale, scale);
        ctx.translate(-width/2, -height/2);
      } else if (camera === 'pan') {
        const pan = Math.sin(frame * 0.02) * 15;
        ctx.translate(pan, 0);
      } else if (camera === 'orbit') {
        const orbitX = Math.cos(frame * 0.03) * 10;
        const orbitY = Math.sin(frame * 0.02) * 6;
        ctx.translate(orbitX, orbitY);
      } else if (camera === 'fpv') {
        const shakeX = (Math.random() * 4 - 2);
        const shakeY = (Math.random() * 4 - 2);
        ctx.translate(shakeX, shakeY);
      }

      // Draw custom style filters on top
      if (style === 'synthwave') {
        // Glowing grids overlay
        ctx.strokeStyle = 'rgba(217, 70, 239, 0.2)';
        ctx.lineWidth = 1.5;
        const offset = (frame * 2) % 40;
        for (let y = 180; y < height; y += 20) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(width, y);
          ctx.stroke();
        }
        for (let x = -80; x < width + 80; x += 30) {
          ctx.beginPath();
          ctx.moveTo(width/2 + (x - width/2) * 0.1, 180);
          ctx.lineTo(x, height);
          ctx.stroke();
        }
      } else if (style === 'retro') {
        // Pixelate noise
        ctx.fillStyle = 'rgba(255,255,255,0.03)';
        for (let i = 0; i < 40; i++) {
          const px = Math.random() * width;
          const py = Math.random() * height;
          ctx.fillRect(Math.floor(px/4)*4, Math.floor(py/4)*4, 4, 4);
        }
      } else {
        // Anime/Realistic particle overlays
        if (Math.random() < 0.15) {
          particles.push({
            x: Math.random() * width,
            y: height,
            vy: -(Math.random() * 3 + 1),
            size: Math.random() * 4 + 2,
            alpha: 0.8
          });
        }

        particles.forEach((p, idx) => {
          p.y += p.vy;
          p.alpha -= 0.01;
          if (p.alpha <= 0) {
            particles.splice(idx, 1);
            return;
          }
          ctx.beginPath();
          ctx.fillStyle = getElColor();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        });
      }

      ctx.restore();

      // Camera lens boundary grid
      ctx.strokeStyle = 'rgba(255,255,255,0.15)';
      ctx.lineWidth = 1;
      ctx.strokeRect(30, 30, width - 60, height - 60);

      // Record indicator
      if (Math.floor(frame / 20) % 2 === 0) {
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(width - 50, 50, 6, 0, Math.PI*2);
        ctx.fill();
        ctx.fillStyle = 'white';
        ctx.font = '9px monospace';
        ctx.fillText("REC", width - 38, 53);
      }

      previewAnimId = requestAnimationFrame(drawLoop);
    };

    drawLoop();
  };

  const equipSpellToDeck = () => {
    if (!activeCustomSpell) return;
    if (window.AudioEngine) window.AudioEngine.playCorrect();

    const player = window.App.getPlayerState();
    
    // Check if customSpells is array
    if (!player.customSpells) {
      player.customSpells = [];
    }

    // Keep max 2 custom spells, shifting out old ones
    if (player.customSpells.length >= 2) {
      player.customSpells.shift();
    }
    
    player.customSpells.push(activeCustomSpell);
    
    window.App.saveState();
    
    const equipBtn = document.getElementById('equip-custom-spell-btn');
    equipBtn.innerText = "EQUIPPED IN ACTIVE DECK!";
    equipBtn.disabled = true;
  };

  const triggerBossIntro = (subject, callback) => {
    const modal = document.getElementById('boss-intro-modal');
    if (!modal) return;
    modal.classList.remove('hidden');
    
    const titleEl = document.getElementById('boss-intro-title');
    const descEl = document.getElementById('boss-intro-desc');
    const enterBtn = document.getElementById('boss-intro-enter-btn');
    const videoEl = document.getElementById('boss-intro-video');
    const skipBtn = document.getElementById('boss-intro-skip-btn');
    
    // Set text descriptions
    const bossNames = {
      math: "Titan of Equations",
      chem: "Valence Overlord",
      bio: "DNA Sentinel",
      phys: "Quantum Singularity"
    };
    const bossDescs = {
      math: "The corrupted Titan of Equations has emerged in the Mathematics realm. Its numerical matrices are warping the balance of all logic...",
      chem: "The chemical gas cloud has condensed. The Valence Overlord stands prepared to react violently to any intrusions...",
      bio: "Deep within the organic swamp, the DNA Sentinel protects its corrupted genomes. It will dissect any wizards in its path...",
      phys: "The laws of nature are collapsing. The Quantum Singularity folds space and time around itself, preparing for impact..."
    };
    
    const name = bossNames[subject] || "Corrupted Entity";
    if (titleEl) titleEl.innerText = `🚨 BOSS INCOMING: ${name.toUpperCase()} 🚨`;
    if (descEl) descEl.innerText = bossDescs[subject] || "A massive boss entity stands in your way...";
    
    // Set video source & play generated Seedance 2.0 Mini cutscene
    if (videoEl) {
      videoEl.src = `assets/boss_intro_${subject}.mp4`;
      videoEl.load();
      videoEl.play().catch(e => console.warn("Autoplay notice:", e));
    }

    const cleanupAndEnter = () => {
      if (window.AudioEngine) window.AudioEngine.playClick();
      if (videoEl) {
        videoEl.pause();
        videoEl.removeAttribute('src');
        videoEl.load();
      }
      modal.classList.add('hidden');
      if (enterBtn) enterBtn.removeEventListener('click', cleanupAndEnter);
      if (skipBtn) skipBtn.onclick = null;
      if (callback) callback();
    };

    if (enterBtn) {
      enterBtn.removeEventListener('click', cleanupAndEnter);
      enterBtn.addEventListener('click', cleanupAndEnter);
    }
    if (skipBtn) {
      skipBtn.onclick = cleanupAndEnter;
    }
  };

  return {
    init,
    triggerBossIntro
  };
})();

window.HiggsfieldEngine = HiggsfieldEngine;
