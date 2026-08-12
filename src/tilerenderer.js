window.TileRenderer = (() => {
  const { TILE_SIZE, GRID_W, GRID_H, CHUNK_TILES, CHUNK_PX, CHUNKS_X, CHUNKS_Y } = window.TileMap;

  class ChunkCache {
    constructor() {
      this.canvases = new Map();
      this.dirty = new Set();
    }
    markDirty(chunkIdx) {
      this.dirty.add(chunkIdx);
    }
    markAllDirty() {
      for (let i = 0; i < CHUNKS_X * CHUNKS_Y; i++) {
        this.dirty.add(i);
      }
    }
    get(chunkIdx) {
      return this.canvases.get(chunkIdx) || null;
    }
    set(chunkIdx, canvas) {
      this.canvases.set(chunkIdx, canvas);
    }
    isDirty(chunkIdx) {
      return this.dirty.has(chunkIdx);
    }
    clearDirty(chunkIdx) {
      this.dirty.delete(chunkIdx);
    }
  }

  const chunkCache = new ChunkCache();

  function drawTile(ctx, tx, ty, tileType, noiseVal, decorationId) {
    const px = tx * TILE_SIZE;
    const py = ty * TILE_SIZE;
    
    ctx.save();
    ctx.translate(px, py);

    if (tileType === 'grass') {
      const grad = ctx.createRadialGradient(TILE_SIZE/2, TILE_SIZE/2, 0, TILE_SIZE/2, TILE_SIZE/2, TILE_SIZE/2);
      grad.addColorStop(0, 'rgba(200,225,240,0.9)');
      grad.addColorStop(1, 'rgba(160,195,220,0.8)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      const v = Math.floor(noiseVal * 10);
      for(let i=0; i<3; i++) {
        ctx.fillRect((v * i * 13) % TILE_SIZE, (v * i * 17) % TILE_SIZE, 2, 2);
      }
    } else if (tileType === 'crystal_dense') {
      ctx.fillStyle = '#8ab6e8';
      ctx.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
      ctx.fillStyle = '#c8e4ff';
      ctx.beginPath(); ctx.moveTo(5, 5); ctx.lineTo(15, 5); ctx.lineTo(10, 15); ctx.fill();
      ctx.beginPath(); ctx.moveTo(25, 20); ctx.lineTo(35, 20); ctx.lineTo(30, 30); ctx.fill();
    } else if (tileType === 'crystal_rock') {
      ctx.fillStyle = '#3a5a8a';
      ctx.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
      ctx.fillStyle = '#6a95cc';
      ctx.beginPath(); ctx.moveTo(10, 10); ctx.lineTo(20, 5); ctx.lineTo(15, 20); ctx.fill();
      ctx.fillStyle = '#90bfe8';
      ctx.beginPath(); ctx.moveTo(20, 20); ctx.lineTo(30, 15); ctx.lineTo(25, 30); ctx.fill();
    } else if (tileType === 'acid_ground') {
      ctx.fillStyle = '#1e3616';
      ctx.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
      ctx.strokeStyle = 'rgba(80,160,60,0.3)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, 10); ctx.lineTo(10, 15); ctx.lineTo(20, 10);
      ctx.moveTo(15, 30); ctx.lineTo(25, 25); ctx.lineTo(35, 35);
      ctx.stroke();
    } else if (tileType === 'lab_floor') {
      ctx.fillStyle = '#152a1a';
      ctx.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
      ctx.strokeStyle = 'rgba(100,200,100,0.2)';
      ctx.lineWidth = 1;
      ctx.strokeRect(0, 0, TILE_SIZE, TILE_SIZE);
      ctx.strokeRect(2, 2, TILE_SIZE-4, TILE_SIZE-4);
    } else if (tileType === 'acid_pool') {
      const grad = ctx.createLinearGradient(0, 0, TILE_SIZE, TILE_SIZE);
      grad.addColorStop(0, '#0a3a0a');
      grad.addColorStop(1, '#1a6a10');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
      ctx.strokeStyle = 'rgba(100,255,80,0.3)';
      ctx.beginPath(); ctx.arc(10, 10, 4, 0, Math.PI*2); ctx.stroke();
      ctx.beginPath(); ctx.arc(25, 25, 6, 0, Math.PI*2); ctx.stroke();
    } else if (tileType === 'jungle') {
      ctx.fillStyle = '#152415';
      ctx.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
      ctx.fillStyle = 'rgba(40,100,40,0.6)';
      ctx.beginPath(); ctx.arc(10, 10, 5, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(30, 15, 6, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(20, 30, 4, 0, Math.PI*2); ctx.fill();
    } else if (tileType === 'swamp') {
      ctx.fillStyle = '#0c1e18';
      ctx.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
      ctx.strokeStyle = 'rgba(20,80,50,0.4)';
      ctx.beginPath(); ctx.arc(20, 20, 10, 0, Math.PI, false); ctx.stroke();
      ctx.beginPath(); ctx.arc(10, 30, 8, 0, Math.PI, false); ctx.stroke();
    } else if (tileType === 'swamp_water') {
      ctx.fillStyle = '#06120e';
      ctx.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
      ctx.strokeStyle = 'rgba(10,50,35,0.5)';
      ctx.beginPath(); ctx.arc(20, 20, 8, 0, Math.PI*2); ctx.stroke();
      ctx.beginPath(); ctx.arc(20, 20, 14, 0, Math.PI*2); ctx.stroke();
    } else if (tileType === 'volcanic') {
      ctx.fillStyle = '#1e1008';
      ctx.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
      ctx.strokeStyle = 'rgba(180,80,20,0.3)';
      ctx.beginPath();
      ctx.moveTo(20, 20); ctx.lineTo(0, 0);
      ctx.moveTo(20, 20); ctx.lineTo(40, 10);
      ctx.moveTo(20, 20); ctx.lineTo(10, 40);
      ctx.stroke();
    } else if (tileType === 'crater') {
      ctx.fillStyle = '#2a1508';
      ctx.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
      ctx.strokeStyle = 'rgba(200,100,30,0.2)';
      ctx.beginPath(); ctx.arc(20, 20, 12, Math.PI, Math.PI*2); ctx.stroke();
    } else if (tileType === 'lava') {
      const grad = ctx.createRadialGradient(20, 20, 0, 20, 20, 20);
      grad.addColorStop(0, '#ff6600');
      grad.addColorStop(1, '#8b2000');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
      ctx.fillStyle = 'rgba(255,255,255,0.3)';
      ctx.beginPath(); ctx.arc(20, 20, 4, 0, Math.PI*2); ctx.fill();
    } else if (tileType === 'plaza') {
      ctx.fillStyle = '#22223a';
      ctx.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
      ctx.strokeStyle = 'rgba(80,80,120,0.4)';
      ctx.beginPath();
      ctx.moveTo(20, 0); ctx.lineTo(20, 40);
      ctx.moveTo(0, 20); ctx.lineTo(40, 20);
      ctx.stroke();
    } else if (tileType === 'path') {
      ctx.fillStyle = '#3a2e1a';
      ctx.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
      ctx.fillStyle = 'rgba(100,90,70,0.5)';
      ctx.beginPath(); ctx.arc(10, 10, 2, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(30, 20, 3, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(15, 30, 2, 0, Math.PI*2); ctx.fill();
    } else if (tileType === 'wall') {
      ctx.fillStyle = '#0a0a1a';
      ctx.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
      ctx.strokeStyle = 'rgba(40,40,80,0.4)';
      ctx.beginPath();
      ctx.moveTo(0, 40); ctx.lineTo(20, 20); ctx.lineTo(40, 40);
      ctx.stroke();
    } else if (tileType === 'chasm') {
      const grad = ctx.createLinearGradient(0, 0, 0, TILE_SIZE);
      grad.addColorStop(0, '#050508');
      grad.addColorStop(1, '#000000');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
    } else if (tileType === 'dungeon_entry') {
      ctx.fillStyle = '#1a0826';
      ctx.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
      ctx.strokeStyle = 'rgba(150,50,220,0.6)';
      ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(20, 20, 10, 0, Math.PI*2); ctx.stroke();
    } else {
      ctx.fillStyle = '#ff00ff';
      ctx.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
    }

    if (decorationId !== undefined && decorationId !== -1) {
      if (decorationId === 0) {
        ctx.fillStyle = 'rgba(180,220,255,0.8)';
        ctx.beginPath(); ctx.moveTo(20, 10); ctx.lineTo(25, 30); ctx.lineTo(15, 30); ctx.fill();
      } else if (decorationId === 1) {
        ctx.fillStyle = 'rgba(180,220,255,0.8)';
        ctx.beginPath(); ctx.moveTo(20, 5); ctx.lineTo(25, 20); ctx.lineTo(15, 20); ctx.fill();
        ctx.beginPath(); ctx.moveTo(10, 15); ctx.lineTo(15, 30); ctx.lineTo(5, 30); ctx.fill();
        ctx.beginPath(); ctx.moveTo(30, 15); ctx.lineTo(35, 30); ctx.lineTo(25, 30); ctx.fill();
      } else if (decorationId === 2) {
        ctx.fillStyle = 'rgba(100,255,80,0.5)';
        ctx.beginPath(); ctx.arc(20, 20, 6, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.beginPath(); ctx.arc(18, 18, 2, 0, Math.PI*2); ctx.fill();
      } else if (decorationId === 3) {
        ctx.fillStyle = 'rgba(150,255,100,0.4)';
        ctx.beginPath(); ctx.moveTo(20, 10); ctx.lineTo(30, 20); ctx.lineTo(20, 30); ctx.lineTo(10, 20); ctx.fill();
      } else if (decorationId === 4) {
        ctx.fillStyle = '#8b4513';
        ctx.fillRect(18, 20, 4, 10);
        ctx.fillStyle = '#cd5c5c';
        ctx.beginPath(); ctx.arc(20, 20, 8, Math.PI, 0); ctx.fill();
      } else if (decorationId === 5) {
        ctx.strokeStyle = 'rgba(80,180,80,0.7)';
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(10, 30, 15, 0, Math.PI/2, true); ctx.stroke();
        ctx.beginPath(); ctx.arc(30, 30, 15, Math.PI, Math.PI*1.5); ctx.stroke();
      } else if (decorationId === 6) {
        ctx.fillStyle = 'rgba(120,80,40,0.6)';
        ctx.beginPath(); ctx.moveTo(20, 10); ctx.lineTo(30, 15); ctx.lineTo(25, 30); ctx.lineTo(15, 28); ctx.lineTo(10, 20); ctx.fill();
      } else if (decorationId === 7) {
        ctx.fillStyle = 'rgba(255,120,20,0.5)';
        ctx.beginPath(); ctx.arc(20, 20, 5, 0, Math.PI*2); ctx.fill();
      }
    }

    ctx.restore();
  }

  function renderChunk(tileGrid, chunkX, chunkY) {
    const canvas = document.createElement('canvas');
    canvas.width = CHUNK_PX;
    canvas.height = CHUNK_PX;
    const ctx = canvas.getContext('2d');
    
    const startX = chunkX * CHUNK_TILES;
    const startY = chunkY * CHUNK_TILES;

    for (let y = 0; y < CHUNK_TILES; y++) {
      for (let x = 0; x < CHUNK_TILES; x++) {
        const tx = startX + x;
        const ty = startY + y;
        if (tx < GRID_W && ty < GRID_H) {
          const type = tileGrid.getType(tx, ty);
          const idx = tileGrid.idx(tx, ty);
          const noise = tileGrid.noiseCache ? tileGrid.noiseCache[idx] : 0.5;
          const decor = tileGrid.decorations ? tileGrid.decorations[idx] : -1;
          drawTile(ctx, x, y, type, noise, decor); // drawn relative to chunk
        }
      }
    }
    return canvas;
  }

  function renderVisibleChunks(ctx, tileGrid, camX, camY, viewW, viewH) {
    const startChunkX = Math.max(0, Math.floor(camX / CHUNK_PX));
    const startChunkY = Math.max(0, Math.floor(camY / CHUNK_PX));
    const endChunkX = Math.min(CHUNKS_X - 1, Math.floor((camX + viewW) / CHUNK_PX));
    const endChunkY = Math.min(CHUNKS_Y - 1, Math.floor((camY + viewH) / CHUNK_PX));

    for (let cy = startChunkY; cy <= endChunkY; cy++) {
      for (let cx = startChunkX; cx <= endChunkX; cx++) {
        const chunkIdx = cy * CHUNKS_X + cx;
        if (chunkCache.isDirty(chunkIdx) || !chunkCache.get(chunkIdx)) {
          const canvas = renderChunk(tileGrid, cx, cy);
          chunkCache.set(chunkIdx, canvas);
          chunkCache.clearDirty(chunkIdx);
        }
        
        const chunkCanvas = chunkCache.get(chunkIdx);
        ctx.drawImage(chunkCanvas, cx * CHUNK_PX - camX, cy * CHUNK_PX - camY);
      }
    }

    if (tileGrid.explored) {
      const startTx = Math.max(0, Math.floor(camX / TILE_SIZE));
      const startTy = Math.max(0, Math.floor(camY / TILE_SIZE));
      const endTx = Math.min(GRID_W - 1, Math.floor((camX + viewW) / TILE_SIZE));
      const endTy = Math.min(GRID_H - 1, Math.floor((camY + viewH) / TILE_SIZE));

      for (let ty = startTy; ty <= endTy; ty++) {
        for (let tx = startTx; tx <= endTx; tx++) {
          const idx = tileGrid.idx(tx, ty);
          const expl = tileGrid.explored[idx];
          if (expl === 0) {
            ctx.fillStyle = 'black';
            ctx.fillRect(tx * TILE_SIZE - camX, ty * TILE_SIZE - camY, TILE_SIZE, TILE_SIZE);
          } else if (expl === 1) {
            ctx.fillStyle = 'rgba(0,0,0,0.65)';
            ctx.fillRect(tx * TILE_SIZE - camX, ty * TILE_SIZE - camY, TILE_SIZE, TILE_SIZE);
          }
        }
      }
    }
  }

  function renderMinimap(ctx, tileGrid, playerX, playerY, bosses, viewW) {
    const mapW = 180;
    const mapH = 90;
    const mapX = viewW - 196;
    const mapY = 14;

    ctx.fillStyle = 'rgba(2,6,23,0.92)';
    ctx.fillRect(mapX, mapY, mapW, mapH);
    ctx.strokeStyle = 'purple';
    ctx.lineWidth = 1;
    ctx.strokeRect(mapX, mapY, mapW, mapH);

    const scaleX = mapW / GRID_W;
    const scaleY = mapH / GRID_H;

    const colors = {
      grass: [160, 195, 220],
      crystal_dense: [200, 228, 255],
      crystal_rock: [106, 149, 204],
      acid_ground: [30, 54, 22],
      lab_floor: [21, 42, 26],
      acid_pool: [26, 106, 16],
      jungle: [21, 36, 21],
      swamp: [12, 30, 24],
      swamp_water: [6, 18, 14],
      volcanic: [30, 16, 8],
      crater: [42, 21, 8],
      lava: [255, 102, 0],
      plaza: [34, 34, 58],
      path: [58, 46, 26],
      wall: [10, 10, 26],
      dungeon_entry: [26, 8, 38],
      chasm: [5, 5, 8]
    };

    if (tileGrid.explored) {
      for (let ty = 0; ty < GRID_H; ty += 2) {
        for (let tx = 0; tx < GRID_W; tx += 2) {
          const idx = tileGrid.idx(tx, ty);
          const expl = tileGrid.explored[idx];
          if (expl > 0) {
            const type = tileGrid.getType(tx, ty);
            const c = colors[type] || [255, 0, 255];
            const alpha = expl === 1 ? 0.5 : 1.0;
            ctx.fillStyle = `rgba(${c[0]},${c[1]},${c[2]},${alpha})`;
            ctx.fillRect(mapX + tx * scaleX, mapY + ty * scaleY, scaleX * 2, scaleY * 2);
          }
        }
      }
    }

    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(mapX + (playerX / TILE_SIZE) * scaleX, mapY + (playerY / TILE_SIZE) * scaleY, 3, 0, Math.PI * 2);
    ctx.fill();

    if (bosses && tileGrid.explored) {
      ctx.fillStyle = 'red';
      for (const boss of bosses) {
        const tx = Math.floor(boss.x / TILE_SIZE);
        const ty = Math.floor(boss.y / TILE_SIZE);
        if (tileGrid.explored[tileGrid.idx(tx, ty)] > 0) {
          ctx.beginPath();
          ctx.arc(mapX + tx * scaleX, mapY + ty * scaleY, 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    ctx.fillStyle = 'gray';
    ctx.font = '10px sans-serif';
    ctx.fillText('MAP', mapX + 4, mapY + 12);
    
    ctx.font = '8px sans-serif';
    ctx.fillStyle = '#8ab6e8'; ctx.fillText('M', mapX + 4, mapY + mapH / 2 - 4);
    ctx.fillStyle = '#50a03c'; ctx.fillText('C', mapX + mapW - 10, mapY + mapH / 2 - 4);
    ctx.fillStyle = '#286428'; ctx.fillText('B', mapX + 4, mapY + mapH - 4);
    ctx.fillStyle = '#ff6600'; ctx.fillText('P', mapX + mapW - 10, mapY + mapH - 4);
  }

  function init(tileGrid) {
    chunkCache.markAllDirty();
  }

  return { renderVisibleChunks, renderMinimap, init, chunkCache };
})();
