/* ==========================================================================
   KNOWLEDGE QUEST - BATTLE ENGINE
   Turn-based combat mechanics, procedural SVG boss monsters,
   specialty buffs, pet captures, and battle item inventory
   ========================================================================== */

const BattleEngine = (() => {
  let player = null;
  let enemy = null;
  let realmSubject = 'math';
  let activeSubject = 'math';
  let activeSpell = null;
  let timerInterval = null;
  let timeLeft = 30;
  let currentQuestion = null;
  let isBossBattle = false;
  let isCaptureAttempt = false;
  let isQuickThink = false;

  // Preload Biome Background Images for Cinematic Spell Animation
  const biomeBgImages = {
    math: new Image(),
    bio: new Image(),
    chem: new Image(),
    phys: new Image()
  };
  biomeBgImages.math.src = 'assets/biome_bg_math.jpg';
  biomeBgImages.bio.src = 'assets/biome_bg_bio.jpg';
  biomeBgImages.chem.src = 'assets/biome_bg_chem.jpg';
  biomeBgImages.phys.src = 'assets/biome_bg_phys.jpg';

  // Minion SVG data
  const minionData = {
    math: [
      { name: "Fraction Wraith", levelOffset: 0, hpMax: 80, emoji: "🔢", draw: (g) => drawFractionWraith(g) },
      { name: "Equation Imp", levelOffset: 1, hpMax: 90, emoji: "✖️", draw: (g) => drawEquationImp(g) },
      { name: "Obsidian Golem", levelOffset: 2, hpMax: 135, emoji: "🗿", draw: (g) => drawObsidianGolem(g) }
    ],
    bio: [
      { name: "Cellular Slime", levelOffset: 0, hpMax: 85, emoji: "🦠", draw: (g) => drawCellularSlime(g) },
      { name: "Chloroplast Spore", levelOffset: 1, hpMax: 95, emoji: "🍃", draw: (g) => drawChloroplastSpore(g) },
      { name: "Nether Hydra", levelOffset: 3, hpMax: 150, emoji: "🐍", draw: (g) => drawNetherHydra(g) }
    ],
    chem: [
      { name: "Periodic Pixie", levelOffset: 0, hpMax: 90, emoji: "🧪", draw: (g) => drawPeriodicPixie(g) },
      { name: "Acid Sludge", levelOffset: 1, hpMax: 100, emoji: "☣️", draw: (g) => drawAcidSludge(g) },
      { name: "Nether Hydra", levelOffset: 3, hpMax: 150, emoji: "🐍", draw: (g) => drawNetherHydra(g) }
    ],
    phys: [
      { name: "Kinetic Imp", levelOffset: 0, hpMax: 90, emoji: "🏃", draw: (g) => drawKineticImp(g) },
      { name: "Magnetic Basilisk", levelOffset: 1, hpMax: 100, emoji: "🧲", draw: (g) => drawMagneticBasilisk(g) },
      { name: "Obsidian Golem", levelOffset: 2, hpMax: 135, emoji: "🗿", draw: (g) => drawObsidianGolem(g) }
    ]
  };

  // Boss SVG data
  const bossData = {
    math: { name: "Titan of Equations", hpMax: 200, emoji: "🔱", draw: (g) => drawMathBoss(g) },
    bio: { name: "DNA Sentinel", hpMax: 220, emoji: "🧬", draw: (g) => drawBioBoss(g) },
    chem: { name: "Valence Overlord", hpMax: 240, emoji: "🪐", draw: (g) => drawChemBoss(g) },
    phys: { name: "Quantum Singularity", hpMax: 250, emoji: "⚛️", draw: (g) => drawPhysBoss(g) }
  };

  // Base Spells library
  const baseSpells = {
    fire: [
      { name: "Ignite Sparks", element: "fire", cost: 0, power: 15, prompt: "A flurry of glowing flame sparks dancing around the target, digital anime style" },
      { name: "Combustion Wave", element: "fire", cost: 15, power: 30, prompt: "A rolling wave of intense thermonuclear heat blasting across a volcanic valley, cinematic CGI" },
      { name: "Plasma Burst", element: "fire", cost: 25, power: 50, prompt: "A highly concentrated beam of superheated purple plasma splitting the ground, dark fantasy realistic" }
    ],
    water: [
      { name: "Aqua Splash", element: "water", cost: 0, power: 15, prompt: "A tight jet of pressurized blue water splashing onto the enemy, cartoon anime" },
      { name: "Tidal Current", element: "water", cost: 15, power: 30, prompt: "A massive spiral vortex of ocean water crashing down from above, drone pan shot, 4k" },
      { name: "Hydro Nova", element: "water", cost: 30, power: 55, prompt: "An explosive shockwave of frozen ice crystal shards bursting in slow motion, macro cinematic CGI" }
    ],
    earth: [
      { name: "Foliage Strike", element: "earth", cost: 0, power: 15, prompt: "Sharp razor leaves spinning like gears toward the enemy, vibrant 2d animation" },
      { name: "Tectonic Spike", element: "earth", cost: 15, power: 32, prompt: "An ancient stone spire erupting violently from a grassy meadow, extreme camera shake" },
      { name: "Crystal Rain", element: "earth", cost: 25, power: 48, prompt: "A cascade of sharp glowing emerald crystals raining down like stars, cinematic dark fantasy" }
    ],
    air: [
      { name: "Wind Gust", element: "air", cost: 0, power: 15, prompt: "A howling spiral wind current tossing dust into the camera, extreme motion blur" },
      { name: "Volt Shock", element: "air", cost: 12, power: 28, prompt: "Forked purple electrical arcs crackling from a storm cloud, realistic lightning simulation" },
      { name: "Galvanic Cyclone", element: "air", cost: 25, power: 52, prompt: "A swirling vortex of cyan electricity and thunder clouds crushing the battlefield, aerial orbit drone shot" }
    ]
  };

  const initBattle = (playerState, subject, isBoss = false, targetEnemyName = null) => {
    player = playerState;
    realmSubject = subject;
    activeSubject = subject;
    isCaptureAttempt = false;
    isBossBattle = isBoss;

    const banner = document.getElementById('battle-type-banner');
    const svgEl = document.getElementById('enemy-monster-svg');
    if (svgEl) svgEl.innerHTML = '';

    // Load backgrounds dynamically based on Boss state
    const battleLayout = document.querySelector('.battle-layout');
    if (battleLayout) {
      if (isBossBattle && subject === 'math') {
        battleLayout.style.backgroundImage = "url('assets/boss_math.jpg')";
      } else if (isBossBattle && subject === 'chem') {
        battleLayout.style.backgroundImage = "url('assets/boss_chem.jpg')";
      } else {
        battleLayout.style.backgroundImage = "url('assets/battle_arena_bg.jpg')";
      }
    }

    // Set up equipped staff/weapon overlays visually on player sprite
    const staffOverlay = document.getElementById('player-staff-overlay');
    if (staffOverlay) {
      if (player.equipped.staff) {
        staffOverlay.classList.remove('hidden');
        staffOverlay.innerText = player.equipped.staff === 'wand_apprentice' ? '🪄' : '🔮';
      } else {
        staffOverlay.classList.add('hidden');
      }
    }

    // Set up player avatar profile portraits (Corner HUD, Battle status panel & Sprite)
    const profileMap = {
      boy: 'assets/profile_boy.jpg',
      girl: 'assets/profile_girl.jpg',
      cyber: 'assets/profile_cyber.jpg',
      celestial: 'assets/profile_celestial.jpg'
    };
    const profileSrc = profileMap[player.avatar] || 'assets/profile_boy.jpg';
    
    const bThumb = document.getElementById('battle-player-avatar-thumb');
    if (bThumb) bThumb.src = profileSrc;

    const pSprite = document.getElementById('player-sprite');
    if (pSprite) pSprite.src = profileSrc;

    if (isBossBattle) {
      const boss = bossData[subject];
      const eLevel = player.level + 2;
      const hpMaxScaled = boss.hpMax + (eLevel * 20);
      
      enemy = {
        name: boss.name,
        level: eLevel,
        hpMax: hpMaxScaled,
        hp: hpMaxScaled,
        emoji: boss.emoji,
        isBoss: true
      };

      if (banner) {
        banner.innerText = "BOSS BATTLE";
        banner.className = "battle-banner-type boss";
      }
      if (svgEl) boss.draw(svgEl);
      const announcer = document.getElementById('battle-announcer');
      if (announcer) announcer.innerText = `WARNING: The corrupted ${enemy.name} (Lv. ${enemy.level}) stands in your path!`;
    } else {
      const allMinions = [
        ...minionData.math,
        ...minionData.bio,
        ...minionData.chem,
        ...minionData.phys
      ];
      let template = null;
      if (targetEnemyName) {
        template = allMinions.find(m => m.name === targetEnemyName);
      }
      if (!template) {
        const realmMinions = minionData[subject] || minionData.math;
        template = realmMinions[Math.floor(Math.random() * realmMinions.length)];
      }

      const eLevel = Math.max(1, player.level + template.levelOffset + Math.floor(Math.random() * 2) - 1);
      const hpMaxScaled = template.hpMax + (eLevel * 12);
      
      enemy = {
        name: template.name,
        level: eLevel,
        hpMax: hpMaxScaled,
        hp: hpMaxScaled,
        emoji: template.emoji,
        isBoss: false
      };

      if (banner) {
        banner.innerText = "MINION BATTLE";
        banner.className = "battle-banner-type minion";
      }
      if (svgEl) template.draw(svgEl);
      const announcer = document.getElementById('battle-announcer');
      if (announcer) announcer.innerText = `A wild ${enemy.name} (Lv. ${enemy.level}) appears!`;
    }

    // Set high-quality enemy sprite image
    const enemySprite = document.getElementById('enemy-sprite-img');
    if (enemySprite) {
      if (svgEl) svgEl.innerHTML = ''; // Clear SVG vector layer so image sprite is 100% visible
      if (isBossBattle) {
        enemySprite.src = `assets/boss_${subject}.jpg`;
      } else {
        const minionImageMap = {
          "Fraction Wraith": "assets/minion_math_wraith.jpg",
          "Equation Imp": "assets/minion_math_imp.jpg",
          "Cellular Slime": "assets/minion_bio_slime.jpg",
          "Chloroplast Spore": "assets/minion_bio_spore.jpg",
          "Periodic Pixie": "assets/minion_chem_pixie.jpg",
          "Acid Sludge": "assets/minion_chem_sludge.jpg",
          "Kinetic Imp": "assets/minion_phys_imp.jpg",
          "Magnetic Basilisk": "assets/minion_phys_basilisk.jpg",
          "Obsidian Golem": "assets/minion_dungeon_golem.jpg",
          "Nether Hydra": "assets/minion_dungeon_hydra.jpg"
        };
        enemySprite.src = minionImageMap[enemy.name] || `assets/minion_${subject}.jpg`;
      }
    }
    
    // Setup HUD
    document.getElementById('battle-subject-indicator').innerText = `Realm: ${getSubjectTitle(subject)}`;
    document.getElementById('player-battle-name').innerText = player.name;
    document.getElementById('enemy-battle-name').innerText = enemy.name;
    document.getElementById('enemy-level-text').innerText = `Lv. ${enemy.level}`;
    
    updateHPBar('player', player.hp, player.hpMax);
    updateHPBar('enemy', enemy.hp, enemy.hpMax);
    updateMPBar(player.mp, player.mpMax);

    // Setup Pet Sidekick
    renderPetSidekick();

    // Reset combat actions panel
    resetActionPanel();

    // Hook up sub-choice buttons
    setupActionBarListeners();

    // Resize canvas
    const canvas = document.getElementById('battle-fx-canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const setupActionBarListeners = () => {
    // Menu selectors
    document.getElementById('action-select-spell').onclick = () => {
      if (window.AudioEngine) window.AudioEngine.playClick();
      showPanelDeck('battle-deck');
      renderSpellDeck();
    };

    document.getElementById('action-use-item-menu').onclick = () => {
      if (window.AudioEngine) window.AudioEngine.playClick();
      showPanelDeck('battle-items');
      renderItemsDeck();
    };

    document.getElementById('action-capture-pet').onclick = () => {
      if (window.AudioEngine) window.AudioEngine.playClick();
      triggerCaptureFlow();
    };

    // Back buttons
    const backs = document.querySelectorAll('.back-action-btn');
    backs.forEach(b => {
      b.onclick = () => {
        if (window.AudioEngine) window.AudioEngine.playClick();
        resetActionPanel();
      };
    });

    // Potion clicking
    document.getElementById('battle-use-hp').onclick = () => {
      useConsumable('potion_hp');
    };
    document.getElementById('battle-use-mp').onclick = () => {
      useConsumable('potion_mp');
    };
  };

  const showPanelDeck = (panelId) => {
    document.getElementById('battle-action-bar').classList.add('hidden');
    document.getElementById('battle-deck').classList.add('hidden');
    document.getElementById('battle-items').classList.add('hidden');
    document.getElementById('question-card').classList.add('hidden');
    
    document.getElementById(panelId).classList.remove('hidden');
  };

  const resetActionPanel = () => {
    document.getElementById('battle-deck').classList.add('hidden');
    document.getElementById('battle-items').classList.add('hidden');
    document.getElementById('question-card').classList.add('hidden');
    document.getElementById('explanation-panel').classList.add('hidden');

    const choiceRow = document.getElementById('battle-action-bar');
    choiceRow.classList.remove('hidden');

    // Show capture option if enemy health < 50% AND not a boss
    const capBtn = document.getElementById('action-capture-pet');
    const hpPct = (enemy.hp / enemy.hpMax) * 100;
    if (hpPct < 50 && !enemy.isBoss) {
      capBtn.classList.remove('hidden');
    } else {
      capBtn.classList.add('hidden');
    }
  };

  const renderPetSidekick = () => {
    const frame = document.getElementById('battle-pet-container');
    if (player.activePet) {
      frame.classList.remove('hidden');
      const petSrc = player.activePet.element === 'fire' || player.activePet.element === 'chem' ? 'assets/minion_chem.jpg' : player.activePet.element === 'water' || player.activePet.element === 'math' ? 'assets/minion_math.jpg' : player.activePet.element === 'earth' || player.activePet.element === 'bio' ? 'assets/minion_bio.jpg' : 'assets/minion_phys.jpg';
      const petImgEl = document.getElementById('battle-pet-img');
      if (petImgEl) {
        petImgEl.src = petSrc;
      }
      document.getElementById('battle-pet-emoji').innerText = player.activePet.emoji || '🐾';
      document.getElementById('battle-pet-name').innerText = player.activePet.name;
    } else {
      frame.classList.add('hidden');
    }
  };

  const renderItemsDeck = () => {
    const hpCount = player.inventory.filter(id => id === 'potion_hp').length;
    const mpCount = player.inventory.filter(id => id === 'potion_mp').length;

    document.getElementById('battle-hp-count').innerText = `x${hpCount} left`;
    document.getElementById('battle-use-hp').disabled = hpCount <= 0 || player.hp >= player.hpMax;

    document.getElementById('battle-mp-count').innerText = `x${mpCount} left`;
    document.getElementById('battle-use-mp').disabled = mpCount <= 0 || player.mp >= player.mpMax;
  };

  const useConsumable = (itemId) => {
    const idx = player.inventory.indexOf(itemId);
    if (idx === -1) return;

    player.inventory.splice(idx, 1); // remove one

    if (itemId === 'potion_hp') {
      player.hp = Math.min(player.hpMax, player.hp + 50);
      showDamageFlyout("+50", 'player', 'water'); // Green floating heal
      if (window.AudioEngine) window.AudioEngine.playCorrect();
    } else {
      player.mp = Math.min(player.mpMax, player.mp + 25);
      showDamageFlyout("+25 MP", 'player', 'water');
      if (window.AudioEngine) window.AudioEngine.playCorrect();
    }

    window.App.saveState();
    window.App.updateHUD();
    
    updateHPBar('player', player.hp, player.hpMax);
    updateMPBar(player.mp, player.mpMax);
    renderItemsDeck();
  };

  const getSubjectTitle = (sub) => {
    switch (sub) {
      case 'math': return 'Mathematics';
      case 'bio': return 'Biology';
      case 'chem': return 'Chemistry';
      case 'phys': return 'Physics';
    }
  };

  const renderSpellDeck = () => {
    const container = document.getElementById('spells-container');
    container.innerHTML = '';
    
    // Load spells from ALL elements so the player has choices!
    let spells = [];
    const elementsList = ['fire', 'water', 'earth', 'air'];
    elementsList.forEach(el => {
      spells = spells.concat(baseSpells[el]);
    });
    
    // Add custom spells
    if (player.customSpells && player.customSpells.length > 0) {
      player.customSpells.forEach(csp => {
        spells.push({
          name: csp.name,
          element: csp.element,
          cost: csp.cost,
          power: csp.power,
          prompt: csp.prompt,
          isCustom: true
        });
      });
    }

    // Apply Spell Power gear stats (+5 Apprentice, +15 Archmage)
    let extraPower = 0;
    if (player.equipped.staff === 'wand_apprentice') extraPower = 5;
    if (player.equipped.staff === 'staff_archmage') extraPower = 15;

    spells.forEach(spell => {
      const btn = document.createElement('button');
      btn.className = `spell-btn ${spell.element}`;
      btn.disabled = player.mp < spell.cost;
      
      const emoji = spell.element === 'fire' ? '🔥' : spell.element === 'water' ? '💧' : spell.element === 'earth' ? '🌿' : '⚡';
      const actualPower = spell.power + extraPower;

      btn.innerHTML = `
        <span class="spell-icon-sm">${emoji}</span>
        <span class="spell-name-sm">${spell.name}</span>
        <span class="spell-cost-sm">${spell.cost > 0 ? `${spell.cost} MP` : 'FREE'} (Pow: ${actualPower})</span>
      `;
      
      btn.addEventListener('click', () => {
        if (window.AudioEngine) window.AudioEngine.playClick();
        castSpell(spell);
      });
      container.appendChild(btn);
    });
  };

  const castSpell = (spell) => {
    activeSpell = spell;
    isCaptureAttempt = false;
    
    // Choose question subject based on spell element instead of the opponent!
    const elementToSubject = {
      fire: 'chem',
      water: 'math',  // Water spells -> Mathematics questions!
      earth: 'bio',   // Earth spells -> Biology questions!
      air: 'phys'
    };
    activeSubject = elementToSubject[spell.element] || 'math';
    
    // Open question panel
    showPanelDeck('question-card');
    
    currentQuestion = window.QuestionEngine.getQuestion(player.grade, activeSubject, false, isBossBattle);
    
    document.getElementById('question-subject-badge').innerText = getSubjectTitle(activeSubject);
    document.getElementById('question-text').innerText = currentQuestion.q;
    
    const graphic = document.getElementById('question-graphic');
    if (graphic) {
      graphic.src = `assets/img_${activeSubject}_q.jpg`;
    }
    
    renderChoices();
  };

  const triggerCaptureFlow = () => {
    isCaptureAttempt = true;
    showPanelDeck('question-card');
    
    // Fetch harder capture question
    currentQuestion = window.QuestionEngine.getQuestion(player.grade, activeSubject, true, isBossBattle);
    
    document.getElementById('question-subject-badge').innerText = `💫 PET RESCUE`;
    document.getElementById('question-text').innerText = currentQuestion.q;
    
    const graphic = document.getElementById('question-graphic');
    if (graphic) {
      graphic.src = `assets/img_${activeSubject}_q.jpg`;
    }
    
    renderChoices();
  };

  const renderChoices = () => {
    const ansGrid = document.getElementById('answers-grid');
    ansGrid.innerHTML = '';
    
    currentQuestion.choices.forEach((choice, index) => {
      const btn = document.createElement('button');
      btn.className = 'choice-btn';
      btn.innerText = choice;
      btn.addEventListener('click', () => submitAnswer(index));
      ansGrid.appendChild(btn);
    });

    timeLeft = 30;
    document.getElementById('question-timer').innerText = timeLeft;
    
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(() => {
      timeLeft--;
      document.getElementById('question-timer').innerText = timeLeft;
      if (timeLeft <= 0) {
        clearInterval(timerInterval);
        submitAnswer(-1);
      }
    }, 1000);
  };

  const submitAnswer = (choiceIndex) => {
    if (timerInterval) clearInterval(timerInterval);
    
    const isCorrect = choiceIndex === currentQuestion.correct;
    const responseTime = 30 - timeLeft;
    isQuickThink = isCorrect && (responseTime <= 5);
    
    const btns = document.querySelectorAll('.choice-btn');
    btns.forEach((btn, idx) => {
      btn.disabled = true;
      if (idx === currentQuestion.correct) {
        btn.classList.add('correct-visual');
      } else if (idx === choiceIndex) {
        btn.classList.add('wrong-visual');
      }
    });

    // Stats Log
    window.DashboardEngine.logQuestion(
      activeSubject,
      currentQuestion.q,
      choiceIndex !== -1 ? currentQuestion.choices[choiceIndex] : 'Timed Out',
      currentQuestion.choices[currentQuestion.correct],
      isCorrect,
      currentQuestion.exp
    );

    setTimeout(() => {
      document.getElementById('question-card').classList.add('hidden');
      const expPanel = document.getElementById('explanation-panel');
      expPanel.classList.remove('hidden');
      
      const statusText = document.getElementById('explanation-status-text');
      const bodyText = document.getElementById('explanation-body-text');
      
      if (isCorrect) {
        if (window.AudioEngine) window.AudioEngine.playCorrect();
        expPanel.className = 'explanation-panel correct';
        statusText.innerText = isCaptureAttempt ? "⭐ RESCUE LINK STABILIZED!" : "⭐ EXCELLENT! CORRECT ANSWER";
        bodyText.innerHTML = `<strong>Great job!</strong> ${currentQuestion.exp}`;
      } else {
        if (window.AudioEngine) window.AudioEngine.playIncorrect();
        expPanel.className = 'explanation-panel incorrect';
        statusText.innerText = isCaptureAttempt ? "❌ RESCUE LINK FAILED" : "❌ SPELL FAILED (INCORRECT)";
        bodyText.innerHTML = `<strong>The correct answer was:</strong> ${currentQuestion.choices[currentQuestion.correct]}<br><br>${currentQuestion.exp}`;
      }

      const nextBtn = document.getElementById('explanation-next-btn');
      const newNextBtn = nextBtn.cloneNode(true);
      nextBtn.parentNode.replaceChild(newNextBtn, nextBtn);
      
      newNextBtn.addEventListener('click', () => {
        if (window.AudioEngine) window.AudioEngine.playClick();
        expPanel.classList.add('hidden');
        
        if (isCorrect) {
          if (isCaptureAttempt) {
            executeCaptureSuccess();
          } else {
            executePlayerAttack();
          }
        } else {
          executeEnemyAttack();
        }
      });

    }, 1500);
  };

  const triggerImpactOverlay = (superEff, quickThink) => {
    const overlay = document.getElementById('combat-impact-overlay');
    const badge = document.getElementById('combat-impact-badge');
    const icon = document.getElementById('combat-impact-icon');
    const text = document.getElementById('combat-impact-text');

    if (!overlay || !badge) return;

    badge.className = 'combat-impact-badge';
    
    if (superEff && quickThink) {
      badge.classList.add('combo-critical');
      icon.innerText = '⚡💥';
      text.innerText = 'SPEED CRITICAL & SUPER EFFECTIVE!';
    } else if (superEff) {
      badge.classList.add('super-effective');
      icon.innerText = '💥';
      text.innerText = 'SUPER EFFECTIVE (1.5x)!';
    } else if (quickThink) {
      icon.innerText = '⚡';
      text.innerText = 'QUICK THINK CRITICAL (1.3x)!';
    }

    overlay.classList.remove('hidden');
    
    if (window.AudioEngine) {
      window.AudioEngine.playSparkle();
    }

    setTimeout(() => {
      overlay.classList.add('hidden');
    }, 1250);
  };

  const executePlayerAttack = () => {
    // Consume mana
    player.mp = Math.max(0, player.mp - activeSpell.cost);
    updateMPBar(player.mp, player.mpMax);

    // Cinematic overlay
    const modal = document.getElementById('cinematic-video-modal');
    modal.classList.remove('hidden');
    document.getElementById('cinematic-prompt-text').innerText = `"${activeSpell.prompt}"`;

    const cinematicScreen = modal.querySelector('.cinematic-screen');
    if (cinematicScreen) {
      cinematicScreen.style.backgroundImage = `linear-gradient(rgba(2, 6, 23, 0.35), rgba(2, 6, 23, 0.35)), url('assets/biome_bg_${realmSubject}.jpg')`;
      cinematicScreen.style.backgroundSize = 'cover';
      cinematicScreen.style.backgroundPosition = 'center';
    }

    const card = modal.querySelector('.cinematic-card');
    if (card) {
      card.style.boxShadow = `0 20px 50px ${getElementColor(activeSpell.element)}ab`;
    }
    
    const spriteImg = document.getElementById('cinematic-player-sprite');
    if (spriteImg) {
      spriteImg.src = `assets/sprite_${player.avatar}.jpg`;
      spriteImg.classList.remove('hidden');
    }

    const enemySpriteImg = document.getElementById('cinematic-enemy-sprite');
    if (enemySpriteImg) {
      const activeEnemySprite = document.getElementById('enemy-sprite-img');
      enemySpriteImg.src = activeEnemySprite ? activeEnemySprite.src : '';
      enemySpriteImg.classList.remove('hidden');
    }

    if (window.AudioEngine) window.AudioEngine.playCast(activeSpell.element);

    const castGlow = document.getElementById('player-cast-glow');
    castGlow.style.borderColor = getElementColor(activeSpell.element);
    castGlow.style.opacity = '0.8';
    castGlow.style.scale = '1.3';
    
    document.getElementById('combatant-player').classList.add('attacking');

    // Run cinematic animation
    const canvas = document.getElementById('cinematic-canvas');
    runCinematicSpellAnimation(canvas, activeSpell.element, () => {
      modal.classList.add('hidden');
      if (spriteImg) spriteImg.classList.add('hidden');
      if (enemySpriteImg) enemySpriteImg.classList.add('hidden');
      castGlow.style.opacity = '0';
      castGlow.style.scale = '0.8';
      document.getElementById('combatant-player').classList.remove('attacking');

      // Staff stat upgrade
      let extraPower = 0;
      if (player.equipped.staff === 'wand_apprentice') extraPower = 5;
      if (player.equipped.staff === 'staff_archmage') extraPower = 15;

      // Base Damage math
      let damage = Math.round((activeSpell.power + extraPower) * (1 + (player.level * 0.05)));
      let criticalHit = false;

      // SPEED CRITICAL HIT (1.3x damage if answered within 5 seconds, or 1.5x with Air/Lightning Pet!)
      let speedCritMultiplier = 1.3;
      if (player.activePet && (player.activePet.element === 'air' || player.activePet.element === 'lightning')) {
        speedCritMultiplier = 1.5;
      }
      if (isQuickThink) {
        damage = Math.round(damage * speedCritMultiplier);
      }

      // TYPE EFFECTIVENESS (1.5x Damage multiplier)
      const getEnemyElement = (subj) => {
        if (subj === 'bio') return 'earth';
        if (subj === 'phys') return 'air';
        if (subj === 'math') return 'water';
        if (subj === 'chem') return 'fire';
        return 'earth';
      };

      const typeChart = {
        fire: 'earth',
        earth: 'air',
        air: 'water',
        water: 'fire'
      };

      const enemyElement = getEnemyElement(realmSubject);
      let isSuperEffective = (typeChart[activeSpell.element] === enemyElement);

      if (isSuperEffective) {
        damage = Math.round(damage * 1.5);
      }

      // ACTIVE PET PASSIVE BUFF MULTIPLIERS (1.1x Fire/Water Spell Damage)
      if (player.activePet) {
        if (player.activePet.element === 'fire' && activeSpell.element === 'fire') {
          damage = Math.round(damage * 1.1);
        } else if (player.activePet.element === 'water' && activeSpell.element === 'water') {
          damage = Math.round(damage * 1.1);
        }
      }

      // Trigger Impact Overlay (Quick Think & Super Effective)
      if (isSuperEffective || isQuickThink) {
        triggerImpactOverlay(isSuperEffective, isQuickThink);
      }

      // ----------------------------------------------------
      // APPLY ELEMENTAL SUBJECT BUFFS (Based on SPELL element)
      // ----------------------------------------------------
      if (activeSubject === 'chem' && activeSpell.element === 'fire') {
        damage = Math.round(damage * 1.25);
        if (!isSuperEffective) document.getElementById('battle-announcer').innerText = "🔥 Exothermic Reaction! Fire magic triggers Chemistry bonus!";
      } else if (activeSubject === 'math' && activeSpell.element === 'water') {
        damage = Math.round(damage * 1.25);
        if (!isSuperEffective) document.getElementById('battle-announcer').innerText = "💧 Fluid Calculations! Water magic triggers Mathematics bonus!";
      } else if (activeSubject === 'phys' && activeSpell.element === 'air') {
        if (Math.random() < 0.35) {
          criticalHit = true;
          damage = damage * 2;
          if (!isSuperEffective) document.getElementById('battle-announcer').innerText = "⚡ Quantum Overload! Lightning magic triggers Physics CRITICAL!";
        }
      } else if (activeSubject === 'bio' && activeSpell.element === 'earth') {
        const healAmt = Math.round(player.hpMax * 0.1);
        player.hp = Math.min(player.hpMax, player.hp + healAmt);
        updateHPBar('player', player.hp, player.hpMax);
        showDamageFlyout(`+${healAmt}`, 'player', 'earth');
        if (!isSuperEffective) document.getElementById('battle-announcer').innerText = "🌿 Cellular Regeneration! Earth magic triggers Biology heal!";
      }

      // Apply passive Pet damage helper & Unique Ally Buffs
      let petDmg = 0;
      if (player.activePet) {
        petDmg = (player.activePet.name === 'Obsidian Golem' ? 12 : 5) + player.activePet.level;
        damage += petDmg;

        // Nether Hydra Corrosive Venom Buff (+20 Acid Damage & 15% Life Drain)
        if (player.activePet.name === 'Nether Hydra') {
          damage += 20;
          const drainAmt = Math.max(5, Math.round(damage * 0.15));
          player.hp = Math.min(player.hpMax, player.hp + drainAmt);
          updateHPBar('player', player.hp, player.hpMax);
          showDamageFlyout(`+${drainAmt} HP`, 'player', 'chem');
        }
      }

      enemy.hp = Math.max(0, enemy.hp - damage);
      updateHPBar('enemy', enemy.hp, enemy.hpMax);
      
      // Floating combat text
      const flyoutText = isSuperEffective ? `💥 ${damage} SUPER EFFECTIVE!` : damage;
      showDamageFlyout(flyoutText, 'enemy', criticalHit ? 'air' : activeSpell.element);

      if (isSuperEffective) {
        const elemNames = { fire: 'Fire 🔥', earth: 'Earth 🌿', air: 'Lightning ⚡', water: 'Water 💧' };
        const targetNames = { fire: 'Fire', earth: 'Earth', air: 'Lightning', water: 'Water' };
        document.getElementById('battle-announcer').innerText = `💥 SUPER EFFECTIVE! ${elemNames[activeSpell.element]} deals 1.5x damage to ${targetNames[enemyElement]}!`;
      } else if (criticalHit) {
        document.getElementById('battle-announcer').innerText = "⚡ Critical Volt Strike! Aeromancer Physics Buff triggers double damage!";
      } else if (petDmg > 0) {
        document.getElementById('battle-announcer').innerText = `🐾 Your pet helper ${player.activePet.name} attacks dealing +${petDmg} physical damage!`;
      }
      
      // Hit flash
      if (window.AudioEngine) window.AudioEngine.playImpact();
      const enemyComp = document.getElementById('combatant-enemy');
      enemyComp.classList.add('hit');
      
      setTimeout(() => {
        enemyComp.classList.remove('hit');
        
        if (enemy.hp <= 0) {
          handleVictory();
        } else {
          executeEnemyAttack();
        }
      }, 700);
    });
  };

  const executeEnemyAttack = () => {
    document.getElementById('battle-announcer').innerText = `${enemy.name} counters!`;
    document.getElementById('combatant-enemy').classList.add('attacking');

    setTimeout(() => {
      document.getElementById('combatant-enemy').classList.remove('attacking');
      
      // Enemy damage scale
      const multiplier = enemy.isBoss ? 1.7 : 1.0;
      const baseDmg = 8 + (enemy.level * 2);
      const randDmg = Math.floor(Math.random() * 5);
      let dmg = Math.round((baseDmg + randDmg) * multiplier);

      // Obsidian Golem Ally Fortress Armor Buff (Takes 25% less damage!)
      if (player.activePet && player.activePet.name === 'Obsidian Golem') {
        dmg = Math.max(1, Math.round(dmg * 0.75));
        showDamageFlyout("🛡️ -25% ARMOR", 'player', 'earth');
      }
      
      player.hp = Math.max(0, player.hp - dmg);
      updateHPBar('player', player.hp, player.hpMax);
      
      showDamageFlyout(dmg, 'player', 'physical');
      if (window.AudioEngine) window.AudioEngine.playImpact();
      
      const playerComp = document.getElementById('combatant-player');
      playerComp.classList.add('hit');

      setTimeout(() => {
        playerComp.classList.remove('hit');
        
        if (player.hp <= 0) {
          handleDefeat();
        } else {
          resetActionPanel();
        }
      }, 500);

    }, 800);
  };

  const executeCaptureSuccess = () => {
    if (window.AudioEngine) window.AudioEngine.playSparkle();
    
    const getPetElement = (subj) => {
      if (subj === 'chem') return 'fire';
      if (subj === 'math') return 'water';
      if (subj === 'bio') return 'earth';
      if (subj === 'phys') return 'air';
      return 'fire';
    };

    const petElement = getPetElement(realmSubject);

    // Exact sprite asset mapping based on enemy name & realmSubject
    let petSpritePath = `assets/minion_${realmSubject}.jpg`;
    if (enemy.name === 'Obsidian Golem') petSpritePath = 'assets/minion_dungeon_golem.jpg';
    else if (enemy.name === 'Nether Hydra') petSpritePath = 'assets/minion_dungeon_hydra.jpg';
    else if (enemy.name.includes("Imp")) petSpritePath = `assets/minion_${realmSubject}_imp.jpg`;
    else if (enemy.name.includes("Wraith")) petSpritePath = `assets/minion_${realmSubject}_wraith.jpg`;
    else if (enemy.name.includes("Pixie")) petSpritePath = `assets/minion_${realmSubject}_pixie.jpg`;
    else if (enemy.name.includes("Sludge")) petSpritePath = `assets/minion_${realmSubject}_sludge.jpg`;
    else if (enemy.name.includes("Slime")) petSpritePath = `assets/minion_${realmSubject}_slime.jpg`;
    else if (enemy.name.includes("Spore")) petSpritePath = `assets/minion_${realmSubject}_spore.jpg`;
    else if (enemy.name.includes("Basilisk")) petSpritePath = `assets/minion_${realmSubject}_basilisk.jpg`;

    const petObj = {
      name: enemy.name || "Captured Ally",
      emoji: enemy.emoji || "🐾",
      element: petElement,
      subject: realmSubject,
      sprite: petSpritePath,
      level: enemy.level
    };

    if (!player.pets) player.pets = [];
    
    // Check duplication
    const duplicate = player.pets.some(p => p.name === petObj.name);
    if (!duplicate) {
      player.pets.push(petObj);
    }
    
    document.getElementById('battle-announcer').innerText = `SUCCESS! You rescued and captured the wild ${petObj.name}!`;

    setTimeout(() => {
      handleVictory(true); // Win battle with capture trigger
    }, 1500);
  };

  const handleVictory = (captured = false) => {
    document.getElementById('battle-announcer').innerText = captured 
      ? `Rescued ${enemy.name}! Battle Won!`
      : `You defeated the ${enemy.name}!`;
    
    // Gold rewards
    let goldReward = 15 + (enemy.level * 5);
    if (enemy.isBoss) {
      goldReward = 150;
    }
    // Pyromancer Gold Buff: 30% extra gold in chem questions
    if (realmSubject === 'chem' && player.element === 'fire') {
      goldReward = Math.round(goldReward * 1.3);
    }
    player.gold += goldReward;

    // XP rewards
    let xpReward = 20 + (enemy.level * 10);
    if (enemy.isBoss) {
      xpReward = 100;
    }
    // Geomancer XP Buff: 40% extra XP in biology questions
    if (realmSubject === 'bio' && player.element === 'earth') {
      xpReward = Math.round(xpReward * 1.4);
    }

    // Earth Pet Passive Buff: 1.2x (20% Extra XP gained from victories & captures)
    if (player.activePet && player.activePet.element === 'earth') {
      xpReward = Math.round(xpReward * 1.2);
    }

    player.battlesWon += 1;
    
    // Progress tracking (based on the realm of the encountered minion/boss)
    if (enemy.isBoss) {
      player.defeatedBosses[realmSubject] = true;
    } else {
      player.minionsDefeated[realmSubject] = Math.min(3, (player.minionsDefeated[realmSubject] || 0) + 1);
    }

    // Refill health and MP after battle victory
    player.hp = player.hpMax;
    player.mp = player.mpMax;

    // Level calculations
    let levelUp = false;
    player.xp += xpReward;
    if (player.xp >= player.xpNext) {
      levelUp = true;
      player.level += 1;
      player.xp -= player.xpNext;
      player.xpNext = Math.round(player.xpNext * 1.3);
      
      // Recalculate base HP upgrades
      window.App.recalculateStats();
      player.hp = player.hpMax;
      player.mp = player.mpMax;
    }

    window.App.saveState();
    window.App.updateHUD();

    setTimeout(() => {
      if (levelUp) {
        if (window.AudioEngine) window.AudioEngine.playLevelUp();
        const lvlModal = document.getElementById('level-up-modal');
        document.getElementById('level-up-num').innerText = player.level;
        lvlModal.classList.remove('hidden');
        
        document.getElementById('level-up-close-btn').onclick = () => {
          if (window.AudioEngine) window.AudioEngine.playClick();
          lvlModal.classList.add('hidden');
          window.App.navigateToScreen('map');
        };
      } else {
        window.App.navigateToScreen('map');
      }
    }, 1500);
  };

  const handleDefeat = () => {
    document.getElementById('battle-announcer').innerText = "You fainted... Retreated back to safety.";
    player.hp = Math.round(player.hpMax * 0.4);
    player.mp = Math.round(player.mpMax * 0.4);
    window.App.saveState();
    window.App.updateHUD();
    
    setTimeout(() => {
      window.App.navigateToScreen('map');
    }, 2000);
  };

  // SVG Render utilities
  const drawFractionWraith = (svg) => {
    svg.innerHTML = `
      <g transform="translate(10, 10)">
        <path d="M 40 20 Q 20 50 40 80 Q 50 70 60 80 Q 80 50 60 20 Z" fill="none" stroke="#10b981" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
        <text x="38" y="42" font-family="monospace" font-size="14" fill="#10b981" font-weight="bold">1</text>
        <line x1="38" y1="46" x2="58" y2="46" stroke="#10b981" stroke-width="2"/>
        <text x="38" y="60" font-family="monospace" font-size="14" fill="#10b981" font-weight="bold">x</text>
        <circle cx="20" cy="30" r="2" fill="#10b981" />
        <circle cx="75" cy="45" r="3" fill="#10b981" />
      </g>
    `;
  };

  const drawEquationImp = (svg) => {
    svg.innerHTML = `
      <g transform="translate(10, 10)">
        <polygon points="50,15 25,60 75,60" fill="none" stroke="#059669" stroke-width="3"/>
        <circle cx="50" cy="45" r="8" fill="#10b981"/>
        <text x="45" y="48" font-family="monospace" font-size="10" fill="white" font-weight="bold">x</text>
        <!-- Imp horns -->
        <path d="M 43 38 Q 40 28 47 34" fill="none" stroke="#059669" stroke-width="2"/>
        <path d="M 57 38 Q 60 28 53 34" fill="none" stroke="#059669" stroke-width="2"/>
      </g>
    `;
  };

  const drawCellularSlime = (svg) => {
    svg.innerHTML = `
      <g transform="translate(10, 10)">
        <path d="M 25 35 Q 15 50 30 70 Q 50 85 70 70 Q 85 50 70 30 Q 50 15 25 35 Z" fill="rgba(59, 130, 246, 0.15)" stroke="#3b82f6" stroke-width="4"/>
        <circle cx="48" cy="48" r="12" fill="none" stroke="#60a5fa" stroke-width="3" stroke-dasharray="4"/>
        <circle cx="48" cy="48" r="5" fill="#3b82f6"/>
        <circle cx="32" cy="42" r="2.5" fill="#3b82f6" />
      </g>
    `;
  };

  const drawChloroplastSpore = (svg) => {
    svg.innerHTML = `
      <g transform="translate(10, 10)">
        <ellipse cx="50" cy="50" rx="30" ry="18" fill="rgba(59, 130, 246, 0.1)" stroke="#3b82f6" stroke-width="3.5"/>
        <path d="M 35 50 C 35 40 65 40 65 50" stroke="#60a5fa" stroke-width="2" fill="none"/>
        <path d="M 35 50 C 35 60 65 60 65 50" stroke="#60a5fa" stroke-width="2" fill="none"/>
        <circle cx="50" cy="50" r="4" fill="#1d4ed8"/>
      </g>
    `;
  };

  const drawPeriodicPixie = (svg) => {
    svg.innerHTML = `
      <g transform="translate(10, 10)">
        <rect x="25" y="20" width="45" height="45" rx="6" fill="none" stroke="#eab308" stroke-width="3"/>
        <text x="32" y="48" font-family="sans-serif" font-weight="800" font-size="24" fill="#eab308">Au</text>
        <path d="M 22 30 C 5 10 10 5 22 25 Z" fill="none" stroke="#fef08a" stroke-width="2"/>
        <path d="M 72 30 C 90 10 85 5 72 25 Z" fill="none" stroke="#fef08a" stroke-width="2"/>
      </g>
    `;
  };

  const drawAcidSludge = (svg) => {
    svg.innerHTML = `
      <g transform="translate(10, 10)">
        <path d="M 15 75 Q 15 50 35 55 Q 50 35 65 55 Q 85 50 85 75 Z" fill="rgba(234, 179, 8, 0.15)" stroke="#ca8a04" stroke-width="4"/>
        <circle cx="35" cy="62" r="3" fill="#eab308"/>
        <circle cx="55" cy="58" r="4.5" fill="#eab308"/>
        <circle cx="70" cy="65" r="2.5" fill="#eab308"/>
      </g>
    `;
  };

  const drawKineticImp = (svg) => {
    svg.innerHTML = `
      <g transform="translate(10, 10)">
        <!-- Running pose arrow -->
        <path d="M 20 40 L 70 40 M 50 20 L 75 40 L 50 60" fill="none" stroke="#ec4899" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/>
        <circle cx="30" cy="30" r="6" fill="#f472b6"/>
        <line x1="25" y1="46" x2="35" y2="46" stroke="#ec4899" stroke-width="2"/>
      </g>
    `;
  };

  const drawMagneticBasilisk = (svg) => {
    svg.innerHTML = `
      <g transform="translate(10, 10)">
        <path d="M 30 20 L 30 40 A 18 18 0 0 0 66 40 L 66 20 L 56 20 L 56 40 A 8 8 0 0 1 40 40 L 40 20 Z" fill="none" stroke="#ec4899" stroke-width="3"/>
        <rect x="29" y="16" width="13" height="5" fill="#ef4444"/>
        <rect x="54" y="16" width="13" height="5" fill="#3b82f6"/>
        <path d="M 48 55 Q 30 65 48 75 Q 65 85 48 95" fill="none" stroke="#ec4899" stroke-width="4" stroke-linecap="round"/>
      </g>
    `;
  };

  const drawObsidianGolem = (svg) => {
    svg.innerHTML = `
      <g transform="translate(10, 10)">
        <polygon points="50,15 75,35 65,75 35,75 25,35" fill="rgba(168, 85, 247, 0.25)" stroke="#a855f7" stroke-width="4.5"/>
        <circle cx="50" cy="40" r="10" fill="#c084fc"/>
        <path d="M 35 60 L 65 60 M 40 70 L 60 70" stroke="#a855f7" stroke-width="3"/>
      </g>
    `;
  };

  const drawNetherHydra = (svg) => {
    svg.innerHTML = `
      <g transform="translate(10, 10)">
        <path d="M 25 75 Q 20 40 35 25 Q 45 40 45 75" fill="none" stroke="#22c55e" stroke-width="4"/>
        <path d="M 50 75 Q 50 35 60 18 Q 70 35 70 75" fill="none" stroke="#4ade80" stroke-width="4"/>
        <circle cx="35" cy="20" r="7" fill="#22c55e"/>
        <circle cx="60" cy="14" r="7" fill="#4ade80"/>
      </g>
    `;
  };

  // Boss SVG Render methods
  const drawMathBoss = (svg) => {
    svg.innerHTML = `
      <g transform="translate(10, 10)">
        <!-- Heavy concrete blocks mapping geometry -->
        <rect x="15" y="15" width="70" height="70" rx="10" fill="rgba(16, 185, 129, 0.1)" stroke="#10b981" stroke-width="5"/>
        <line x1="15" y1="50" x2="85" y2="50" stroke="#059669" stroke-width="2.5"/>
        <line x1="50" y1="15" x2="50" y2="85" stroke="#059669" stroke-width="2.5"/>
        <!-- Matrix text symbols inside -->
        <text x="24" y="38" font-family="monospace" font-size="15" fill="#10b981" font-weight="bold">∑</text>
        <text x="62" y="38" font-family="monospace" font-size="15" fill="#10b981" font-weight="bold">√</text>
        <text x="24" y="74" font-family="monospace" font-size="15" fill="#10b981" font-weight="bold">π</text>
        <text x="60" y="74" font-family="monospace" font-size="15" fill="#10b981" font-weight="bold">∞</text>
      </g>
    `;
  };

  const drawBioBoss = (svg) => {
    svg.innerHTML = `
      <g transform="translate(10, 10)">
        <!-- double helix vertical structure -->
        <path d="M 30 10 Q 50 25 30 40 Q 50 55 30 70 Q 50 85 30 90" fill="none" stroke="#3b82f6" stroke-width="4"/>
        <path d="M 70 10 Q 50 25 70 40 Q 50 55 70 70 Q 50 85 70 90" fill="none" stroke="#60a5fa" stroke-width="4"/>
        <!-- rungs -->
        <line x1="37" y1="20" x2="63" y2="20" stroke="#93c5fd" stroke-width="2"/>
        <line x1="39" y1="35" x2="61" y2="35" stroke="#93c5fd" stroke-width="2"/>
        <line x1="37" y1="50" x2="63" y2="50" stroke="#93c5fd" stroke-width="2"/>
        <line x1="39" y1="65" x2="61" y2="65" stroke="#93c5fd" stroke-width="2"/>
        <line x1="37" y1="80" x2="63" y2="80" stroke="#93c5fd" stroke-width="2"/>
      </g>
    `;
  };

  const drawChemBoss = (svg) => {
    svg.innerHTML = `
      <g transform="translate(10, 10)">
        <!-- Giant complex orbital rings -->
        <circle cx="50" cy="50" r="12" fill="#ca8a04"/>
        <ellipse cx="50" cy="50" rx="42" ry="14" fill="none" stroke="#eab308" stroke-width="3" transform="rotate(45 50 50)"/>
        <ellipse cx="50" cy="50" rx="42" ry="14" fill="none" stroke="#eab308" stroke-width="3" transform="rotate(-45 50 50)"/>
        <ellipse cx="50" cy="50" rx="42" ry="14" fill="none" stroke="#eab308" stroke-width="3" transform="rotate(90 50 50)"/>
        <circle cx="20" cy="20" r="5" fill="#fef08a"/>
        <circle cx="80" cy="80" r="5" fill="#fef08a"/>
        <circle cx="8" cy="50" r="4.5" fill="#ca8a04"/>
        <circle cx="92" cy="50" r="4.5" fill="#ca8a04"/>
      </g>
    `;
  };

  const drawPhysBoss = (svg) => {
    svg.innerHTML = `
      <g transform="translate(10, 10)">
        <!-- Giant pulsing black hole singularity -->
        <circle cx="50" cy="50" r="22" fill="#020617" stroke="#db2777" stroke-width="4"/>
        <!-- Event horizon rays -->
        <path d="M 50 10 L 50 20 M 50 80 L 50 90 M 10 50 L 20 50 M 80 50 L 90 50" stroke="#ec4899" stroke-width="3" stroke-linecap="round"/>
        <path d="M 22 22 L 29 29 M 71 71 L 78 78 M 22 78 L 29 71 M 71 22 L 78 29" stroke="#ec4899" stroke-width="3" stroke-linecap="round"/>
        <circle cx="50" cy="50" r="14" fill="rgba(219, 39, 119, 0.3)"/>
      </g>
    `;
  };

  const getElementColor = (el) => {
    switch (el) {
      case 'fire': return '#ef4444';
      case 'water': return '#3b82f6';
      case 'earth': return '#10b981';
      case 'air': return '#d946ef';
      default: return '#cbd5e1';
    }
  };

  const showDamageFlyout = (val, target, element) => {
    const isPlayer = target === 'player';
    const comp = document.getElementById(isPlayer ? 'combatant-player' : 'combatant-enemy');
    const sprite = comp.querySelector('.sprite-container');
    
    const fly = document.createElement('div');
    fly.className = 'damage-flyout';
    fly.innerText = val;
    fly.style.color = getElementColor(element);
    
    // Style settings
    fly.style.position = 'absolute';
    fly.style.left = '50%';
    fly.style.top = '30%';
    fly.style.transform = 'translate(-50%, -50%)';
    fly.style.fontWeight = '900';
    fly.style.fontSize = '2.5rem';
    fly.style.webkitTextStroke = '1.5px black';
    fly.style.textShadow = '0 0 10px rgba(0,0,0,0.5)';
    fly.style.zIndex = '100';
    fly.style.animation = 'floatUp 0.8s forwards ease-out';
    
    sprite.appendChild(fly);
    setTimeout(() => fly.remove(), 800);
  };

  const updateHPBar = (id, cur, max) => {
    const bar = document.getElementById(`${id}-hp-bar`);
    const txt = document.getElementById(`${id}-hp-text`);
    const pct = Math.max(0, Math.min(100, (cur / max) * 100));
    bar.style.width = `${pct}%`;
    txt.innerText = `${cur}/${max}`;
  };

  const updateMPBar = (cur, max) => {
    const bar = document.getElementById('player-mp-bar');
    const txt = document.getElementById('player-mp-text');
    const pct = Math.max(0, Math.min(100, (cur / max) * 100));
    bar.style.width = `${pct}%`;
    txt.innerText = `${cur}/${max}`;
  };

  // Higgsfield Spell Cinematic Animation Renderer on Canvas
  const runCinematicSpellAnimation = (canvas, element, callback) => {
    const ctx = canvas.getContext('2d');
    const width = canvas.width = 640;
    const height = canvas.height = 360;
    
    let frame = 0;
    const maxFrames = 60; // 2.5 seconds at 24fps
    
    const particles = [];
    
    // Spawn initial particles based on element
    if (element === 'fire') {
      for (let i = 0; i < 40; i++) {
        particles.push({
          x: width * 0.2, y: height * 0.6,
          vx: Math.random() * 8 + 4, vy: (Math.random() * 6 - 3),
          size: Math.random() * 8 + 4,
          life: Math.random() * 30 + 30
        });
      }
    } else if (element === 'water') {
      for (let i = 0; i < 35; i++) {
        particles.push({
          x: width * 0.2, y: height * 0.2,
          vx: Math.random() * 5 + 3, vy: Math.random() * 8 + 1,
          size: Math.random() * 6 + 2,
          life: Math.random() * 40 + 20
        });
      }
    } else if (element === 'earth') {
      for (let i = 0; i < 20; i++) {
        particles.push({
          x: width * 0.7, y: height * 0.8,
          vx: (Math.random() * 4 - 2), vy: -(Math.random() * 8 + 4),
          size: Math.random() * 14 + 6,
          life: Math.random() * 25 + 20
        });
      }
    } else {
      // Air/Lightning
      for (let i = 0; i < 15; i++) {
        particles.push({
          x: width * 0.2, y: height * 0.5,
          x2: width * 0.8, y2: height * 0.5,
          life: 45
        });
      }
    }

    const animate = () => {
      frame++;
      
      const themeColor = getElementColor(element);

      // Draw Biome Background Image
      const bgImg = biomeBgImages[realmSubject];
      if (bgImg && bgImg.complete && bgImg.naturalWidth !== 0) {
        ctx.drawImage(bgImg, 0, 0, width, height);
        ctx.fillStyle = 'rgba(2, 6, 23, 0.45)';
        ctx.fillRect(0, 0, width, height);
      } else {
        ctx.fillStyle = '#020617';
        ctx.fillRect(0, 0, width, height);
      }

      // Ambient radial themed fog glow in the center
      const ambientGlow = ctx.createRadialGradient(width/2, height/2, 50, width/2, height/2, 260);
      ambientGlow.addColorStop(0, themeColor + '1c'); // ~11% opacity
      ambientGlow.addColorStop(1, 'rgba(2, 6, 23, 0)');
      ctx.fillStyle = ambientGlow;
      ctx.fillRect(0, 0, width, height);
      
      // Draw Grid lines
      ctx.strokeStyle = themeColor + '10'; // ~6% opacity
      ctx.lineWidth = 1;
      for (let x = 0; x < width; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0); ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y); ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Draw silhouettes
      ctx.fillStyle = themeColor + '20'; // ~12% opacity
      ctx.beginPath(); ctx.arc(80, height * 0.6, 35, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(width - 80, height * 0.5, 45, 0, Math.PI * 2); ctx.fill();

      // Camera pan
      let camX = 0;
      let camY = 0;
      if (frame > 20 && frame < 50) {
        camX = (Math.random() * 6 - 3);
        camY = (Math.random() * 6 - 3);
      }

      ctx.save();
      ctx.translate(camX, camY);

      // Render elements
      if (element === 'fire') {
        particles.forEach(p => {
          p.x += p.vx;
          p.y += p.vy;
          p.size = Math.max(0.1, p.size * 0.95);
          p.life--;
          
          ctx.beginPath();
          const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 1.5);
          grad.addColorStop(0, '#fff');
          grad.addColorStop(0.3, '#f97316');
          grad.addColorStop(1, 'rgba(239, 68, 68, 0)');
          ctx.fillStyle = grad;
          ctx.arc(p.x, p.y, p.size * 1.8, 0, Math.PI * 2);
          ctx.fill();
        });
      } else if (element === 'water') {
        particles.forEach(p => {
          p.x += p.vx;
          p.y += p.vy;
          p.vy += 0.15;
          p.life--;

          ctx.beginPath();
          ctx.fillStyle = 'rgba(59, 130, 246, 0.6)';
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        });
      } else if (element === 'earth') {
        particles.forEach(p => {
          p.y += p.vy;
          p.vy *= 0.92;
          p.life--;

          ctx.fillStyle = '#065f46';
          ctx.strokeStyle = '#34d399';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(p.x - p.size/2, height);
          ctx.lineTo(p.x, p.y);
          ctx.lineTo(p.x + p.size/2, height);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
        });
      } else {
        ctx.strokeStyle = '#fef08a'; // Bright yellow lightning core
        ctx.shadowColor = '#a855f7'; // Purple electrical glow
        ctx.shadowBlur = 18;
        ctx.lineWidth = 3;
        
        ctx.beginPath();
        let lx = width * 0.2;
        let ly = height * 0.55;
        ctx.moveTo(lx, ly);
        
        while (lx < width * 0.8) {
          lx += Math.random() * 40 + 10;
          ly += Math.random() * 60 - 30;
          ctx.lineTo(lx, ly);
        }
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      ctx.restore();

      // scanlines
      ctx.fillStyle = 'rgba(0,0,0,0.15)';
      for (let i = 0; i < height; i += 4) {
        ctx.fillRect(0, i, width, 1.5);
      }

      if (frame < maxFrames) {
        requestAnimationFrame(animate);
      } else {
        callback();
      }
    };
    
    animate();
  };

  return {
    initBattle,
    castSpell
  };
})();

window.BattleEngine = BattleEngine;
