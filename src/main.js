/* ==========================================================================
   KNOWLEDGE QUEST - MAIN APPLICATION
   State management, gear stat calculations, shop purchasing, and story router
   ========================================================================== */

const App = (() => {
  // Global player state with RPG expansion fields
  let player = {
    name: "",
    element: "fire",
    grade: "8",
    subject: "math",
    level: 1,
    xp: 0,
    xpNext: 100,
    hp: 100,
    hpMax: 100,
    mp: 50,
    mpMax: 50,
    gold: 150, // Starting gold for shop demo
    battlesWon: 0,
    customSpells: [],
    
    // Expansion fields
    inventory: [], // lists item IDs owned
    equipped: { staff: null, robe: null, ring: null },
    pets: [], // captured pet objects
    activePet: null,
    minionsDefeated: { math: 0, bio: 0, chem: 0, phys: 0 },
    defeatedBosses: { math: false, bio: false, chem: false, phys: false },
    storySeen: false,
    avatar: "boy",
    hue: 0
  };

  const gearStats = {
    wand_apprentice: { type: "staff", stat: "spellPower", val: 5 },
    staff_archmage: { type: "staff", stat: "spellPower", val: 15 },
    robe_aether: { type: "robe", stat: "hpMax", val: 30 },
    ring_quantum: { type: "ring", stat: "mpMax", val: 15 }
  };

  const init = () => {
    // Initial engines load
    window.DashboardEngine.init();
    
    // Check for saved wizard profiles
    const saved = localStorage.getItem('knowledge_quest_player');
    if (saved) {
      try {
        const loaded = JSON.parse(saved);
        // Copy keys to ensure backwards compatibility
        player = { ...player, ...loaded };
        
        // Ensure sub-objects exist
        if (!player.inventory) player.inventory = [];
        if (!player.equipped) player.equipped = { staff: null, robe: null, ring: null };
        if (!player.pets) player.pets = [];
        if (!player.defeatedBosses) player.defeatedBosses = { math: false, bio: false, chem: false, phys: false };
        if (!player.minionsDefeated) player.minionsDefeated = { math: 0, bio: 0, chem: 0, phys: 0 };
        
        recalculateStats();
        updateHUD();
        navigateToScreen('map');
        
        if (window.AudioEngine) window.AudioEngine.startBGM();

        // Story modal trigger
        if (!player.storySeen) {
          triggerStoryIntro();
        }
      } catch (e) {
        console.error("Failed to parse saved player data", e);
      }
    }

    // Set up HUD Navigation Events
    const navs = ['map', 'shop', 'lab', 'dashboard', 'allies', 'pvp'];
    navs.forEach(navId => {
      const btn = document.getElementById(`nav-${navId}`);
      if (btn) {
        btn.addEventListener('click', () => {
          if (window.AudioEngine) window.AudioEngine.playClick();
          navigateToScreen(navId);
        });
      }
    });

    document.getElementById('hud-grade-select').addEventListener('change', (e) => {
      player.grade = e.target.value;
      saveState();
      updateHUD();
      if (window.AudioEngine) window.AudioEngine.playClick();
    });

    const respawnBtn = document.getElementById('respawn-btn');
    if (respawnBtn) {
      respawnBtn.addEventListener('click', () => {
        if (window.AudioEngine) window.AudioEngine.playClick();
        playerX = 450;
        playerY = 120;
        const mapScreen = document.getElementById('screen-map');
        if (mapScreen && mapScreen.classList.contains('active')) {
          startMapLoop();
        } else {
          navigateToScreen('map');
        }
      });
    }

    document.getElementById('reset-game-btn').addEventListener('click', () => {
      if (window.AudioEngine) window.AudioEngine.playClick();
      if (confirm("Are you sure you want to reset all game data and start a new wizard journey? This will wipe your gold, items, pets, and levels.")) {
        localStorage.clear();
        window.location.reload();
      }
    });

    // Robot customizer events setup
    let selectedAvatar = "boy";
    const setupBtns = document.querySelectorAll('#setup-avatar-grid .avatar-option-btn');
    setupBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        setupBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        selectedAvatar = btn.getAttribute('data-avatar');
        if (window.AudioEngine) window.AudioEngine.playClick();
      });
    });

    const setupHueSlider = document.getElementById('setup-robe-hue');
    setupHueSlider.addEventListener('input', (e) => {
      const val = e.target.value;
      document.getElementById('setup-hue-val').innerText = `${val}°`;
      applyRobeFilter(val);
    });

    const dashBtns = document.querySelectorAll('#dash-avatar-grid .avatar-option-btn');
    dashBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        dashBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        player.avatar = btn.getAttribute('data-avatar');
        saveState();
        updateHUD();
        if (window.AudioEngine) window.AudioEngine.playClick();
      });
    });

    const dashHueSlider = document.getElementById('dash-robe-hue');
    dashHueSlider.addEventListener('input', (e) => {
      const val = e.target.value;
      document.getElementById('dash-hue-val').innerText = `${val}°`;
      player.hue = parseInt(val);
      saveState();
      applyRobeFilter(val);
    });

    const soundBtn = document.getElementById('sound-toggle-btn');
    soundBtn.addEventListener('click', () => {
      if (window.AudioEngine) {
        const isMuted = window.AudioEngine.toggleMute();
        soundBtn.innerText = isMuted ? '🔇' : '🔊';
        if (!isMuted) window.AudioEngine.playClick();
      }
    });

    // Character Setup Form
    document.getElementById('setup-form').addEventListener('submit', (e) => {
      e.preventDefault();
      
      const nameInput = document.getElementById('char-name').value.trim();
      const elementChoice = document.querySelector('input[name="element"]:checked').value;
      const gradeChoice = document.getElementById('setup-grade').value;
      const subjectChoice = document.getElementById('setup-subject').value;

      player.name = nameInput;
      player.element = elementChoice;
      player.grade = gradeChoice;
      player.subject = subjectChoice;
      player.avatar = selectedAvatar;
      player.hue = parseInt(document.getElementById('setup-robe-hue').value);
      
      recalculateStats();
      player.hp = player.hpMax;
      player.mp = player.mpMax;
      player.storySeen = true;

      // Give starter potion
      player.inventory.push('potion_hp');

      saveState();
      updateHUD();
      
      if (window.AudioEngine) {
        window.AudioEngine.init();
        window.AudioEngine.playCorrect();
        window.AudioEngine.startBGM();
      }

      navigateToScreen('map');
      triggerStoryIntro();
    });

  // Setup Shop Buy Button Listeners
  const buyBtns = document.querySelectorAll('.buy-item-btn');
  const costs = { potion_hp: 50, potion_mp: 40, wand_apprentice: 100, staff_archmage: 250, robe_aether: 180, ring_quantum: 150 };

  buyBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const itemId = btn.getAttribute('data-item');
      const cost = costs[itemId];

      if (player.gold < cost) {
        if (window.AudioEngine) window.AudioEngine.playIncorrect();
        alert("Insufficient Gold! Answer more questions in battle to earn gold.");
        return;
      }

      // Potion or gear duplicate check
      if (itemId !== 'potion_hp' && itemId !== 'potion_mp' && player.inventory.includes(itemId)) {
        if (window.AudioEngine) window.AudioEngine.playIncorrect();
        alert("You already own this piece of gear!");
        return;
      }

      player.gold -= cost;
      player.inventory.push(itemId);
      
      if (window.AudioEngine) {
        window.AudioEngine.playCoin();
      }

      saveState();
      updateHUD();
      showItemAcquiredModal(itemId);
      
      // Force refresh dashboard inventory & gear boxes right away
      if (window.DashboardEngine) {
        window.DashboardEngine.updateDashboardUI();
      }
    });
  });

    // Initialize 2D Adventure Minions State
    initAdventureMinions();

    // Higgsfield Engine init
    window.HiggsfieldEngine.init();
  };

  // 2D Canvas Map Movement and Encounter Engine (3600x1760 4x Quadruple-Sized World Map)
  const WORLD_WIDTH = 3600;
  const WORLD_HEIGHT = 1760;

  const getSpawnCoords = (element) => {
    if (element === 'fire') return { x: 2700, y: 440 }; // Chem Realm (Top Right)
    if (element === 'water') return { x: 900, y: 440 }; // Math Realm (Top Left)
    if (element === 'earth') return { x: 900, y: 1320 }; // Bio Realm (Bottom Left)
    if (element === 'air') return { x: 2700, y: 1320 }; // Phys Realm (Bottom Right)
    return { x: 1800, y: 880 }; // World Central Core
  };

  let playerX = 1800;
  let playerY = 880;
  let playerZ = 0; // 3D Height Off Ground (Z-axis)
  let playerVZ = 0; // Vertical Jump Velocity
  let keys = { up: false, down: false, left: false, right: false, space: false };
  let mapInterval = null;
  let lastCollidedMinionId = null;
  let minions = [];
  let particles = [];
  
  // Market Realm State & Stationary Merchant Entities
  let inMarket = false;
  let marketReturnCoords = { x: 900, y: 440 };

  const marketBgImg = new Image();
  marketBgImg.src = 'assets/market_map_bg.jpg';

  const shatteredContinentBgImg = new Image();
  shatteredContinentBgImg.src = 'assets/map_layout_option_d.jpg';

  const merchantSprites = {
    alchemist: new Image(),
    wandsmith: new Image(),
    tailor: new Image(),
    picky_merchant: new Image()
  };
  merchantSprites.alchemist.src = 'assets/merchant_alchemist.jpg';
  merchantSprites.wandsmith.src = 'assets/merchant_wandsmith.jpg';
  merchantSprites.tailor.src = 'assets/merchant_tailor.jpg';
  merchantSprites.picky_merchant.src = 'assets/merchant_picky.jpg';

  const chestSprites = {
    closed: new Image(),
    open: new Image()
  };
  chestSprites.closed.src = 'assets/chest_closed.jpg';
  chestSprites.open.src = 'assets/chest_open.jpg';

  const marketEntities = [
    {
      id: 'alchemist',
      name: "Alchemist Gideon",
      title: "Master Alchemist",
      quote: `"Greetings traveler! Browse my finest potions and elixirs, brewed to restore health and mana in combat."`,
      x: 140,
      y: 90,
      radius: 32,
      avatar: "🧙‍♂️",
      icon: "🧪",
      color: "#3b82f6",
      items: ['potion_hp', 'potion_mp']
    },
    {
      id: 'wandsmith',
      name: "Master Wandsmith",
      title: "Wandsmith & Forgemaster",
      quote: `"Ah, seeking greater spellpower? My wands and staffs are forged in dragon fire!"`,
      x: 480,
      y: 90,
      radius: 32,
      avatar: "🧑‍🏭",
      icon: "🔨",
      color: "#f59e0b",
      items: ['wand_apprentice', 'staff_archmage']
    },
    {
      id: 'tailor',
      name: "Royal Tailor & Relics",
      title: "Arcane Tailor & Relic Vault",
      quote: `"Protective Aether Robes and Quantum Rings of power! Step closer and admire the craftsmanship."`,
      x: 480,
      y: 220,
      radius: 32,
      avatar: "🧝‍♂️",
      icon: "🧵",
      color: "#ec4899",
      items: ['robe_aether', 'ring_quantum']
    },
    {
      id: 'picky_merchant',
      name: "Picky Merchant Barnaby",
      title: "Picky Merchant & Collector",
      quote: `"Hmm... I only buy the finest goods! Show me your inventory and I'll grant you gold coins for your items!"`,
      x: 140,
      y: 220,
      radius: 32,
      avatar: "🧐",
      icon: "⚖️",
      color: "#10b981",
      isSellMerchant: true,
      items: []
    }
  ];

  const bosses = [
    { subject: 'math', x: 1000, y: 450, radius: 25, emoji: '🔱' },
    { subject: 'chem', x: 2600, y: 450, radius: 25, emoji: '🪐' },
    { subject: 'bio', x: 1000, y: 1300, radius: 25, emoji: '🧬' },
    { subject: 'phys', x: 2600, y: 1300, radius: 25, emoji: '⚛️' }
  ];

  // Preload Sprite Graphic Assets
  const playerSprites = {
    boy: new Image(),
    girl: new Image(),
    cyber: new Image(),
    celestial: new Image()
  };
  playerSprites.boy.src = 'assets/sprite_boy.jpg';
  playerSprites.girl.src = 'assets/sprite_girl.jpg';
  playerSprites.cyber.src = 'assets/sprite_cyber.jpg';
  playerSprites.celestial.src = 'assets/sprite_celestial.jpg';

  const bossSprites = {
    math: new Image(),
    chem: new Image(),
    bio: new Image(),
    phys: new Image()
  };
  bossSprites.math.src = 'assets/boss_math.jpg';
  bossSprites.chem.src = 'assets/boss_chem.jpg';
  bossSprites.bio.src = 'assets/boss_bio.jpg';
  bossSprites.phys.src = 'assets/boss_phys.jpg';

  const minionSprites = {
    math: new Image(),
    bio: new Image(),
    chem: new Image(),
    phys: new Image(),
    'Obsidian Golem': new Image(),
    'Nether Hydra': new Image(),
    dungeon_golem: new Image(),
    dungeon_hydra: new Image()
  };
  minionSprites.math.src = 'assets/minion_math.jpg';
  minionSprites.bio.src = 'assets/minion_bio.jpg';
  minionSprites.chem.src = 'assets/minion_chem.jpg';
  minionSprites.phys.src = 'assets/minion_phys.jpg';
  minionSprites['Obsidian Golem'].src = 'assets/minion_dungeon_golem.jpg';
  minionSprites['Nether Hydra'].src = 'assets/minion_dungeon_hydra.jpg';
  minionSprites.dungeon_golem.src = 'assets/minion_dungeon_golem.jpg';
  minionSprites.dungeon_hydra.src = 'assets/minion_dungeon_hydra.jpg';

  const obsSprites = {
    peaks: new Image(),
    ruins: new Image(),
    swamp: new Image(),
    dynamo: new Image()
  };
  obsSprites.peaks.src = 'assets/obs_peaks.jpg';
  obsSprites.ruins.src = 'assets/obs_ruins.jpg';
  obsSprites.swamp.src = 'assets/obs_swamp.jpg';
  obsSprites.dynamo.src = 'assets/obs_dynamo.jpg';

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

  const dungeonBgImg = new Image();
  dungeonBgImg.src = 'assets/dungeon_bg.jpg';

  const mineshaftSprite = new Image();
  mineshaftSprite.src = 'assets/mineshaft_portal.jpg';

  const transparentSpriteCache = {};

  const getTransparentSprite = (imgInput) => {
    if (!imgInput) return null;
    let imgSrc = typeof imgInput === 'string' ? imgInput : imgInput.src;
    if (!imgSrc) return imgInput;

    if (transparentSpriteCache[imgSrc]) {
      return transparentSpriteCache[imgSrc];
    }

    const cleanImg = new Image();
    transparentSpriteCache[imgSrc] = cleanImg;

    const rawImg = new Image();
    rawImg.crossOrigin = "Anonymous";
    rawImg.onload = () => {
      try {
        const c = document.createElement('canvas');
        const w = rawImg.naturalWidth || 64;
        const h = rawImg.naturalHeight || 64;
        c.width = w;
        c.height = h;
        const cx = c.getContext('2d');
        cx.drawImage(rawImg, 0, 0);

        const imgData = cx.getImageData(0, 0, w, h);
        const data = imgData.data;

        // Sample top-left corner color
        const cornerR = data[0], cornerG = data[1], cornerB = data[2];

        // BFS Flood Fill starting from outer boundary edge pixels ONLY
        const visited = new Uint8Array(w * h);
        const queue = [];

        // Add top and bottom border row pixels to queue
        for (let x = 0; x < w; x++) {
          queue.push(x);
          queue.push((h - 1) * w + x);
        }
        // Add left and right border column pixels to queue
        for (let y = 1; y < h - 1; y++) {
          queue.push(y * w);
          queue.push(y * w + (w - 1));
        }

        for (let i = 0; i < queue.length; i++) {
          visited[queue[i]] = 1;
        }

        let head = 0;
        while (head < queue.length) {
          const idx = queue[head++];
          const px = idx % w;
          const py = Math.floor(idx / w);
          const pByte = idx * 4;

          const r = data[pByte];
          const g = data[pByte + 1];
          const b = data[pByte + 2];

          // Check if pixel matches outer background color (No false-positives on dark clothing)
          const dist = Math.hypot(r - cornerR, g - cornerG, b - cornerB);
          const isWhiteBg = (cornerR > 210 && cornerG > 210 && cornerB > 210) && (r > 220 && g > 220 && b > 220);
          const isDarkBg = (cornerR < 50 && cornerG < 50 && cornerB < 50) && dist < 28;

          if (isWhiteBg || isDarkBg || dist < 25) {
            data[pByte + 3] = 0; // Outer background transparent

            // Propagate only to connected adjacent background neighbors
            if (px > 0 && !visited[idx - 1]) { visited[idx - 1] = 1; queue.push(idx - 1); }
            if (px < w - 1 && !visited[idx + 1]) { visited[idx + 1] = 1; queue.push(idx + 1); }
            if (py > 0 && !visited[idx - w]) { visited[idx - w] = 1; queue.push(idx - w); }
            if (py < h - 1 && !visited[idx + w]) { visited[idx + w] = 1; queue.push(idx + w); }
          }
        }

        cx.putImageData(imgData, 0, 0);
        cleanImg.src = c.toDataURL();
      } catch (e) {
        cleanImg.src = imgSrc;
      }
    };
    rawImg.src = imgSrc;
    return cleanImg;
  };

  const getPetSpriteSrc = (pet) => {
    if (!pet) return 'assets/minion_bio.jpg';
    if (pet.name === 'Obsidian Golem' || pet.id === 'dungeon_golem') return 'assets/minion_dungeon_golem.jpg';
    if (pet.name === 'Nether Hydra' || pet.id === 'dungeon_hydra') return 'assets/minion_dungeon_hydra.jpg';
    if (pet.sprite) return pet.sprite;
    if (pet.subject) return `assets/minion_${pet.subject}.jpg`;
    if (pet.element === 'fire' || pet.element === 'chem') return 'assets/minion_chem.jpg';
    if (pet.element === 'water' || pet.element === 'math') return 'assets/minion_math.jpg';
    if (pet.element === 'earth' || pet.element === 'bio') return 'assets/minion_bio.jpg';
    if (pet.element === 'air' || pet.element === 'phys') return 'assets/minion_phys.jpg';
    return 'assets/minion_bio.jpg';
  };

  let inDungeon = false;
  let activeDungeonId = null;
  let surfaceReturnCoords = { x: 1800, y: 880 };

  const dungeonPortals = [
    // 4 Built-in 3D Mineshaft Dungeon Entrances across the 3600x1760 4x Open World Map
    { id: 'dungeon_math', x: 650, y: 350, realm: 'math', name: '⛏️ Ancient Math Catacombs Mineshaft', color: '#3b82f6' },
    { id: 'dungeon_chem', x: 2950, y: 350, realm: 'chem', name: '⛏️ Volcanic Chemical Mineshaft', color: '#ef4444' },
    { id: 'dungeon_bio', x: 650, y: 1450, realm: 'bio', name: '⛏️ Bioluminescent Abyss Mineshaft', color: '#22c55e' },
    { id: 'dungeon_phys', x: 2950, y: 1450, realm: 'phys', name: '⛏️ Quantum Spacetime Vault Mineshaft', color: '#a855f7' }
  ];

  // Environment 3D Obstacles Database for 3600x1760 Quadruple-Sized 3D World Map
  const obstacles = [
    // Math Glacial Peaks & Crystal Monoliths (Top-Left 0..1800, 0..880)
    { type: 'rect', x: 240, y: 160, w: 280, h: 120, height: 110, color: '#047857', label: 'peaks' },
    { type: 'rect', x: 1160, y: 360, w: 140, h: 280, height: 130, color: '#047857', label: 'peaks' },
    { type: 'rect', x: 560, y: 560, w: 240, h: 100, height: 95, color: '#047857', label: 'peaks' },

    // Chem Acid Ruins & Alchemical Vats (Top-Right 1800..3600, 0..880)
    { type: 'rect', x: 2100, y: 200, w: 140, h: 300, height: 120, color: '#a16207', label: 'ruins' },
    { type: 'rect', x: 2800, y: 160, w: 320, h: 100, height: 100, color: '#a16207', label: 'ruins' },
    { type: 'rect', x: 2400, y: 580, w: 260, h: 120, height: 105, color: '#a16207', label: 'ruins' },

    // Bio Ancient Oak Canopy & Giant Mushrooms (Bottom-Left 0..1800, 880..1760)
    { type: 'rect', x: 300, y: 1040, w: 320, h: 120, height: 120, color: '#1d4ed8', label: 'swamp' },
    { type: 'rect', x: 1240, y: 1300, w: 140, h: 280, height: 140, color: '#1d4ed8', label: 'swamp' },
    { type: 'rect', x: 700, y: 1440, w: 280, h: 100, height: 95, color: '#1d4ed8', label: 'swamp' },

    // Phys Volcanic Dynamos & Tesla Towers (Bottom-Right 1800..3600, 880..1760)
    { type: 'rect', x: 2200, y: 1040, w: 240, h: 120, height: 130, color: '#9f1239', label: 'dynamo' },
    { type: 'rect', x: 3040, y: 1240, w: 140, h: 300, height: 150, color: '#9f1239', label: 'dynamo' },
    { type: 'rect', x: 2560, y: 1480, w: 280, h: 100, height: 110, color: '#9f1239', label: 'dynamo' }
  ];

  const obstaclePrettyLabels = {
    peaks: '⛰️ Math Glacial Monolith',
    ruins: '🧱 Chem Acid Ruins',
    swamp: '🌳 Bio Canopy Oak',
    dynamo: '⚡ Tesla Dynamos'
  };

  const checkObstacleCollision = (x, y, r) => {
    if (inDungeon || inMarket) {
      return false;
    }

    // 1. Solid Outer Boundary Cliff Walls (3600x1760 World Boundaries - Player Cannot Go Off Map Edges)
    if (x <= 60 || x >= 3540 || y <= 60 || y >= 1700) {
      return true;
    }

    // 2. 3D Terrain Height-Slope Cliff Collision (Steep Rock Cliffs Cannot Be Walked Over)
    if (window.World3DEngine) {
      const map3DX = ((x / 3600) * 180) - 90;
      const map3DZ = ((y / 1760) * 80) - 40;
      const tH = window.World3DEngine.getTerrainHeight(map3DX, map3DZ);
      // Impassable outer mountain walls or deep rift chasms
      if (tH > 18.0 || tH < -6.0) {
        return true;
      }
    }

    // 2. Chasm Ledge Physics for Option D (Shattered Continent Chasms across 3600x1760)
    // Central Stone Crossroads Bridge is at X: 1720..1880, Y: 810..950
    const onBridge = (x >= 1720 && x <= 1880 && y >= 810 && y <= 950);
    if (!onBridge) {
      // Vertical Energy Chasm (X: 1760..1840)
      if (x > 1760 && x < 1840) return true;
      // Horizontal Energy Chasm (Y: 840..920)
      if (y > 840 && y < 920) return true;
    }

    // 3. Central Obelisk Monument Base Check (X: 1800, Y: 880, radius: 55)
    const coreDist = Math.hypot(x - 1800, y - 880);
    if (coreDist < r + 55) return true;

    // 4. 3D Obstacle Footprint Collision Check
    for (let obs of obstacles) {
      const closestX = Math.max(obs.x, Math.min(x, obs.x + obs.w));
      const closestY = Math.max(obs.y, Math.min(y, obs.y + obs.h));
      const dist = Math.hypot(x - closestX, y - closestY);
      if (dist < r) return true;
    }
    return false;
  };

  const dungeonChestsDatabase = {
    dungeon_math: [
      { id: 'chest_math_1', x: 220, y: 160, radius: 22, opened: false },
      { id: 'chest_math_2', x: 1580, y: 220, radius: 22, opened: false },
      { id: 'chest_math_3', x: 920, y: 720, radius: 22, opened: false }
    ],
    dungeon_chem: [
      { id: 'chest_chem_1', x: 280, y: 700, radius: 22, opened: false },
      { id: 'chest_chem_2', x: 1520, y: 180, radius: 22, opened: false },
      { id: 'chest_chem_3', x: 880, y: 220, radius: 22, opened: false }
    ],
    dungeon_bio: [
      { id: 'chest_bio_1', x: 180, y: 220, radius: 22, opened: false },
      { id: 'chest_bio_2', x: 1620, y: 720, radius: 22, opened: false },
      { id: 'chest_bio_3', x: 1080, y: 680, radius: 22, opened: false }
    ],
    dungeon_phys: [
      { id: 'chest_phys_1', x: 320, y: 720, radius: 22, opened: false },
      { id: 'chest_phys_2', x: 1420, y: 220, radius: 22, opened: false },
      { id: 'chest_phys_3', x: 920, y: 180, radius: 22, opened: false }
    ]
  };

  let activeDungeonChests = [];

  const initDungeonChests = (dungeonId = 'dungeon_math') => {
    let openedState = {};
    try {
      const saved = localStorage.getItem('knowledge_quest_chests');
      if (saved) openedState = JSON.parse(saved);
    } catch (e) {}

    const defaults = dungeonChestsDatabase[dungeonId] || dungeonChestsDatabase.dungeon_math;
    activeDungeonChests = defaults.map(c => ({
      ...c,
      opened: !!openedState[c.id]
    }));
  };

  const showChestLootModal = (goldAmount, droppedItem) => {
    const modal = document.getElementById('chest-loot-modal');
    if (!modal) return;

    const detailsEl = document.getElementById('chest-loot-details');
    
    const itemNames = {
      potion_hp: { name: "HP Healing Potion", icon: "❤️", desc: "Restores 50 HP in battle!" },
      potion_mp: { name: "Mana Elixir", icon: "💧", desc: "Restores 40 MP in battle!" },
      wand_apprentice: { name: "Apprentice Wand", icon: "🪄", desc: "+8 Spell Power!" },
      staff_archmage: { name: "Archmage Staff", icon: "🔮", desc: "+15 Spell Power!" },
      robe_aether: { name: "Aether Robes", icon: "🥋", desc: "+35 Max HP!" },
      ring_quantum: { name: "Quantum Ring", icon: "💍", desc: "+25 Max MP!" }
    };

    let html = `
      <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
        <span style="font-size: 1.6rem;">🪙</span>
        <div>
          <strong style="color: #fbbf24; font-size: 1.05rem;">+${goldAmount} Gold Coins</strong>
          <div style="font-size: 0.8rem; color: #94a3b8;">Added directly to your gold balance!</div>
        </div>
      </div>
    `;

    if (droppedItem && itemNames[droppedItem]) {
      const info = itemNames[droppedItem];
      html += `
        <div style="display: flex; align-items: center; gap: 12px; margin-top: 10px; padding-top: 10px; border-top: 1px solid rgba(255,255,255,0.1);">
          <span style="font-size: 1.6rem;">${info.icon}</span>
          <div>
            <strong style="color: #4ade80; font-size: 1.05rem;">BONUS ITEM: ${info.name}</strong>
            <div style="font-size: 0.8rem; color: #cbd5e1;">${info.desc}</div>
          </div>
        </div>
      `;
    } else {
      html += `
        <div style="margin-top: 6px; font-size: 0.82rem; color: #64748b; font-style: italic;">
          (No bonus equipment dropped this time)
        </div>
      `;
    }

    detailsEl.innerHTML = html;
    modal.classList.remove('hidden');

    document.getElementById('close-chest-loot-btn').onclick = () => {
      if (window.AudioEngine) window.AudioEngine.playClick();
      modal.classList.add('hidden');
    };
  };

  const initDungeonMinions = (dungeonId = 'dungeon_math') => {
    initDungeonChests(dungeonId);
    // Dungeon Exclusive Monsters (NO surface minions inside dungeons!)
    if (dungeonId === 'dungeon_chem') {
      minions = [
        { id: 'dung_chem_1', subject: 'chem', name: 'Nether Hydra', sprite: 'assets/minion_dungeon_hydra.jpg', x: 350, y: 220, vx: 1.4, vy: 1.1, radius: 18, emoji: '🐍', active: true },
        { id: 'dung_chem_2', subject: 'math', name: 'Obsidian Golem', sprite: 'assets/minion_dungeon_golem.jpg', x: 750, y: 320, vx: -1.2, vy: 1.3, radius: 18, emoji: '🗿', active: true },
        { id: 'dung_chem_3', subject: 'chem', name: 'Nether Hydra', sprite: 'assets/minion_dungeon_hydra.jpg', x: 1300, y: 220, vx: 1.1, vy: -1.4, radius: 18, emoji: '🐍', active: true },
        { id: 'dung_chem_4', subject: 'phys', name: 'Obsidian Golem', sprite: 'assets/minion_dungeon_golem.jpg', x: 1550, y: 650, vx: -1.3, vy: -1.1, radius: 18, emoji: '🗿', active: true }
      ];
    } else if (dungeonId === 'dungeon_bio') {
      minions = [
        { id: 'dung_bio_1', subject: 'bio', name: 'Nether Hydra', sprite: 'assets/minion_dungeon_hydra.jpg', x: 350, y: 250, vx: 1.2, vy: 1.3, radius: 18, emoji: '🐍', active: true },
        { id: 'dung_bio_2', subject: 'math', name: 'Obsidian Golem', sprite: 'assets/minion_dungeon_golem.jpg', x: 650, y: 600, vx: -1.4, vy: -1.1, radius: 18, emoji: '🗿', active: true },
        { id: 'dung_bio_3', subject: 'bio', name: 'Nether Hydra', sprite: 'assets/minion_dungeon_hydra.jpg', x: 1250, y: 700, vx: 1.1, vy: 1.4, radius: 18, emoji: '🐍', active: true },
        { id: 'dung_bio_4', subject: 'phys', name: 'Obsidian Golem', sprite: 'assets/minion_dungeon_golem.jpg', x: 1450, y: 250, vx: -1.3, vy: -1.2, radius: 18, emoji: '🗿', active: true }
      ];
    } else if (dungeonId === 'dungeon_phys') {
      minions = [
        { id: 'dung_phys_1', subject: 'phys', name: 'Obsidian Golem', sprite: 'assets/minion_dungeon_golem.jpg', x: 400, y: 200, vx: 1.3, vy: -1.2, radius: 18, emoji: '🗿', active: true },
        { id: 'dung_phys_2', subject: 'bio', name: 'Nether Hydra', sprite: 'assets/minion_dungeon_hydra.jpg', x: 800, y: 650, vx: -1.1, vy: 1.4, radius: 18, emoji: '🐍', active: true },
        { id: 'dung_phys_3', subject: 'phys', name: 'Obsidian Golem', sprite: 'assets/minion_dungeon_golem.jpg', x: 1200, y: 250, vx: 1.4, vy: 1.1, radius: 18, emoji: '🗿', active: true },
        { id: 'dung_phys_4', subject: 'chem', name: 'Nether Hydra', sprite: 'assets/minion_dungeon_hydra.jpg', x: 1600, y: 600, vx: -1.2, vy: -1.3, radius: 18, emoji: '🐍', active: true }
      ];
    } else {
      // Math Catacombs Dungeon
      minions = [
        { id: 'dung_math_1', subject: 'math', name: 'Obsidian Golem', sprite: 'assets/minion_dungeon_golem.jpg', x: 300, y: 200, vx: 1.4, vy: 1.1, radius: 18, emoji: '🗿', active: true },
        { id: 'dung_math_2', subject: 'chem', name: 'Nether Hydra', sprite: 'assets/minion_dungeon_hydra.jpg', x: 700, y: 300, vx: -1.2, vy: 1.3, radius: 18, emoji: '🐍', active: true },
        { id: 'dung_math_3', subject: 'math', name: 'Obsidian Golem', sprite: 'assets/minion_dungeon_golem.jpg', x: 1300, y: 200, vx: 1.1, vy: -1.4, radius: 18, emoji: '🗿', active: true },
        { id: 'dung_math_4', subject: 'bio', name: 'Nether Hydra', sprite: 'assets/minion_dungeon_hydra.jpg', x: 1500, y: 650, vx: -1.3, vy: -1.1, radius: 18, emoji: '🐍', active: true }
      ];
    }

    // 5% Chance for each dungeon monster to spawn as Special ⭐
    minions.forEach(m => {
      m.isSpecial = Math.random() < 0.05;
    });
  };

  const initAdventureMinions = () => {
    if (inDungeon) {
      initDungeonMinions(activeDungeonId);
      return;
    }
    // Default minions per quadrant across 3600x1760 world map
    minions = [
      // Math Minions (Top Left 0..1800, 0..880)
      { id: 'math_1', subject: 'math', name: 'Fraction Wraith', sprite: 'assets/minion_math_wraith.jpg', x: 440, y: 300, vx: 1.4, vy: 1.1, radius: 15, emoji: '🔢', active: true },
      { id: 'math_2', subject: 'math', name: 'Equation Imp', sprite: 'assets/minion_math_imp.jpg', x: 1360, y: 560, vx: -1.1, vy: 1.4, radius: 15, emoji: '✖️', active: true },
      { id: 'math_3', subject: 'math', name: 'Fraction Wraith', sprite: 'assets/minion_math_wraith.jpg', x: 700, y: 200, vx: 0.9, vy: -1.2, radius: 15, emoji: '🔢', active: true },
      // Chem Minions (Top Right 1800..3600, 0..880)
      { id: 'chem_1', subject: 'chem', name: 'Periodic Pixie', sprite: 'assets/minion_chem_pixie.jpg', x: 2240, y: 300, vx: 1.2, vy: -1.4, radius: 15, emoji: '🧪', active: true },
      { id: 'chem_2', subject: 'chem', name: 'Acid Sludge', sprite: 'assets/minion_chem_sludge.jpg', x: 3160, y: 560, vx: -1.4, vy: -0.9, radius: 15, emoji: '☣️', active: true },
      { id: 'chem_3', subject: 'chem', name: 'Periodic Pixie', sprite: 'assets/minion_chem_pixie.jpg', x: 2600, y: 200, vx: -0.9, vy: 1.3, radius: 15, emoji: '🧪', active: true },
      // Bio Minions (Bottom Left 0..1800, 880..1760)
      { id: 'bio_1', subject: 'bio', name: 'Cellular Slime', sprite: 'assets/minion_bio_slime.jpg', x: 440, y: 1180, vx: 1.1, vy: 1.4, radius: 15, emoji: '🦠', active: true },
      { id: 'bio_2', subject: 'bio', name: 'Chloroplast Spore', sprite: 'assets/minion_bio_spore.jpg', x: 1360, y: 1440, vx: -1.4, vy: -1.1, radius: 15, emoji: '🍃', active: true },
      { id: 'bio_3', subject: 'bio', name: 'Cellular Slime', sprite: 'assets/minion_bio_slime.jpg', x: 700, y: 1040, vx: 0.9, vy: -0.9, radius: 15, emoji: '🦠', active: true },
      // Phys Minions (Bottom Right 1800..3600, 880..1760)
      { id: 'phys_1', subject: 'phys', name: 'Kinetic Imp', sprite: 'assets/minion_phys_imp.jpg', x: 2240, y: 1180, vx: -1.1, vy: 1.4, radius: 15, emoji: '🏃', active: true },
      { id: 'phys_2', subject: 'phys', name: 'Magnetic Basilisk', sprite: 'assets/minion_phys_basilisk.jpg', x: 3160, y: 1440, vx: 1.4, vy: -1.1, radius: 15, emoji: '🧲', active: true },
      { id: 'phys_3', subject: 'phys', name: 'Kinetic Imp', sprite: 'assets/minion_phys_imp.jpg', x: 2600, y: 1040, vx: -1.0, vy: -1.0, radius: 15, emoji: '🏃', active: true }
    ];

    // Deactivate surface minions of any realm whose Boss has been defeated!
    minions.forEach(m => {
      if (player.defeatedBosses && player.defeatedBosses[m.subject]) {
        m.active = false;
      }
    });
  };

  const showItemAcquiredModal = (itemId) => {
    const details = {
      potion_hp: { name: "HP Healing Potion", icon: "❤️", desc: "Added to inventory! Restores +50 Health in battle." },
      potion_mp: { name: "Mana Elixir", icon: "💧", desc: "Added to inventory! Restores +25 Magic Points in battle." },
      wand_apprentice: { name: "Apprentice Wand", icon: "🪄", desc: "Equipped! Adds +5 Spell Power to your magical attacks." },
      staff_archmage: { name: "Archmage Staff", icon: "🔮", desc: "Equipped! Adds +15 Spell Power to your magical attacks." },
      robe_aether: { name: "Aether Robes", icon: "🥋", desc: "Equipped! Increases your Maximum HP by +30." },
      ring_quantum: { name: "Quantum Ring", icon: "💍", desc: "Equipped! Increases your Maximum MP by +15." }
    };

    const item = details[itemId] || { name: "Arcane Artifact", icon: "✨", desc: "Item added to your inventory!" };

    const iconEl = document.getElementById('acquired-item-icon');
    const nameEl = document.getElementById('acquired-item-name');
    const descEl = document.getElementById('acquired-item-desc');

    if (iconEl) iconEl.innerText = item.icon;
    if (nameEl) nameEl.innerText = item.name;
    if (descEl) descEl.innerText = item.desc;

    const modal = document.getElementById('item-acquired-modal');
    if (modal) {
      modal.classList.remove('hidden');
    }

    const closeBtn = document.getElementById('close-item-acquired-btn');
    if (closeBtn) {
      closeBtn.onclick = () => {
        if (window.AudioEngine) window.AudioEngine.playClick();
        modal.classList.add('hidden');
      };
    }
  };

  const openMerchantShopModal = (merchant) => {
    window.activeMerchantId = merchant.id;
    const modal = document.getElementById('medieval-merchant-modal');
    if (!modal) return;

    document.getElementById('merchant-modal-icon').innerText = merchant.icon;
    document.getElementById('merchant-modal-name').innerText = merchant.name;
    document.getElementById('merchant-modal-avatar').innerText = merchant.avatar;
    document.getElementById('merchant-modal-title').innerText = merchant.title;
    document.getElementById('merchant-modal-quote').innerText = merchant.quote;

    const modalSprite = document.getElementById('merchant-modal-sprite');
    if (modalSprite) {
      modalSprite.src = `assets/merchant_${merchant.id === 'picky_merchant' ? 'picky' : merchant.id}.jpg`;
    }

    const itemsGrid = document.getElementById('merchant-items-grid');
    const allShopCards = document.querySelectorAll('#screen-shop .shop-item-card');
    const costs = { potion_hp: 50, potion_mp: 40, wand_apprentice: 100, staff_archmage: 250, robe_aether: 180, ring_quantum: 150 };

    itemsGrid.innerHTML = '';

    if (merchant.isSellMerchant) {
      const itemDetails = {
        potion_hp: { name: "HP Healing Potion", icon: "❤️", sellPrice: 25 },
        potion_mp: { name: "Mana Elixir", icon: "💧", sellPrice: 20 },
        wand_apprentice: { name: "Apprentice Wand", icon: "🪄", sellPrice: 50 },
        staff_archmage: { name: "Archmage Staff", icon: "🔮", sellPrice: 125 },
        robe_aether: { name: "Aether Robes", icon: "🥋", sellPrice: 90 },
        ring_quantum: { name: "Quantum Ring", icon: "💍", sellPrice: 75 }
      };

      const renderSellGrid = () => {
        itemsGrid.innerHTML = '';
        if (!player.inventory || player.inventory.length === 0) {
          itemsGrid.innerHTML = `<div style="grid-column: 1 / -1; text-align: center; padding: 40px 20px; color: #94a3b8; font-weight: 600; font-size: 1rem; background: rgba(15, 23, 42, 0.6); border-radius: 12px; border: 1px dashed rgba(255,255,255,0.15);">You have no items in your inventory to sell to Barnaby!</div>`;
          return;
        }

        const counts = {};
        player.inventory.forEach(item => {
          counts[item] = (counts[item] || 0) + 1;
        });

        Object.keys(counts).forEach(itemId => {
          const info = itemDetails[itemId] || { name: itemId, icon: "📦", sellPrice: 15 };
          const qty = counts[itemId];

          const sellCard = document.createElement('div');
          sellCard.className = 'shop-item-card';
          sellCard.style.border = '1px solid rgba(16, 185, 129, 0.4)';
          sellCard.style.background = 'rgba(15, 23, 42, 0.85)';

          sellCard.innerHTML = `
            <div class="shop-item-header">
              <span class="shop-item-icon">${info.icon}</span>
              <div>
                <h4 class="shop-item-title" style="color: #fef3c7;">${info.name} ${qty > 1 ? `<span style="color:#4ade80;">x${qty}</span>` : ''}</h4>
                <p class="shop-item-cost" style="color: #4ade80;">Resale Value: 🪙 ${info.sellPrice} Gold</p>
              </div>
            </div>
            <p class="shop-item-desc" style="font-size: 0.82rem; color: #cbd5e1; margin: 8px 0;">Barnaby inspects this item and offers ${info.sellPrice} Gold Coins in cash!</p>
            <button class="cta-btn primary sell-item-btn" style="width:100%; margin-top:10px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); font-weight: 700; font-size: 0.88rem;">
              💰 Sell Item (+${info.sellPrice} Gold)
            </button>
          `;

          sellCard.querySelector('.sell-item-btn').onclick = () => {
            const idx = player.inventory.indexOf(itemId);
            if (idx > -1) {
              player.inventory.splice(idx, 1);
              player.gold += info.sellPrice;

              // Unequip if no longer in inventory
              if (player.equipped.staff === itemId && !player.inventory.includes(itemId)) player.equipped.staff = null;
              if (player.equipped.robe === itemId && !player.inventory.includes(itemId)) player.equipped.robe = null;
              if (player.equipped.ring === itemId && !player.inventory.includes(itemId)) player.equipped.ring = null;

              if (window.AudioEngine) window.AudioEngine.playCoin();
              saveState();
              recalculateStats();
              updateHUD();
              if (window.DashboardEngine) window.DashboardEngine.updateDashboardUI();
              renderSellGrid();
            }
          };

          itemsGrid.appendChild(sellCard);
        });
      };

      renderSellGrid();
    } else {
      merchant.items.forEach(itemId => {
        const templateCard = Array.from(allShopCards).find(card => card.querySelector(`[data-item="${itemId}"]`));
        if (templateCard) {
          const clonedCard = templateCard.cloneNode(true);
          const buyBtn = clonedCard.querySelector('.buy-item-btn');
          if (buyBtn) {
            buyBtn.onclick = () => {
              const cost = costs[itemId];
              if (player.gold < cost) {
                if (window.AudioEngine) window.AudioEngine.playIncorrect();
                alert("Insufficient Gold! Answer more questions in battle to earn gold.");
                return;
              }
              if (itemId !== 'potion_hp' && itemId !== 'potion_mp' && player.inventory.includes(itemId)) {
                if (window.AudioEngine) window.AudioEngine.playIncorrect();
                alert("You already own this piece of gear!");
                return;
              }
              player.gold -= cost;
              player.inventory.push(itemId);
              if (window.AudioEngine) window.AudioEngine.playCoin();
              saveState();
              updateHUD();
              showItemAcquiredModal(itemId);
              if (window.DashboardEngine) window.DashboardEngine.updateDashboardUI();
            };
          }
          itemsGrid.appendChild(clonedCard);
        }
      });
    }

    modal.classList.remove('hidden');

    document.getElementById('close-merchant-modal-btn').onclick = () => {
      if (window.AudioEngine) window.AudioEngine.playClick();
      modal.classList.add('hidden');
      setTimeout(() => { window.activeMerchantId = null; }, 1000);
    };
  };

  const handleKeyDown = (e) => {
    if (e.key === 'w' || e.key === 'W' || e.key === 'ArrowUp') keys.up = true;
    if (e.key === 's' || e.key === 'S' || e.key === 'ArrowDown') keys.down = true;
    if (e.key === 'a' || e.key === 'A' || e.key === 'ArrowLeft') keys.left = true;
    if (e.key === 'd' || e.key === 'D' || e.key === 'ArrowRight') keys.right = true;
    if (e.key === ' ' || e.code === 'Space') {
      if (playerZ === 0) {
        playerVZ = 6.5;
        if (window.AudioEngine) window.AudioEngine.playClick();
      }
    }
    if (e.key === 'e' || e.key === 'E') {
      if (inMarket) {
        marketEntities.forEach(ent => {
          const dist = Math.hypot(playerX - ent.x, playerY - ent.y);
          if (dist < 48 && ent.id !== 'exit') {
            openMerchantShopModal(ent);
          }
        });
      }
    }
  };

  const handleKeyUp = (e) => {
    if (e.key === 'w' || e.key === 'W' || e.key === 'ArrowUp') keys.up = false;
    if (e.key === 's' || e.key === 'S' || e.key === 'ArrowDown') keys.down = false;
    if (e.key === 'a' || e.key === 'A' || e.key === 'ArrowLeft') keys.left = false;
    if (e.key === 'd' || e.key === 'D' || e.key === 'ArrowRight') keys.right = false;
  };

  const setupDpadEvents = () => {
    const directions = { up: 'dpad-up', down: 'dpad-down', left: 'dpad-left', right: 'dpad-right' };
    Object.keys(directions).forEach(dir => {
      const btn = document.getElementById(directions[dir]);
      if (btn) {
        const clone = btn.cloneNode(true);
        btn.parentNode.replaceChild(clone, btn);
        
        clone.addEventListener('mousedown', () => { keys[dir] = true; });
        clone.addEventListener('mouseup', () => { keys[dir] = false; });
        clone.addEventListener('mouseleave', () => { keys[dir] = false; });
        clone.addEventListener('touchstart', (e) => { e.preventDefault(); keys[dir] = true; });
        clone.addEventListener('touchend', (e) => { e.preventDefault(); keys[dir] = false; });
      }
    });
  };

  const startMapLoop = () => {
    stopMapLoop();
    const canvas = document.getElementById('adventure-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    setupDpadEvents();

    if (checkObstacleCollision(playerX, playerY, 15)) {
      playerX = 450;
      playerY = 120;
    }

    // Ensure all 12 minions are active and roaming the map
    if (!minions || minions.length < 12) {
      initAdventureMinions();
    }
    minions.forEach(m => {
      if (!inDungeon && player.defeatedBosses && player.defeatedBosses[m.subject]) {
        m.active = false;
      } else {
        m.active = true;
      }
    });

    // Initialize Three.js WebGL 3D Engine on dedicated adventure-canvas-3d
    const canvas3D = document.getElementById('adventure-canvas-3d');
    if (window.World3DEngine && window.THREE && canvas3D) {
      window.World3DEngine.init(canvas3D);
    }

    mapInterval = setInterval(() => {
      updateMapFrame(canvas, ctx);
    }, 1000 / 60);
  };

  const stopMapLoop = () => {
    if (mapInterval) {
      clearInterval(mapInterval);
      mapInterval = null;
    }
    window.removeEventListener('keydown', handleKeyDown);
    window.removeEventListener('keyup', handleKeyUp);
    keys = { up: false, down: false, left: false, right: false };
  };

  const updateMapFrame = (canvas, ctx) => {
    const is3DActive = !!(window.World3DEngine && window.THREE);
    // 1. Move player
    let dx = 0; let dy = 0;
    if (keys.up) dy = -6;
    if (keys.down) dy = 6;
    if (keys.left) { dx = -6; player.facing = 'left'; }
    if (keys.right) { dx = 6; player.facing = 'right'; }
    
    if (dx !== 0 && dy !== 0) {
      dx *= 0.7071;
      dy *= 0.7071;
    }
    
    const isMoving = dx !== 0 || dy !== 0;
    const pWalkFrame = Math.floor(Date.now() / 130) % 2;
    const bobY = isMoving ? (pWalkFrame === 0 ? -3 : 3) : Math.sin(Date.now() / 400) * 1.0;
    
    // Check independent axis movements for smooth sliding collisions (3600x1760 4x World Bounds)
    let nextX = playerX + dx;
    let nextY = playerY + dy;
    
    if (nextX < 40) nextX = 40;
    if (nextX > 3560) nextX = 3560;
    if (nextY < 40) nextY = 40;
    if (nextY > 1720) nextY = 1720;

    if (!checkObstacleCollision(nextX, playerY, 15)) {
      playerX = nextX;
    }
    if (!checkObstacleCollision(playerX, nextY, 15)) {
      playerY = nextY;
    }
    
    // 1b. 3D Jump Physics (Z-axis elevation & gravity)
    if (playerZ > 0 || playerVZ > 0) {
      playerZ += playerVZ;
      playerVZ -= 0.45; // Gravity pull down
      if (playerZ <= 0) {
        playerZ = 0;
        playerVZ = 0;
      }
    }
    
    // 2. Trail Particles update
    if (isMoving && Math.random() < 0.45) {
      particles.push({
        x: playerX + (Math.random() - 0.5) * 8,
        y: playerY + 12 + (Math.random() - 0.5) * 6,
        vx: (Math.random() - 0.5) * 1.2,
        vy: (Math.random() - 0.5) * 1.2,
        size: 3.5 + Math.random() * 3,
        alpha: 1,
        color: `hsla(${player.hue}, 95%, 60%, 0.75)`
      });
    }
    
    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy - 0.4;
      p.alpha -= 0.055;
      p.size *= 0.94;
    });
    particles = particles.filter(p => p.alpha > 0);
    
    if (!inMarket) {
      // 3. Move Minions in their respective 900x440 quadrants
      minions.forEach(m => {
        if (!m.active) return;
        if (!inDungeon && player.defeatedBosses && player.defeatedBosses[m.subject]) {
          m.active = false;
          return;
        }
        m.x += m.vx;
        m.y += m.vy;
        
        let minX = 20; let maxX = 1780; let minY = 20; let maxY = 860;
        if (m.subject === 'math') { minX = 50; maxX = 850; minY = 50; maxY = 390; }
        else if (m.subject === 'chem') { minX = 950; maxX = 1750; minY = 50; maxY = 390; }
        else if (m.subject === 'bio') { minX = 50; maxX = 850; minY = 490; maxY = 830; }
        else if (m.subject === 'phys') { minX = 950; maxX = 1750; minY = 490; maxY = 830; }
        
        if (m.x < minX || m.x > maxX) { m.vx = -m.vx; m.x = Math.max(minX, Math.min(maxX, m.x)); }
        if (m.y < minY || m.y > maxY) { m.vy = -m.vy; m.y = Math.max(minY, Math.min(maxY, m.y)); }
      });

      // 4. Collision check with minions
      for (let m of minions) {
        if (!m.active) continue;
        if (!inDungeon && player.defeatedBosses && player.defeatedBosses[m.subject]) {
          m.active = false;
          continue;
        }
        const dist = Math.hypot(playerX - m.x, playerY - m.y);
        if (dist < 25) {
          lastCollidedMinionId = m.id;
          player.subject = m.subject;
          stopMapLoop();
          
          if (window.AudioEngine) {
            window.AudioEngine.playClick();
            window.AudioEngine.stopBGM();
          }
          
          const pushAngle = Math.atan2(playerY - m.y, playerX - m.x);
          let targetX = playerX + Math.cos(pushAngle) * 35;
          let targetY = playerY + Math.sin(pushAngle) * 35;
          if (!checkObstacleCollision(targetX, targetY, 15)) {
            playerX = targetX;
            playerY = targetY;
          } else {
            const coords = getSpawnCoords(player.element);
            playerX = coords.x;
            playerY = coords.y;
          }
          
          window.BattleEngine.initBattle(player, m.subject, false, m.name, !!m.isSpecial);
          navigateToScreen('battle');
          return;
        }
      }

      // 5. Collision check with active Bosses
      for (let b of bosses) {
        const minionCount = player.minionsDefeated[b.subject] || 0;
        const active = minionCount >= 3 && !player.defeatedBosses[b.subject];
        if (!active) continue;
        
        const dist = Math.hypot(playerX - b.x, playerY - b.y);
        if (dist < 32) {
          player.subject = b.subject;
          stopMapLoop();
          
          if (window.AudioEngine) {
            window.AudioEngine.playClick();
            window.AudioEngine.stopBGM();
          }
          
          const pushAngle = Math.atan2(playerY - b.y, playerX - b.x);
          let targetBossX = playerX + Math.cos(pushAngle) * 40;
          let targetBossY = playerY + Math.sin(pushAngle) * 40;
          if (!checkObstacleCollision(targetBossX, targetBossY, 15)) {
            playerX = targetBossX;
            playerY = targetBossY;
          } else {
            const coords = getSpawnCoords(player.element);
            playerX = coords.x;
            playerY = coords.y;
          }
          
          window.HiggsfieldEngine.triggerBossIntro(b.subject, () => {
            window.BattleEngine.initBattle(player, b.subject, true);
            navigateToScreen('battle');
          });
          return;
        }
      }
    }

    // ----------------------------------------------------
    // 6. Dynamic Viewport Camera Tracking (Fixed 0,0 when in Market)
    // ----------------------------------------------------
    const viewW = canvas.width || 1150;
    const viewH = canvas.height || 560;
    const zoom = 1.85; // 50% FOV reduction (zooms in world 1.85x)

    const visibleWorldW = viewW / zoom;
    const visibleWorldH = viewH / zoom;

    let camX = 0;
    let camY = 0;
    if (!inMarket) {
      camX = Math.max(0, Math.min(WORLD_WIDTH - visibleWorldW, playerX - visibleWorldW / 2));
      camY = Math.max(0, Math.min(WORLD_HEIGHT - visibleWorldH, playerY - visibleWorldH / 2));
    }

    ctx.clearRect(0, 0, viewW, viewH);
    
    ctx.save();
    ctx.scale(zoom, zoom);
    ctx.translate(-camX, -camY);

    if (inMarket) {
      // ----------------------------------------------------
      // FIXED-FRAME MEDIEVAL MARKET REALM (620x300 - Fits 100% inside FOV)
      // ----------------------------------------------------
      if (marketBgImg.complete || marketBgImg.src) {
        ctx.drawImage(marketBgImg, 0, 0, 620, 300);
      } else {
        ctx.fillStyle = '#1c130b';
        ctx.fillRect(0, 0, 620, 300);
      }

      // Warm Ambient Market Lighting Overlay
      const mGlow = ctx.createRadialGradient(310, 150, 40, 310, 150, 320);
      mGlow.addColorStop(0, 'rgba(245, 158, 11, 0.15)');
      mGlow.addColorStop(1, 'rgba(2, 6, 23, 0.55)');
      ctx.fillStyle = mGlow;
      ctx.fillRect(0, 0, 620, 300);

      // Render Stationary Merchant Entities
      marketEntities.forEach(ent => {
        const dist = Math.hypot(playerX - ent.x, playerY - ent.y);

        ctx.save();
        ctx.translate(ent.x, ent.y);

        const pulse = Math.sin(Date.now() / 200 + ent.x) * 3;
        
        // Drop Shadow
        ctx.fillStyle = 'rgba(2, 6, 23, 0.6)';
        ctx.beginPath(); ctx.ellipse(0, 16, ent.radius * 0.8, 8, 0, 0, Math.PI * 2); ctx.fill();

        // Pulsing Ring
        ctx.fillStyle = ent.color + '33';
        ctx.beginPath(); ctx.arc(0, 0, ent.radius + pulse, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = ent.color;
        ctx.lineWidth = 2;
        ctx.stroke();

        // Merchant Wooden Counter/Stall Desk
        if (ent.id !== 'exit') {
          ctx.fillStyle = '#451a03';
          ctx.fillRect(-22, 8, 44, 12);
          ctx.strokeStyle = '#d97706';
          ctx.lineWidth = 1;
          ctx.strokeRect(-22, 8, 44, 12);
        }

        // Render 3D Higgsfield Merchant Portrait Sprite!
        const mImg = merchantSprites[ent.id];
        if (mImg && (mImg.complete || mImg.src)) {
          const tImg = getTransparentSprite(mImg);
          if (tImg) {
            ctx.save();
            ctx.beginPath();
            ctx.arc(0, -4, 18, 0, Math.PI * 2);
            ctx.clip();
            ctx.drawImage(tImg, -18, -22, 36, 36);
            ctx.restore();
          } else {
            ctx.font = '22px Outfit';
            ctx.textAlign = 'center';
            ctx.fillText(ent.avatar, 0, 4);
          }
        } else {
          ctx.font = '22px Outfit';
          ctx.textAlign = 'center';
          ctx.fillText(ent.avatar, 0, 4);
        }

        // Merchant Name Tag
        ctx.font = 'bold 10px Outfit';
        ctx.fillStyle = '#fef3c7';
        ctx.fillText(ent.name, 0, -24);

        // Hovering Tooltip when nearby!
        if (dist < 42) {
          ctx.fillStyle = '#f59e0b';
          ctx.font = 'bold 10px Outfit';
          ctx.fillText(ent.id === 'exit' ? '🚪 Touch to Leave' : '✨ Press E or Touch to Shop', 0, 36);
        }

        ctx.restore();

        // Interaction Collision
        if (dist < 32) {
          if (ent.id === 'exit') {
            inMarket = false;
            playerX = marketReturnCoords.x;
            playerY = marketReturnCoords.y;
            if (window.AudioEngine) window.AudioEngine.playSparkle();
          } else if (!window.activeMerchantId || window.activeMerchantId !== ent.id) {
            openMerchantShopModal(ent);
          }
        }
      });
    } else if (!inDungeon) {
      // ----------------------------------------------------
      // SURFACE WORLD MAP (3600x1760 Playable Terrain)
      // ----------------------------------------------------
      if (shatteredContinentBgImg && shatteredContinentBgImg.complete && shatteredContinentBgImg.naturalWidth !== 0) {
        ctx.drawImage(shatteredContinentBgImg, 0, 0, 3600, 1760);
      } else {
        const drawBiomeGround = (img, x, y, w, h, fallbackCol) => {
          if (img && img.complete && img.naturalWidth !== 0) {
            ctx.drawImage(img, x, y, w, h);
            ctx.fillStyle = 'rgba(2, 6, 23, 0.35)'; // Vignette overlay
            ctx.fillRect(x, y, w, h);
          } else {
            ctx.fillStyle = fallbackCol;
            ctx.fillRect(x, y, w, h);
          }
        };
        drawBiomeGround(biomeBgImages.math, 0, 0, 1800, 880, '#022c22');
        drawBiomeGround(biomeBgImages.chem, 1800, 0, 1800, 880, '#1c1917');
        drawBiomeGround(biomeBgImages.bio, 0, 880, 1800, 880, '#172554');
        drawBiomeGround(biomeBgImages.phys, 1800, 880, 1800, 880, '#310413');
      }

      // Outer Perimeter Impassable Cliff Border Outline
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.85)';
      ctx.lineWidth = 14;
      ctx.strokeRect(7, 7, 3586, 1746);
      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 6;
      ctx.strokeRect(3, 3, 3594, 1754);

      // 2D Chasm Rifts
      const chasmPulse = Math.sin(Date.now() / 250) * 3.5;
      const riftGradV = ctx.createLinearGradient(1760, 0, 1840, 0);
      riftGradV.addColorStop(0, 'rgba(56, 189, 248, 0.12)');
      riftGradV.addColorStop(0.5, `rgba(56, 189, 248, ${0.45 + (chasmPulse / 20)})`);
      riftGradV.addColorStop(1, 'rgba(56, 189, 248, 0.12)');
      ctx.fillStyle = riftGradV;
      ctx.fillRect(1770, 0, 60, 1760);

      const riftGradH = ctx.createLinearGradient(0, 840, 0, 920);
      riftGradH.addColorStop(0, 'rgba(56, 189, 248, 0.12)');
      riftGradH.addColorStop(0.5, `rgba(56, 189, 248, ${0.45 + (chasmPulse / 20)})`);
      riftGradH.addColorStop(1, 'rgba(56, 189, 248, 0.12)');
      ctx.fillStyle = riftGradH;
      ctx.fillRect(0, 850, 3600, 60);

      // Central Crossroads Bridge
      ctx.fillStyle = '#334155';
      ctx.fillRect(1730, 810, 140, 140);
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 3;
      ctx.strokeRect(1730, 810, 140, 140);

      // Draw Mineshaft Entrance Portals in the 4 Biomes
      dungeonPortals.forEach(dp => {
        ctx.save();
        const pulse = Math.sin(Date.now() / 180) * 3.5;
        
        // Swirling mineshaft portal aura
        const dGrad = ctx.createRadialGradient(dp.x, dp.y, 5, dp.x, dp.y, 30 + pulse);
        dGrad.addColorStop(0, '#ffffff');
        dGrad.addColorStop(0.5, dp.color);
        dGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = dGrad;
        ctx.beginPath(); ctx.arc(dp.x, dp.y, 30 + pulse, 0, Math.PI * 2); ctx.fill();

        // Mineshaft Sprite Graphic
        if (mineshaftSprite && mineshaftSprite.complete && mineshaftSprite.naturalWidth !== 0) {
          ctx.save();
          ctx.beginPath(); ctx.arc(dp.x, dp.y, 22, 0, Math.PI * 2); ctx.clip();
          ctx.drawImage(mineshaftSprite, dp.x - 22, dp.y - 22, 44, 44);
          ctx.restore();
        } else {
          ctx.font = '22px Outfit';
          ctx.textAlign = 'center';
          ctx.fillText('⛏️', dp.x, dp.y + 7);
        }

        ctx.strokeStyle = dp.color;
        ctx.lineWidth = 2.5;
        ctx.beginPath(); ctx.arc(dp.x, dp.y, 22, 0, Math.PI * 2); ctx.stroke();

        ctx.restore();

        ctx.font = 'bold 9px Outfit';
        ctx.fillStyle = dp.color;
        ctx.textAlign = 'center';
        ctx.fillText(dp.name, dp.x, dp.y - 32);

        // Check Mineshaft Entrance Collision
        const dist = Math.hypot(playerX - dp.x, playerY - dp.y);
        if (dist < 32) {
          inDungeon = true;
          activeDungeonId = dp.id;
          surfaceReturnCoords = { x: dp.x, y: dp.y + 45 }; // Record position right outside this entrance!
          playerX = 900;
          playerY = 650;
          initDungeonMinions(dp.id);
          if (window.AudioEngine) window.AudioEngine.playSparkle();
        }
      });

      // Environment Obstacles Drawing with Organic Shapes & Textures (No Glowing Outlines, No Flat Boxes)
      obstacles.forEach(obs => {
        const img = obsSprites[obs.label];
        
        ctx.save();
        
        // Define organic non-rectangular shape clip paths
        ctx.beginPath();
        if (obs.label === 'peaks') {
          // Jagged Mountain Rock Cluster
          ctx.moveTo(obs.x + obs.w * 0.08, obs.y + obs.h);
          ctx.lineTo(obs.x + obs.w * 0.22, obs.y + obs.h * 0.12);
          ctx.lineTo(obs.x + obs.w * 0.42, obs.y + obs.h * 0.55);
          ctx.lineTo(obs.x + obs.w * 0.65, obs.y + obs.h * 0.08);
          ctx.lineTo(obs.x + obs.w * 0.88, obs.y + obs.h * 0.68);
          ctx.lineTo(obs.x + obs.w, obs.y + obs.h);
          ctx.closePath();
        } else if (obs.label === 'ruins') {
          // Round Hexagonal Stone Fortress Ruins
          ctx.ellipse(obs.x + obs.w/2, obs.y + obs.h/2, obs.w/2, obs.h/2, 0, 0, Math.PI * 2);
        } else if (obs.label === 'swamp') {
          // Smooth Curved Mangrove Boulder Canopy
          ctx.moveTo(obs.x + 16, obs.y);
          ctx.quadraticCurveTo(obs.x + obs.w/2, obs.y - 10, obs.x + obs.w - 16, obs.y);
          ctx.quadraticCurveTo(obs.x + obs.w + 10, obs.y + obs.h/2, obs.x + obs.w - 16, obs.y + obs.h);
          ctx.quadraticCurveTo(obs.x + obs.w/2, obs.y + obs.h + 10, obs.x + 16, obs.y + obs.h);
          ctx.quadraticCurveTo(obs.x - 10, obs.y + obs.h/2, obs.x + 16, obs.y);
          ctx.closePath();
        } else {
          // Angular Power Monolith Monoliths (dynamo)
          ctx.moveTo(obs.x + obs.w * 0.18, obs.y);
          ctx.lineTo(obs.x + obs.w * 0.82, obs.y);
          ctx.lineTo(obs.x + obs.w, obs.y + obs.h * 0.45);
          ctx.lineTo(obs.x + obs.w * 0.82, obs.y + obs.h);
          ctx.lineTo(obs.x + obs.w * 0.18, obs.y + obs.h);
          ctx.lineTo(obs.x, obs.y + obs.h * 0.55);
          ctx.closePath();
        }

        // Ground Drop Shadow
        ctx.fillStyle = 'rgba(2, 6, 23, 0.55)';
        ctx.fill();

        ctx.clip(); // Clip rich texture to organic shape silhouette

        if (img && img.complete && img.naturalWidth !== 0) {
          ctx.drawImage(img, obs.x, obs.y, obs.w, obs.h);
        } else {
          ctx.fillStyle = 'rgba(15, 23, 42, 0.94)';
          ctx.fillRect(obs.x, obs.y, obs.w, obs.h);
        }
        
        // Inner shadow vignette for depth
        ctx.fillStyle = 'rgba(2, 6, 23, 0.22)';
        ctx.fillRect(obs.x, obs.y, obs.w, obs.h);

        ctx.restore();

        // X-Ray Occlusion Highlight (Diablo & Don't Starve style: player silhouetted glow behind 3D structures)
        if (playerY + 12 < obs.y + obs.h && playerX >= obs.x - 20 && playerX <= obs.x + obs.w + 20 && playerY >= obs.y - (obs.height || 60)) {
          ctx.save();
          ctx.globalAlpha = 0.60;
          ctx.font = 'bold 24px Outfit';
          ctx.textAlign = 'center';
          ctx.fillStyle = '#38bdf8';
          ctx.shadowColor = '#0284c7';
          ctx.shadowBlur = 14;
          ctx.fillText('🧙‍♂️', playerX, playerY + bobY - playerZ + 8);
          ctx.restore();
        }
      });

      // Central Core Obelisk Monument at (1800, 880)
      const pulse = 55 + Math.sin(Date.now() / 200) * 5;
      const coreGrad = ctx.createRadialGradient(1800, 880, 5, 1800, 880, pulse);
      coreGrad.addColorStop(0, '#ffffff');
      coreGrad.addColorStop(0.3, '#a855f7');
      coreGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = coreGrad;
      ctx.beginPath(); ctx.arc(1800, 880, pulse, 0, Math.PI * 2); ctx.fill();
      
      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 13px Outfit';
      ctx.textAlign = 'center';
      ctx.fillText('⚡ Aether Core', 1800, 884);

    } else {
      // ----------------------------------------------------
      // SUBTERRANEAN STONE DUNGEON WORLD (1800x880)
      // ----------------------------------------------------
      if (dungeonBgImg && dungeonBgImg.complete && dungeonBgImg.naturalWidth !== 0) {
        ctx.drawImage(dungeonBgImg, 0, 0, 1800, 880);
        ctx.fillStyle = 'rgba(2, 6, 23, 0.45)';
        ctx.fillRect(0, 0, 1800, 880);
      } else {
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, 1800, 880);
      }

      // Dungeon Grid lines
      ctx.strokeStyle = 'rgba(234, 88, 12, 0.06)';
      ctx.lineWidth = 1;
      for (let i = 0; i < 1800; i += 60) {
        ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, 880); ctx.stroke();
      }
      for (let j = 0; j < 880; j += 60) {
        ctx.beginPath(); ctx.moveTo(0, j); ctx.lineTo(1800, j); ctx.stroke();
      }

      // Torch Sconces Ambient Light Effects
      const torches = [
        { x: 300, y: 150 }, { x: 900, y: 150 }, { x: 1500, y: 150 },
        { x: 300, y: 750 }, { x: 900, y: 750 }, { x: 1500, y: 750 }
      ];
      torches.forEach(t => {
        const tFlicker = Math.sin(Date.now() / 80 + t.x) * 4;
        const tGrad = ctx.createRadialGradient(t.x, t.y, 2, t.x, t.y, 45 + tFlicker);
        tGrad.addColorStop(0, 'rgba(251, 146, 60, 0.5)');
        tGrad.addColorStop(0.5, 'rgba(234, 88, 12, 0.2)');
        tGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = tGrad;
        ctx.beginPath(); ctx.arc(t.x, t.y, 45 + tFlicker, 0, Math.PI * 2); ctx.fill();
      });

      // Distinct Dungeon Title Banner
      const dungeonNames = {
        dungeon_math: '⛏️ SUBTERRANEAN MATH CATACOMBS MINESHAFT',
        dungeon_chem: '⛏️ VOLCANIC CHEMICAL MINESHAFT DUNGEON',
        dungeon_bio: '⛏️ BIOLUMINESCENT ABYSS MINESHAFT',
        dungeon_phys: '⛏️ QUANTUM SPACETIME MINESHAFT VAULT'
      };
      const curDungeonTitle = dungeonNames[activeDungeonId] || '⛏️ SUBTERRANEAN STONE MINESHAFT';

      ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
      ctx.fillRect(680, 20, 440, 32);
      ctx.strokeStyle = '#ea580c';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(680, 20, 440, 32);
      ctx.font = 'bold 11px Outfit';
      ctx.fillStyle = '#fdba74';
      ctx.textAlign = 'center';
      ctx.fillText(curDungeonTitle, 900, 40);

      // Mineshaft Exit Surface Portal at (900, 440)
      const exPulse = Math.sin(Date.now() / 150) * 4;
      const exGrad = ctx.createRadialGradient(900, 440, 5, 900, 440, 32 + exPulse);
      exGrad.addColorStop(0, '#ffffff');
      exGrad.addColorStop(0.5, '#38bdf8');
      exGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = exGrad;
      ctx.beginPath(); ctx.arc(900, 440, 32 + exPulse, 0, Math.PI * 2); ctx.fill();

      // Mineshaft Sprite Graphic for Exit
      if (mineshaftSprite && mineshaftSprite.complete && mineshaftSprite.naturalWidth !== 0) {
        ctx.save();
        ctx.beginPath(); ctx.arc(900, 440, 22, 0, Math.PI * 2); ctx.clip();
        ctx.drawImage(mineshaftSprite, 878, 418, 44, 44);
        ctx.restore();
      } else {
        ctx.font = '22px Outfit'; ctx.textAlign = 'center'; ctx.fillText('⛏️', 900, 447);
      }

      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.arc(900, 440, 22, 0, Math.PI * 2); ctx.stroke();

      ctx.font = 'bold 10px Outfit'; ctx.fillStyle = '#38bdf8'; ctx.fillText('⬆️ EXIT MINESHAFT TO SURFACE', 900, 396);

      // Check Exit Portal Collision (returns RIGHT OUTSIDE the entrance used!)
      const exDist = Math.hypot(playerX - 900, playerY - 440);
      if (exDist < 30) {
        inDungeon = false;
        playerX = surfaceReturnCoords.x;
        playerY = surfaceReturnCoords.y; // Teleports RIGHT OUTSIDE the exact entrance!
        activeDungeonId = null;
        initAdventureMinions();
        if (window.AudioEngine) window.AudioEngine.playSparkle();
      }

      // Render & Process Subterranean Treasure Chests
      activeDungeonChests.forEach(chest => {
        const dist = Math.hypot(playerX - chest.x, playerY - chest.y);
        ctx.save();
        ctx.translate(chest.x, chest.y);

        // Ground Drop Shadow
        ctx.fillStyle = 'rgba(2, 6, 23, 0.6)';
        ctx.beginPath();
        ctx.ellipse(0, 14, 18, 8, 0, 0, Math.PI * 2);
        ctx.fill();

        if (!chest.opened) {
          // Unopened Glowing Gold Treasure Chest
          const pulse = Math.sin(Date.now() / 180 + chest.x) * 3;
          const cGlow = ctx.createRadialGradient(0, 0, 4, 0, 0, 26 + pulse);
          cGlow.addColorStop(0, 'rgba(251, 191, 36, 0.55)');
          cGlow.addColorStop(1, 'transparent');
          ctx.fillStyle = cGlow;
          ctx.beginPath(); ctx.arc(0, 0, 26 + pulse, 0, Math.PI * 2); ctx.fill();

          // Render Higgsfield 3D Closed Treasure Chest Sprite!
          const cImg = chestSprites.closed;
          if (cImg && (cImg.complete || cImg.src)) {
            const tImg = getTransparentSprite(cImg);
            if (tImg) {
              ctx.save();
              ctx.beginPath();
              ctx.arc(0, -2, 20, 0, Math.PI * 2);
              ctx.clip();
              ctx.drawImage(tImg, -20, -22, 40, 40);
              ctx.restore();
            } else {
              ctx.font = '26px Outfit'; ctx.textAlign = 'center'; ctx.fillText('🎁', 0, 6);
            }
          } else {
            ctx.font = '26px Outfit'; ctx.textAlign = 'center'; ctx.fillText('🎁', 0, 6);
          }

          // Nearby Tooltip
          if (dist < 45) {
            ctx.fillStyle = '#fbbf24';
            ctx.font = 'bold 10px Outfit';
            ctx.fillText('✨ Touch to Open Chest (2-20 Coins + Items)', 0, -22);
          }

          // Open Collision
          if (dist < 28) {
            chest.opened = true;

            // Save opened chests state
            try {
              let savedState = {};
              const saved = localStorage.getItem('knowledge_quest_chests');
              if (saved) savedState = JSON.parse(saved);
              savedState[chest.id] = true;
              localStorage.setItem('knowledge_quest_chests', JSON.stringify(savedState));
            } catch (e) {}

            // Reward: 2-20 Gold Coins
            const goldCoins = Math.floor(Math.random() * 19) + 2;
            player.gold += goldCoins;

            // 35% Chance to Drop an Item
            const itemPool = ['potion_hp', 'potion_mp', 'wand_apprentice', 'staff_archmage', 'robe_aether', 'ring_quantum'];
            let bonusItem = null;
            if (Math.random() < 0.35) {
              bonusItem = itemPool[Math.floor(Math.random() * itemPool.length)];
              player.inventory.push(bonusItem);
            }

            if (window.AudioEngine) {
              window.AudioEngine.playSparkle();
              window.AudioEngine.playCoin();
            }

            saveState();
            updateHUD();
            if (window.DashboardEngine) window.DashboardEngine.updateDashboardUI();
            showChestLootModal(goldCoins, bonusItem);
          }
        } else {
          // Render Higgsfield 3D Opened Treasure Chest Sprite!
          const oImg = chestSprites.open;
          if (oImg && (oImg.complete || oImg.src)) {
            const tImg = getTransparentSprite(oImg);
            if (tImg) {
              ctx.save();
              ctx.globalAlpha = 0.65;
              ctx.beginPath();
              ctx.arc(0, -2, 18, 0, Math.PI * 2);
              ctx.clip();
              ctx.drawImage(tImg, -18, -20, 36, 36);
              ctx.restore();
            } else {
              ctx.font = '22px Outfit'; ctx.textAlign = 'center'; ctx.globalAlpha = 0.55; ctx.fillText('📭', 0, 6);
            }
          } else {
            ctx.font = '22px Outfit'; ctx.textAlign = 'center'; ctx.globalAlpha = 0.55; ctx.fillText('📭', 0, 6);
          }
        }

        ctx.restore();
      });
    }

    // Draw particle sparkles
    particles.forEach(p => {
      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    if (!inMarket) {
      // Draw Boss Portals & 2-Frame Animated Walking Boss Sprites (Transparent PNG, No Box, No Feet)
      bosses.forEach(b => {
        const minionCount = player.minionsDefeated[b.subject] || 0;
        const active = minionCount >= 3 && !player.defeatedBosses[b.subject];
        const cleared = player.defeatedBosses[b.subject];
        
        if (active) {
          const walkFrame = Math.floor(Date.now() / 150) % 2;
          const bBobY = Math.sin(Date.now() / 150) * 4;
          const bStrideTilt = walkFrame === 0 ? -0.09 : 0.09;

          ctx.save();
          ctx.translate(b.x, b.y + bBobY);
          ctx.rotate(bStrideTilt);
          ctx.scale(walkFrame === 0 ? 1.05 : 0.95, walkFrame === 0 ? 0.95 : 1.05);

          // Ground drop shadow
          ctx.fillStyle = 'rgba(2, 6, 23, 0.55)';
          ctx.beginPath(); ctx.ellipse(0, 18 - bBobY, 20, 8, 0, 0, Math.PI * 2); ctx.fill();

          // Boss Sprite Image (Chroma-keyed transparent sprite)
          const bImgRaw = bossSprites[b.subject];
          const bImg = getTransparentSprite(bImgRaw);
          if (bImg && (bImg.complete || bImg.src)) {
            ctx.drawImage(bImg, -22, -22, 44, 44);
          } else {
            ctx.font = '24px Outfit';
            ctx.textAlign = 'center';
            ctx.fillText(b.emoji, 0, 8);
          }

          ctx.restore();
          
          ctx.font = 'bold 9px Outfit';
          ctx.fillStyle = '#ef4444';
          ctx.textAlign = 'center';
          ctx.fillText('⚠️ BOSS ENCOUNTER', b.x, b.y - 34);
        } else if (cleared) {
          ctx.font = '14px Outfit';
          ctx.textAlign = 'center';
          ctx.fillText('✅ CLEARED', b.x, b.y + 5);
        }
      });

      // Draw Minions with 2-Frame Stepping Walk Animations (Transparent PNG, No Box, No Feet)
      minions.forEach((m, idx) => {
        if (!m.active) return;
        if (!inDungeon && player.defeatedBosses && player.defeatedBosses[m.subject]) {
          m.active = false;
          return;
        }

        const walkFrame = Math.floor((Date.now() + idx * 200) / 140) % 2;
        const mBobY = Math.sin(Date.now() / 110 + idx * 1.5) * 3.5;
        const mStrideTilt = walkFrame === 0 ? -0.10 : 0.10;

        ctx.save();
        ctx.translate(m.x, m.y + mBobY);
        ctx.rotate(mStrideTilt);
        ctx.scale(walkFrame === 0 ? 1.06 : 0.94, walkFrame === 0 ? 0.94 : 1.06);

        // Ground Drop Shadow
        ctx.fillStyle = 'rgba(2, 6, 23, 0.5)';
        ctx.beginPath(); ctx.ellipse(0, 14 - mBobY, 13, 5, 0, 0, Math.PI * 2); ctx.fill();

        // Minion Sprite Image (Chroma-keyed transparent sprite matching exact battle monster)
        let imgRaw = minionSprites[m.name] || (m.sprite ? m.sprite : minionSprites[m.subject]);
        const img = getTransparentSprite(imgRaw);
        if (img && (img.complete || img.src)) {
          ctx.drawImage(img, -16, -16, 32, 32);
        } else {
          ctx.font = '18px Outfit';
          ctx.textAlign = 'center';
          ctx.fillText(m.emoji, 0, 6);
        }

        if (m.isSpecial) {
          ctx.save();
          const starPulse = Math.sin(Date.now() / 150 + m.x) * 2;
          ctx.font = 'bold 12px Outfit';
          ctx.textAlign = 'center';
          ctx.fillStyle = '#fbbf24';
          ctx.shadowColor = '#f59e0b';
          ctx.shadowBlur = 8;
          ctx.fillText('⭐', 14, -14 + starPulse);
          ctx.restore();
        }

        ctx.restore();
      });
    }

    // Player 2-Frame Stepping Walk Animation with Directional Mirroring (Left vs Right)
    // (bobY and pWalkFrame are calculated at top of updateMapFrame)

    // Player Ground Floor Drop Shadow & Sprite
    ctx.save();
    const shadowScale = Math.max(0.4, 1 - (playerZ / 100));
    ctx.fillStyle = 'rgba(2, 6, 23, 0.55)';
    ctx.beginPath();
    ctx.ellipse(playerX, playerY + 18, 16 * shadowScale, 6 * shadowScale, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.translate(playerX, playerY + bobY - playerZ);

    // Directional Mirroring: Flip horizontally when facing Left so character faces left cleanly!
    if (player.facing === 'left') {
      ctx.scale(-1, 1);
    }

    // 2-Frame Alternating Stride Tilt & Stride Stretch (Left foot vs Right foot step)
    if (isMoving) {
      const strideTilt = pWalkFrame === 0 ? -0.12 : 0.12;
      ctx.rotate(strideTilt);
      ctx.scale(pWalkFrame === 0 ? 1.08 : 0.92, pWalkFrame === 0 ? 0.92 : 1.08);
    }

    // Player Ground Drop Shadow
    ctx.fillStyle = 'rgba(2, 6, 23, 0.55)';
    ctx.beginPath(); ctx.ellipse(0, 18 - bobY, 16, 6, 0, 0, Math.PI * 2); ctx.fill();

    // Draw Player Avatar Sprite Image
    const pImgRaw = playerSprites[player.avatar] || playerSprites.boy;
    const pImg = getTransparentSprite(pImgRaw);
    if (pImg && (pImg.complete || pImg.src)) {
      ctx.drawImage(pImg, -20, -20, 40, 40);
    } else {
      const avatars = { boy: '🧑‍🎤', girl: '🧝‍♀️', cyber: '🧑‍💻', celestial: '🧙‍♂️' };
      const playerEmoji = avatars[player.avatar] || '🧙‍♂️';
      ctx.font = '22px Outfit';
      ctx.textAlign = 'center';
      ctx.fillText(playerEmoji, 0, 7);
    }
    
    // Draw staff indicator if active
    if (player.equipped.staff) {
      const staffIcon = player.equipped.staff === 'wand_apprentice' ? '🪄' : '🔮';
      ctx.font = '12px Outfit';
      ctx.textAlign = 'center';
      ctx.fillText(staffIcon, 14, 14);
    }
    
    ctx.restore();

    // Player floating Name tag static above bobbing
    ctx.font = 'bold 11px Outfit';
    ctx.fillStyle = '#f8fafc';
    ctx.textAlign = 'center';
    ctx.fillText(player.name || 'Wizard', playerX, playerY - 24);

    // Render Active Captured Ally Sprite (Top-Right, Transparent PNG, No Square Box, No Feet)
    if (player.activePet) {
      const trailX = playerX + 24;
      const trailY = playerY - 18;

      const petWalkFrame = Math.floor(Date.now() / 150) % 2;
      const petBobY = Math.sin(Date.now() / 150) * 2.5;
      const petSway = petWalkFrame === 0 ? -0.08 : 0.08;

      ctx.save();
      ctx.translate(trailX, trailY + petBobY);
      ctx.rotate(petSway);
      ctx.scale(petWalkFrame === 0 ? 1.06 : 0.94, petWalkFrame === 0 ? 0.94 : 1.06);

      // Ally Ground Drop Shadow
      ctx.fillStyle = 'rgba(2, 6, 23, 0.45)';
      ctx.beginPath(); ctx.ellipse(0, 13 - petBobY, 11, 4.5, 0, 0, Math.PI * 2); ctx.fill();

      // Ally Sprite Image (Chroma-keyed transparent sprite)
      const allySrc = getPetSpriteSrc(player.activePet);
      const allyImg = getTransparentSprite(allySrc);
      if (allyImg && (allyImg.complete || allyImg.src)) {
        ctx.drawImage(allyImg, -13, -13, 26, 26);
      } else {
        ctx.font = '14px Outfit';
        ctx.textAlign = 'center';
        ctx.fillText(player.activePet.emoji || '🐾', 0, 4);
      }

      ctx.restore();

      // Floating Ally Name Tag
      ctx.font = 'bold 9px Outfit';
      ctx.fillStyle = '#4ade80';
      ctx.textAlign = 'center';
      ctx.fillText(`🐾 ${player.activePet.name}`, trailX, trailY - 18);
    }

    // End World Coordinate Camera Translation
    ctx.restore();

    // ----------------------------------------------------
    // FIXED SCREEN HUD: Radar Minimap (Top Right of Expanded Viewport)
    // ----------------------------------------------------
    ctx.save();
    const mmW = 135; const mmH = 68;
    const mmX = viewW - mmW - 16; const mmY = 14;
    
    ctx.fillStyle = 'rgba(2, 6, 23, 0.88)';
    ctx.strokeStyle = 'rgba(168, 85, 247, 0.55)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(mmX, mmY, mmW, mmH, 8);
    ctx.fill(); ctx.stroke();

    // Biome dividers in minimap
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(mmX + mmW/2, mmY); ctx.lineTo(mmX + mmW/2, mmY + mmH); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(mmX, mmY + mmH/2); ctx.lineTo(mmX + mmW, mmY + mmH/2); ctx.stroke();

    // Radar scan beam effect
    const scanX = mmX + (Date.now() / 15) % mmW;
    ctx.fillStyle = 'rgba(168, 85, 247, 0.2)';
    ctx.fillRect(scanX, mmY, 3, mmH);

    // Player location dot
    const pMmX = mmX + (playerX / WORLD_WIDTH) * mmW;
    const pMmY = mmY + (playerY / WORLD_HEIGHT) * mmH;
    ctx.fillStyle = '#ef4444';
    ctx.beginPath(); ctx.arc(pMmX, pMmY, 3.5, 0, Math.PI * 2); ctx.fill();

    // Boss locations dots
    bosses.forEach(b => {
      const bMmX = mmX + (b.x / WORLD_WIDTH) * mmW;
      const bMmY = mmY + (b.y / WORLD_HEIGHT) * mmH;
      ctx.fillStyle = '#a855f7';
      ctx.beginPath(); ctx.arc(bMmX, bMmY, 2.5, 0, Math.PI * 2); ctx.fill();
    });

    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 8px Outfit';
    ctx.textAlign = 'left';
    ctx.restore();

    // 3D WebGL Engine Synchronization & Render Loop
    if (window.World3DEngine) {
      window.World3DEngine.updatePlayer(playerX, playerY, playerZ, player.facing);
      window.World3DEngine.render();
    }
  };

  const triggerStoryIntro = () => {
    const modal = document.getElementById('story-modal');
    modal.classList.remove('hidden');
    
    document.getElementById('story-close-btn').onclick = () => {
      if (window.AudioEngine) window.AudioEngine.playClick();
      modal.classList.add('hidden');
      player.storySeen = true;
      saveState();
    };
  };

  const recalculateStats = () => {
    // Reset to elemental bases
    let baseHp = 100;
    let baseMp = 40;

    if (player.element === 'water') {
      baseHp = 110; baseMp = 50;
    } else if (player.element === 'earth') {
      baseHp = 120; baseMp = 35;
    } else if (player.element === 'air') {
      baseHp = 95; baseMp = 60;
    }

    // Apply robes HP
    if (player.equipped.robe === 'robe_aether') {
      baseHp += gearStats.robe_aether.val;
    }

    // Apply ring MP
    if (player.equipped.ring === 'ring_quantum') {
      baseMp += gearStats.ring_quantum.val;
    }

    // Obsidian Golem Ally Fortress Armor Buff (+40 Max HP)
    if (player.activePet && (player.activePet.name === 'Obsidian Golem' || (player.activePet.name && player.activePet.name.includes('Obsidian Golem')))) {
      baseHp += 40;
    }

    // Special Dungeon Monster Active Companion Buff: +10% Max Player Health!
    if (player.activePet && (player.activePet.isSpecial || (player.activePet.name && player.activePet.name.includes('⭐')))) {
      baseHp = Math.round(baseHp * 1.10);
    }

    player.hpMax = baseHp;
    player.mpMax = baseMp;
    player.hp = Math.min(player.hp, player.hpMax);
    player.mp = Math.min(player.mp, player.mpMax);
  };

  const navigateToScreen = (screenId) => {
    if (screenId === 'shop') {
      if (!inMarket) {
        marketReturnCoords = { x: playerX, y: playerY };
      }
      inMarket = true;
      inDungeon = false;
      playerX = 310;
      playerY = 160;
      screenId = 'map';
    } else if (screenId === 'map') {
      if (inMarket) {
        inMarket = false;
        playerX = marketReturnCoords.x || 450;
        playerY = marketReturnCoords.y || 220;
      }
    }

    const screens = document.querySelectorAll('.screen');
    screens.forEach(s => {
      s.classList.add('hidden');
      s.classList.remove('active');
    });

    const target = document.getElementById(`screen-${screenId}`);
    if (target) {
      target.classList.remove('hidden');
      target.classList.add('active');
    }

    const hud = document.getElementById('game-hud');
    if (screenId === 'auth') {
      hud.classList.add('hidden');
      stopMapLoop();
    } else {
      hud.classList.remove('hidden');
      
      const navButtons = document.querySelectorAll('.hud-nav button');
      navButtons.forEach(btn => btn.classList.remove('active'));
      
      const activeBtn = document.getElementById(`nav-${screenId === 'map' && inMarket ? 'shop' : screenId}`);
      if (activeBtn) activeBtn.classList.add('active');
    }

    if (screenId === 'dashboard') {
      stopMapLoop();
      window.DashboardEngine.updateDashboardUI();
    } else if (screenId === 'allies') {
      stopMapLoop();
      renderAlliesList();
    } else if (screenId === 'pvp') {
      stopMapLoop();
      if (window.PVPEngine && window.PVPEngine.init) {
        window.PVPEngine.init();
      }
    } else if (screenId === 'lab') {
      stopMapLoop();
      if (window.TrainingEngine) {
        window.TrainingEngine.renderTrainingScreen();
      } else {
        renderMagicTrainingUI('chem');
      }
    } else if (screenId === 'map') {
      startMapLoop();
      updateMapProgression();
      if (window.AudioEngine) window.AudioEngine.startBGM();
    } else {
      stopMapLoop();
    }
  };

  const trainingData = {
    chem: {
      title: "🔥 Chemistry & Reaction Mechanics (Fire Spells)",
      subtitle: "Learn how chemical reactions release or absorb energy to power Exothermic Fire Spells!",
      bg: "assets/biome_bg_chem.jpg",
      color: "#ef4444",
      concepts: [
        {
          heading: "1. Exothermic vs Endothermic Reactions",
          body: "<strong>Exothermic Reactions</strong> release heat/energy into surroundings (e.g. fire, combustion, explosion). Solution temperature <em>increases</em>.<br><strong>Endothermic Reactions</strong> absorb heat/energy from surroundings (e.g. photosynthesis, melting ice). Solution temperature <em>drops</em>."
        },
        {
          heading: "2. Physical vs Chemical Changes",
          body: "<strong>Chemical Change:</strong> Forms NEW chemical bonds and substances (e.g. wood burning into ash, iron rusting, gas bubbling).<br><strong>Physical Change:</strong> Alters shape/state without making new chemical substances (e.g. ice melting to water, tearing paper)."
        }
      ],
      workedExample: {
        question: "When wood burns in a campfire releasing intense heat and ash, what type of reaction occurred?",
        steps: [
          "Step 1: Identify energy flow → Heat and light are released.",
          "Step 2: Apply rule → Releasing heat = Exothermic Reaction.",
          "Step 3: Check matter → Wood converts into new chemical ash = Chemical Change.",
          "Conclusion: Exothermic Chemical Reaction!"
        ]
      },
      quiz: {
        q: "A chemical reaction absorbs heat from its container causing the liquid to cool down from 24°C to 16°C. What type of reaction is this?",
        choices: [
          "A) Exothermic Reaction (Releases Heat)",
          "B) Endothermic Reaction (Absorbs Heat)",
          "C) Nuclear Fusion Reaction",
          "D) Simple Physical Displacement"
        ],
        correct: 1,
        exp: "Correct! Endothermic reactions absorb thermal energy from surroundings, causing the temperature to drop!"
      }
    },
    math: {
      title: "💧 Mathematics & Geometry Formulas (Water Spells)",
      subtitle: "Master proportions, percentages, and area calculations to calculate precise Water Spells!",
      bg: "assets/biome_bg_math.jpg",
      color: "#3b82f6",
      concepts: [
        {
          heading: "1. Area of Geometric Shapes",
          body: "<strong>Rectangle:</strong> A = length × width<br><strong>Triangle:</strong> A = (1/2) × base × height<br><strong>Circle:</strong> A = π × r²"
        },
        {
          heading: "2. Percentages & Ratios",
          body: "To find a percentage of a number, convert percent to decimal and multiply:<br>Part = (Percent ÷ 100) × Total"
        }
      ],
      workedExample: {
        question: "Calculate the area of a triangular magical portal with base = 10 m and height = 6 m.",
        steps: [
          "Step 1: Write formula → Area = (1/2) × base × height.",
          "Step 2: Substitute values → Area = (1/2) × 10 × 6.",
          "Step 3: Multiply → 10 × 6 = 60, then (1/2) × 60 = 30.",
          "Conclusion: Area = 30 m²!"
        ]
      },
      quiz: {
        q: "A wizard staff costs 120 Gold with a 25% discount. What is the final price of the staff?",
        choices: [
          "A) 80 Gold",
          "B) 90 Gold",
          "C) 95 Gold",
          "D) 100 Gold"
        ],
        correct: 1,
        exp: "Correct! 25% of 120 = 30 Gold discount. Final price = 120 - 30 = 90 Gold!"
      }
    },
    bio: {
      title: "🌿 Biology & Cellular Organelles (Earth Spells)",
      subtitle: "Understand cell structures, cellular respiration, and photosynthesis to channel Earth Spells!",
      bg: "assets/biome_bg_bio.jpg",
      color: "#22c55e",
      concepts: [
        {
          heading: "1. Core Cell Organelles",
          body: "<strong>Mitochondria:</strong> 'Powerhouse of the Cell' — produces ATP energy via cellular respiration.<br><strong>Chloroplast:</strong> Plant organelle that converts sunlight into glucose via photosynthesis.<br><strong>Nucleus:</strong> Brain of the cell — stores genetic DNA code."
        },
        {
          heading: "2. Photosynthesis Equation",
          body: "6CO₂ + 6H₂O + Light Energy → Glucose (C₆H₁₂O₆) + 6O₂"
        }
      ],
      workedExample: {
        question: "Which organelle is found ONLY in plant cells and carries out photosynthesis?",
        steps: [
          "Step 1: Recall plant vs animal cell structures → Chloroplast & Cell Wall.",
          "Step 2: Identify energy organelle → Chloroplast contains green chlorophyll.",
          "Step 3: Verify function → Captures sunlight to make glucose.",
          "Conclusion: Chloroplast!"
        ]
      },
      quiz: {
        q: "Which organelle is known as the 'Powerhouse of the Cell' because it breaks down glucose to generate ATP energy?",
        choices: [
          "A) Ribosome",
          "B) Mitochondria",
          "C) Vacuole",
          "D) Cell Membrane"
        ],
        correct: 1,
        exp: "Correct! Mitochondria generate cellular energy (ATP) through cellular respiration!"
      }
    },
    phys: {
      title: "⚡ Physics & Energy Dynamics (Lightning Spells)",
      subtitle: "Calculate speed, velocity, kinetic energy, and circuit dynamics to channel Lightning Spells!",
      bg: "assets/biome_bg_phys.jpg",
      color: "#a855f7",
      concepts: [
        {
          heading: "1. Speed & Distance Formula",
          body: "Speed (v) = Distance (d) ÷ Time (t)<br>Distance (d) = Speed (v) × Time (t)"
        },
        {
          heading: "2. Forms of Energy & Circuits",
          body: "<strong>Kinetic Energy:</strong> Energy of motion (KE = 1/2 m v²).<br><strong>Potential Energy:</strong> Stored positional energy (PE = mgh).<br><strong>Series Circuit:</strong> 1 single current path.<br><strong>Parallel Circuit:</strong> Multiple independent current paths."
        }
      ],
      workedExample: {
        question: "If a lightning strike travels 400 meters in 8 seconds, what is the speed of the lightning?",
        steps: [
          "Step 1: Write speed formula → v = d / t.",
          "Step 2: Substitute values → v = 400 meters / 8 seconds.",
          "Step 3: Calculate → 400 / 8 = 50.",
          "Conclusion: Speed = 50 m/s!"
        ]
      },
      quiz: {
        q: "A wizard runs a distance of 180 meters in 30 seconds. What is the wizard's average speed?",
        choices: [
          "A) 4 m/s",
          "B) 5 m/s",
          "C) 6 m/s",
          "D) 8 m/s"
        ],
        correct: 2,
        exp: "Correct! Speed = Distance ÷ Time = 180 ÷ 30 = 6 m/s!"
      }
    }
  };

  const renderMagicTrainingUI = (subject = 'chem') => {
    const card = document.getElementById('training-content-card');
    if (!card) return;

    // Update active tab buttons styling
    const tabs = document.querySelectorAll('.training-tab-btn');
    tabs.forEach(tab => {
      const s = tab.getAttribute('data-subject');
      if (s === subject) {
        tab.classList.add('active');
        tab.style.background = s === 'chem' ? 'rgba(239, 68, 68, 0.25)' : s === 'math' ? 'rgba(59, 130, 246, 0.25)' : s === 'bio' ? 'rgba(34, 197, 94, 0.25)' : 'rgba(168, 85, 247, 0.25)';
        tab.style.borderColor = s === 'chem' ? '#ef4444' : s === 'math' ? '#3b82f6' : s === 'bio' ? '#22c55e' : '#a855f7';
        tab.style.color = '#ffffff';
      } else {
        tab.classList.remove('active');
        tab.style.background = 'rgba(15, 23, 42, 0.4)';
        tab.style.borderColor = 'rgba(255, 255, 255, 0.15)';
        tab.style.color = '#94a3b8';
      }
    });

    const data = trainingData[subject] || trainingData.chem;

    card.innerHTML = `
      <div style="position: relative; border-radius: var(--radius-md); overflow: hidden; margin-bottom: 24px; box-shadow: 0 10px 25px rgba(0,0,0,0.5);">
        <img src="${data.bg}" alt="${data.title}" style="width: 100%; height: 180px; object-fit: cover; filter: brightness(0.7);">
        <div style="position: absolute; bottom: 0; left: 0; right: 0; padding: 18px 24px; background: linear-gradient(to top, rgba(2,6,23,0.95), transparent);">
          <h3 style="margin: 0 0 4px; font-size: 1.5rem; color: #f8fafc; font-weight: 800;">${data.title}</h3>
          <p style="margin: 0; color: #cbd5e1; font-size: 0.9rem;">${data.subtitle}</p>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 24px;">
        ${data.concepts.map(c => `
          <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: var(--radius-md); padding: 16px;">
            <h4 style="margin: 0 0 8px; color: ${data.color}; font-size: 1.1rem; font-weight: 700;">${c.heading}</h4>
            <div style="color: #cbd5e1; font-size: 0.9rem; line-height: 1.6;">${c.body}</div>
          </div>
        `).join('')}
      </div>

      <!-- Worked Solution Cutscene Guide -->
      <div style="background: rgba(15, 23, 42, 0.6); border: 1px solid ${data.color}66; border-radius: var(--radius-md); padding: 20px; margin-bottom: 24px;">
        <h4 style="margin: 0 0 10px; color: #fef08a; font-size: 1.1rem; font-weight: 700; display: flex; align-items: center; gap: 8px;">
          🎬 Interactive Solution Cutscene: Worked STEM Problem
        </h4>
        <p style="margin: 0 0 14px; color: #f8fafc; font-size: 1rem; font-weight: 600;">
          "${data.workedExample.question}"
        </p>
        <div style="display: flex; flex-direction: column; gap: 8px; background: rgba(2,6,23,0.6); padding: 14px; border-radius: 8px;">
          ${data.workedExample.steps.map(s => `
            <div style="color: #cbd5e1; font-size: 0.88rem; font-family: 'Fira Code', monospace;">${s}</div>
          `).join('')}
        </div>
      </div>

      <!-- Interactive Skill Check Quiz -->
      <div style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.08); border-radius: var(--radius-md); padding: 20px;">
        <h4 style="margin: 0 0 12px; color: #f8fafc; font-size: 1.05rem; font-weight: 700;">
          📝 Training Practice Check:
        </h4>
        <p style="color: #cbd5e1; font-size: 0.95rem; margin-bottom: 14px; line-height: 1.5;">${data.quiz.q}</p>
        <div id="training-quiz-choices" style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 14px;">
          ${data.quiz.choices.map((c, i) => `
            <button class="training-choice-btn" data-index="${i}" style="padding: 12px 14px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.12); background: rgba(255,255,255,0.04); color: #f8fafc; font-size: 0.9rem; text-align: left; cursor: pointer; transition: all 0.2s;">
              ${c}
            </button>
          `).join('')}
        </div>
        <div id="training-quiz-feedback" class="hidden" style="padding: 12px; border-radius: 8px; font-weight: 600; font-size: 0.9rem;"></div>
      </div>
    `;

    // Add Tab click listeners
    const tabBtns = document.querySelectorAll('.training-tab-btn');
    tabBtns.forEach(btn => {
      btn.onclick = () => {
        if (window.AudioEngine) window.AudioEngine.playClick();
        const targetSubj = btn.getAttribute('data-subject');
        renderMagicTrainingUI(targetSubj);
      };
    });

    // Add Quiz Choice listeners
    const quizBtns = card.querySelectorAll('.training-choice-btn');
    const feedbackEl = card.querySelector('#training-quiz-feedback');
    quizBtns.forEach(btn => {
      btn.onclick = () => {
        const choiceIdx = parseInt(btn.getAttribute('data-index'));
        quizBtns.forEach(b => b.disabled = true);

        if (choiceIdx === data.quiz.correct) {
          if (window.AudioEngine) window.AudioEngine.playCorrect();
          btn.style.background = 'rgba(34, 197, 94, 0.25)';
          btn.style.borderColor = '#22c55e';
          feedbackEl.className = '';
          feedbackEl.style.background = 'rgba(34, 197, 94, 0.2)';
          feedbackEl.style.border = '1px solid #22c55e';
          feedbackEl.style.color = '#4ade80';
          feedbackEl.innerHTML = `🎉 ${data.quiz.exp}`;
        } else {
          if (window.AudioEngine) window.AudioEngine.playIncorrect();
          btn.style.background = 'rgba(239, 68, 68, 0.25)';
          btn.style.borderColor = '#ef4444';
          const correctBtn = quizBtns[data.quiz.correct];
          if (correctBtn) {
            correctBtn.style.background = 'rgba(34, 197, 94, 0.25)';
            correctBtn.style.borderColor = '#22c55e';
          }
          feedbackEl.className = '';
          feedbackEl.style.background = 'rgba(239, 68, 68, 0.2)';
          feedbackEl.style.border = '1px solid #ef4444';
          feedbackEl.style.color = '#fca5a5';
          feedbackEl.innerHTML = `❌ Incorrect. ${data.quiz.exp}`;
        }
      };
    });
  };

  const renderAlliesList = () => {
    const container = document.getElementById('allies-grid-list');
    if (!container) return;

    if (!player.pets || player.pets.length === 0) {
      container.innerHTML = `<div class="empty-pets-text" style="color: var(--text-secondary); text-align: center; width: 100%; padding: 40px 0;">No captured allies yet. Whittle wild monsters below 50% HP in battle, then click "Attempt Capture" to capture them!</div>`;
      return;
    }

    const petBuffDescriptions = {
      fire: "🔥 Pyromancer's Flame: +10% Fire Spell Damage",
      water: "💧 Hydromancer's Blessing: +10% Water Spell Damage",
      earth: "🌿 Geomancer's Growth: +20% Victory & Capture XP",
      air: "⚡ Aeromancer's Haste: +1.5x Speed Critical Multiplier"
    };

    container.innerHTML = '';
    player.pets.forEach(pet => {
      const card = document.createElement('div');
      card.className = "pet-card";
      
      const isActive = player.activePet && player.activePet.name === pet.name;
      if (isActive) {
        card.classList.add('active-helper');
      }

      let buffText = petBuffDescriptions[pet.element] || "✨ Minor Combat Assist";
      if (pet.name.includes('Obsidian Golem')) {
        buffText = "🗿 Fortress Armor: +40 Max HP & Takes 25% Less Damage!";
      } else if (pet.name.includes('Nether Hydra')) {
        buffText = "🐍 Corrosive Venom: +20 Acid Damage & Heals 15% Damage!";
      }

      const isSpecialPet = pet.isSpecial || pet.name.includes('⭐');
      if (isSpecialPet) {
        buffText += "<br><span style='color: #fbbf24; font-weight: 700;'>⭐ Special Buff: +10% Max Player HP!</span>";
      }

      const petSpriteSrc = getPetSpriteSrc(pet);

      card.innerHTML = `
        <div style="position: relative; width: 54px; height: 54px; border-radius: 50%; overflow: hidden; margin: 0 auto 8px; border: 2px solid ${isActive ? '#4ade80' : 'rgba(255,255,255,0.2)'}; box-shadow: 0 4px 12px rgba(0,0,0,0.5);">
          <img src="${petSpriteSrc}" alt="${pet.name}" style="width: 100%; height: 100%; object-fit: cover;">
          ${isSpecialPet ? `<span style="position: absolute; top: 0; right: 0; font-size: 0.9rem; filter: drop-shadow(0 0 6px #fbbf24);">⭐</span>` : ''}
        </div>
        <span class="pet-name-txt">${pet.emoji || '🐾'} ${pet.name}</span>
        <span class="pet-level-txt">Lv. ${pet.level} ${pet.element.toUpperCase()}</span>
        <div style="font-size: 0.76rem; color: ${isActive ? '#4ade80' : '#cbd5e1'}; margin: 6px 0; text-align: center; font-weight: 600; background: rgba(15, 23, 42, 0.6); padding: 4px 6px; border-radius: 6px; line-height: 1.4;">
          ${buffText}
        </div>
        <button class="cta-btn ${isActive ? 'secondary' : 'primary'} small" style="width: 100%; margin-top: 4px; font-size: 0.8rem; padding: 6px 12px;">
          ${isActive ? '✅ Active Ally' : '⚡ Activate Ally'}
        </button>
      `;

      card.addEventListener('click', () => {
        if (window.AudioEngine) window.AudioEngine.playClick();
        
        if (isActive) {
          player.activePet = null;
        } else {
          // Strictly 1 active pet at a time! Replaces previous active pet.
          player.activePet = pet;
        }
        
        recalculateStats();
        player.hp = player.hpMax; // Refill HP when activating health-granting allies!
        player.mp = player.mpMax;
        saveState();
        renderAlliesList();
        updateHUD();
      });

      container.appendChild(card);
    });
  };

  const updateMapProgression = () => {
    // Disable last collided minion if we won a battle
    if (lastCollidedMinionId) {
      const minion = minions.find(m => m.id === lastCollidedMinionId);
      if (minion) {
        minion.active = false;
        // Save minions state
        localStorage.setItem('knowledge_quest_minions', JSON.stringify(minions));
      }
      lastCollidedMinionId = null;
    }

    const realms = ['math', 'bio', 'chem', 'phys'];
    realms.forEach(r => {
      const minionsDef = player.minionsDefeated[r];
      document.getElementById(`${r}-minions`).innerText = minionsDef;
      
      const cleared = player.defeatedBosses[r];
      const statusLbl = document.getElementById(`${r}-status-lbl`);
      if (statusLbl) {
        statusLbl.innerText = cleared ? "Yes (RESTORED)" : (minionsDef >= 3 ? "BOSS SPAWNED" : "Active");
      }
    });

    // Check Win Scenario
    const allCleared = Object.values(player.defeatedBosses).every(v => v === true);
    if (allCleared) {
      setTimeout(() => {
        alert("🎉 CONGRATULATIONS! You have restored all elemental core equations and successfully saved the Higgsfield Aetheria! You have completed the game!");
        // Reset boss progression to allow replaying
        player.defeatedBosses = { math: false, bio: false, chem: false, phys: false };
        player.minionsDefeated = { math: 0, bio: 0, chem: 0, phys: 0 };
        // Reactivate all minions
        minions.forEach(m => m.active = true);
        localStorage.setItem('knowledge_quest_minions', JSON.stringify(minions));
        
        saveState();
        updateMapProgression();
      }, 500);
    }
  };

  const avatarProfileMap = {
    boy: 'assets/profile_boy.jpg',
    girl: 'assets/profile_girl.jpg',
    cyber: 'assets/profile_cyber.jpg',
    celestial: 'assets/profile_celestial.jpg'
  };

  const updateHUD = () => {
    recalculateStats();

    // Sync battle stats HUD elements if present
    const battleHpBar = document.getElementById('battle-player-hp-bar');
    const battleHpText = document.getElementById('battle-player-hp-text');
    const battleMpBar = document.getElementById('battle-player-mp-bar');
    const battleMpText = document.getElementById('battle-player-mp-text');

    if (battleHpBar && battleHpText) {
      const hpPct = Math.max(0, Math.min(100, (player.hp / player.hpMax) * 100));
      battleHpBar.style.width = `${hpPct}%`;
      battleHpText.innerText = `${player.hp}/${player.hpMax}`;
    }
    if (battleMpBar && battleMpText) {
      const mpPct = Math.max(0, Math.min(100, (player.mp / player.mpMax) * 100));
      battleMpBar.style.width = `${mpPct}%`;
      battleMpText.innerText = `${player.mp}/${player.mpMax}`;
    }

    const profileSrc = avatarProfileMap[player.avatar] || 'assets/profile_boy.jpg';
    
    const hudAv = document.getElementById('hud-avatar');
    if (hudAv) hudAv.src = profileSrc;

    const bThumb = document.getElementById('battle-player-avatar-thumb');
    if (bThumb) bThumb.src = profileSrc;

    const pSprite = document.getElementById('player-sprite');
    if (pSprite) pSprite.src = profileSrc;

    document.getElementById('hud-username').innerText = player.name;
    document.getElementById('hud-level').innerText = player.level;
    document.getElementById('hud-gold').innerText = player.gold;
    document.getElementById('hud-grade-select').value = player.grade;

    const xpPct = (player.xp / player.xpNext) * 100;
    document.getElementById('hud-xp-bar').style.width = `${xpPct}%`;
    document.getElementById('hud-xp-current').innerText = player.xp;
    document.getElementById('hud-xp-next').innerText = player.xpNext;

    // Apply color robe filter
    applyRobeFilter(player.hue);

    // Sync dashboard customizer selectors
    const dashBtns = document.querySelectorAll('#dash-avatar-grid .avatar-option-btn');
    dashBtns.forEach(btn => {
      if (btn.getAttribute('data-avatar') === player.avatar) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    const dashSlider = document.getElementById('dash-robe-hue');
    if (dashSlider) {
      dashSlider.value = player.hue;
      document.getElementById('dash-hue-val').innerText = `${player.hue}°`;
    }
  };

  const applyRobeFilter = (hueVal) => {
    const avatar = player.avatar || "boy";
    let baseFilter = "";
    if (avatar === 'girl') {
      baseFilter = "sepia(0.3) saturate(1.4) ";
    } else if (avatar === 'cyber') {
      baseFilter = "brightness(1.15) contrast(1.15) saturate(1.7) ";
    } else if (avatar === 'celestial') {
      baseFilter = "invert(0.15) brightness(0.95) ";
    }

    const filterString = `${baseFilter}hue-rotate(${hueVal}deg)`;
    
    const hudAv = document.getElementById('hud-avatar');
    if (hudAv) hudAv.style.filter = filterString;
    
    const sprite = document.getElementById('player-sprite');
    if (sprite) sprite.style.filter = filterString;
  };

  const saveState = () => {
    localStorage.setItem('knowledge_quest_player', JSON.stringify(player));
  };

  const getPlayerState = () => player;

  return {
    init,
    navigateToScreen,
    updateHUD,
    saveState,
    getPlayerState,
    recalculateStats
  };
})();

// Wait for load to initialize
window.addEventListener('DOMContentLoaded', () => {
  window.App = App;
  App.init();
});
