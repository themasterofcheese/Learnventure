window.TileRenderer = (() => {
  const { TILE_SIZE, GRID_W, GRID_H, CHUNK_TILES, CHUNK_PX, CHUNKS_X, CHUNKS_Y } = window.TileMap;
  const S = TILE_SIZE;
  const S64 = 64;

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

  // HD Generated Tile Image Textures
  const hdImages = {};
  const hdSources = {
    // MATH REALM (Top-Left: Crystal Meadow & Sapphire Quartz)
    grass: 'assets/tile_grass.jpg',
    crystal_dense: 'assets/tile_crystal.jpg',
    crystal_rock: 'assets/tile_crystal.jpg',

    // CHEMISTRY REALM (Top-Right: 100% Molten Magma Lava & Volcanic Basalt)
    acid_ground: 'assets/tile_lava.jpg',
    acid_pool: 'assets/tile_lava.jpg',
    lava: 'assets/tile_lava.jpg',
    volcanic: 'assets/tile_lava.jpg',

    // BIOLOGY REALM (Bottom-Left: 100% Bioluminescent Jungle & Swamp)
    jungle: 'assets/tile_jungle.jpg',
    swamp: 'assets/tile_jungle.jpg',
    swamp_water: 'assets/tile_jungle.jpg',

    // PHYSICS REALM (Bottom-Right: 100% Metallic Steel Circuits & Tesla Arcs)
    crater: 'assets/tile_physics.jpg',
    lab_floor: 'assets/tile_physics.jpg',
    wall: 'assets/tile_physics.jpg',
    chasm: 'assets/tile_physics.jpg',

    // SHARED TOWN PLAZA
    plaza: 'assets/tile_plaza.jpg',
    path: 'assets/tile_plaza.jpg',
    dungeon_entry: 'assets/tile_plaza.jpg'
  };

  const loadedImages = {};

  function loadHDImages() {
    for (const type in hdSources) {
      const src = hdSources[type];
      if (!loadedImages[src]) {
        const img = new Image();
        img.src = src;
        img.onload = () => {
          chunkCache.markAllDirty();
        };
        loadedImages[src] = img;
      }
      hdImages[type] = loadedImages[src];
    }
  }

  // 64x64 Procedural Fallback Canvas Atlas
  const proceduralAtlas = {};

  function hash(x, y) {
    return Math.abs(Math.sin(x * 12.9898 + y * 78.233) * 43758.5453) % 1;
  }

  function generateProceduralFallback(tileType) {
    const cvs = document.createElement('canvas');
    cvs.width = S64; cvs.height = S64;
    const ctx = cvs.getContext('2d');

    const g = ctx.createLinearGradient(0, 0, S64, S64);
    if (tileType.includes('crystal') || tileType === 'grass') {
      g.addColorStop(0, '#1e3a5f'); g.addColorStop(1, '#0f2744');
    } else if (tileType.includes('acid') || tileType === 'lab_floor') {
      g.addColorStop(0, '#14281d'); g.addColorStop(1, '#0d1f14');
    } else if (tileType.includes('jungle') || tileType.includes('swamp')) {
      g.addColorStop(0, '#064e3b'); g.addColorStop(1, '#022c22');
    } else if (tileType.includes('lava') || tileType.includes('volcanic')) {
      g.addColorStop(0, '#1c1917'); g.addColorStop(1, '#0c0a09');
    } else {
      g.addColorStop(0, '#312e81'); g.addColorStop(1, '#1e1b4b');
    }
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, S64, S64);
    return cvs;
  }

  function initTextures() {
    if (window.TileMap && window.TileMap.TILE_TYPES) {
      for (const type in window.TileMap.TILE_TYPES) {
        proceduralAtlas[type] = generateProceduralFallback(type);
      }
    }
    loadHDImages();
  }

  function drawTile(ctx, lx, ly, tileType, n, decorationId, worldTx, worldTy) {
    const px = lx * S, py = ly * S;
    const wTx = worldTx !== undefined ? worldTx : lx;
    const wTy = worldTy !== undefined ? worldTy : ly;

    ctx.save();

    // 1. Render HD Generated Image Texture (sub-crop sampling for zero repetitive grid effect)
    const img = hdImages[tileType];
    if (img && img.complete && img.naturalWidth > 0) {
      const cropSize = 128;
      const srcX = (wTx * 97) % (img.naturalWidth - cropSize);
      const srcY = (wTy * 113) % (img.naturalHeight - cropSize);
      ctx.drawImage(img, srcX, srcY, cropSize, cropSize, px, py, S, S);
    } else {
      // Fallback
      const fallback = proceduralAtlas[tileType] || proceduralAtlas['grass'];
      if (fallback) ctx.drawImage(fallback, px, py, S, S);
    }

    // 2. Overlay Biome Tint / Edge Shading
    if (tileType === 'crystal_rock' || tileType === 'wall') {
      ctx.fillStyle = 'rgba(15, 23, 42, 0.35)'; ctx.fillRect(px, py, S, S);
    } else if (tileType === 'acid_pool' || tileType === 'lava') {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.08)'; ctx.fillRect(px, py, S, S);
    }

    // 3. Optional Soft Bioluminescent Particle Highlights (Replaces crude legacy vector shapes)
    if (decorationId !== undefined && decorationId >= 0) {
      ctx.save();
      ctx.translate(px, py);
      if (decorationId === 0 || decorationId === 1) {
        ctx.fillStyle = 'rgba(186, 230, 253, 0.4)';
        ctx.beginPath(); ctx.arc(S * 0.4, S * 0.4, 2, 0, Math.PI * 2); ctx.fill();
      } else if (decorationId === 2 || decorationId === 3) {
        ctx.fillStyle = 'rgba(74, 222, 128, 0.4)';
        ctx.beginPath(); ctx.arc(S * 0.6, S * 0.5, 2.5, 0, Math.PI * 2); ctx.fill();
      } else if (decorationId === 4 || decorationId === 5) {
        ctx.fillStyle = 'rgba(52, 211, 153, 0.4)';
        ctx.beginPath(); ctx.arc(S * 0.3, S * 0.7, 2, 0, Math.PI * 2); ctx.fill();
      } else if (decorationId === 6 || decorationId === 7) {
        ctx.fillStyle = 'rgba(251, 146, 60, 0.4)';
        ctx.beginPath(); ctx.arc(S * 0.5, S * 0.5, 2, 0, Math.PI * 2); ctx.fill();
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
            tileGrid.decorations ? tileGrid.decorations[i] : -1,
            tx, ty);
        }
      }
    }
    return canvas;
  }

  function renderVisibleChunks(ctx, tileGrid, camX, camY, viewW, viewH, zoom, playerX, playerY) {
    zoom = zoom || 1.85;
    const wL = camX, wT = camY, wR = camX + viewW / zoom, wB = camY + viewH / zoom;
    const sx = Math.max(0, Math.floor(wL / CHUNK_PX));
    const sy = Math.max(0, Math.floor(wT / CHUNK_PX));
    const ex = Math.min(CHUNKS_X - 1, Math.floor(wR / CHUNK_PX));
    const ey = Math.min(CHUNKS_Y - 1, Math.floor(wB / CHUNK_PX));

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

    if (tileGrid.explored) {
      const stx = Math.max(0, Math.floor(wL / TILE_SIZE));
      const sty = Math.max(0, Math.floor(wT / TILE_SIZE));
      const etx = Math.min(GRID_W - 1, Math.floor(wR / TILE_SIZE));
      const ety = Math.min(GRID_H - 1, Math.floor(wB / TILE_SIZE));

      for (let ty = sty; ty <= ety; ty++) {
        for (let tx = stx; tx <= etx; tx++) {
          const e = tileGrid.explored[tileGrid.idx(tx, ty)];
          if (e === 0) {
            ctx.fillStyle = '#020617';
            ctx.fillRect(tx * TILE_SIZE, ty * TILE_SIZE, TILE_SIZE, TILE_SIZE);
          } else if (e === 1) {
            ctx.fillStyle = 'rgba(2, 6, 23, 0.65)';
            ctx.fillRect(tx * TILE_SIZE, ty * TILE_SIZE, TILE_SIZE, TILE_SIZE);
          }
        }
      }

      if (playerX !== undefined && playerY !== undefined) {
        ctx.save();
        const innerR = 140, outerR = 330;
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
    initTextures();
    chunkCache.markAllDirty();
    if (tileGrid && tileGrid.updateFogFrame) {
      tileGrid.updateFogFrame(1800, 880, 16);
    }
  }

  initTextures();

  return { renderVisibleChunks, renderMinimap, init, chunkCache, initTextures };
})();
