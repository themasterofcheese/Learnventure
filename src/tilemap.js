window.TileMap = (() => {
    const TILE_SIZE = 40;
    const GRID_W = 90;
    const GRID_H = 44;
    const CHUNK_TILES = 10;
    const CHUNK_PX = 400;
    const CHUNKS_X = 9;
    const CHUNKS_Y = 5;

    const TILE_TYPES = {
        grass:         { id:0,  walkable:true,  slow:false, fast:false, trigger:null, biome:'math',   color:'#c8ddf0', name:'Crystal Meadow' },
        crystal_dense: { id:1,  walkable:true,  slow:false, fast:false, trigger:null, biome:'math',   color:'#8ab6e8', name:'Crystal Grove' },
        crystal_rock:  { id:2,  walkable:false, slow:false, fast:false, trigger:null, biome:'math',   color:'#4a7ab8', name:'Crystal Wall' },
        acid_ground:   { id:3,  walkable:true,  slow:false, fast:false, trigger:null, biome:'chem',   color:'#2a4a1e', name:'Corroded Ground' },
        lab_floor:     { id:4,  walkable:true,  slow:false, fast:false, trigger:null, biome:'chem',   color:'#1a3a24', name:'Lab Floor' },
        acid_pool:     { id:5,  walkable:false, slow:false, fast:false, trigger:null, biome:'chem',   color:'#0d4a10', name:'Acid Pool' },
        jungle:        { id:6,  walkable:true,  slow:false, fast:false, trigger:null, biome:'bio',    color:'#1a3a1a', name:'Jungle Floor' },
        swamp:         { id:7,  walkable:true,  slow:true,  fast:false, trigger:null, biome:'bio',    color:'#0f2820', name:'Swamp' },
        swamp_water:   { id:8,  walkable:false, slow:false, fast:false, trigger:null, biome:'bio',    color:'#091a14', name:'Deep Swamp' },
        volcanic:      { id:9,  walkable:true,  slow:false, fast:false, trigger:null, biome:'phys',   color:'#2a1a0a', name:'Volcanic Rock' },
        crater:        { id:10, walkable:true,  slow:false, fast:false, trigger:null, biome:'phys',   color:'#3a2010', name:'Crater' },
        lava:          { id:11, walkable:false, slow:false, fast:false, trigger:null, biome:'phys',   color:'#8b3500', name:'Lava' },
        plaza:         { id:12, walkable:true,  slow:false, fast:false, trigger:null, biome:'center', color:'#2a2a3a', name:'Market Plaza' },
        path:          { id:13, walkable:true,  slow:false, fast:true,  trigger:null, biome:'all',    color:'#4a3a24', name:'Path' },
        wall:          { id:14, walkable:false, slow:false, fast:false, trigger:null, biome:'edge',   color:'#111122', name:'Mountain Wall' },
        chasm:         { id:15, walkable:false, slow:false, fast:false, trigger:null, biome:'border', color:'#08080f', name:'Chasm' },
        dungeon_entry: { id:16, walkable:true,  slow:false, fast:false, trigger:'dungeon', biome:'all', color:'#220a30', name:'Dungeon Portal' }
    };

    const ID_TO_TYPE = {};
    for (const key in TILE_TYPES) {
        ID_TO_TYPE[TILE_TYPES[key].id] = key;
    }

    class TileGrid {
        constructor() {
            const size = GRID_W * GRID_H;
            this.types = new Int8Array(size);
            this.explored = new Uint8Array(size);
            this.decorations = new Int8Array(size).fill(-1);
            this.noiseCache = new Float32Array(size);
        }

        idx(tx, ty) {
            return ty * GRID_W + tx;
        }

        inBounds(tx, ty) {
            return tx >= 0 && tx < GRID_W && ty >= 0 && ty < GRID_H;
        }

        getType(tx, ty) {
            if (!this.inBounds(tx, ty)) return 'wall';
            return ID_TO_TYPE[this.types[this.idx(tx, ty)]] || 'wall';
        }

        setType(tx, ty, typeName) {
            if (this.inBounds(tx, ty) && TILE_TYPES[typeName]) {
                this.types[this.idx(tx, ty)] = TILE_TYPES[typeName].id;
            }
        }

        getDef(tx, ty) {
            const typeName = this.getType(tx, ty);
            return TILE_TYPES[typeName] || TILE_TYPES.wall;
        }

        isWalkable(tx, ty) {
            return this.getDef(tx, ty).walkable;
        }

        isSlow(tx, ty) {
            return this.getDef(tx, ty).slow;
        }

        isFast(tx, ty) {
            return this.getDef(tx, ty).fast;
        }

        getTrigger(tx, ty) {
            return this.getDef(tx, ty).trigger;
        }

        getBiome(tx, ty) {
            return this.getDef(tx, ty).biome;
        }

        worldToTile(wx, wy) {
            return {
                tx: Math.floor(wx / TILE_SIZE),
                ty: Math.floor(wy / TILE_SIZE)
            };
        }

        tileToWorld(tx, ty) {
            return {
                wx: tx * TILE_SIZE,
                wy: ty * TILE_SIZE
            };
        }

        tileCenterWorld(tx, ty) {
            return {
                wx: tx * TILE_SIZE + TILE_SIZE / 2,
                wy: ty * TILE_SIZE + TILE_SIZE / 2
            };
        }

        updateFogFrame(wx, wy, radiusTiles = 7) {
            const center = this.worldToTile(wx, wy);
            const dirtyChunks = new Set();
            
            const rSq = radiusTiles * radiusTiles;

            for (let y = 0; y < GRID_H; y++) {
                for (let x = 0; x < GRID_W; x++) {
                    const i = this.idx(x, y);
                    if (this.explored[i] === 2) {
                        this.explored[i] = 1;
                        dirtyChunks.add(`${Math.floor(x/CHUNK_TILES)},${Math.floor(y/CHUNK_TILES)}`);
                    }
                }
            }

            for (let y = Math.max(0, center.ty - radiusTiles); y <= Math.min(GRID_H - 1, center.ty + radiusTiles); y++) {
                for (let x = Math.max(0, center.tx - radiusTiles); x <= Math.min(GRID_W - 1, center.tx + radiusTiles); x++) {
                    const dx = x - center.tx;
                    const dy = y - center.ty;
                    if (dx * dx + dy * dy <= rSq) {
                        const i = this.idx(x, y);
                        this.explored[i] = 2;
                        dirtyChunks.add(`${Math.floor(x/CHUNK_TILES)},${Math.floor(y/CHUNK_TILES)}`);
                    }
                }
            }
            return dirtyChunks;
        }

        save(key = 'learnventure_tilemap_v2') {
            try {
                const data = {
                    types: Array.from(this.types),
                    explored: Array.from(this.explored),
                    decorations: Array.from(this.decorations)
                };
                localStorage.setItem(key, JSON.stringify(data));
                return true;
            } catch(e) {
                console.error("Failed to save tilemap:", e);
                return false;
            }
        }

        load(key = 'learnventure_tilemap_v2') {
            try {
                const dataStr = localStorage.getItem(key);
                if (!dataStr) return false;
                const data = JSON.parse(dataStr);
                
                if (data.types) this.types.set(data.types);
                if (data.explored) this.explored.set(data.explored);
                if (data.decorations) this.decorations.set(data.decorations);
                
                return true;
            } catch(e) {
                console.error("Failed to load tilemap:", e);
                return false;
            }
        }

        reset() {
            this.types.fill(0);
            this.explored.fill(0);
            this.decorations.fill(-1);
        }
    }

    return {
        TILE_TYPES,
        ID_TO_TYPE,
        TILE_SIZE,
        GRID_W,
        GRID_H,
        CHUNK_TILES,
        CHUNK_PX,
        CHUNKS_X,
        CHUNKS_Y,
        TileGrid
    };
})();
