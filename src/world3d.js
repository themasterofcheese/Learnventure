/**
 * Knowledge Quest - Optimized 60 FPS 3D WebGL World Engine (Three.js)
 * 
 * Features:
 * - Silky smooth 60 FPS performance (optimized lighting & clean geometries)
 * - 4 High-Contrast STEM Biomes with distinct ground colors & 3D landscaping
 * - 4 Medieval Market Shops around Central Plaza
 * - 4 Mountain Cliff Mineshaft Dungeon Entrances
 * - 4 Realm Boss Summoning Altars & Central Floating Obelisk Crystal
 * - 3D Impassable Outer Mountain Wall Perimeter
 * - 3D Wizard Model with Staff, Hat, Robe, and Third-Person Camera Tracking
 */

(function() {
  let scene, camera, renderer;
  let terrainMesh, objectsGroup;
  let playerMesh, staffGem, centralCrystal;
  let initialized = false;
  let animFrameId = null;

  // World dimensions in 3D coordinates (-100 to +100 X, -50 to +50 Z)
  const WORLD_X = 200;
  const WORLD_Z = 100;

  // Elevation height function for 3D terrain
  function getTerrainHeight(x, z) {
    // Outer perimeter mountain cliff walls
    if (Math.abs(x) > 86 || Math.abs(z) > 40) {
      return 20.0;
    }

    // Central Market Plaza (-22..22 X, -14..14 Z)
    if (Math.abs(x) < 22 && Math.abs(z) < 14) {
      return 0.0;
    }

    // Chasm Rift
    if ((Math.abs(x) < 6 && Math.abs(z) >= 14) || (Math.abs(z) < 6 && Math.abs(x) >= 22)) {
      return -8.0;
    }

    // Top-Left: Math Glacial Crystal Plateau (x < -22, z < -14)
    if (x < -22 && z < -14) {
      return 6.0;
    }

    // Top-Right: Chem Acid Ruins Basin (x > 22, z < -14)
    if (x > 22 && z < -14) {
      return -3.0;
    }

    // Bottom-Left: Bio Canopy Forest Hills (x < -22, z > 14)
    if (x < -22 && z > 14) {
      return 4.0;
    }

    // Bottom-Right: Phys Volcanic Canyons (x > 22, z > 14)
    if (x > 22 && z > 14) {
      return 3.0;
    }

    return 0.0;
  }

  function init3DWorld(targetCanvas) {
    if (initialized) return;

    // 1. Scene & Atmosphere
    scene = new THREE.Scene();
    scene.background = new THREE.Color('#020617');
    scene.fog = new THREE.FogExp2('#020617', 0.005);

    // 2. Camera Setup (Isometric Third-Person Perspective)
    const aspect = targetCanvas.width / targetCanvas.height;
    camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 1000);
    camera.position.set(0, 42, 42);
    camera.lookAt(0, 0, 0);

    // 3. WebGL Renderer (Fast, High-Performance Shading)
    renderer = new THREE.WebGLRenderer({
      canvas: targetCanvas,
      antialias: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(targetCanvas.width, targetCanvas.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // 4. Lighting System
    const ambient = new THREE.AmbientLight('#94a3b8', 1.6);
    scene.add(ambient);

    const sun = new THREE.DirectionalLight('#fef08a', 2.0);
    sun.position.set(50, 80, 40);
    scene.add(sun);

    // Biome Accent Lights
    scene.add(createPointLight(-50, 18, -25, '#38bdf8', 3, 70));
    scene.add(createPointLight(50, 18, -25, '#4ade80', 3, 70));
    scene.add(createPointLight(-50, 18, 25, '#a3e635', 3, 70));
    scene.add(createPointLight(50, 18, 25, '#c084fc', 3, 70));

    objectsGroup = new THREE.Group();
    scene.add(objectsGroup);

    // BUILD 3D WORLD
    build3DTerrain();
    buildWalkablePaths();
    buildMarketShops();
    buildMineshafts();
    buildBossAltars();
    buildLandmarks();
    buildPerimeterMountainWalls();
    build3DPlayer();

    // Start 60 FPS Render Loop
    startAnimationLoop();

    initialized = true;
  }

  function createPointLight(x, y, z, color, intensity, distance) {
    const l = new THREE.PointLight(color, intensity, distance);
    l.position.set(x, y, z);
    return l;
  }

  // 1. Terrain Mesh with Mapped HD Texture & Biome Shading
  function build3DTerrain() {
    const geo = new THREE.PlaneGeometry(WORLD_X, WORLD_Z, 80, 40);
    geo.rotateX(-Math.PI / 2);

    const pos = geo.attributes.position;
    const colors = new Float32Array(pos.count * 3);

    for (let i = 0; i < pos.count; i++) {
      const vx = pos.getX(i);
      const vz = pos.getZ(i);
      const vy = getTerrainHeight(vx, vz);
      pos.setY(i, vy);

      let c = new THREE.Color('#ffffff');
      if (Math.abs(vx) > 86 || Math.abs(vz) > 40) {
        c.set('#0f172a'); // Outer Mountain Cliff
      }
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }

    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geo.computeVertexNormals();

    // Load HD Overworld Terrain Texture
    const textureLoader = new THREE.TextureLoader();
    const mapTexture = textureLoader.load('assets/map_layout_option_d.jpg');

    const mat = new THREE.MeshLambertMaterial({
      map: mapTexture,
      vertexColors: true
    });

    terrainMesh = new THREE.Mesh(geo, mat);
    scene.add(terrainMesh);
  }

  // 2. Walkable Pathways
  function buildWalkablePaths() {
    createPathMesh(0, 0, 44, 28, '#475569'); // Central Plaza
    createPathMesh(-45, -22, 12, 36, '#38bdf8'); // Math Path
    createPathMesh(45, -22, 12, 36, '#ca8a04'); // Chem Path
    createPathMesh(-45, 22, 12, 36, '#22c55e'); // Bio Path
    createPathMesh(45, 22, 12, 36, '#dc2626'); // Phys Path
  }

  function createPathMesh(x, z, w, d, color) {
    const geo = new THREE.PlaneGeometry(w, d);
    geo.rotateX(-Math.PI / 2);
    const mat = new THREE.MeshLambertMaterial({ color });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x, getTerrainHeight(x, z) + 0.08, z);
    objectsGroup.add(mesh);
  }

  // 3. Central Market Village Shops
  function buildMarketShops() {
    create3DShop(-14, -8, '#b45309', '#fef3c7', '🧪 Potion Shop');
    create3DShop(14, -8, '#1d4ed8', '#e0f2fe', '🧵 Tailor Shop');
    create3DShop(-14, 8, '#15803d', '#dcfce7', '⛏️ Tool Smith');
    create3DShop(14, 8, '#7e22ce', '#f3e8ff', '🔮 Wand Smith');
  }

  function create3DShop(x, z, roofColor, wallColor, shopName) {
    const group = new THREE.Group();
    group.position.set(x, 0, z);

    // Stone Body
    const bodyMat = new THREE.MeshLambertMaterial({ color: wallColor });
    const body = new THREE.Mesh(new THREE.BoxGeometry(8, 5.5, 7), bodyMat);
    body.position.y = 2.75;
    group.add(body);

    // Roof
    const roofMat = new THREE.MeshLambertMaterial({ color: roofColor });
    const roof = new THREE.Mesh(new THREE.ConeGeometry(6.5, 4, 4), roofMat);
    roof.position.y = 7.5;
    roof.rotation.y = Math.PI / 4;
    group.add(roof);

    // Wooden Door
    const doorMat = new THREE.MeshLambertMaterial({ color: '#451a03' });
    const door = new THREE.Mesh(new THREE.BoxGeometry(2, 3.4, 0.2), doorMat);
    door.position.set(0, 1.7, 3.4);
    group.add(door);

    // Yellow Lantern
    const light = new THREE.PointLight('#fef08a', 2.0, 14);
    light.position.set(0, 4.2, 3.8);
    group.add(light);

    objectsGroup.add(group);
  }

  // 4. 3D Mineshaft Dungeon Entrances
  function buildMineshafts() {
    create3DMineshaft(-65, -30, '#38bdf8'); // Math
    create3DMineshaft(65, -30, '#ef4444'); // Chem
    create3DMineshaft(-65, 30, '#22c55e'); // Bio
    create3DMineshaft(65, 30, '#a855f7'); // Phys
  }

  function create3DMineshaft(x, z, glowColor) {
    const group = new THREE.Group();
    const terrainY = getTerrainHeight(x, z);
    group.position.set(x, terrainY, z);

    // Timber Support Arch
    const woodMat = new THREE.MeshLambertMaterial({ color: '#78350f' });
    const p1 = new THREE.Mesh(new THREE.BoxGeometry(1.6, 8.5, 1.6), woodMat);
    p1.position.set(-3.2, 4.25, 0);
    const p2 = new THREE.Mesh(new THREE.BoxGeometry(1.6, 8.5, 1.6), woodMat);
    p2.position.set(3.2, 4.25, 0);
    const beam = new THREE.Mesh(new THREE.BoxGeometry(8.0, 1.8, 1.8), woodMat);
    beam.position.set(0, 8.5, 0);

    // Dark Cave Opening
    const caveMat = new THREE.MeshBasicMaterial({ color: '#000000' });
    const cave = new THREE.Mesh(new THREE.PlaneGeometry(5.6, 7.8), caveMat);
    cave.position.set(0, 3.9, 0.1);

    // Glowing Portal Core
    const glowMat = new THREE.MeshBasicMaterial({ color: glowColor, transparent: true, opacity: 0.8 });
    const core = new THREE.Mesh(new THREE.CircleGeometry(2.4, 16), glowMat);
    core.position.set(0, 3.9, 0.2);

    const light = new THREE.PointLight(glowColor, 2.5, 18);
    light.position.set(0, 7.0, 1.5);

    group.add(p1); group.add(p2); group.add(beam); group.add(cave); group.add(core); group.add(light);
    objectsGroup.add(group);
  }

  // 5. Boss Altars
  function buildBossAltars() {
    createBossAltar(-45, -20, '#38bdf8');
    createBossAltar(45, -20, '#4ade80');
    createBossAltar(-45, 20, '#a3e635');
    createBossAltar(45, 20, '#c084fc');
  }

  function createBossAltar(x, z, glowColor) {
    const group = new THREE.Group();
    const terrainY = getTerrainHeight(x, z);
    group.position.set(x, terrainY, z);

    const stoneMat = new THREE.MeshLambertMaterial({ color: '#1e293b' });
    const base = new THREE.Mesh(new THREE.CylinderGeometry(4, 4.5, 1.5, 12), stoneMat);
    base.position.y = 0.75;

    const orbMat = new THREE.MeshLambertMaterial({ color: glowColor, emissive: glowColor, emissiveIntensity: 2.0 });
    const orb = new THREE.Mesh(new THREE.SphereGeometry(1.6, 16, 16), orbMat);
    orb.position.y = 3.2;

    const light = new THREE.PointLight(glowColor, 3, 20);
    light.position.set(0, 3.2, 0);

    group.add(base); group.add(orb); group.add(light);
    objectsGroup.add(group);
  }

  // 6. Biome Landmark Structures
  function buildLandmarks() {
    // Math Pyramids
    createPyramid(-45, -28, '#0284c7', 10, 16);
    createPyramid(-75, -20, '#38bdf8', 8, 12);

    // Chem Vats & Ruins
    createAcidVat(45, -28);
    createRuinedWall(75, -24);

    // Bio Canopy Redwood Trees & Mushrooms
    createTree(-45, 28);
    createTree(-75, 22);
    createTree(-35, 38);
    createMushroom(-55, 36);

    // Phys Tesla Spires
    createTeslaSpire(45, 28);
    createTeslaSpire(75, 22);

    // Central Floating Crystal Obelisk
    createCentralObelisk(0, 0);
  }

  function createPyramid(x, z, color, baseW, h) {
    const geo = new THREE.ConeGeometry(baseW, h, 4);
    const mat = new THREE.MeshLambertMaterial({ color });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x, getTerrainHeight(x, z) + h / 2, z);
    mesh.rotation.y = Math.PI / 4;
    objectsGroup.add(mesh);
  }

  function createAcidVat(x, z) {
    const group = new THREE.Group();
    const terrainY = getTerrainHeight(x, z);
    group.position.set(x, terrainY, z);

    const stoneMat = new THREE.MeshLambertMaterial({ color: '#44403c' });
    const vat = new THREE.Mesh(new THREE.CylinderGeometry(5, 5, 6, 16), stoneMat);
    vat.position.y = 3;

    const fluidMat = new THREE.MeshLambertMaterial({ color: '#22c55e', emissive: '#15803d', emissiveIntensity: 1.5 });
    const fluid = new THREE.Mesh(new THREE.CylinderGeometry(4.5, 4.5, 0.2, 16), fluidMat);
    fluid.position.y = 5.8;

    group.add(vat); group.add(fluid);
    objectsGroup.add(group);
  }

  function createRuinedWall(x, z) {
    const mat = new THREE.MeshLambertMaterial({ color: '#78716c' });
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(12, 7, 2.5), mat);
    mesh.position.set(x, getTerrainHeight(x, z) + 3.5, z);
    mesh.rotation.y = 0.35;
    objectsGroup.add(mesh);
  }

  function createTree(x, z) {
    const group = new THREE.Group();
    const terrainY = getTerrainHeight(x, z);
    group.position.set(x, terrainY, z);

    const trunkMat = new THREE.MeshLambertMaterial({ color: '#451a03' });
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 2.2, 10, 8), trunkMat);
    trunk.position.y = 5;

    const leavesMat = new THREE.MeshLambertMaterial({ color: '#15803d' });
    const canopy = new THREE.Mesh(new THREE.DodecahedronGeometry(6, 1), leavesMat);
    canopy.position.y = 11;

    group.add(trunk); group.add(canopy);
    objectsGroup.add(group);
  }

  function createMushroom(x, z) {
    const group = new THREE.Group();
    const terrainY = getTerrainHeight(x, z);
    group.position.set(x, terrainY, z);

    const stemMat = new THREE.MeshLambertMaterial({ color: '#fef3c7' });
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 1.0, 4, 8), stemMat);
    stem.position.y = 2;

    const capMat = new THREE.MeshLambertMaterial({ color: '#ec4899', emissive: '#db2777', emissiveIntensity: 1.0 });
    const cap = new THREE.Mesh(new THREE.ConeGeometry(3.5, 2.5, 8), capMat);
    cap.position.y = 4.8;

    group.add(stem); group.add(cap);
    objectsGroup.add(group);
  }

  function createTeslaSpire(x, z) {
    const group = new THREE.Group();
    const terrainY = getTerrainHeight(x, z);
    group.position.set(x, terrainY, z);

    const metalMat = new THREE.MeshLambertMaterial({ color: '#475569' });
    const spire = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 1.8, 14, 8), metalMat);
    spire.position.y = 7;

    const orbMat = new THREE.MeshLambertMaterial({ color: '#c084fc', emissive: '#9333ea', emissiveIntensity: 2.0 });
    const orb = new THREE.Mesh(new THREE.SphereGeometry(2.2, 16, 16), orbMat);
    orb.position.y = 14.5;

    group.add(spire); group.add(orb);
    objectsGroup.add(group);
  }

  function createCentralObelisk(x, z) {
    const group = new THREE.Group();
    group.position.set(x, 0, z);

    const stoneMat = new THREE.MeshLambertMaterial({ color: '#1e293b' });
    const base = new THREE.Mesh(new THREE.BoxGeometry(10, 2.5, 10), stoneMat);
    base.position.y = 1.25;

    const gemMat = new THREE.MeshLambertMaterial({ color: '#a855f7', emissive: '#9333ea', emissiveIntensity: 2.2 });
    centralCrystal = new THREE.Mesh(new THREE.OctahedronGeometry(3.5, 0), gemMat);
    centralCrystal.position.y = 7.0;

    const light = new THREE.PointLight('#a855f7', 4, 30);
    light.position.set(0, 7.0, 0);

    group.add(base); group.add(centralCrystal); group.add(light);
    objectsGroup.add(group);
  }

  // 7. Outer Mountain Perimeter Wall
  function buildPerimeterMountainWalls() {
    const rockMat = new THREE.MeshLambertMaterial({ color: '#0f172a' });

    for (let x = -100; x <= 100; x += 12) {
      createMountainBlock(x, -48, rockMat);
      createMountainBlock(x, 48, rockMat);
    }
    for (let z = -48; z <= 48; z += 12) {
      createMountainBlock(-98, z, rockMat);
      createMountainBlock(98, z, rockMat);
    }
  }

  function createMountainBlock(x, z, material) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(14, 25, 14), material);
    mesh.position.set(x, 12.5, z);
    objectsGroup.add(mesh);
  }

  // 8. 3D Player Wizard Character Rig
  function build3DPlayer() {
    playerMesh = new THREE.Group();

    // Robe
    const robeMat = new THREE.MeshLambertMaterial({ color: '#2563eb' });
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 1.1, 2.8, 12), robeMat);
    body.position.y = 1.4;
    playerMesh.add(body);

    // Head
    const skinMat = new THREE.MeshLambertMaterial({ color: '#fde047' });
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.55, 12, 12), skinMat);
    head.position.y = 3.0;
    playerMesh.add(head);

    // Hat
    const hatMat = new THREE.MeshLambertMaterial({ color: '#1e3a8a' });
    const hat = new THREE.Mesh(new THREE.ConeGeometry(0.9, 1.8, 12), hatMat);
    hat.position.y = 3.9; hat.rotation.x = -0.15;
    playerMesh.add(hat);

    // Magic Staff
    const staffMat = new THREE.MeshLambertMaterial({ color: '#78350f' });
    const staff = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 4.2, 8), staffMat);
    staff.position.set(0.9, 2.1, 0.4); staff.rotation.z = -0.2;
    playerMesh.add(staff);

    const gemMat = new THREE.MeshLambertMaterial({ color: '#38bdf8', emissive: '#0284c7', emissiveIntensity: 2.5 });
    staffGem = new THREE.Mesh(new THREE.OctahedronGeometry(0.35, 0), gemMat);
    staffGem.position.set(1.0, 4.2, 0.4);
    playerMesh.add(staffGem);

    // Player Light
    const playerLight = new THREE.PointLight('#38bdf8', 3, 20);
    playerLight.position.set(0, 3.5, 0);
    playerMesh.add(playerLight);

    scene.add(playerMesh);
  }

  function updatePlayer3D(worldX, worldY, playerZ, facing) {
    if (!initialized || !playerMesh) return;

    // Convert 2D map coords (0..3600 X, 0..1760 Y) to 3D units (-90..90 X, -40..40 Z)
    const target3DX = ((worldX / 3600) * 180) - 90;
    const target3DZ = ((worldY / 1760) * 80) - 40;
    const terrainY = getTerrainHeight(target3DX, target3DZ);

    playerMesh.position.x = target3DX;
    playerMesh.position.z = target3DZ;
    playerMesh.position.y = terrainY + (playerZ / 12);

    if (facing === 'left') playerMesh.rotation.y = -Math.PI / 2;
    else if (facing === 'right') playerMesh.rotation.y = Math.PI / 2;

    // Smooth Camera Tracking
    const camTargetX = playerMesh.position.x;
    const camTargetZ = playerMesh.position.z + 32;
    const camTargetY = playerMesh.position.y + 32;

    camera.position.x += (camTargetX - camera.position.x) * 0.15;
    camera.position.z += (camTargetZ - camera.position.z) * 0.15;
    camera.position.y += (camTargetY - camera.position.y) * 0.15;
    camera.lookAt(playerMesh.position.x, playerMesh.position.y + 2.5, playerMesh.position.z);
  }

  function startAnimationLoop() {
    if (animFrameId) cancelAnimationFrame(animFrameId);

    const animate = () => {
      animFrameId = requestAnimationFrame(animate);

      if (centralCrystal) {
        centralCrystal.rotation.y += 0.03;
        centralCrystal.position.y = 7.0 + Math.sin(Date.now() / 250) * 0.5;
      }

      if (staffGem) {
        staffGem.rotation.y += 0.05;
      }

      if (renderer && scene && camera) {
        renderer.render(scene, camera);
      }
    };

    animate();
  }

  window.World3DEngine = {
    init: init3DWorld,
    updatePlayer: updatePlayer3D,
    render: function() {}, // Rendered smoothly via 60 FPS requestAnimationFrame loop
    getTerrainHeight: getTerrainHeight
  };
})();
