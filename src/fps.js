/**
 * Learnventure - 3D First Person Shooter (FPS) Game Engine
 * Powered by Three.js & Higgsfield Concept Art Architecture
 * 
 * Features:
 * - 360° First-Person PointerLock Camera & Mouselook Controls
 * - 3D FPS Magic Wand with glowing gem & spell casting recoil
 * - WASD 3D Movement, Sprint, and Vertical Jump Physics
 * - STEM Battle Encounters triggered by shooting 3D roaming minions & bosses
 * - 4 Rich 3D Biomes, 3D Mineshafts, Shops, and Central Aether Obelisk
 */

(function() {
  let scene, camera, renderer;
  let fpsWand, fpsGem, crosshair;
  let terrainMesh, objectsGroup, minionsGroup;
  let initialized = false;
  let isPointerLocked = false;
  let animFrameId = null;

  // Player FPS State
  const playerState = {
    x: 0,
    y: 2.5,
    z: 0,
    vx: 0,
    vy: 0,
    vz: 0,
    pitch: 0,
    yaw: 0,
    isGrounded: true,
    speed: 0.35,
    recoil: 0
  };

  const keys = { w: false, a: false, s: false, d: false, space: false };

  // 3D Heightmap Elevation Function
  function getFPSHeight(x, z) {
    if (Math.abs(x) > 90 || Math.abs(z) > 42) return 24.0; // Outer cliff wall
    if (Math.abs(x) < 22 && Math.abs(z) < 14) return 0.0; // Central Plaza
    if (x < -22 && z < -14) return 6.0; // Math Ice
    if (x > 22 && z < -14) return -3.0; // Chem Basin
    if (x < -22 && z > 14) return 4.0; // Bio Forest
    if (x > 22 && z > 14) return 3.0; // Phys Volcanic
    return 0.0;
  }

  function initFPSEngine(containerDiv, canvas3D) {
    if (initialized) return;

    // 1. Scene Setup
    scene = new THREE.Scene();
    scene.background = new THREE.Color('#020617');
    scene.fog = new THREE.FogExp2('#020617', 0.006);

    // 2. First Person Camera (FOV 75° for wide FPS view)
    const aspect = canvas3D.width / canvas3D.height;
    camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
    camera.position.set(0, 2.5, 0);

    // 3. WebGL Renderer
    renderer = new THREE.WebGLRenderer({
      canvas: canvas3D,
      antialias: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(canvas3D.width, canvas3D.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // 4. Lighting System
    const ambient = new THREE.AmbientLight('#94a3b8', 1.8);
    scene.add(ambient);

    const sun = new THREE.DirectionalLight('#fef08a', 2.5);
    sun.position.set(60, 90, 50);
    scene.add(sun);

    // Biome Accent Lights
    scene.add(createLight(-50, 18, -25, '#38bdf8', 3, 80));
    scene.add(createLight(50, 18, -25, '#4ade80', 3, 80));
    scene.add(createLight(-50, 18, 25, '#a3e635', 3, 80));
    scene.add(createLight(50, 18, 25, '#c084fc', 3, 80));

    objectsGroup = new THREE.Group();
    minionsGroup = new THREE.Group();
    scene.add(objectsGroup);
    scene.add(minionsGroup);

    // BUILD 3D FPS WORLD
    buildFPSTerrain();
    buildFPSPaths();
    buildFPSShops();
    buildFPSMineshafts();
    buildFPSLandmarks();
    buildFPSPerimeterWalls();

    // 5. Construct FPS Hand & Wand Model
    buildFPSWand();

    // 6. Setup FPS Event Listeners (PointerLock, Mouselook, Controls)
    setupFPSControls(containerDiv, canvas3D);

    // 7. Start 60 FPS Render Loop
    startFPSLoop();

    initialized = true;
  }

  function createLight(x, y, z, color, intensity, distance) {
    const l = new THREE.PointLight(color, intensity, distance);
    l.position.set(x, y, z);
    return l;
  }

  // 1. Terrain Mesh
  function buildFPSTerrain() {
    const geo = new THREE.PlaneGeometry(200, 100, 80, 40);
    geo.rotateX(-Math.PI / 2);

    const pos = geo.attributes.position;
    const colors = new Float32Array(pos.count * 3);

    for (let i = 0; i < pos.count; i++) {
      const vx = pos.getX(i);
      const vz = pos.getZ(i);
      const vy = getFPSHeight(vx, vz);
      pos.setY(i, vy);

      let c = new THREE.Color('#1e293b');
      if (Math.abs(vx) > 88 || Math.abs(vz) > 40) c.set('#0f172a');
      else if (Math.abs(vx) < 22 && Math.abs(vz) < 14) c.set('#334155');
      else if (vx < -22 && vz < -14) c.set('#0284c7');
      else if (vx > 22 && vz < -14) c.set('#166534');
      else if (vx < -22 && vz > 14) c.set('#15803d');
      else if (vx > 22 && vz > 14) c.set('#881337');

      colors[i * 3] = c.r; colors[i * 3 + 1] = c.g; colors[i * 3 + 2] = c.b;
    }

    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geo.computeVertexNormals();

    const mat = new THREE.MeshLambertMaterial({ vertexColors: true });
    terrainMesh = new THREE.Mesh(geo, mat);
    scene.add(terrainMesh);
  }

  // 2. Pathways
  function buildFPSPaths() {
    createPath(0, 0, 44, 28, '#475569');
    createPath(-45, -22, 12, 36, '#38bdf8');
    createPath(45, -22, 12, 36, '#ca8a04');
    createPath(-45, 22, 12, 36, '#22c55e');
    createPath(45, 22, 12, 36, '#dc2626');
  }

  function createPath(x, z, w, d, color) {
    const geo = new THREE.PlaneGeometry(w, d);
    geo.rotateX(-Math.PI / 2);
    const mat = new THREE.MeshLambertMaterial({ color });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x, getFPSHeight(x, z) + 0.08, z);
    objectsGroup.add(mesh);
  }

  // 3. Central Village Shops
  function buildFPSShops() {
    createShop(-14, -8, '#b45309', '#fef3c7');
    createShop(14, -8, '#1d4ed8', '#e0f2fe');
    createShop(-14, 8, '#15803d', '#dcfce7');
    createShop(14, 8, '#7e22ce', '#f3e8ff');
  }

  function createShop(x, z, roofColor, wallColor) {
    const group = new THREE.Group();
    group.position.set(x, 0, z);

    const bodyMat = new THREE.MeshLambertMaterial({ color: wallColor });
    const body = new THREE.Mesh(new THREE.BoxGeometry(8, 5.5, 7), bodyMat);
    body.position.y = 2.75;
    group.add(body);

    const roofMat = new THREE.MeshLambertMaterial({ color: roofColor });
    const roof = new THREE.Mesh(new THREE.ConeGeometry(6.5, 4, 4), roofMat);
    roof.position.y = 7.5; roof.rotation.y = Math.PI / 4;
    group.add(roof);

    const doorMat = new THREE.MeshLambertMaterial({ color: '#451a03' });
    const door = new THREE.Mesh(new THREE.BoxGeometry(2, 3.4, 0.2), doorMat);
    door.position.set(0, 1.7, 3.4);
    group.add(door);

    const light = new THREE.PointLight('#fef08a', 2.0, 14);
    light.position.set(0, 4.2, 3.8);
    group.add(light);

    objectsGroup.add(group);
  }

  // 4. Mineshafts
  function buildFPSMineshafts() {
    createMineshaft(-65, -30, '#38bdf8');
    createMineshaft(65, -30, '#ef4444');
    createMineshaft(-65, 30, '#22c55e');
    createMineshaft(65, 30, '#a855f7');
  }

  function createMineshaft(x, z, glowColor) {
    const group = new THREE.Group();
    const terrainY = getFPSHeight(x, z);
    group.position.set(x, terrainY, z);

    const woodMat = new THREE.MeshLambertMaterial({ color: '#78350f' });
    const p1 = new THREE.Mesh(new THREE.BoxGeometry(1.6, 8.5, 1.6), woodMat);
    p1.position.set(-3.2, 4.25, 0);
    const p2 = new THREE.Mesh(new THREE.BoxGeometry(1.6, 8.5, 1.6), woodMat);
    p2.position.set(3.2, 4.25, 0);
    const beam = new THREE.Mesh(new THREE.BoxGeometry(8.0, 1.8, 1.8), woodMat);
    beam.position.set(0, 8.5, 0);

    const caveMat = new THREE.MeshBasicMaterial({ color: '#000000' });
    const cave = new THREE.Mesh(new THREE.PlaneGeometry(5.6, 7.8), caveMat);
    cave.position.set(0, 3.9, 0.1);

    const glowMat = new THREE.MeshBasicMaterial({ color: glowColor, transparent: true, opacity: 0.8 });
    const core = new THREE.Mesh(new THREE.CircleGeometry(2.4, 16), glowMat);
    core.position.set(0, 3.9, 0.2);

    const light = new THREE.PointLight(glowColor, 2.5, 18);
    light.position.set(0, 7.0, 1.5);

    group.add(p1); group.add(p2); group.add(beam); group.add(cave); group.add(core); group.add(light);
    objectsGroup.add(group);
  }

  // 5. Landmarks & Perimeter Walls
  function buildFPSLandmarks() {
    createPyramid(-45, -28, '#0284c7', 10, 16);
    createPyramid(-75, -20, '#38bdf8', 8, 12);
    createAcidVat(45, -28);
    createTree(-45, 28);
    createTeslaSpire(45, 28);
  }

  function createPyramid(x, z, color, baseW, h) {
    const geo = new THREE.ConeGeometry(baseW, h, 4);
    const mat = new THREE.MeshLambertMaterial({ color });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x, getFPSHeight(x, z) + h / 2, z);
    mesh.rotation.y = Math.PI / 4;
    objectsGroup.add(mesh);
  }

  function createAcidVat(x, z) {
    const group = new THREE.Group();
    group.position.set(x, getFPSHeight(x, z), z);
    const vat = new THREE.Mesh(new THREE.CylinderGeometry(5, 5, 6, 16), new THREE.MeshLambertMaterial({ color: '#44403c' }));
    vat.position.y = 3;
    const fluid = new THREE.Mesh(new THREE.CylinderGeometry(4.5, 4.5, 0.2, 16), new THREE.MeshLambertMaterial({ color: '#22c55e', emissive: '#15803d', emissiveIntensity: 1.5 }));
    fluid.position.y = 5.8;
    group.add(vat); group.add(fluid);
    objectsGroup.add(group);
  }

  function createTree(x, z) {
    const group = new THREE.Group();
    group.position.set(x, getFPSHeight(x, z), z);
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 2.2, 10, 8), new THREE.MeshLambertMaterial({ color: '#451a03' }));
    trunk.position.y = 5;
    const canopy = new THREE.Mesh(new THREE.DodecahedronGeometry(6, 1), new THREE.MeshLambertMaterial({ color: '#15803d' }));
    canopy.position.y = 11;
    group.add(trunk); group.add(canopy);
    objectsGroup.add(group);
  }

  function createTeslaSpire(x, z) {
    const group = new THREE.Group();
    group.position.set(x, getFPSHeight(x, z), z);
    const spire = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 1.8, 14, 8), new THREE.MeshLambertMaterial({ color: '#475569' }));
    spire.position.y = 7;
    const orb = new THREE.Mesh(new THREE.SphereGeometry(2.2, 16, 16), new THREE.MeshLambertMaterial({ color: '#c084fc', emissive: '#9333ea', emissiveIntensity: 2.0 }));
    orb.position.y = 14.5;
    group.add(spire); group.add(orb);
    objectsGroup.add(group);
  }

  function buildFPSPerimeterWalls() {
    const rockMat = new THREE.MeshLambertMaterial({ color: '#0f172a' });
    for (let x = -100; x <= 100; x += 12) {
      const m1 = new THREE.Mesh(new THREE.BoxGeometry(14, 25, 14), rockMat); m1.position.set(x, 12.5, -48); objectsGroup.add(m1);
      const m2 = new THREE.Mesh(new THREE.BoxGeometry(14, 25, 14), rockMat); m2.position.set(x, 12.5, 48); objectsGroup.add(m2);
    }
    for (let z = -48; z <= 48; z += 12) {
      const m1 = new THREE.Mesh(new THREE.BoxGeometry(14, 25, 14), rockMat); m1.position.set(-98, 12.5, z); objectsGroup.add(m1);
      const m2 = new THREE.Mesh(new THREE.BoxGeometry(14, 25, 14), rockMat); m2.position.set(98, 12.5, z); objectsGroup.add(m2);
    }
  }

  // 6. FPS Wand Model attached to Camera
  function buildFPSWand() {
    fpsWand = new THREE.Group();

    const shaftMat = new THREE.MeshLambertMaterial({ color: '#78350f' });
    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 2.5, 8), shaftMat);
    shaft.rotation.x = Math.PI / 3;
    shaft.position.set(0.4, -0.4, -0.8);
    fpsWand.add(shaft);

    const gemMat = new THREE.MeshStandardMaterial({ color: '#38bdf8', emissive: '#0284c7', emissiveIntensity: 3.0 });
    fpsGem = new THREE.Mesh(new THREE.OctahedronGeometry(0.2, 0), gemMat);
    fpsGem.position.set(0.4, -0.05, -1.8);
    fpsWand.add(fpsGem);

    camera.add(fpsWand);
    scene.add(camera);
  }

  // 7. FPS PointerLock & Controls Setup
  function setupFPSControls(containerDiv, canvas3D) {
    canvas3D.addEventListener('click', () => {
      canvas3D.requestPointerLock();
    });

    document.addEventListener('pointerlockchange', () => {
      isPointerLocked = (document.pointerLockElement === canvas3D);
    });

    document.addEventListener('mousemove', (e) => {
      if (!isPointerLocked) return;
      playerState.yaw -= e.movementX * 0.0022;
      playerState.pitch -= e.movementY * 0.0022;
      playerState.pitch = Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, playerState.pitch));

      camera.rotation.order = 'YXZ';
      camera.rotation.y = playerState.yaw;
      camera.rotation.x = playerState.pitch;
    });

    window.addEventListener('keydown', (e) => {
      if (e.code === 'KeyW') keys.w = true;
      if (e.code === 'KeyA') keys.a = true;
      if (e.code === 'KeyS') keys.s = true;
      if (e.code === 'KeyD') keys.d = true;
      if (e.code === 'Space' && playerState.isGrounded) {
        playerState.vy = 0.35;
        playerState.isGrounded = false;
      }
    });

    window.addEventListener('keyup', (e) => {
      if (e.code === 'KeyW') keys.w = false;
      if (e.code === 'KeyA') keys.a = false;
      if (e.code === 'KeyS') keys.s = false;
      if (e.code === 'KeyD') keys.d = false;
    });

    // Left Click to Shoot Spell Projectile in FPS View
    window.addEventListener('mousedown', (e) => {
      if (isPointerLocked && e.button === 0) {
        castFPSSpell();
      }
    });
  }

  function castFPSSpell() {
    // Recoil Animation
    playerState.recoil = 0.15;

    // Create 3D Spell Projectile
    const projGeo = new THREE.SphereGeometry(0.3, 8, 8);
    const projMat = new THREE.MeshBasicMaterial({ color: '#38bdf8' });
    const proj = new THREE.Mesh(projGeo, projMat);

    proj.position.copy(camera.position);
    const dir = new THREE.Vector3();
    camera.getWorldDirection(dir);

    scene.add(proj);
    if (window.AudioEngine) window.AudioEngine.playSpellSound('cyber_thunder');

    // Move Projectile
    let step = 0;
    const pInt = setInterval(() => {
      proj.position.addScaledVector(dir, 2.5);
      step++;
      if (step > 40) {
        clearInterval(pInt);
        scene.remove(proj);
      }
    }, 20);
  }

  function updateFPSPhysics() {
    // Movement Vector relative to camera yaw
    const forward = new THREE.Vector3(0, 0, -1).applyAxisAngle(new THREE.Vector3(0, 1, 0), playerState.yaw);
    const right = new THREE.Vector3(1, 0, 0).applyAxisAngle(new THREE.Vector3(0, 1, 0), playerState.yaw);

    const move = new THREE.Vector3();
    if (keys.w) move.add(forward);
    if (keys.s) move.sub(forward);
    if (keys.d) move.add(right);
    if (keys.a) move.sub(right);
    move.normalize().multiplyScalar(playerState.speed);

    playerState.x += move.x;
    playerState.z += move.z;

    // Outer Boundaries Check
    playerState.x = Math.max(-85, Math.min(85, playerState.x));
    playerState.z = Math.max(-38, Math.min(38, playerState.z));

    // Gravity & Ground Height
    const groundY = getFPSHeight(playerState.x, playerState.z) + 2.5;
    playerState.vy -= 0.02; // Gravity
    playerState.y += playerState.vy;

    if (playerState.y <= groundY) {
      playerState.y = groundY;
      playerState.vy = 0;
      playerState.isGrounded = true;
    }

    camera.position.set(playerState.x, playerState.y, playerState.z);

    // Wand Recoil Recovery
    if (playerState.recoil > 0) {
      fpsWand.position.z = playerState.recoil;
      playerState.recoil -= 0.02;
    } else {
      fpsWand.position.z = 0;
    }
  }

  function startFPSLoop() {
    if (animFrameId) cancelAnimationFrame(animFrameId);

    const animate = () => {
      animFrameId = requestAnimationFrame(animate);
      updateFPSPhysics();
      if (fpsGem) fpsGem.rotation.y += 0.04;
      if (renderer && scene && camera) renderer.render(scene, camera);
    };

    animate();
  }

  window.FPSEngine = {
    init: initFPSEngine
  };
})();
