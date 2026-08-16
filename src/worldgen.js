window.WorldGen = (() => {
  class SeededRNG {
    constructor(seed) {
      this.seed = seed;
    }
    next() {
      let t = this.seed += 0x6D2B79F5;
      t = Math.imul(t ^ t >>> 15, t | 1);
      t ^= t + Math.imul(t ^ t >>> 7, t | 61);
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    }
    nextInt(min, max) {
      return Math.floor(this.next() * (max - min + 1)) + min;
    }
    nextFloat(min, max) {
      return this.next() * (max - min) + min;
    }
  }

  class SeededNoise {
    constructor(seed) {
      this.p = new Uint8Array(512);
      const rng = new SeededRNG(seed);
      const p = new Uint8Array(256);
      for (let i = 0; i < 256; i++) {
        p[i] = i;
      }
      for (let i = 255; i > 0; i--) {
        const j = rng.nextInt(0, i);
        const temp = p[i];
        p[i] = p[j];
        p[j] = temp;
      }
      for (let i = 0; i < 512; i++) {
        this.p[i] = p[i & 255];
      }
    }
    fade(t) {
      return t * t * t * (t * (t * 6 - 15) + 10);
    }
    lerp(a, b, t) {
      return a + t * (b - a);
    }
    grad(hash, x, y) {
      const h = hash & 7;
      const u = h < 4 ? x : y;
      const v = h < 4 ? y : x;
      return ((h & 1) ? -u : u) + ((h & 2) ? -2.0 * v : 2.0 * v);
    }
    noise2D(x, y) {
      const X = Math.floor(x) & 255;
      const Y = Math.floor(y) & 255;
      x -= Math.floor(x);
      y -= Math.floor(y);
      const u = this.fade(x);
      const v = this.fade(y);
      const A = this.p[X] + Y;
      const B = this.p[X + 1] + Y;
      
      return this.lerp(
        this.lerp(this.grad(this.p[A], x, y), this.grad(this.p[B], x - 1, y), u),
        this.lerp(this.grad(this.p[A + 1], x, y - 1), this.grad(this.p[B + 1], x - 1, y - 1), u),
        v
      );
    }
    fbm(x, y, octaves = 4) {
      let total = 0;
      let frequency = 1;
      let amplitude = 1;
      let maxValue = 0;
      for (let i = 0; i < octaves; i++) {
        total += this.noise2D(x * frequency, y * frequency) * amplitude;
        maxValue += amplitude;
        amplitude *= 0.5;
        frequency *= 2.0;
      }
      return (total / maxValue + 1) / 2; // normalize to 0-1
    }
  }

  const WORLD_SEED = 42;

  function generateWorld(tileGrid) {
    const GRID_W = tileGrid.width || 90;
    const GRID_H = tileGrid.height || 44;
    const TILE_SIZE = 40; 
    
    const noise = new SeededNoise(WORLD_SEED);
    const rng = new SeededRNG(WORLD_SEED);

    // 1. Fill border walls (quadrant-aware)
    for (let ty = 0; ty < GRID_H; ty++) {
      for (let tx = 0; tx < GRID_W; tx++) {
        if (tx < 2 || tx > GRID_W - 3 || ty < 2 || ty > GRID_H - 3) {
          if (tx < 45 && ty < 22) tileGrid.setType(tx, ty, 'crystal_rock'); // Math border
          else if (tx >= 45 && ty < 22) tileGrid.setType(tx, ty, 'volcanic'); // Chem border
          else if (tx < 45 && ty >= 22) tileGrid.setType(tx, ty, 'swamp_water'); // Bio border
          else tileGrid.setType(tx, ty, 'wall'); // Phys border
        }
      }
    }

    // 2. Voronoi biome assignment
    const biomes = [
      { name: 'math', x: 450, y: 220, type: 'primary' },
      { name: 'chem', x: 2880, y: 220, type: 'primary' },
      { name: 'bio', x: 450, y: 1320, type: 'primary' },
      { name: 'phys', x: 2880, y: 1320, type: 'primary' }
    ];

    for (let i = 0; i < 18; i++) {
      biomes.push({ name: 'math', x: rng.nextFloat(0, 1800), y: rng.nextFloat(0, 880), type: 'secondary' });
      biomes.push({ name: 'chem', x: rng.nextFloat(1800, 3600), y: rng.nextFloat(0, 880), type: 'secondary' });
      biomes.push({ name: 'bio', x: rng.nextFloat(0, 1800), y: rng.nextFloat(880, 1760), type: 'secondary' });
      biomes.push({ name: 'phys', x: rng.nextFloat(1800, 3600), y: rng.nextFloat(880, 1760), type: 'secondary' });
    }

    if (!tileGrid.noiseCache) tileGrid.noiseCache = new Float32Array(GRID_W * GRID_H);
    if (!tileGrid.decorations) tileGrid.decorations = new Int8Array(GRID_W * GRID_H).fill(-1);

    for (let ty = 2; ty < GRID_H - 2; ty++) {
      for (let tx = 2; tx < GRID_W - 2; tx++) {
        const px = tx * TILE_SIZE + noise.noise2D(tx * 0.05, ty * 0.05) * 80;
        const py = ty * TILE_SIZE + noise.noise2D(tx * 0.05 + 100, ty * 0.05 + 100) * 80;

        let nearestBiome = null;
        let minDist = Infinity;
        for (const b of biomes) {
          const dx = px - b.x;
          const dy = py - b.y;
          const dist = dx * dx + dy * dy;
          if (dist < minDist) {
            minDist = dist;
            nearestBiome = b;
          }
        }

        const n = noise.fbm(tx * 0.12, ty * 0.12);
        tileGrid.noiseCache[tileGrid.idx(tx, ty)] = n;

        let type = 'grass';
        if (nearestBiome.name === 'math') {
          type = n > 0.72 ? 'crystal_rock' : (n > 0.48 ? 'crystal_dense' : 'grass');
        } else if (nearestBiome.name === 'chem') {
          type = n > 0.65 ? 'lava' : (n > 0.42 ? 'volcanic' : (n > 0.22 ? 'acid_pool' : 'acid_ground'));
        } else if (nearestBiome.name === 'bio') {
          type = n > 0.72 ? 'swamp_water' : (n > 0.48 ? 'swamp' : 'jungle');
        } else if (nearestBiome.name === 'phys') {
          type = n > 0.60 ? 'lab_floor' : 'crater';
        }
        
        tileGrid.setType(tx, ty, type);
      }
    }

    // 3. Central plaza
    const cx = 45;
    const cy = 22;
    for (let ty = cy - 6; ty <= cy + 6; ty++) {
      for (let tx = cx - 6; tx <= cx + 6; tx++) {
        const dx = tx - cx;
        const dy = ty - cy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist <= 6 && tx > 0 && tx < GRID_W && ty > 0 && ty < GRID_H) {
          tileGrid.setType(tx, ty, 'plaza');
        }
        if (dist <= 3 && tx > 0 && tx < GRID_W && ty > 0 && ty < GRID_H) {
          tileGrid.setType(tx, ty, 'plaza');
        }
      }
    }

    // 4. Path network
    const waypoints = {
      center: { tx: 45, ty: 22 },
      mathBoss: { tx: 11, ty: 11 },
      chemBoss: { tx: 79, ty: 11 },
      bioBoss: { tx: 11, ty: 33 },
      physBoss: { tx: 79, ty: 33 },
      mathDungeon: { tx: 16, ty: 22 },
      chemDungeon: { tx: 74, ty: 11 },
      bioDungeon: { tx: 16, ty: 33 },
      physDungeon: { tx: 74, ty: 33 },
      mathMerchant: { tx: 22, ty: 9 },
      chemMerchant: { tx: 68, ty: 9 },
      bioMerchant: { tx: 22, ty: 35 },
      physMerchant: { tx: 68, ty: 35 }
    };

    function carvePath(tg, p1, p2, width = 2) {
      let x0 = p1.tx;
      let y0 = p1.ty;
      const x1 = p2.tx;
      const y1 = p2.ty;
      const dx = Math.abs(x1 - x0);
      const dy = Math.abs(y1 - y0);
      const sx = (x0 < x1) ? 1 : -1;
      const sy = (y0 < y1) ? 1 : -1;
      let err = dx - dy;

      while (true) {
        for (let wy = -width; wy <= width; wy++) {
          for (let wx = -width; wx <= width; wx++) {
            if (wx * wx + wy * wy <= width * width) {
              const nx = x0 + wx;
              const ny = y0 + wy;
              if (nx >= 2 && nx < GRID_W - 2 && ny >= 2 && ny < GRID_H - 2) {
                const currentType = tg.getType(nx, ny);
                if (currentType !== 'plaza' && currentType !== 'wall') {
                  tg.setType(nx, ny, 'path');
                }
              }
            }
          }
        }
        if (x0 === x1 && y0 === y1) break;
        const e2 = 2 * err;
        if (e2 > -dy) { err -= dy; x0 += sx; }
        if (e2 < dx) { err += dx; y0 += sy; }
      }
    }

    carvePath(tileGrid, waypoints.center, waypoints.mathBoss);
    carvePath(tileGrid, waypoints.center, waypoints.chemBoss);
    carvePath(tileGrid, waypoints.center, waypoints.bioBoss);
    carvePath(tileGrid, waypoints.center, waypoints.physBoss);
    carvePath(tileGrid, waypoints.mathBoss, waypoints.mathDungeon);
    carvePath(tileGrid, waypoints.mathBoss, waypoints.mathMerchant);
    carvePath(tileGrid, waypoints.chemBoss, waypoints.chemDungeon);
    carvePath(tileGrid, waypoints.chemBoss, waypoints.chemMerchant);
    carvePath(tileGrid, waypoints.bioBoss, waypoints.bioDungeon);
    carvePath(tileGrid, waypoints.bioBoss, waypoints.bioMerchant);
    carvePath(tileGrid, waypoints.physBoss, waypoints.physDungeon);
    carvePath(tileGrid, waypoints.physBoss, waypoints.physMerchant);

    // 5. Place dungeon portal tiles
    const dungeons = [waypoints.mathDungeon, waypoints.chemDungeon, waypoints.bioDungeon, waypoints.physDungeon];
    for (const d of dungeons) {
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const nx = d.tx + dx;
          const ny = d.ty + dy;
          if (nx >= 0 && nx < GRID_W && ny >= 0 && ny < GRID_H) {
            tileGrid.setType(nx, ny, 'dungeon_entry');
          }
        }
      }
    }

    // 6. Decoration pass
    for (let ty = 2; ty < GRID_H - 2; ty++) {
      for (let tx = 2; tx < GRID_W - 2; tx++) {
        const type = tileGrid.getType(tx, ty);
        if (type !== 'path' && type !== 'plaza' && type !== 'dungeon_entry' && type !== 'wall') {
          // Check neighbors
          let hasNeighborDecor = false;
          for (let ny = -1; ny <= 1; ny++) {
            for (let nx = -1; nx <= 1; nx++) {
              if (nx === 0 && ny === 0) continue;
              if (tileGrid.decorations[tileGrid.idx(tx + nx, ty + ny)] !== -1) {
                hasNeighborDecor = true;
                break;
              }
            }
            if (hasNeighborDecor) break;
          }

          if (!hasNeighborDecor) {
            const r = rng.next();
            const nVal = tileGrid.noiseCache[tileGrid.idx(tx, ty)];
            let decor = -1;
            
            const px = tx * TILE_SIZE;
            const py = ty * TILE_SIZE;
            let nearestBiome = null;
            let minDist = Infinity;
            for (const b of biomes) {
              const dx = px - b.x;
              const dy = py - b.y;
              const dist = dx * dx + dy * dy;
              if (dist < minDist) {
                minDist = dist;
                nearestBiome = b;
              }
            }

            if (nearestBiome.name === 'math') {
              if (r < 0.12) decor = rng.next() > 0.5 ? 0 : 1;
            } else if (nearestBiome.name === 'chem') {
              if (r < 0.14) decor = rng.next() > 0.5 ? 2 : 3;
            } else if (nearestBiome.name === 'bio') {
              if (r < 0.18) decor = rng.next() > 0.5 ? 4 : 5;
            } else if (nearestBiome.name === 'phys') {
              if (r < 0.12) decor = rng.next() > 0.5 ? 6 : 7;
            }

            if (decor !== -1) {
              tileGrid.decorations[tileGrid.idx(tx, ty)] = decor;
            }
          }
        }
      }
    }

    // 7. Return waypoints
    return {
      mathBoss: { x: waypoints.mathBoss.tx * TILE_SIZE, y: waypoints.mathBoss.ty * TILE_SIZE },
      chemBoss: { x: waypoints.chemBoss.tx * TILE_SIZE, y: waypoints.chemBoss.ty * TILE_SIZE },
      bioBoss: { x: waypoints.bioBoss.tx * TILE_SIZE, y: waypoints.bioBoss.ty * TILE_SIZE },
      physBoss: { x: waypoints.physBoss.tx * TILE_SIZE, y: waypoints.physBoss.ty * TILE_SIZE },
      mathDungeon: { x: waypoints.mathDungeon.tx * TILE_SIZE, y: waypoints.mathDungeon.ty * TILE_SIZE },
      chemDungeon: { x: waypoints.chemDungeon.tx * TILE_SIZE, y: waypoints.chemDungeon.ty * TILE_SIZE },
      bioDungeon: { x: waypoints.bioDungeon.tx * TILE_SIZE, y: waypoints.bioDungeon.ty * TILE_SIZE },
      physDungeon: { x: waypoints.physDungeon.tx * TILE_SIZE, y: waypoints.physDungeon.ty * TILE_SIZE }
    };
  }

  return { generateWorld, WORLD_SEED };
})();
