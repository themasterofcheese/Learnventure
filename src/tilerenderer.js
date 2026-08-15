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

  // 64x64 Texture Generator for all 17 tile types
  const textureAtlas = {};

  function hash(x, y) {
    return Math.abs(Math.sin(x * 12.9898 + y * 78.233) * 43758.5453) % 1;
  }

  function generate64Texture(tileType) {
    const cvs = document.createElement('canvas');
    cvs.width = S64;
    cvs.height = S64;
    const ctx = cvs.getContext('2d');

    switch (tileType) {
      case 'grass': { // Crystal Meadow (Math)
        const g = ctx.createLinearGradient(0, 0, S64, S64);
        g.addColorStop(0, '#1e3a5f'); g.addColorStop(1, '#0f2744');
        ctx.fillStyle = g; ctx.fillRect(0, 0, S64, S64);

        // Ground texture noise
        const imgData = ctx.getImageData(0, 0, S64, S64);
        const data = imgData.data;
        for (let y = 0; y < S64; y++) {
          for (let x = 0; x < S64; x++) {
            const idx = (y * S64 + x) * 4;
            const n = hash(x, y);
            data[idx]     = Math.min(255, data[idx]     + (n * 25 - 12));
            data[idx + 1] = Math.min(255, data[idx + 1] + (n * 35 - 17));
            data[idx + 2] = Math.min(255, data[idx + 2] + (n * 45 - 20));
          }
        }
        ctx.putImageData(imgData, 0, 0);

        ctx.strokeStyle = 'rgba(56, 189, 248, 0.45)'; ctx.lineWidth = 1;
        for (let i = 0; i < 14; i++) {
          const bx = (i * 17 + 5) % S64, by = (i * 23 + 9) % S64;
          ctx.beginPath(); ctx.moveTo(bx, by);
          ctx.lineTo(bx + (i % 3 - 1) * 3, by - 6 - (i % 4)); ctx.stroke();
        }
        ctx.fillStyle = 'rgba(186, 230, 253, 0.85)';
        for (let i = 0; i < 8; i++) {
          ctx.fillRect((i * 29 + 3) % (S64 - 4) + 2, (i * 19 + 7) % (S64 - 4) + 2, 2, 2);
        }
        break;
      }
      case 'crystal_dense': { // Crystal Grove (Math)
        const g = ctx.createLinearGradient(0, 0, S64, S64);
        g.addColorStop(0, '#1d4ed8'); g.addColorStop(1, '#1e3a8a');
        ctx.fillStyle = g; ctx.fillRect(0, 0, S64, S64);

        ctx.strokeStyle = 'rgba(56, 189, 248, 0.6)'; ctx.lineWidth = 1.5;
        const drawDiamond = (cx, cy, rx, ry, col) => {
          ctx.fillStyle = col; ctx.beginPath();
          ctx.moveTo(cx, cy - ry); ctx.lineTo(cx + rx, cy);
          ctx.lineTo(cx, cy + ry); ctx.lineTo(cx - rx, cy);
          ctx.closePath(); ctx.fill(); ctx.stroke();
        };
        drawDiamond(16, 20, 12, 16, 'rgba(56, 189, 248, 0.35)');
        drawDiamond(44, 18, 14, 14, 'rgba(14, 165, 233, 0.4)');
        drawDiamond(28, 44, 16, 18, 'rgba(186, 230, 253, 0.45)');
        drawDiamond(52, 48, 10, 12, 'rgba(56, 189, 248, 0.3)');
        break;
      }
      case 'crystal_rock': { // Crystal Wall (Math)
        ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, S64, S64);
        const spires = [
          { pts: [[8, 64], [20, 10], [32, 64]], col: '#1e40af', light: '#38bdf8' },
          { pts: [[24, 64], [38, 4], [52, 64]], col: '#1d4ed8', light: '#7dd3fc' },
          { pts: [[42, 64], [54, 18], [62, 64]], col: '#1e3a8a', light: '#0284c7' }
        ];
        spires.forEach(sp => {
          ctx.fillStyle = sp.col; ctx.beginPath();
          ctx.moveTo(sp.pts[0][0], sp.pts[0][1]);
          ctx.lineTo(sp.pts[1][0], sp.pts[1][1]);
          ctx.lineTo(sp.pts[2][0], sp.pts[2][1]);
          ctx.closePath(); ctx.fill();
          ctx.strokeStyle = sp.light; ctx.lineWidth = 1.5; ctx.beginPath();
          ctx.moveTo(sp.pts[0][0], sp.pts[0][1]); ctx.lineTo(sp.pts[1][0], sp.pts[1][1]); ctx.stroke();
          ctx.fillStyle = '#ffffff'; ctx.beginPath();
          ctx.arc(sp.pts[1][0], sp.pts[1][1] + 2, 2, 0, Math.PI * 2); ctx.fill();
        });
        break;
      }
      case 'acid_ground': { // Corroded Ground (Chem)
        const g = ctx.createLinearGradient(0, 0, S64, S64);
        g.addColorStop(0, '#14281d'); g.addColorStop(1, '#0d1f14');
        ctx.fillStyle = g; ctx.fillRect(0, 0, S64, S64);

        ctx.strokeStyle = 'rgba(74, 222, 128, 0.5)'; ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(0, 20); ctx.lineTo(24, 12); ctx.lineTo(40, 36); ctx.lineTo(64, 28);
        ctx.moveTo(18, 64); ctx.lineTo(34, 42); ctx.lineTo(52, 54);
        ctx.stroke();

        ctx.fillStyle = 'rgba(34, 197, 94, 0.3)';
        ctx.beginPath(); ctx.arc(20, 22, 6, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(48, 44, 8, 0, Math.PI * 2); ctx.fill();
        break;
      }
      case 'lab_floor': { // Lab Floor (Chem)
        ctx.fillStyle = '#064e3b'; ctx.fillRect(0, 0, S64, S64);
        ctx.strokeStyle = 'rgba(52, 211, 153, 0.4)'; ctx.lineWidth = 1.2;
        const hx = 32, hy = 32, hr = 24;
        ctx.beginPath();
        for (let k = 0; k < 6; k++) {
          const a = k * Math.PI / 3 - Math.PI / 6;
          const x = hx + hr * Math.cos(a), y = hy + hr * Math.sin(a);
          k === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.closePath(); ctx.stroke();
        ctx.fillStyle = 'rgba(16, 185, 129, 0.15)'; ctx.fill();
        ctx.fillStyle = '#fbbf24';
        [[4, 4], [60, 4], [4, 60], [60, 60]].forEach(([rx, ry]) => {
          ctx.beginPath(); ctx.arc(rx, ry, 2, 0, Math.PI * 2); ctx.fill();
        });
        break;
      }
      case 'acid_pool': { // Acid Pool (Chem)
        const g = ctx.createRadialGradient(32, 32, 4, 32, 32, 36);
        g.addColorStop(0, '#4ade80'); g.addColorStop(0.5, '#16a34a'); g.addColorStop(1, '#052e16');
        ctx.fillStyle = g; ctx.fillRect(0, 0, S64, S64);
        ctx.strokeStyle = 'rgba(187, 247, 208, 0.8)'; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.arc(18, 20, 6, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.arc(46, 42, 8, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.arc(38, 18, 4, 0, Math.PI * 2); ctx.stroke();
        break;
      }
      case 'jungle': { // Jungle Floor (Bio)
        const g = ctx.createLinearGradient(0, 0, S64, S64);
        g.addColorStop(0, '#064e3b'); g.addColorStop(1, '#022c22');
        ctx.fillStyle = g; ctx.fillRect(0, 0, S64, S64);
        ctx.fillStyle = 'rgba(16, 185, 129, 0.5)';
        [[12, 14, 10, 6, 0.3], [36, 12, 12, 7, -0.4], [22, 40, 11, 6, 0.5], [48, 46, 13, 8, -0.2]].forEach(([lx, ly, rx, ry, rot]) => {
          ctx.save(); ctx.translate(lx, ly); ctx.rotate(rot);
          ctx.beginPath(); ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2); ctx.fill();
          ctx.restore();
        });
        ctx.fillStyle = 'rgba(52, 211, 153, 0.85)';
        ctx.beginPath(); ctx.arc(44, 24, 2, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(18, 48, 2.5, 0, Math.PI * 2); ctx.fill();
        break;
      }
      case 'swamp': { // Swamp (Bio)
        const g = ctx.createLinearGradient(0, 0, 0, S64);
        g.addColorStop(0, '#0f766e'); g.addColorStop(1, '#042f2e');
        ctx.fillStyle = g; ctx.fillRect(0, 0, S64, S64);
        ctx.strokeStyle = 'rgba(45, 212, 191, 0.4)'; ctx.lineWidth = 1.2;
        ctx.beginPath(); ctx.arc(32, 32, 18, 0, Math.PI * 1.5); ctx.stroke();
        ctx.beginPath(); ctx.arc(32, 32, 10, Math.PI * 0.5, Math.PI * 2); ctx.stroke();
        ctx.fillStyle = '#047857';
        ctx.beginPath(); ctx.arc(20, 44, 7, 0, Math.PI * 1.7); ctx.lineTo(20, 44); ctx.fill();
        break;
      }
      case 'swamp_water': { // Deep Swamp Water (Bio)
        const g = ctx.createRadialGradient(32, 32, 2, 32, 32, 38);
        g.addColorStop(0, '#0f4c5c'); g.addColorStop(0.7, '#082c36'); g.addColorStop(1, '#02131a');
        ctx.fillStyle = g; ctx.fillRect(0, 0, S64, S64);
        ctx.strokeStyle = 'rgba(45, 212, 191, 0.3)'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.arc(32, 32, 22, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.arc(32, 32, 12, 0, Math.PI * 2); ctx.stroke();
        break;
      }
      case 'volcanic': { // Volcanic Rock (Phys)
        const g = ctx.createLinearGradient(0, 0, S64, S64);
        g.addColorStop(0, '#1c1917'); g.addColorStop(1, '#0c0a09');
        ctx.fillStyle = g; ctx.fillRect(0, 0, S64, S64);
        ctx.strokeStyle = 'rgba(249, 115, 22, 0.7)'; ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(8, 8); ctx.lineTo(28, 22); ctx.lineTo(20, 48); ctx.lineTo(48, 58);
        ctx.moveTo(48, 0); ctx.lineTo(38, 28); ctx.lineTo(58, 42);
        ctx.stroke();
        break;
      }
      case 'crater': { // Crater (Phys)
        const g = ctx.createLinearGradient(0, 0, S64, S64);
        g.addColorStop(0, '#4c1d95'); g.addColorStop(1, '#1e1b4b');
        ctx.fillStyle = g; ctx.fillRect(0, 0, S64, S64);
        ctx.strokeStyle = 'rgba(192, 132, 252, 0.45)'; ctx.lineWidth = 1.2;
        ctx.beginPath(); ctx.arc(32, 32, 24, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.arc(32, 32, 14, 0, Math.PI * 2); ctx.stroke();
        ctx.fillStyle = 'rgba(168, 85, 247, 0.25)';
        ctx.beginPath(); ctx.arc(32, 32, 10, 0, Math.PI * 2); ctx.fill();
        break;
      }
      case 'lava': { // Molten Lava (Phys)
        const g = ctx.createRadialGradient(24, 24, 4, 32, 32, 36);
        g.addColorStop(0, '#f97316'); g.addColorStop(0.5, '#dc2626'); g.addColorStop(1, '#7f1d1d');
        ctx.fillStyle = g; ctx.fillRect(0, 0, S64, S64);
        ctx.strokeStyle = 'rgba(254, 240, 138, 0.9)'; ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, 24); ctx.lineTo(22, 34); ctx.lineTo(42, 18); ctx.lineTo(64, 40);
        ctx.stroke();
        ctx.fillStyle = '#1c1917';
        ctx.fillRect(10, 12, 10, 6);
        ctx.fillRect(40, 44, 12, 8);
        break;
      }
      case 'plaza': { // Market Plaza (Center)
        ctx.fillStyle = '#312e81'; ctx.fillRect(0, 0, S64, S64);
        ctx.strokeStyle = 'rgba(168, 85, 247, 0.4)'; ctx.lineWidth = 1.2;
        const bW = 16, bH = 16;
        for (let r = 0; r <= 4; r++) {
          const off = (r % 2) * (bW / 2);
          for (let c = -1; c <= 4; c++) ctx.strokeRect(c * bW + off, r * bH, bW, bH);
        }
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath(); ctx.arc(32, 32, 3, 0, Math.PI * 2); ctx.fill();
        break;
      }
      case 'path': { // Dirt Road (All)
        const g = ctx.createLinearGradient(0, 0, S64, S64);
        g.addColorStop(0, '#78350f'); g.addColorStop(1, '#451a03');
        ctx.fillStyle = g; ctx.fillRect(0, 0, S64, S64);
        ctx.fillStyle = 'rgba(251, 191, 36, 0.18)'; ctx.fillRect(10, 0, 44, S64);
        ctx.fillStyle = 'rgba(217, 119, 6, 0.65)';
        [[8, 10], [24, 38], [48, 18], [56, 48], [14, 54], [38, 8]].forEach(([bx, by]) => {
          ctx.beginPath(); ctx.arc(bx, by, 2, 0, Math.PI * 2); ctx.fill();
        });
        break;
      }
      case 'wall': { // Mountain Wall (Edge)
        const g = ctx.createLinearGradient(0, 0, S64, S64);
        g.addColorStop(0, '#1e1b4b'); g.addColorStop(1, '#0f172a');
        ctx.fillStyle = g; ctx.fillRect(0, 0, S64, S64);
        ctx.strokeStyle = 'rgba(99, 102, 241, 0.45)'; ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(0, 16); ctx.lineTo(38, 20); ctx.lineTo(64, 12);
        ctx.moveTo(12, 40); ctx.lineTo(52, 44); ctx.lineTo(64, 36);
        ctx.stroke();
        break;
      }
      case 'chasm': { // Void Chasm (Border)
        const g = ctx.createRadialGradient(32, 32, 2, 32, 32, 36);
        g.addColorStop(0, '#0f172a'); g.addColorStop(0.6, '#020617'); g.addColorStop(1, '#000000');
        ctx.fillStyle = g; ctx.fillRect(0, 0, S64, S64);
        break;
      }
      case 'dungeon_entry': { // Dungeon Portal Ground
        const g = ctx.createLinearGradient(0, 0, 0, S64);
        g.addColorStop(0, '#3b0764'); g.addColorStop(1, '#1e1b4b');
        ctx.fillStyle = g; ctx.fillRect(0, 0, S64, S64);
        ctx.strokeStyle = 'rgba(192, 132, 252, 0.9)'; ctx.lineWidth = 2.5;
        ctx.beginPath(); ctx.arc(32, 32, 22, 0, Math.PI * 2); ctx.stroke();
        ctx.fillStyle = 'rgba(168, 85, 247, 0.35)';
        ctx.beginPath(); ctx.arc(32, 32, 18, 0, Math.PI * 2); ctx.fill();
        break;
      }
      default: {
        ctx.fillStyle = '#1e293b'; ctx.fillRect(0, 0, S64, S64);
      }
    }
    return cvs;
  }

  function initTextures() {
    if (window.TileMap && window.TileMap.TILE_TYPES) {
      for (const type in window.TileMap.TILE_TYPES) {
        textureAtlas[type] = generate64Texture(type);
      }
    }
  }

  function drawTile(ctx, lx, ly, tileType, n, decorationId) {
    const px = lx * S, py = ly * S;
    ctx.save();

    // Render 64x64 pre-generated procedural texture
    const tex = textureAtlas[tileType] || textureAtlas['grass'];
    if (tex) {
      ctx.drawImage(tex, px, py, S, S);
    } else {
      ctx.fillStyle = '#1e293b'; ctx.fillRect(px, py, S, S);
    }

    // Render Tile Overlay Decorations
    if (decorationId !== undefined && decorationId >= 0) {
      ctx.save();
      ctx.translate(px, py);
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
          ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(S * 0.38, S * 0.46, 2, 0, Math.PI * 2); ctx.fill();
          break;
        case 5:
          ctx.strokeStyle = 'rgba(16, 185, 129, 0.8)'; ctx.lineWidth = 1.4;
          ctx.beginPath(); ctx.moveTo(S / 2, S * 0.75); ctx.quadraticCurveTo(S * 0.15, S * 0.6, S * 0.1, S * 0.25); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(S / 2, S * 0.75); ctx.quadraticCurveTo(S * 0.85, S * 0.6, S * 0.9, S * 0.25); ctx.stroke();
          break;
        case 6:
          ctx.fillStyle = 'rgba(180, 83, 9, 0.7)'; ctx.beginPath();
          ctx.moveTo(S * 0.5, S * 0.2); ctx.lineTo(S * 0.72, S * 0.35); ctx.lineTo(S * 0.68, S * 0.65);
          ctx.lineTo(S * 0.5, S * 0.75); ctx.lineTo(S * 0.3, S * 0.62); ctx.lineTo(S * 0.28, S * 0.35);
          ctx.closePath(); ctx.fill();
          break;
        case 7:
          ctx.fillStyle = 'rgba(249, 115, 22, 0.6)'; ctx.beginPath(); ctx.arc(S / 2, S / 2, 5, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = 'rgba(254, 240, 138, 0.85)'; ctx.beginPath(); ctx.arc(S / 2, S / 2, 2.5, 0, Math.PI * 2); ctx.fill();
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

  // Pre-generate textures on load
  initTextures();

  return { renderVisibleChunks, renderMinimap, init, chunkCache, initTextures };
})();
