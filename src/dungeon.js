// ============================================================
//  DungeonEngine — Isaac-style room network for Learnventure
//  Generates, renders, and manages room-based dungeon runs.
// ============================================================
window.DungeonEngine = (() => {
  'use strict';

  // ─── Seeded RNG ─────────────────────────────────────────────
  class DRNG {
    constructor(seed) { this.s = (seed & 0xffffffff) || 1; }
    next() {
      this.s = (Math.imul(1664525, this.s) + 1013904223) & 0xffffffff;
      return (this.s >>> 0) / 0x100000000;
    }
    nextInt(min, max) { return Math.floor(this.next() * (max - min + 1)) + min; }
    pick(arr) { return arr[Math.floor(this.next() * arr.length)]; }
    shuffle(arr) {
      const a = [...arr];
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(this.next() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
      }
      return a;
    }
  }

  // ─── Layout Constants ────────────────────────────────────────
  const GRID_W   = 5;   // columns in grid
  const GRID_H   = 4;   // rows in grid
  const ROOM_W   = 1800; // canvas width (matches existing dungeon space)
  const ROOM_H   = 880;  // canvas height
  const WALL_T   = 100;  // wall thickness px
  const DOOR_W   = 200;  // door opening width px

  const DIRS = [
    { dx: 0, dy: -1, door: 'north', opp: 'south' },
    { dx: 0, dy:  1, door: 'south', opp: 'north' },
    { dx:-1, dy:  0, door: 'west',  opp: 'east'  },
    { dx: 1, dy:  0, door: 'east',  opp: 'west'  }
  ];

  // ─── Synergy Items ───────────────────────────────────────────
  const SYNERGY_ITEMS = [
    { id: 'frost_shard',      name: 'Frost Shard',     icon: '🧊', desc: 'First correct answer in each battle pre-damages the enemy for 15 HP.' },
    { id: 'tesla_coil',       name: 'Tesla Coil',      icon: '⚡', desc: 'Every correct answer deals +5 extra spell damage in battle.' },
    { id: 'combustion_rune',  name: 'Combustion Rune', icon: '🔥', desc: '25% chance a defeated enemy explodes for 10 splash damage.' },
    { id: 'time_loop',        name: 'Time Loop',       icon: '🌀', desc: 'Once per battle, an incorrect answer is forgiven (free retry).' },
    { id: 'barrier_ward',     name: 'Barrier Ward',    icon: '🛡️', desc: 'Each new battle starts with 2 damage-absorbing shield layers.' }
  ];

  // ─── Subject Themes ──────────────────────────────────────────
  const THEMES = {
    dungeon_math:  { wall: '#1a2f52', torch: '#38bdf8', torchRgb: '56,189,248', accent: '#7dd3fc', label: '⛏️ MATH CATACOMBS'    },
    dungeon_chem:  { wall: '#5c1a0a', torch: '#fb923c', torchRgb: '251,146,60',  accent: '#fdba74', label: '🌋 CHEMICAL MINESHAFT' },
    dungeon_bio:   { wall: '#0d3318', torch: '#4ade80', torchRgb: '74,222,128',  accent: '#86efac', label: '🌿 BIOLUMINESCENT ABYSS'},
    dungeon_phys:  { wall: '#2d1054', torch: '#c084fc', torchRgb: '192,132,252', accent: '#e879f9', label: '⚡ QUANTUM VAULT'       }
  };
  function theme(subject) { return THEMES[subject] || THEMES.dungeon_math; }

  // ─── Room Class ──────────────────────────────────────────────
  class Room {
    constructor(gx, gy, type) {
      this.gx       = gx;
      this.gy       = gy;
      this.type     = type; // 'start'|'combat'|'treasure'|'shop'|'question'|'secret'|'curse'|'boss'
      this.doors    = { north: null, south: null, east: null, west: null }; // indices into run.rooms
      this.cleared  = ['start','treasure','shop','question','secret'].includes(type);
      this.visited  = false;
      this.enemies  = [];  // populated on first entry for combat/boss/question rooms
      this.chest    = null; // { opened, isFinal, x, y }
    }
  }

  // ─── DungeonRun Class ────────────────────────────────────────
  class DungeonRun {
    constructor(subject, seed) {
      this.subject          = subject;
      this.seed             = seed;
      this.grid             = new Array(GRID_W * GRID_H).fill(null);
      this.rooms            = [];
      this.startRoomIdx     = 0;
      this.bossRoomIdx      = -1;
      this.allCombatCleared = false;
    }
    gridIdx(gx, gy)     { return gy * GRID_W + gx; }
    getRoom(gx, gy)     { return this.grid[this.gridIdx(gx, gy)]; }
    setRoom(gx, gy, r)  { this.grid[this.gridIdx(gx, gy)] = r; }

    checkAllCombatCleared() {
      this.allCombatCleared = this.rooms
        .filter(r => r.type === 'combat')
        .every(r => r.cleared);
      return this.allCombatCleared;
    }
  }

  // ─── Room Generation ─────────────────────────────────────────
  function generateDungeonRun(subject, seed) {
    const rng = new DRNG(seed);
    const run = new DungeonRun(subject, seed);

    // 1. Start room at grid centre-ish (2,1)
    const startRoom = new Room(2, 1, 'start');
    run.setRoom(2, 1, startRoom);
    run.rooms.push(startRoom);

    // 2. Random expansion — target 11–13 rooms
    const target = rng.nextInt(11, 13);
    const frontier = [{ gx: 2, gy: 1 }];

    while (run.rooms.length < target && frontier.length > 0) {
      const fi   = Math.floor(rng.next() * frontier.length);
      const { gx, gy } = frontier[fi];
      const dirs = rng.shuffle([...DIRS]);
      let expanded = false;

      for (const d of dirs) {
        const nx = gx + d.dx, ny = gy + d.dy;
        if (nx < 0 || nx >= GRID_W || ny < 0 || ny >= GRID_H) continue;
        if (run.getRoom(nx, ny)) continue;

        // Cap connections — prevents star/hub shapes
        let neighbours = 0;
        for (const d2 of DIRS) {
          if (run.getRoom(nx + d2.dx, ny + d2.dy)) neighbours++;
        }
        if (neighbours > 2) continue;

        const newRoom = new Room(nx, ny, 'combat');
        run.setRoom(nx, ny, newRoom);
        run.rooms.push(newRoom);

        const parent = run.getRoom(gx, gy);
        parent.doors[d.door] = run.rooms.length - 1;
        newRoom.doors[d.opp] = run.rooms.indexOf(parent);

        frontier.push({ gx: nx, gy: ny });
        expanded = true;
        break;
      }
      if (!expanded) frontier.splice(fi, 1);
    }

    // 3. BFS to find farthest room → Boss
    const dist = new Array(run.rooms.length).fill(-1);
    const queue = [0];
    dist[0] = 0;
    while (queue.length) {
      const cur = queue.shift();
      for (const nb of Object.values(run.rooms[cur].doors)) {
        if (nb !== null && dist[nb] === -1) { dist[nb] = dist[cur] + 1; queue.push(nb); }
      }
    }

    // Boss room must be a dead-end (1 door) — pick farthest dead-end
    const deadEnds = [];
    for (let i = 1; i < run.rooms.length; i++) {
      const dc = Object.values(run.rooms[i].doors).filter(d => d !== null).length;
      if (dc === 1) deadEnds.push({ i, d: dist[i] });
    }
    deadEnds.sort((a, b) => b.d - a.d);
    const bossIdx = deadEnds.length ? deadEnds[0].i : run.rooms.length - 1;
    run.bossRoomIdx = bossIdx;
    run.rooms[bossIdx].type    = 'boss';
    run.rooms[bossIdx].cleared = false;

    // 4. Assign special types to dead-ends
    const specials = rng.shuffle([
      'treasure',
      ...(run.rooms.length >= 10 ? ['treasure'] : []),
      'shop',
      'question',
      ...(rng.next() < 0.65 ? ['secret'] : []),
      ...(rng.next() < 0.50 ? ['curse']  : [])
    ]);

    const nonBossDeads = deadEnds.filter(e => e.i !== bossIdx).map(e => e.i);
    const nonDeads     = [];
    for (let i = 1; i < run.rooms.length; i++) {
      if (i === bossIdx) continue;
      const dc = Object.values(run.rooms[i].doors).filter(d => d !== null).length;
      if (dc > 1) nonDeads.push(i);
    }
    const assignOrder = [...rng.shuffle(nonBossDeads), ...rng.shuffle(nonDeads)];

    for (let i = 0; i < specials.length && i < assignOrder.length; i++) {
      const r   = run.rooms[assignOrder[i]];
      r.type    = specials[i];
      r.cleared = ['treasure', 'shop', 'question', 'secret', 'curse'].includes(r.type);
    }

    // 5. Attach chests
    for (const room of run.rooms) {
      if (room.type === 'treasure') {
        room.chest = { opened: false, isFinal: false, x: ROOM_W / 2, y: ROOM_H / 2 - 30 };
      }
      if (room.type === 'curse') {
        room.chest = { opened: false, isFinal: false, x: ROOM_W / 2, y: ROOM_H / 2 - 30 };
      }
      if (room.type === 'boss') {
        room.chest = { opened: false, isFinal: true, x: ROOM_W / 2 + 160, y: ROOM_H / 2 - 30 };
      }
    }

    return run;
  }

  // ─── Room Rendering ──────────────────────────────────────────
  function renderRoom(ctx, run, roomIdx, playerX, playerY, locked, dungeonBgImg, chestSprites) {
    const room = run.rooms[roomIdx];
    const th   = theme(run.subject);
    const W = ROOM_W, H = ROOM_H, T = WALL_T, DW = DOOR_W;
    const cx = W / 2, cy = H / 2;

    // ── Floor background ──
    if (dungeonBgImg && dungeonBgImg.complete && dungeonBgImg.naturalWidth !== 0) {
      ctx.drawImage(dungeonBgImg, 0, 0, W, H);
    } else {
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, W, H);
    }

    // Room-type atmosphere overlay
    const overlays = {
      start:    'rgba(2,6,23,0.32)',
      combat:   'rgba(20,5,5,0.40)',
      treasure: 'rgba(30,22,4,0.30)',
      shop:     'rgba(8,5,28,0.36)',
      question: 'rgba(10,5,28,0.30)',
      secret:   'rgba(20,5,22,0.38)',
      curse:    'rgba(30,0,0,0.52)',
      boss:     'rgba(22,0,0,0.58)'
    };
    ctx.fillStyle = overlays[room.type] || 'rgba(2,6,23,0.35)';
    ctx.fillRect(0, 0, W, H);

    // Subtle stone grid
    ctx.strokeStyle = 'rgba(255,255,255,0.035)';
    ctx.lineWidth = 1;
    for (let x = T; x < W - T; x += 64) { ctx.beginPath(); ctx.moveTo(x, T); ctx.lineTo(x, H - T); ctx.stroke(); }
    for (let y = T; y < H - T; y += 64) { ctx.beginPath(); ctx.moveTo(T, y); ctx.lineTo(W - T, y); ctx.stroke(); }

    // ── Walls ──
    ctx.fillStyle = th.wall;
    ctx.fillRect(0, 0, W, T);          // top
    ctx.fillRect(0, H - T, W, T);      // bottom
    ctx.fillRect(0, 0, T, H);          // left
    ctx.fillRect(W - T, 0, T, H);      // right

    // Stone horizontal mortar lines on top/bottom walls
    ctx.strokeStyle = 'rgba(0,0,0,0.28)'; ctx.lineWidth = 1.5;
    for (let y = 0; y < T; y += 22) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, H - T + y); ctx.lineTo(W, H - T + y); ctx.stroke();
    }
    // Stone vertical mortar on side walls
    for (let x = 0; x < T; x += 22) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(W - T + x, 0); ctx.lineTo(W - T + x, H); ctx.stroke();
    }

    // ── Doors ──
    for (const [dir, nbIdx] of Object.entries(room.doors)) {
      if (nbIdx === null) continue;
      const nb = run.rooms[nbIdx];

      // Door opening rectangle
      let dx1, dy1, dw2, dh2;
      if (dir === 'north') { dx1 = cx - DW/2; dy1 = 0;     dw2 = DW; dh2 = T; }
      else if (dir === 'south') { dx1 = cx - DW/2; dy1 = H-T;  dw2 = DW; dh2 = T; }
      else if (dir === 'west')  { dx1 = 0;    dy1 = cy-DW/2; dw2 = T;  dh2 = DW; }
      else                      { dx1 = W-T;  dy1 = cy-DW/2; dw2 = T;  dh2 = DW; }

      const isCombatLocked = locked && room.type === 'combat' && !room.cleared;
      const isBossLocked   = nb.type === 'boss' && !run.allCombatCleared;

      if (isCombatLocked || isBossLocked) {
        // Locked door — carve hole + draw bars
        ctx.fillStyle = '#050a14';
        ctx.fillRect(dx1, dy1, dw2, dh2);
        ctx.strokeStyle = isBossLocked ? '#fbbf24' : '#ef4444';
        ctx.lineWidth = 4;
        if (dir === 'north' || dir === 'south') {
          for (let bx = dx1 + 22; bx < dx1 + dw2 - 10; bx += 30) {
            ctx.beginPath(); ctx.moveTo(bx, dy1 + 5); ctx.lineTo(bx, dy1 + dh2 - 5); ctx.stroke();
          }
        } else {
          for (let by = dy1 + 22; by < dy1 + dh2 - 10; by += 30) {
            ctx.beginPath(); ctx.moveTo(dx1 + 5, by); ctx.lineTo(dx1 + dw2 - 5, by); ctx.stroke();
          }
        }
        ctx.font = '20px Outfit'; ctx.textAlign = 'center';
        ctx.fillText(isBossLocked ? '🔑' : '🔒', dx1 + dw2/2, dy1 + dh2/2 + 7);
        if (isBossLocked) {
          ctx.font = 'bold 9px Outfit'; ctx.fillStyle = '#fbbf24';
          ctx.fillText('CLEAR ALL COMBAT ROOMS FIRST', dx1 + dw2/2, dy1 + dh2/2 + 22);
        }

      } else {
        // Open door — dark archway + glow
        ctx.fillStyle = '#000000';
        ctx.fillRect(dx1, dy1, dw2, dh2);
        const dmx = dx1 + dw2/2, dmy = dy1 + dh2/2;
        const aGrad = ctx.createRadialGradient(dmx, dmy, 8, dmx, dmy, DW * 0.55);
        aGrad.addColorStop(0, `rgba(${th.torchRgb},0.35)`);
        aGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = aGrad; ctx.fillRect(dx1, dy1, dw2, dh2);
        // Archway frame
        ctx.strokeStyle = th.accent; ctx.lineWidth = 2;
        ctx.strokeRect(dx1 + 4, dy1 + 4, dw2 - 8, dh2 - 8);
        // Direction arrow
        const arrows = { north: '⬆', south: '⬇', west: '⬅', east: '➡' };
        ctx.font = '13px Outfit'; ctx.fillStyle = th.accent; ctx.textAlign = 'center';
        ctx.fillText(arrows[dir], dmx, dmy + 5);
      }
    }

    // ── Torch Sconces ──
    const torchPos = [
      { x: T + 70, y: T + 70 }, { x: W - T - 70, y: T + 70 },
      { x: T + 70, y: H - T - 70 }, { x: W - T - 70, y: H - T - 70 }
    ];
    torchPos.forEach(tp => {
      const flicker = Math.sin(Date.now() / 80 + tp.x * 0.01) * 5;
      ctx.save();
      ctx.globalAlpha = 0.5;
      const tg = ctx.createRadialGradient(tp.x, tp.y, 2, tp.x, tp.y, 70 + flicker);
      tg.addColorStop(0, `rgba(${th.torchRgb},0.85)`);
      tg.addColorStop(0.5, `rgba(${th.torchRgb},0.25)`);
      tg.addColorStop(1, 'transparent');
      ctx.fillStyle = tg;
      ctx.beginPath(); ctx.arc(tp.x, tp.y, 70 + flicker, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
      ctx.fillStyle = th.torch;
      ctx.beginPath(); ctx.arc(tp.x, tp.y, 5, 0, Math.PI * 2); ctx.fill();
      ctx.font = '13px Outfit'; ctx.textAlign = 'center';
      ctx.fillText('🕯️', tp.x, tp.y - 8);
    });

    // ── Dungeon Title Banner ──
    const label = theme(run.subject).label;
    ctx.fillStyle = 'rgba(2,6,23,0.88)';
    ctx.fillRect(cx - 230, 22, 460, 30);
    ctx.strokeStyle = th.accent; ctx.lineWidth = 1.2;
    ctx.strokeRect(cx - 230, 22, 460, 30);
    ctx.font = 'bold 11px Outfit'; ctx.fillStyle = th.accent; ctx.textAlign = 'center';
    ctx.fillText(label, cx, 42);

    // ── Room-Type Decorations ──
    _drawRoomDecor(ctx, room, cx, cy, W, H, T, th);
  }

  function _drawRoomDecor(ctx, room, cx, cy, W, H, T, th) {
    if (room.type === 'start') {
      ctx.save();
      ctx.globalAlpha = 0.28 + Math.sin(Date.now() / 600) * 0.08;
      const sg = ctx.createRadialGradient(cx, cy + 80, 10, cx, cy + 80, 140);
      sg.addColorStop(0, th.torch); sg.addColorStop(1, 'transparent');
      ctx.fillStyle = sg; ctx.beginPath(); ctx.arc(cx, cy + 80, 140, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
      ctx.font = 'bold 12px Outfit'; ctx.fillStyle = th.accent; ctx.textAlign = 'center';
      ctx.fillText('⛏️  DUNGEON ENTRANCE  —  Explore all rooms, then face the Boss!', cx, T + 36);
      ctx.font = '11px Outfit'; ctx.fillStyle = 'rgba(203,213,225,0.7)';
      ctx.fillText('Walk to a glowing doorway to enter the next room', cx, T + 54);
    }

    else if (room.type === 'combat') {
      if (!room.cleared) {
        ctx.save(); ctx.globalAlpha = 0.22 + Math.sin(Date.now() / 300) * 0.06;
        ctx.font = '32px Outfit'; ctx.textAlign = 'center';
        [[T+90,T+140],[W-T-90,T+140],[T+90,H-T-100],[W-T-90,H-T-100]].forEach(([x,y]) => ctx.fillText('💀', x, y));
        ctx.restore();
        ctx.font = 'bold 12px Outfit'; ctx.fillStyle = '#f87171'; ctx.textAlign = 'center';
        ctx.fillText('⚔️  COMBAT ROOM  —  Defeat all enemies to unlock the doors!', cx, T + 36);
      } else {
        ctx.font = 'bold 12px Outfit'; ctx.fillStyle = '#4ade80'; ctx.textAlign = 'center';
        ctx.fillText('✅  COMBAT ROOM CLEARED', cx, T + 36);
      }
    }

    else if (room.type === 'treasure') {
      ctx.save(); ctx.globalAlpha = 0.22 + Math.sin(Date.now() / 400) * 0.08;
      const tg = ctx.createRadialGradient(cx, cy, 10, cx, cy, 220);
      tg.addColorStop(0, '#fbbf24'); tg.addColorStop(1, 'transparent');
      ctx.fillStyle = tg; ctx.beginPath(); ctx.arc(cx, cy, 220, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
      ctx.font = 'bold 12px Outfit'; ctx.fillStyle = '#fbbf24'; ctx.textAlign = 'center';
      ctx.fillText('💰  TREASURE ROOM  —  Free chest, no enemies!', cx, T + 36);
    }

    else if (room.type === 'shop') {
      ctx.font = 'bold 12px Outfit'; ctx.fillStyle = '#a78bfa'; ctx.textAlign = 'center';
      ctx.fillText('🏪  MERCHANT\'S LAIR  —  Safe rest area', cx, T + 36);
      ctx.font = '56px Outfit'; ctx.textAlign = 'center';
      ctx.fillText('🧙', cx, cy - 50);
      ctx.font = 'bold 14px Outfit'; ctx.fillStyle = '#e2e8f0'; ctx.textAlign = 'center';
      ctx.fillText('Wandering Dungeon Merchant', cx, cy + 10);
      ctx.font = '11px Outfit'; ctx.fillStyle = '#94a3b8';
      ctx.fillText('(Use the Realm Shop on the overworld to purchase items)', cx, cy + 30);
    }

    else if (room.type === 'question') {
      const pulse = 0.7 + Math.sin(Date.now() / 280) * 0.3;
      ctx.save(); ctx.globalAlpha = pulse * 0.38;
      const qg = ctx.createRadialGradient(cx, cy - 60, 5, cx, cy - 60, 170);
      qg.addColorStop(0, '#a855f7'); qg.addColorStop(1, 'transparent');
      ctx.fillStyle = qg; ctx.beginPath(); ctx.arc(cx, cy - 60, 170, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
      ctx.font = 'bold 12px Outfit'; ctx.fillStyle = '#c084fc'; ctx.textAlign = 'center';
      ctx.fillText('❓  QUESTION CHAMBER  —  Defeat the Quiz Spirit for bonus XP!', cx, T + 36);
      if (!room.cleared) {
        ctx.save(); ctx.globalAlpha = pulse;
        ctx.font = '48px Outfit'; ctx.textAlign = 'center'; ctx.fillText('🔮', cx, cy - 20);
        ctx.font = 'bold 13px Outfit'; ctx.fillStyle = '#c084fc';
        ctx.fillText('Challenge the spirit to earn XP!', cx, cy + 32);
        ctx.restore();
      } else {
        ctx.font = '36px Outfit'; ctx.textAlign = 'center'; ctx.fillText('✅', cx, cy - 20);
        ctx.font = '13px Outfit'; ctx.fillStyle = '#4ade80'; ctx.textAlign = 'center';
        ctx.fillText('Spirit vanquished — XP awarded!', cx, cy + 32);
      }
    }

    else if (room.type === 'secret') {
      ctx.save(); ctx.globalAlpha = 0.22 + Math.sin(Date.now() / 500) * 0.07;
      const sg = ctx.createRadialGradient(cx, cy, 10, cx, cy, 190);
      sg.addColorStop(0, '#7c3aed'); sg.addColorStop(1, 'transparent');
      ctx.fillStyle = sg; ctx.beginPath(); ctx.arc(cx, cy, 190, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
      ctx.font = 'bold 12px Outfit'; ctx.fillStyle = '#a78bfa'; ctx.textAlign = 'center';
      ctx.fillText('👁️  SECRET ROOM  —  You found a hidden passage!', cx, T + 36);
    }

    else if (room.type === 'curse') {
      const redPulse = 0.25 + Math.sin(Date.now() / 200) * 0.1;
      ctx.save(); ctx.globalAlpha = redPulse;
      const cg = ctx.createRadialGradient(cx, cy, 10, cx, cy, 250);
      cg.addColorStop(0, '#dc2626'); cg.addColorStop(1, 'transparent');
      ctx.fillStyle = cg; ctx.beginPath(); ctx.arc(cx, cy, 250, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
      ctx.font = 'bold 12px Outfit'; ctx.fillStyle = '#f87171'; ctx.textAlign = 'center';
      ctx.fillText('💀  CURSE ROOM  —  You paid 20 HP to enter. Claim your reward.', cx, T + 36);
    }

    else if (room.type === 'boss') {
      ctx.save(); ctx.globalAlpha = 0.30 + Math.sin(Date.now() / 140) * 0.10;
      const bg = ctx.createRadialGradient(cx, cy, 20, cx, cy, H * 0.65);
      bg.addColorStop(0, 'transparent'); bg.addColorStop(1, '#7f1d1d');
      ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H); ctx.restore();

      if (!room.cleared) {
        ctx.font = 'bold 14px Outfit'; ctx.fillStyle = '#ef4444'; ctx.textAlign = 'center';
        ctx.fillText('👑  BOSS CHAMBER  —  Final Battle!', cx, T + 36);
      } else {
        ctx.font = 'bold 13px Outfit'; ctx.fillStyle = '#4ade80'; ctx.textAlign = 'center';
        ctx.fillText('👑  BOSS DEFEATED — Claim your Synergy Item from the special chest!', cx, T + 36);
      }
    }
  }

  // ─── Minimap ─────────────────────────────────────────────────
  function renderMinimap(ctx, run, currentRoomIdx, vpW) {
    const CELL_W = 28, CELL_H = 20, GAP = 4;
    const mapW = GRID_W * (CELL_W + GAP);
    const mapH = GRID_H * (CELL_H + GAP);
    const MAP_X = vpW - mapW - 24;
    const MAP_Y = 14;

    // Background panel
    ctx.fillStyle = 'rgba(2,6,23,0.92)';
    ctx.strokeStyle = 'rgba(148,163,184,0.3)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.roundRect(MAP_X - 6, MAP_Y - 2, mapW + 12, mapH + 24, 6);
    ctx.fill(); ctx.stroke();
    ctx.font = 'bold 8px Outfit'; ctx.fillStyle = 'rgba(148,163,184,0.7)'; ctx.textAlign = 'center';
    ctx.fillText('DUNGEON MAP', MAP_X - 6 + (mapW + 12)/2, MAP_Y + 9);

    const roomFills = {
      start:    '#3b82f6', combat:   '#6b7280', treasure: '#f59e0b',
      shop:     '#8b5cf6', question: '#7c3aed', secret:   '#4c1d95',
      curse:    '#991b1b', boss:     '#dc2626'
    };
    const roomIcons = {
      start: '⛏', combat: '⚔', treasure: '💰', shop: '🏪',
      question: '❓', secret: '👁', curse: '💀', boss: '👑'
    };

    for (let gy = 0; gy < GRID_H; gy++) {
      for (let gx = 0; gx < GRID_W; gx++) {
        const room = run.grid[gy * GRID_W + gx];
        if (!room) continue;
        const ridx = run.rooms.indexOf(room);
        const rx   = MAP_X + gx * (CELL_W + GAP);
        const ry   = MAP_Y + 14 + gy * (CELL_H + GAP);

        if (!room.visited && ridx !== currentRoomIdx) {
          ctx.strokeStyle = 'rgba(255,255,255,0.12)'; ctx.lineWidth = 1;
          ctx.strokeRect(rx, ry, CELL_W, CELL_H);
          continue;
        }

        ctx.fillStyle = roomFills[room.type] || '#6b7280';
        ctx.globalAlpha = room.cleared ? 0.65 : 1.0;
        ctx.fillRect(rx, ry, CELL_W, CELL_H);
        ctx.globalAlpha = 1.0;

        if (ridx === currentRoomIdx) {
          const pulse = 0.7 + Math.sin(Date.now() / 200) * 0.3;
          ctx.strokeStyle = `rgba(251,191,36,${pulse})`; ctx.lineWidth = 2.5;
          ctx.strokeRect(rx - 1, ry - 1, CELL_W + 2, CELL_H + 2);
        }

        ctx.font = '8px Outfit'; ctx.fillStyle = '#fff'; ctx.textAlign = 'center';
        ctx.fillText(roomIcons[room.type] || '?', rx + CELL_W/2, ry + CELL_H/2 + 3);

        // Door connectors between adjacent visited cells
        ctx.fillStyle = 'rgba(255,255,255,0.7)';
        if (room.doors.east !== null) {
          const nb = run.rooms[room.doors.east];
          if (nb && (nb.visited || room.doors.east === currentRoomIdx)) {
            ctx.fillRect(rx + CELL_W, ry + CELL_H/2 - 1.5, GAP, 3);
          }
        }
        if (room.doors.south !== null) {
          const nb = run.rooms[room.doors.south];
          if (nb && (nb.visited || room.doors.south === currentRoomIdx)) {
            ctx.fillRect(rx + CELL_W/2 - 1.5, ry + CELL_H, 3, GAP);
          }
        }
      }
    }
  }

  // ─── Enemy Spawning ──────────────────────────────────────────
  function spawnRoomEnemies(room, subject, isBoss) {
    const count = isBoss ? 2 : (Math.random() < 0.40 ? 1 : 2);

    const templates = {
      dungeon_math:  [
        { name: 'Fraction Wraith',   sprite: 'assets/minion_math_wraith.jpg', emoji: '🔢', subj: 'math' },
        { name: 'Equation Imp',      sprite: 'assets/minion_math_imp.jpg',    emoji: '✖️', subj: 'math' }
      ],
      dungeon_chem:  [
        { name: 'Periodic Pixie',    sprite: 'assets/minion_chem_pixie.jpg',  emoji: '🧪', subj: 'chem' },
        { name: 'Acid Sludge',       sprite: 'assets/minion_chem_sludge.jpg', emoji: '☣️', subj: 'chem' }
      ],
      dungeon_bio:   [
        { name: 'Cellular Slime',    sprite: 'assets/minion_bio_slime.jpg',   emoji: '🦠', subj: 'bio'  },
        { name: 'Spore Fiend',       sprite: 'assets/minion_bio_spore.jpg',   emoji: '🍃', subj: 'bio'  }
      ],
      dungeon_phys:  [
        { name: 'Kinetic Imp',       sprite: 'assets/minion_phys_imp.jpg',    emoji: '🏃', subj: 'phys' },
        { name: 'Magnetic Basilisk', sprite: 'assets/minion_phys_basilisk.jpg',emoji: '🧲', subj: 'phys' }
      ]
    };

    const tpls    = templates[subject] || templates.dungeon_math;
    const positions = [[620, 280], [1180, 560], [900, 390], [500, 620]];
    const enemies = [];

    for (let i = 0; i < count; i++) {
      const t   = tpls[i % tpls.length];
      const pos = positions[i];
      enemies.push({
        id:        `room_${subject}_${Date.now()}_${i}`,
        subject:   t.subj,
        name:      isBoss ? `Elite ${t.name}` : t.name,
        sprite:    t.sprite,
        emoji:     t.emoji,
        x: pos[0], y: pos[1],
        vx: (Math.random() - 0.5) * 2.4,
        vy: (Math.random() - 0.5) * 2.4,
        radius:    isBoss ? 22 : 18,
        active:    true,
        isSpecial: isBoss || Math.random() < 0.08
      });
    }
    return enemies;
  }

  // ─── Quiz Spirit for Question Rooms ─────────────────────────
  function spawnQuizSpirit(subject) {
    const subj = subject.replace('dungeon_', '');
    return [{
      id:        `quiz_spirit_${Date.now()}`,
      subject:   subj,
      name:      '📜 Quiz Spirit',
      sprite:    `assets/minion_${subj}_wraith.jpg`,
      emoji:     '🔮',
      x: 900, y: 380,
      vx: 0, vy: 0,
      radius: 18, active: true,
      isSpecial: false, isQuizSpirit: true
    }];
  }

  // ─── Public API ──────────────────────────────────────────────
  return {
    generateDungeonRun,
    renderRoom,
    renderMinimap,
    spawnRoomEnemies,
    spawnQuizSpirit,
    SYNERGY_ITEMS,
    ROOM_W, ROOM_H, WALL_T, DOOR_W
  };
})();
