window.TileRenderer = (() => {
  const { TILE_SIZE, GRID_W, GRID_H, CHUNK_TILES, CHUNK_PX, CHUNKS_X, CHUNKS_Y } = window.TileMap;
  const S = TILE_SIZE;

  class ChunkCache {
    constructor() { this.canvases = new Map(); this.dirty = new Set(); }
    markDirty(i)    { this.dirty.add(i); }
    markAllDirty()  { for (let i = 0; i < CHUNKS_X * CHUNKS_Y; i++) this.dirty.add(i); }
    get(i)          { return this.canvases.get(i) || null; }
    set(i, c)       { this.canvases.set(i, c); }
    isDirty(i)      { return this.dirty.has(i); }
    clearDirty(i)   { this.dirty.delete(i); }
  }
  const chunkCache = new ChunkCache();

  function lg(ctx, x0,y0,x1,y1,...stops) {
    const g = ctx.createLinearGradient(x0,y0,x1,y1);
    for (let i=0; i<stops.length; i+=2) g.addColorStop(stops[i], stops[i+1]);
    return g;
  }
  function rg(ctx, x0,y0,r0,x1,y1,r1,...stops) {
    const g = ctx.createRadialGradient(x0,y0,r0,x1,y1,r1);
    for (let i=0; i<stops.length; i+=2) g.addColorStop(stops[i], stops[i+1]);
    return g;
  }

  function drawTile(ctx, lx, ly, tileType, n, decorationId) {
    const px = lx * S, py = ly * S;
    n = (n === undefined || n === null) ? 0.5 : n;
    ctx.save();
    ctx.translate(px, py);

    switch (tileType) {
      // ── MATH BIOME ──────────────────────────────────────
      case 'grass': {
        ctx.fillStyle = lg(ctx, 0, 0, S, S,
          0, `hsl(215, ${45 + n * 15 | 0}%, ${18 + n * 6 | 0}%)`,
          1, `hsl(220, ${50 + n * 15 | 0}%, ${12 + n * 5 | 0}%)`);
        ctx.fillRect(0, 0, S, S);
        ctx.strokeStyle = `rgba(56, 189, 248, ${0.15 + n * 0.15})`;
        ctx.lineWidth = 0.7;
        ctx.beginPath();
        ctx.moveTo(0, S * 0.2); ctx.lineTo(S * 0.4, S * 0.6); ctx.lineTo(S, S * 0.4);
        ctx.stroke();
        ctx.fillStyle = `rgba(186, 230, 253, ${0.4 + n * 0.4})`;
        const sv = (n * 100) | 0;
        ctx.fillRect((sv * 3) % (S - 4) + 2, (sv * 7) % (S - 4) + 2, 2, 2);
        ctx.fillRect((sv * 11) % (S - 4) + 2, (sv * 5) % (S - 4) + 2, 1.5, 1.5);
        break;
      }
      case 'crystal_dense': {
        ctx.fillStyle = lg(ctx, 0, 0, S, S,
          0, `hsl(215, 65%, ${28 + n * 8 | 0}%)`,
          1, `hsl(220, 70%, ${20 + n * 6 | 0}%)`);
        ctx.fillRect(0, 0, S, S);
        ctx.fillStyle = 'rgba(56, 189, 248, 0.45)';
        ctx.beginPath();
        ctx.moveTo(S * 0.2, S * 0.8); ctx.lineTo(S * 0.4, S * 0.2); ctx.lineTo(S * 0.6, S * 0.8);
        ctx.closePath(); ctx.fill();
        ctx.fillStyle = 'rgba(186, 230, 253, 0.6)';
        ctx.beginPath();
        ctx.moveTo(S * 0.6, S * 0.7); ctx.lineTo(S * 0.75, S * 0.3); ctx.lineTo(S * 0.9, S * 0.7);
        ctx.closePath(); ctx.fill();
        break;
      }
      case 'crystal_rock': {
        ctx.fillStyle = lg(ctx, 0, 0, S, S, 0, 'hsl(220, 60%, 14%)', 1, 'hsl(225, 65%, 8%)');
        ctx.fillRect(0, 0, S, S);
        [[4, S, 12, 6, 20, S], [16, S, 26, 2, 34, S], [26, S, 35, 10, 40, S]].forEach(([x1, y1, x2, y2, x3, y3], i) => {
          ctx.fillStyle = `hsl(215, ${65 + i * 5}%, ${24 + i * 8}%)`;
          ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.lineTo(x3, y3); ctx.closePath(); ctx.fill();
          ctx.strokeStyle = 'rgba(56, 189, 248, 0.7)'; ctx.lineWidth = 1; ctx.stroke();
          ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
          ctx.beginPath(); ctx.arc(x2, y2 + 2, 1.5, 0, Math.PI * 2); ctx.fill();
        });
        break;
      }

      // ── CHEMISTRY BIOME ─────────────────────────────────
      case 'acid_ground': {
        ctx.fillStyle = lg(ctx, 0, 0, S, S, 0, `hsl(140, 35%, ${12 + n * 5 | 0}%)`, 1, 'hsl(145, 40%, 8%)');
        ctx.fillRect(0, 0, S, S);
        ctx.strokeStyle = `rgba(74, 222, 128, ${0.35 + n * 0.2})`; ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(0, S * 0.35); ctx.lineTo(S * 0.45, S * 0.2); ctx.lineTo(S * 0.75, S * 0.65); ctx.lineTo(S, S * 0.5);
        ctx.stroke();
        break;
      }
      case 'lab_floor': {
        ctx.fillStyle = `hsl(150, 30%, ${9 + n * 4 | 0}%)`; ctx.fillRect(0, 0, S, S);
        ctx.strokeStyle = 'rgba(34, 197, 94, 0.25)'; ctx.lineWidth = 0.9;
        const hx = S / 2, hy = S / 2, hr = 15;
        ctx.beginPath();
        for (let k = 0; k < 6; k++) {
          const a = k * Math.PI / 3 - Math.PI / 6;
          if (k === 0) ctx.moveTo(hx + hr * Math.cos(a), hy + hr * Math.sin(a));
          else ctx.lineTo(hx + hr * Math.cos(a), hy + hr * Math.sin(a));
        }
        ctx.closePath(); ctx.stroke();
        ctx.fillStyle = 'rgba(74, 222, 128, 0.06)'; ctx.fill();
        break;
      }
      case 'acid_pool': {
        ctx.fillStyle = rg(ctx, S / 2, S / 2, 2, S / 2, S / 2, S * 0.75,
          0, 'rgba(34, 197, 94, 0.95)', 0.6, 'rgba(21, 128, 61, 0.9)', 1, 'rgba(5, 46, 22, 0.95)');
        ctx.fillRect(0, 0, S, S);
        ctx.strokeStyle = 'rgba(134, 239, 172, 0.7)'; ctx.lineWidth = 1.2;
        ctx.beginPath(); ctx.arc(12 + n * 6, 12 + n * 8, 4 + n * 3, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.arc(S - (10 + n * 6), S - (10 + n * 8), 3 + n * 2, 0, Math.PI * 2); ctx.stroke();
        break;
      }

      // ── BIOLOGY BIOME ───────────────────────────────────
      case 'jungle': {
        ctx.fillStyle = lg(ctx, 0, 0, S, S, 0, `hsl(145, 45%, ${11 + n * 5 | 0}%)`, 1, 'hsl(150, 50%, 7%)');
        ctx.fillRect(0, 0, S, S);
        ctx.fillStyle = `rgba(16, 185, 129, ${0.45 + n * 0.2})`;
        [[8, 10, 8, 5, 0.3], [22, 8, 10, 6, -0.2], [14, 26, 7, 4, 0.5], [30, 28, 9, 5, 0.1]].forEach(([lx, ly, rx, ry, rot]) => {
          ctx.save(); ctx.translate(lx, ly); ctx.rotate(rot);
          ctx.beginPath(); ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2); ctx.fill();
          ctx.restore();
        });
        ctx.fillStyle = 'rgba(52, 211, 153, 0.6)';
        ctx.beginPath(); ctx.arc(S * 0.7, S * 0.3, 1.8, 0, Math.PI * 2); ctx.fill();
        break;
      }
      case 'swamp': {
        ctx.fillStyle = lg(ctx, 0, 0, 0, S, 0, 'hsl(165, 40%, 8%)', 1, 'hsl(170, 45%, 5%)');
        ctx.fillRect(0, 0, S, S);
        ctx.strokeStyle = 'rgba(20, 184, 166, 0.35)'; ctx.lineWidth = 0.9;
        ctx.beginPath(); ctx.arc(S / 2, S / 2, 13 + n * 4, 0, Math.PI * 1.5, false); ctx.stroke();
        ctx.beginPath(); ctx.arc(S / 2, S / 2, 7 + n * 3, Math.PI * 0.5, Math.PI * 2, false); ctx.stroke();
        break;
      }
      case 'swamp_water': {
        ctx.fillStyle = rg(ctx, S / 2, S / 2, 0, S / 2, S / 2, S * 0.75,
          0, 'rgba(15, 118, 110, 0.95)', 0.7, 'rgba(13, 78, 74, 0.98)', 1, 'rgba(4, 47, 46, 1)');
        ctx.fillRect(0, 0, S, S);
        ctx.strokeStyle = 'rgba(45, 212, 191, 0.3)'; ctx.lineWidth = 0.7;
        ctx.beginPath(); ctx.arc(S / 2, S / 2, 14, 0, Math.PI * 2); ctx.stroke();
        break;
      }

      // ── PHYSICS BIOME ───────────────────────────────────
      case 'volcanic': {
        ctx.fillStyle = lg(ctx, 0, 0, S, S, 0, `hsl(20, 40%, ${10 + n * 4 | 0}%)`, 1, 'hsl(15, 45%, 6%)');
        ctx.fillRect(0, 0, S, S);
        ctx.strokeStyle = `rgba(249, 115, 22, ${0.4 + n * 0.3})`; ctx.lineWidth = 0.9;
        ctx.beginPath();
        ctx.moveTo(S * 0.1, S * 0.1); ctx.lineTo(S * 0.45, S * 0.35); ctx.lineTo(S * 0.3, S * 0.75); ctx.lineTo(S * 0.7, S * 0.9);
        ctx.moveTo(S * 0.7, 0); ctx.lineTo(S * 0.55, S * 0.45); ctx.lineTo(S * 0.85, S * 0.7);
        ctx.stroke();
        break;
      }
      case 'crater': {
        ctx.fillStyle = lg(ctx, 0, 0, S, S, 0, 'hsl(270, 35%, 12%)', 1, 'hsl(275, 40%, 7%)');
        ctx.fillRect(0, 0, S, S);
        ctx.strokeStyle = 'rgba(192, 132, 252, 0.35)'; ctx.lineWidth = 0.8;
        ctx.beginPath(); ctx.arc(S / 2, S / 2, 14 + n * 3, 0, Math.PI * 2); ctx.stroke();
        ctx.fillStyle = 'rgba(168, 85, 247, 0.12)'; ctx.fill();
        break;
      }
      case 'lava': {
        ctx.fillStyle = rg(ctx, S * 0.4, S * 0.4, 2, S / 2, S / 2, S * 0.65,
          0, 'rgba(249, 115, 22, 0.98)', 0.5, 'rgba(220, 38, 38, 0.95)', 1, 'rgba(127, 29, 29, 0.98)');
        ctx.fillRect(0, 0, S, S);
        ctx.strokeStyle = 'rgba(254, 240, 138, 0.75)'; ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(0, S * 0.4); ctx.lineTo(S * 0.35, S * 0.55); ctx.lineTo(S * 0.6, S * 0.25); ctx.lineTo(S, S * 0.65);
        ctx.stroke();
        break;
      }

      // ── SHARED / STRUCTURES ─────────────────────────────
      case 'plaza': {
        ctx.fillStyle = `hsl(245, 25%, ${15 + n * 4 | 0}%)`; ctx.fillRect(0, 0, S, S);
        ctx.strokeStyle = 'rgba(168, 85, 247, 0.3)'; ctx.lineWidth = 0.9;
        const bW = S / 4, bH = S / 3;
        for (let row = 0; row <= 3; row++) {
          const off = (row % 2) * bW / 2;
          for (let col = -1; col <= 4; col++) ctx.strokeRect(col * bW + off, row * bH, bW, bH);
        }
        break;
      }
      case 'path': {
        ctx.fillStyle = `hsl(30, 35%, ${20 + n * 6 | 0}%)`; ctx.fillRect(0, 0, S, S);
        ctx.fillStyle = 'rgba(251, 191, 36, 0.12)'; ctx.fillRect(S * 0.15, 0, S * 0.7, S);
        ctx.fillStyle = `rgba(217, 119, 6, ${0.35 + n * 0.2})`;
        [[4, 5], [14, 22], [28, 11], [35, 30], [8, 35], [22, 7], [33, 18]].forEach(([bx, by]) => {
          ctx.beginPath(); ctx.arc((bx + n * 3) % S, (by + n * 5) % S, 1.5, 0, Math.PI * 2); ctx.fill();
        });
        break;
      }
      case 'wall': {
        ctx.fillStyle = lg(ctx, 0, 0, S, S, 0, 'hsl(230, 25%, 9%)', 1, 'hsl(235, 30%, 5%)');
        ctx.fillRect(0, 0, S, S);
        ctx.strokeStyle = 'rgba(99, 102, 241, 0.35)'; ctx.lineWidth = 0.7;
        ctx.beginPath();
        ctx.moveTo(0, S * 0.25); ctx.lineTo(S * 0.6, S * 0.3); ctx.lineTo(S, S * 0.2);
        ctx.moveTo(S * 0.2, S * 0.6); ctx.lineTo(S * 0.8, S * 0.65); ctx.lineTo(S, S * 0.5);
        ctx.stroke();
        break;
      }
      case 'chasm': {
        ctx.fillStyle = rg(ctx, S / 2, S / 2, 0, S / 2, S / 2, S * 0.8, 0, 'rgba(8, 8, 20, 0.98)', 0.5, 'rgba(3, 3, 10, 1)', 1, 'rgba(0, 0, 0, 1)');
        ctx.fillRect(0, 0, S, S);
        break;
      }
      case 'dungeon_entry': {
        ctx.fillStyle = lg(ctx, 0, 0, 0, S, 0, 'hsl(275, 45%, 12%)', 1, 'hsl(285, 55%, 6%)');
        ctx.fillRect(0, 0, S, S);
        ctx.strokeStyle = 'rgba(168, 85, 247, 0.8)'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(S / 2, S / 2, 14, 0, Math.PI * 2); ctx.stroke();
        ctx.fillStyle = 'rgba(192, 132, 252, 0.25)';
        ctx.beginPath(); ctx.arc(S / 2, S / 2, 11, 0, Math.PI * 2); ctx.fill();
        break;
      }
      default: {
        ctx.fillStyle = '#111827'; ctx.fillRect(0, 0, S, S);
      }
    }

    // ── DECORATIONS ──────────────────────────────────────
    if (decorationId !== undefined && decorationId >= 0) {
      ctx.save();
      switch (decorationId) {
        case 0:
          ctx.fillStyle = 'rgba(186, 230, 253, 0.9)';
          ctx.beginPath(); ctx.moveTo(S / 2, S * 0.2); ctx.lineTo(S * 0.6, S * 0.7); ctx.lineTo(S * 0.4, S * 0.7); ctx.closePath(); ctx.fill();
          break;
        case 1:
          ctx.fillStyle = 'rgba(125, 211, 252, 0.85)';
          [[S * 0.25, S * 0.25, S * 0.35, S * 0.7, S * 0.15, S * 0.7], [S * 0.5, S * 0.1, S * 0.62, S * 0.65, S * 0.38, S * 0.65], [S * 0.75, S * 0.28, S * 0.85, S * 0.72, S * 0.65, S * 0.72]].forEach(([ax, ay, bx, by, cx, cy]) => {
            ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by); ctx.lineTo(cx, cy); ctx.closePath(); ctx.fill();
          });
          break;
        case 2:
          ctx.strokeStyle = 'rgba(74, 222, 128, 0.7)'; ctx.lineWidth = 1.2;
          ctx.beginPath(); ctx.arc(S * 0.4, S * 0.45, 5, 0, Math.PI * 2); ctx.stroke();
          ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
          ctx.beginPath(); ctx.arc(S * 0.38, S * 0.42, 1.5, 0, Math.PI * 2); ctx.fill();
          break;
        case 3:
          ctx.strokeStyle = 'rgba(134, 239, 172, 0.6)'; ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(S * 0.4, S * 0.25); ctx.lineTo(S * 0.6, S * 0.5); ctx.lineTo(S * 0.4, S * 0.75); ctx.lineTo(S * 0.2, S * 0.5); ctx.closePath(); ctx.stroke();
          break;
        case 4:
          ctx.fillStyle = '#78350f'; ctx.fillRect(S * 0.43, S * 0.52, S * 0.14, S * 0.32);
          ctx.fillStyle = '#ef4444'; ctx.beginPath(); ctx.ellipse(S / 2, S * 0.5, S * 0.22, S * 0.16, 0, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = '#ffffff';
          ctx.beginPath(); ctx.arc(S * 0.38, S * 0.46, 2, 0, Math.PI * 2); ctx.fill();
          break;
        case 5:
          ctx.strokeStyle = 'rgba(16, 185, 129, 0.8)'; ctx.lineWidth = 1.4;
          ctx.beginPath(); ctx.moveTo(S / 2, S * 0.75); ctx.quadraticCurveTo(S * 0.15, S * 0.6, S * 0.1, S * 0.25); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(S / 2, S * 0.75); ctx.quadraticCurveTo(S * 0.85, S * 0.6, S * 0.9, S * 0.25); ctx.stroke();
          break;
        case 6:
          ctx.fillStyle = 'rgba(180, 83, 9, 0.7)';
          ctx.beginPath();
          ctx.moveTo(S * 0.5, S * 0.2); ctx.lineTo(S * 0.72, S * 0.35); ctx.lineTo(S * 0.68, S * 0.65);
          ctx.lineTo(S * 0.5, S * 0.75); ctx.lineTo(S * 0.3, S * 0.62); ctx.lineTo(S * 0.28, S * 0.35);
          ctx.closePath(); ctx.fill();
          break;
        case 7:
          ctx.fillStyle = 'rgba(249, 115, 22, 0.6)';
          ctx.beginPath(); ctx.arc(S / 2, S / 2, 5, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = 'rgba(254, 240, 138, 0.85)';
          ctx.beginPath(); ctx.arc(S / 2, S / 2, 2.5, 0, Math.PI * 2); ctx.fill();
          break;
      }
      ctx.restore();
    }
    ctx.restore();
  }

  function renderChunk(tileGrid, chunkX, chunkY) {
    const canvas = document.createElement('canvas');
    canvas.width = CHUNK_PX; canvas.height = CHUNK_PX;
    const ctx = canvas.getContext('2d');
    const sx = chunkX * CHUNK_TILES, sy = chunkY * CHUNK_TILES;
    for (let ly = 0; ly < CHUNK_TILES; ly++) {
      for (let lx = 0; lx < CHUNK_TILES; lx++) {
        const tx = sx + lx, ty = sy + ly;
        if (tx < GRID_W && ty < GRID_H) {
          const i = tileGrid.idx(tx, ty);
          drawTile(ctx, lx, ly, tileGrid.getType(tx, ty),
            tileGrid.noiseCache ? tileGrid.noiseCache[i] : 0.5,
            tileGrid.decorations ? tileGrid.decorations[i] : -1);
        }
      }
    }
    return canvas;
  }

  // IMPORTANT: ctx already has scale(zoom,zoom) + translate(-camX,-camY) applied by main.js.
  // Draw chunks and fog overlays in WORLD space.
  function renderVisibleChunks(ctx, tileGrid, camX, camY, viewW, viewH, zoom, playerX, playerY) {
    zoom = zoom || 1.85;
    const wL = camX, wT = camY, wR = camX + viewW / zoom, wB = camY + viewH / zoom;
    const sx = Math.max(0, Math.floor(wL / CHUNK_PX));
    const sy = Math.max(0, Math.floor(wT / CHUNK_PX));
    const ex = Math.min(CHUNKS_X - 1, Math.floor(wR / CHUNK_PX));
    const ey = Math.min(CHUNKS_Y - 1, Math.floor(wB / CHUNK_PX));

    // 1. Blit ground chunks
    for (let cy = sy; cy <= ey; cy++) {
      for (let cx = sx; cx <= ex; cx++) {
        const idx = cy * CHUNKS_X + cx;
        if (chunkCache.isDirty(idx) || !chunkCache.get(idx)) {
          chunkCache.set(idx, renderChunk(tileGrid, cx, cy));
          chunkCache.clearDirty(idx);
        }
        ctx.drawImage(chunkCache.get(idx), cx * CHUNK_PX, cy * CHUNK_PX);
      }
    }

    // 2. Smooth Atmospheric Fog of War Overlay
    if (tileGrid.explored) {
      const stx = Math.max(0, Math.floor(wL / TILE_SIZE));
      const sty = Math.max(0, Math.floor(wT / TILE_SIZE));
      const etx = Math.min(GRID_W - 1, Math.floor(wR / TILE_SIZE));
      const ety = Math.min(GRID_H - 1, Math.floor(wB / TILE_SIZE));

      // Shroud unrevealed and non-visible explored areas
      for (let ty = sty; ty <= ety; ty++) {
        for (let tx = stx; tx <= etx; tx++) {
          const e = tileGrid.explored[tileGrid.idx(tx, ty)];
          if (e === 0) {
            ctx.fillStyle = '#020617'; // Unexplored deep black-blue void
            ctx.fillRect(tx * TILE_SIZE, ty * TILE_SIZE, TILE_SIZE, TILE_SIZE);
          } else if (e === 1) {
            ctx.fillStyle = 'rgba(2, 6, 23, 0.65)'; // Explored ambient dark shroud
            ctx.fillRect(tx * TILE_SIZE, ty * TILE_SIZE, TILE_SIZE, TILE_SIZE);
          }
        }
      }

      // 3. Smooth Radial Vision Light Mask centered on Player (Don't Starve / Diablo style)
      if (playerX !== undefined && playerY !== undefined) {
        ctx.save();
        const innerR = 140;
        const outerR = 330;
        const lightGrad = ctx.createRadialGradient(playerX, playerY, innerR, playerX, playerY, outerR);
        lightGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
        lightGrad.addColorStop(0.5, 'rgba(2, 6, 23, 0.25)');
        lightGrad.addColorStop(1, 'rgba(2, 6, 23, 0.82)');

        ctx.globalCompositeOperation = 'destination-out';
        ctx.fillStyle = lightGrad;
        ctx.beginPath();
        ctx.arc(playerX, playerY, outerR, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }
  }

  function shadeHex(hex, pct) {
    if (!hex || hex[0] !== '#' || hex.length < 7) return hex || '#222';
    let r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16);
    r = Math.max(0, Math.min(255, r + (r * pct / 100) | 0));
    g = Math.max(0, Math.min(255, g + (g * pct / 100) | 0));
    b = Math.max(0, Math.min(255, b + (b * pct / 100) | 0));
    return `rgb(${r},${g},${b})`;
  }

  function renderMinimap(ctx, tileGrid, playerX, playerY, bosses, viewW) {
    const mapW = 180, mapH = 90, mapX = viewW - 196, mapY = 14;
    ctx.fillStyle = 'rgba(2, 6, 23, 0.92)'; ctx.strokeStyle = 'rgba(168, 85, 247, 0.6)'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.roundRect(mapX, mapY, mapW, mapH, 7); ctx.fill(); ctx.stroke();
    const scX = mapW / GRID_W, scY = mapH / GRID_H;
    const BC = {
      grass: '#1e3a8a', crystal_dense: '#1d4ed8', crystal_rock: '#0369a1',
      acid_ground: '#15803d', lab_floor: '#044e3b', acid_pool: '#22c55e',
      jungle: '#047857', swamp: '#0f766e', swamp_water: '#0f4c5c',
      volcanic: '#c2410c', crater: '#7e22ce', lava: '#f97316',
      plaza: '#4338ca', path: '#b45309', wall: '#1e1b4b',
      chasm: '#020617', dungeon_entry: '#a855f7'
    };
    for (let ty = 0; ty < GRID_H; ty++) for (let tx = 0; tx < GRID_W; tx++) {
      const e = tileGrid.explored[tileGrid.idx(tx, ty)];
      if (e === 0) continue;
      const col = BC[tileGrid.getType(tx, ty)] || '#222';
      ctx.fillStyle = e === 2 ? col : shadeHex(col, -40);
      ctx.fillRect(mapX + tx * scX, mapY + ty * scY, Math.max(1, scX), Math.max(1, scY));
    }
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)'; ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(mapX + mapW / 2, mapY); ctx.lineTo(mapX + mapW / 2, mapY + mapH);
    ctx.moveTo(mapX, mapY + mapH / 2); ctx.lineTo(mapX + mapW, mapY + mapH / 2);
    ctx.stroke();
    if (bosses) bosses.forEach(b => {
      const btx = Math.floor(b.x / TILE_SIZE), bty = Math.floor(b.y / TILE_SIZE);
      if (tileGrid.explored[tileGrid.idx(btx, bty)] > 0) {
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(mapX + (b.x / (GRID_W * TILE_SIZE)) * mapW, mapY + (b.y / (GRID_H * TILE_SIZE)) * mapH, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }
    });
    ctx.fillStyle = '#fff'; ctx.shadowColor = '#a855f7'; ctx.shadowBlur = 4;
    ctx.beginPath();
    ctx.arc(mapX + (playerX / (GRID_W * TILE_SIZE)) * mapW, mapY + (playerY / (GRID_H * TILE_SIZE)) * mapH, 3, 0, Math.PI * 2);
    ctx.fill(); ctx.shadowBlur = 0;
    ctx.font = '7px Outfit'; ctx.textAlign = 'left';
    ctx.fillStyle = 'rgba(186, 230, 253, 0.8)'; ctx.fillText('M', mapX + 3, mapY + 10);
    ctx.fillStyle = 'rgba(52, 211, 153, 0.8)'; ctx.fillText('B', mapX + 3, mapY + mapH - 3);
    ctx.textAlign = 'right';
    ctx.fillStyle = 'rgba(74, 222, 128, 0.8)'; ctx.fillText('C', mapX + mapW - 3, mapY + 10);
    ctx.fillStyle = 'rgba(251, 146, 60, 0.8)'; ctx.fillText('P', mapX + mapW - 3, mapY + mapH - 3);
    ctx.font = 'bold 7px Outfit'; ctx.fillStyle = 'rgba(148, 163, 184, 0.6)'; ctx.textAlign = 'left';
    ctx.fillText('MAP', mapX + 3, mapY + mapH - 3);
  }

  function init(tileGrid) {
    chunkCache.markAllDirty();
    if (tileGrid && tileGrid.updateFogFrame) {
      tileGrid.updateFogFrame(1800, 880, 16);
    }
  }

  return { renderVisibleChunks, renderMinimap, init, chunkCache };
})();
