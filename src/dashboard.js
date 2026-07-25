/* ==========================================================================
   KNOWLEDGE QUEST - STUDENT DASHBOARD
   Inventory equipping, Pet Menagerie registers, and mastery rings
   ========================================================================== */

const DashboardEngine = (() => {
  let stats = {
    questionsAnswered: 0,
    questionsCorrect: 0,
    currentStreak: 0,
    mastery: {
      math: { answered: 0, correct: 0 },
      bio: { answered: 0, correct: 0 },
      chem: { answered: 0, correct: 0 },
      phys: { answered: 0, correct: 0 }
    },
    history: []
  };

  const itemDetails = {
    wand_apprentice: { name: "Apprentice Wand", icon: "🪄", type: "staff", stat: "spellPower", value: 5 },
    staff_archmage: { name: "Archmage Staff", icon: "🔮", type: "staff", stat: "spellPower", value: 15 },
    robe_aether: { name: "Aether Robes", icon: "🥋", type: "robe", stat: "maxHp", value: 30 },
    ring_quantum: { name: "Quantum Ring", icon: "💍", type: "ring", stat: "maxMp", value: 15 }
  };

  const init = () => {
    const saved = localStorage.getItem('knowledge_quest_stats');
    if (saved) {
      try {
        stats = JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse statistics", e);
      }
    }
  };

  const logQuestion = (subject, qText, playerAns, correctAns, isCorrect, explanation) => {
    stats.questionsAnswered++;
    if (isCorrect) {
      stats.questionsCorrect++;
      stats.currentStreak++;
    } else {
      stats.currentStreak = 0;
    }

    if (!stats.mastery[subject]) {
      stats.mastery[subject] = { answered: 0, correct: 0 };
    }
    stats.mastery[subject].answered++;
    if (isCorrect) {
      stats.mastery[subject].correct++;
    }

    stats.history.unshift({
      id: Date.now(),
      subject,
      question: qText,
      playerAnswer: playerAns,
      correctAnswer: correctAns,
      isCorrect,
      explanation
    });

    if (stats.history.length > 30) {
      stats.history.pop();
    }

    saveStats();
    updateDashboardUI();
    
    const player = window.App.getPlayerState();
    player.streak = stats.currentStreak;
    window.App.saveState();
  };

  const saveStats = () => {
    localStorage.setItem('knowledge_quest_stats', JSON.stringify(stats));
  };

  const updateDashboardUI = () => {
    const player = window.App.getPlayerState();
    
    // Header Stats
    document.getElementById('dash-grade-text').innerText = `Grade ${player.grade}`;
    document.getElementById('dash-streak-text').innerText = stats.currentStreak;
    document.getElementById('dash-battles-text').innerText = player.battlesWon || 0;
    
    const accuracy = stats.questionsAnswered > 0 
      ? Math.round((stats.questionsCorrect / stats.questionsAnswered) * 100) 
      : 0;
    document.getElementById('dash-accuracy-text').innerText = `${accuracy}%`;

    // Circular Mastery Indicators (Circumference: 251.3)
    updateMasteryRing('math', stats.mastery.math);
    updateMasteryRing('bio', stats.mastery.bio);
    updateMasteryRing('chem', stats.mastery.chem);
    updateMasteryRing('phys', stats.mastery.phys);

    // Render Equipped Gear Boxes
    renderEquippedGear(player);

    // Render Stored Inventory Items
    renderInventoryBag(player);

    // Render Potion counts in dashboard
    const hpCount = player.inventory.filter(id => id === 'potion_hp').length;
    const mpCount = player.inventory.filter(id => id === 'potion_mp').length;
    document.getElementById('dash-potion-hp-count').innerText = `x${hpCount}`;
    document.getElementById('dash-potion-mp-count').innerText = `x${mpCount}`;

    // Render Pets Menagerie
    renderPetsMenagerie(player);

    // Render History Log
    const logContainer = document.getElementById('dashboard-history-log');
    if (stats.history.length === 0) {
      logContainer.innerHTML = `<div class="empty-log">No questions answered yet. Head over to the Adventure Map and fight some monsters!</div>`;
      return;
    }

    logContainer.innerHTML = '';
    stats.history.forEach(item => {
      const el = document.createElement('div');
      el.className = `log-item ${item.isCorrect ? 'correct' : 'incorrect'}`;
      
      const emoji = item.isCorrect ? '✅' : '❌';
      const subEmoji = item.subject === 'math' ? '🔢' : item.subject === 'bio' ? '🌱' : item.subject === 'chem' ? '🧪' : '⚡';
      const subTitle = item.subject === 'math' ? 'Math' : item.subject === 'bio' ? 'Biology' : item.subject === 'chem' ? 'Chemistry' : 'Physics';
      
      el.innerHTML = `
        <div class="log-icon">${emoji}</div>
        <div class="log-info">
          <div class="log-meta">
            <span class="log-subject">${subEmoji} ${subTitle}</span>
            <span>Just now</span>
          </div>
          <div class="log-question">${item.question}</div>
          <div class="log-answers">
            Your Answer: <span class="${item.isCorrect ? 'correct-ans' : 'wrong-ans'}">${item.playerAnswer}</span> | 
            Correct: <span class="correct-ans">${item.correctAnswer}</span>
          </div>
        </div>
      `;
      logContainer.appendChild(el);
    });
  };

  const updateMasteryRing = (id, subStat) => {
    const ring = document.getElementById(`ring-${id}`);
    const label = document.getElementById(`val-${id}`);
    
    const pct = subStat && subStat.answered > 0
      ? Math.round((subStat.correct / subStat.answered) * 100)
      : 0;

    label.innerText = `${pct}%`;

    // SVG Circumference calculation: 2 * PI * r = 2 * 3.14159 * 40 = 251.3
    const circumference = 251.3;
    const offset = circumference - (pct / 100) * circumference;
    ring.style.strokeDashoffset = offset;
  };

  const renderEquippedGear = (player) => {
    const types = ['staff', 'robe', 'ring'];
    types.forEach(t => {
      const box = document.getElementById(`equipped-${t}-box`);
      const itemId = player.equipped[t];
      
      if (itemId && itemDetails[itemId]) {
        const item = itemDetails[itemId];
        box.innerText = `${item.icon} ${item.name} (+${item.value})`;
        box.className = "slot-item-box equipped";
      } else {
        const emoji = t === 'staff' ? '🪄' : t === 'robe' ? '🥋' : '💍';
        box.innerText = `${emoji} Empty`;
        box.className = "slot-item-box";
      }
    });
  };

  const renderInventoryBag = (player) => {
    const container = document.getElementById('inventory-bag-items');
    
    // Filter items to show only gear (exclude potions)
    const gearItems = player.inventory.filter(id => id !== 'potion_hp' && id !== 'potion_mp');

    if (gearItems.length === 0) {
      container.innerHTML = `<div class="empty-bag-text">Your equipment pouch is empty. Visit the Shop to purchase gear!</div>`;
      return;
    }

    container.innerHTML = '';
    gearItems.forEach(itemId => {
      const item = itemDetails[itemId];
      if (!item) return;

      const card = document.createElement('div');
      card.className = "bag-item-card";
      card.innerText = item.icon;
      card.title = `${item.name}: Adds +${item.value} ${item.stat === 'maxHp' ? 'HP' : item.stat === 'maxMp' ? 'MP' : 'Spell Power'}`;
      
      // Is currently equipped?
      if (player.equipped[item.type] === itemId) {
        card.classList.add('active-equipped');
      }

      card.addEventListener('click', () => {
        equipItem(itemId);
      });

      container.appendChild(card);
    });
  };

  const equipItem = (itemId) => {
    if (window.AudioEngine) window.AudioEngine.playClick();
    const player = window.App.getPlayerState();
    const item = itemDetails[itemId];
    if (!item) return;

    // Toggle equipment: if already equipped, unequip it
    if (player.equipped[item.type] === itemId) {
      player.equipped[item.type] = null;
    } else {
      player.equipped[item.type] = itemId;
    }

    // Recalculate stats based on gear
    window.App.recalculateStats();
    window.App.saveState();
    window.App.updateHUD();
    updateDashboardUI();
  };

  const renderPetsMenagerie = (player) => {
    const container = document.getElementById('pets-menagerie-list');
    
    if (!player.pets || player.pets.length === 0) {
      container.innerHTML = `<div class="empty-pets-text">No captured pets. Decrease wild monsters' health below 50% in battle to capture them!</div>`;
      return;
    }

    const petBuffDescriptions = {
      fire: "🔥 +10% Fire Damage",
      water: "💧 +10% Water Damage",
      earth: "🌿 +20% Victory XP",
      air: "⚡ +1.5x Speed Critical"
    };

    container.innerHTML = '';
    player.pets.forEach(pet => {
      const card = document.createElement('div');
      card.className = "pet-card";
      
      // Check if active pet helper
      const isActive = player.activePet && player.activePet.name === pet.name;
      if (isActive) {
        card.classList.add('active-helper');
      }

      const buffText = petBuffDescriptions[pet.element] || "✨ Combat Assist";

      card.innerHTML = `
        <span class="pet-icon-big">${pet.emoji}</span>
        <span class="pet-name-txt">${pet.name}</span>
        <span class="pet-level-txt">Lv. ${pet.level} ${pet.element.toUpperCase()}</span>
        <div style="font-size: 0.74rem; color: ${isActive ? '#4ade80' : '#cbd5e1'}; margin: 4px 0; font-weight: 600;">${buffText}</div>
        ${isActive ? '<span class="pet-status-badge">ACTIVE ALLY</span>' : ''}
      `;

      card.addEventListener('click', () => {
        if (window.AudioEngine) window.AudioEngine.playClick();
        
        // Toggle active pet (strictly 1 active at a time)
        if (isActive) {
          player.activePet = null;
        } else {
          player.activePet = pet;
        }
        
        window.App.saveState();
        updateDashboardUI();
      });

      container.appendChild(card);
    });
  };

  const getStats = () => stats;

  return {
    init,
    logQuestion,
    updateDashboardUI,
    getStats
  };
})();

window.DashboardEngine = DashboardEngine;
