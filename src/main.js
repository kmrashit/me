import './style.css';
import { startIntro } from './intro.js';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// ─── Application State ──────────────────────────────────────────
let scene, camera, renderer, controls;
let configData = null;
let skillsData = null;

// ─── ThreeJS Objects ─────────────────────────────────────────────
let rocketGroup;
let flameGroup; // Exhaust flame cones (animated)
let stars;
let starPositions, starSpeeds;
let starCount = 1200;
let starSizeMultiplier = 3;
let skillsNebulaGroup;
let cometParticles = [];
let beaconLight;
let celestialBodies = []; // Meteorites, moons, sun, galaxy

// ─── Raycaster ───────────────────────────────────────────────────
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// ─── Interaction State ───────────────────────────────────────────
let currentSpeed = 1;
let previousSpeed = 1;
let activeCategory = 'all';
let hoveredNode = null;
let selectedNode = null;
let baseFov = 60;
let clock = new THREE.Clock();

// ─── Theme Colors ────────────────────────────────────────────────
let themeColors = {
  high: 0xff3b70,
  medium: 0x00ffd2,
  low: 0xbd00ff,
  accent: 0x00f0ff,
  starfield: 0xffffff,
  constellation: 0xffffff
};

// ═════════════════════════════════════════════════════════════════
// PROCEDURAL TEXTURE GENERATORS
// ═════════════════════════════════════════════════════════════════

function generateSunTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  const grad = ctx.createRadialGradient(256, 256, 0, 256, 256, 256);
  grad.addColorStop(0, '#ffffee');
  grad.addColorStop(0.15, '#ffee44');
  grad.addColorStop(0.4, '#ffaa00');
  grad.addColorStop(0.7, '#ff6600');
  grad.addColorStop(1, '#cc3300');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 512);
  // Solar surface noise
  for (let i = 0; i < 150; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 512;
    const r = 2 + Math.random() * 12;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, ${Math.floor(120 + Math.random() * 135)}, 0, ${0.08 + Math.random() * 0.15})`;
    ctx.fill();
  }
  return new THREE.CanvasTexture(canvas);
}

function generateMoonTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  // Base surface
  ctx.fillStyle = '#999999';
  ctx.fillRect(0, 0, 256, 256);
  // Surface variation
  for (let i = 0; i < 80; i++) {
    const x = Math.random() * 256;
    const y = Math.random() * 256;
    const r = 2 + Math.random() * 25;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    const grey = 60 + Math.floor(Math.random() * 80);
    ctx.fillStyle = `rgba(${grey}, ${grey}, ${grey}, ${0.15 + Math.random() * 0.35})`;
    ctx.fill();
  }
  // Craters
  for (let i = 0; i < 25; i++) {
    const x = Math.random() * 256;
    const y = Math.random() * 256;
    const r = 4 + Math.random() * 16;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(50, 50, 50, ${0.2 + Math.random() * 0.35})`;
    ctx.fill();
    // Rim highlight
    ctx.beginPath();
    ctx.arc(x - r * 0.15, y - r * 0.15, r * 0.85, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(170, 170, 170, ${0.15 + Math.random() * 0.15})`;
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }
  return new THREE.CanvasTexture(canvas);
}

function generateGalaxyTexture() {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, size, size);
  const cx = size / 2;
  const cy = size / 2;
  // Core glow
  const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, size * 0.12);
  grad.addColorStop(0, 'rgba(255, 240, 220, 0.9)');
  grad.addColorStop(0.5, 'rgba(200, 180, 255, 0.35)');
  grad.addColorStop(1, 'rgba(100, 80, 200, 0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);
  // Spiral arms
  for (let arm = 0; arm < 2; arm++) {
    const armOffset = arm * Math.PI;
    for (let i = 0; i < 2500; i++) {
      const t = i / 2500;
      const angle = armOffset + t * Math.PI * 5;
      const r = t * size * 0.44;
      const spread = 6 + t * 28;
      const px = cx + Math.cos(angle) * r + (Math.random() - 0.5) * spread;
      const py = cy + Math.sin(angle) * r + (Math.random() - 0.5) * spread;
      const brightness = 1 - t * 0.65;
      const dotSize = 0.4 + Math.random() * 1.8;
      ctx.beginPath();
      ctx.arc(px, py, dotSize, 0, Math.PI * 2);
      const hue = 200 + Math.random() * 80;
      ctx.fillStyle = `hsla(${hue}, 65%, ${55 + brightness * 35}%, ${brightness * 0.75})`;
      ctx.fill();
    }
  }
  return new THREE.CanvasTexture(canvas);
}

function generateMeteoriteTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#554433';
  ctx.fillRect(0, 0, 128, 128);
  for (let i = 0; i < 60; i++) {
    const x = Math.random() * 128;
    const y = Math.random() * 128;
    const r = 1 + Math.random() * 8;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    const val = 30 + Math.floor(Math.random() * 50);
    ctx.fillStyle = `rgba(${val + 20}, ${val + 10}, ${val}, ${0.3 + Math.random() * 0.5})`;
    ctx.fill();
  }
  // Occasional bright mineral spots
  for (let i = 0; i < 8; i++) {
    const x = Math.random() * 128;
    const y = Math.random() * 128;
    ctx.beginPath();
    ctx.arc(x, y, 1 + Math.random() * 2, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(200, 180, 140, ${0.3 + Math.random() * 0.4})`;
    ctx.fill();
  }
  return new THREE.CanvasTexture(canvas);
}

// ═════════════════════════════════════════════════════════════════
// INIT
// ═════════════════════════════════════════════════════════════════

async function initApp(visitorName) {
  try {
    const configRes = await fetch('./config.json');
    configData = await configRes.json();

    const skillsRes = await fetch('./skills.json');
    skillsData = await skillsRes.json();

    applyConfigToUI(configData);

    if (visitorName) {
      const crewStatus = document.getElementById('crew-status');
      const badge = document.getElementById('visitor-name-badge');
      if (badge && crewStatus) {
        badge.textContent = visitorName;
        crewStatus.classList.remove('hidden');
      }
    }

    setupScene();
    setupWarpStars();
    setupRocket();
    setupNebulaSkills();
    setupCelestialBodies();
    setupInteraction();
    animate();
  } catch (error) {
    console.error("Initialization error:", error);
    const nameEl = document.getElementById('dev-name');
    if (nameEl) nameEl.textContent = "Error Loading Portfolio";
  }
}

// ═════════════════════════════════════════════════════════════════
// CONFIG → UI
// ═════════════════════════════════════════════════════════════════

function applyConfigToUI(config) {
  const nameEl = document.getElementById('dev-name');
  const titleEl = document.getElementById('dev-title');
  const bioEl = document.getElementById('dev-bio');

  if (nameEl) nameEl.textContent = config.developer.name;
  if (titleEl) titleEl.textContent = config.developer.title;
  if (bioEl) bioEl.textContent = config.developer.bio;

  const avatarGlowEl = document.querySelector('.avatar-glow');
  if (avatarGlowEl) {
    avatarGlowEl.replaceChildren(); // Safe clearing of previous contents
    const avatarVal = config.developer.avatar ? config.developer.avatar.trim() : '';
    if (avatarVal) {
      const isImage = avatarVal.includes('.') || avatarVal.startsWith('http') || avatarVal.startsWith('data:');
      if (isImage) {
        const img = document.createElement('img');
        img.src = avatarVal;
        img.alt = config.developer.name || 'Avatar';
        img.className = 'avatar-image';
        avatarGlowEl.appendChild(img);
      } else {
        const span = document.createElement('span');
        span.className = 'avatar-emoji';
        span.textContent = avatarVal;
        avatarGlowEl.appendChild(span);
      }
    } else {
      const span = document.createElement('span');
      span.className = 'avatar-emoji';
      span.textContent = '🚀';
      avatarGlowEl.appendChild(span);
    }
  }

  if (config.theme) {
    themeColors.high = parseInt(config.theme.highProficiencyColor.replace('#', '0x'));
    themeColors.medium = parseInt(config.theme.mediumProficiencyColor.replace('#', '0x'));
    themeColors.low = parseInt(config.theme.lowProficiencyColor.replace('#', '0x'));
    themeColors.accent = parseInt(config.theme.accentColor.replace('#', '0x'));
    themeColors.starfield = parseInt(config.theme.starfieldColor.replace('#', '0x'));
    themeColors.constellation = parseInt(config.theme.constellationLinesColor.replace('#', '0x'));

    document.documentElement.style.setProperty('--accent', config.theme.accentColor);
    document.documentElement.style.setProperty('--high-prof', config.theme.highProficiencyColor);
    document.documentElement.style.setProperty('--med-prof', config.theme.mediumProficiencyColor);
    document.documentElement.style.setProperty('--low-prof', config.theme.lowProficiencyColor);
    document.documentElement.style.setProperty('--bg-color', config.theme.backgroundGradStart);
    document.documentElement.style.setProperty('--bg-gradient', `radial-gradient(circle at center, ${config.theme.backgroundGradEnd} 0%, ${config.theme.backgroundGradStart} 100%)`);
  }

  const slider = document.getElementById('speed-slider');
  if (slider) slider.value = currentSpeed;
  const sliderVal = document.getElementById('speed-value');
  if (sliderVal) sliderVal.textContent = `${currentSpeed}x`;

  // Render Social Links with proper SVG namespace
  const socialsContainer = document.getElementById('social-links');
  if (socialsContainer && config.developer.socials) {
    socialsContainer.replaceChildren();

    const socials = config.developer.socials;
    const icons = {
      github: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>',
      linkedin: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>',
      email: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M0 3v18h24v-18h-24zm6.623 7.929l-4.623 3.937v-8.193l4.623 4.256zm1.458.83l3.919 3.606 3.919-3.606 6.301 5.841h-20.44l6.301-5.841zm1.458-.83l4.623-4.256v8.193l-4.623-3.937zm12.301 4.767l-4.623-3.937 4.623-4.256v8.193zm-1.84-8.696l-8 7.375-8-7.375h16z"/></svg>'
    };

    Object.keys(socials).forEach(key => {
      if (socials[key] && icons[key]) {
        const btn = document.createElement('a');
        btn.setAttribute('href', socials[key]);
        btn.setAttribute('target', '_blank');
        btn.setAttribute('rel', 'noopener noreferrer');
        btn.setAttribute('class', 'social-btn');
        btn.setAttribute('title', key.charAt(0).toUpperCase() + key.slice(1));

        const doc = new DOMParser().parseFromString(icons[key], 'image/svg+xml');
        const svgEl = doc.documentElement;
        btn.appendChild(svgEl);
        socialsContainer.appendChild(btn);
      }
    });
  }
}

// ═════════════════════════════════════════════════════════════════
// SCENE
// ═════════════════════════════════════════════════════════════════

function setupScene() {
  const container = document.getElementById('canvas-container');

  scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x03030c, 0.003);

  camera = new THREE.PerspectiveCamera(baseFov, container.clientWidth / container.clientHeight, 0.1, 2000);
  camera.position.set(0, 8, 28);

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(scene.fog.color);
  container.appendChild(renderer.domElement);

  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.maxDistance = 60;
  controls.minDistance = 6;
  controls.enablePan = false;
  controls.target.set(0, 0, 0);

  // Lighting
  scene.add(new THREE.AmbientLight(0xffffff, 0.2));

  const keyLight = new THREE.DirectionalLight(0xffffff, 1.5);
  keyLight.position.set(10, 20, 10);
  scene.add(keyLight);

  const rimLight = new THREE.DirectionalLight(0x4488ff, 0.5);
  rimLight.position.set(-10, -5, -10);
  scene.add(rimLight);

  const engineGlow = new THREE.PointLight(0xffaa44, 2.5, 20);
  engineGlow.position.set(0, -2.5, 0);
  scene.add(engineGlow);

  window.addEventListener('resize', onWindowResize);
}

// ═════════════════════════════════════════════════════════════════
// WARP STARS – Streak downward (-Y) since rocket nose points up (+Y)
// ═════════════════════════════════════════════════════════════════

function setupWarpStars() {
  // Remove old stars if rebuilding
  if (stars) {
    scene.remove(stars);
    stars.geometry.dispose();
    stars.material.dispose();
  }

  const geo = new THREE.BufferGeometry();
  const positions = new Float32Array(starCount * 2 * 3);
  starSpeeds = new Float32Array(starCount);

  for (let i = 0; i < starCount; i++) {
    const x = (Math.random() - 0.5) * 250;
    const y = (Math.random() - 0.5) * 250;
    const z = (Math.random() - 0.5) * 250;

    // Head vertex (higher Y)
    positions[i * 6]     = x;
    positions[i * 6 + 1] = y;
    positions[i * 6 + 2] = z;

    // Tail vertex (slightly below head)
    positions[i * 6 + 3] = x;
    positions[i * 6 + 4] = y - 0.15;
    positions[i * 6 + 5] = z;

    starSpeeds[i] = 0.8 + Math.random() * 1.6;
  }

  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  starPositions = geo.attributes.position;

  const mat = new THREE.LineBasicMaterial({
    color: themeColors.starfield,
    transparent: true,
    opacity: 0.6
  });

  stars = new THREE.LineSegments(geo, mat);
  scene.add(stars);
}

// ═════════════════════════════════════════════════════════════════
// ENHANCED ROCKET – Nose +Y, exhaust -Y, with ring exhaust & flames
// ═════════════════════════════════════════════════════════════════

function setupRocket() {
  rocketGroup = new THREE.Group();
  flameGroup = new THREE.Group();

  const rocketCfg = configData?.rocket || {};
  const bodyColor = new THREE.Color(rocketCfg.bodyColor || '#ffffff');
  const finColor = new THREE.Color(rocketCfg.finColor || '#ff3b70');
  const windowColor = new THREE.Color(rocketCfg.windowColor || '#00ffd2');
  const exhaustColorVal = new THREE.Color(rocketCfg.exhaustColor || '#ff6a00');

  // ── Main Fuselage ──
  const bodyGeo = new THREE.CylinderGeometry(0.55, 0.7, 3.2, 24);
  const bodyMat = new THREE.MeshStandardMaterial({ color: bodyColor, roughness: 0.08, metalness: 0.95 });
  rocketGroup.add(new THREE.Mesh(bodyGeo, bodyMat));

  // ── Nose Cone ──
  const noseGeo = new THREE.ConeGeometry(0.55, 1.6, 24);
  const noseMat = new THREE.MeshStandardMaterial({ color: finColor, roughness: 0.15, metalness: 0.7 });
  const nose = new THREE.Mesh(noseGeo, noseMat);
  nose.position.y = 2.4;
  rocketGroup.add(nose);

  // ── Antenna + Beacon ──
  const antenna = new THREE.Mesh(
    new THREE.CylinderGeometry(0.02, 0.02, 0.8, 8),
    new THREE.MeshStandardMaterial({ color: 0xcccccc, roughness: 0.3, metalness: 0.9 })
  );
  antenna.position.y = 3.6;
  rocketGroup.add(antenna);

  const beaconGeo = new THREE.SphereGeometry(0.07, 12, 12);
  const beaconMat = new THREE.MeshBasicMaterial({ color: 0xff0000, transparent: true, opacity: 1.0 });
  const beacon = new THREE.Mesh(beaconGeo, beaconMat);
  beacon.position.y = 4.05;
  rocketGroup.add(beacon);

  beaconLight = new THREE.PointLight(0xff0000, 2.0, 5);
  beaconLight.position.y = 4.05;
  rocketGroup.add(beaconLight);

  // ── Cabin Window ──
  const windowMat = new THREE.MeshStandardMaterial({
    color: windowColor, emissive: windowColor, emissiveIntensity: 0.9, roughness: 0.05, metalness: 0.3
  });
  const cabinWindow = new THREE.Mesh(new THREE.SphereGeometry(0.22, 16, 16), windowMat);
  cabinWindow.position.set(0, 0.7, 0.58);
  rocketGroup.add(cabinWindow);

  // Side windows
  for (let i = -1; i <= 1; i += 2) {
    const sw = new THREE.Mesh(new THREE.SphereGeometry(0.12, 12, 12), windowMat.clone());
    const angle = i * Math.PI * 0.35;
    sw.position.set(Math.sin(angle) * 0.6, 0.7, Math.cos(angle) * 0.6);
    rocketGroup.add(sw);
  }

  // ── 4 Main Fins ──
  const finGeo = new THREE.BoxGeometry(0.08, 1.2, 1.0);
  const finMat = new THREE.MeshStandardMaterial({ color: finColor, roughness: 0.15, metalness: 0.8 });
  for (let i = 0; i < 4; i++) {
    const fin = new THREE.Mesh(finGeo, finMat);
    fin.position.y = -1.2;
    const angle = (i * Math.PI) / 2;
    fin.position.x = Math.cos(angle) * 0.72;
    fin.position.z = Math.sin(angle) * 0.72;
    fin.rotation.y = -angle;
    rocketGroup.add(fin);
  }

  // ── Main Nozzle ──
  const nozzleMat = new THREE.MeshStandardMaterial({ color: 0x1a1a2e, roughness: 0.4, metalness: 0.95 });
  const nozzle = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.3, 0.5, 16), nozzleMat);
  nozzle.position.y = -1.85;
  rocketGroup.add(nozzle);

  // ── Exhaust Ring (Glowing torus at nozzle mouth) ──
  const exhaustRingGeo = new THREE.TorusGeometry(0.38, 0.05, 12, 32);
  const exhaustRingMat = new THREE.MeshBasicMaterial({
    color: exhaustColorVal, transparent: true, opacity: 0.85
  });
  const exhaustRing = new THREE.Mesh(exhaustRingGeo, exhaustRingMat);
  exhaustRing.position.y = -2.1;
  exhaustRing.rotation.x = Math.PI / 2;
  rocketGroup.add(exhaustRing);

  // ── Layered Flame Cones ──
  // Inner core (white-hot)
  const innerFlameGeo = new THREE.ConeGeometry(0.2, 1.8, 12, 1, true);
  const innerFlameMat = new THREE.MeshBasicMaterial({
    color: 0xffffcc, transparent: true, opacity: 0.85, side: THREE.DoubleSide
  });
  const innerFlame = new THREE.Mesh(innerFlameGeo, innerFlameMat);
  innerFlame.position.y = -3.0;
  innerFlame.rotation.x = Math.PI; // Tip points down
  flameGroup.add(innerFlame);

  // Mid flame (orange)
  const midFlameGeo = new THREE.ConeGeometry(0.35, 2.6, 12, 1, true);
  const midFlameMat = new THREE.MeshBasicMaterial({
    color: 0xff8800, transparent: true, opacity: 0.5, side: THREE.DoubleSide
  });
  const midFlame = new THREE.Mesh(midFlameGeo, midFlameMat);
  midFlame.position.y = -3.4;
  midFlame.rotation.x = Math.PI;
  flameGroup.add(midFlame);

  // Outer flame (red, transparent)
  const outerFlameGeo = new THREE.ConeGeometry(0.5, 3.5, 12, 1, true);
  const outerFlameMat = new THREE.MeshBasicMaterial({
    color: 0xff3300, transparent: true, opacity: 0.2, side: THREE.DoubleSide
  });
  const outerFlame = new THREE.Mesh(outerFlameGeo, outerFlameMat);
  outerFlame.position.y = -3.8;
  outerFlame.rotation.x = Math.PI;
  flameGroup.add(outerFlame);

  rocketGroup.add(flameGroup);

  // ── Side Boosters ──
  const boosterGeo = new THREE.CylinderGeometry(0.22, 0.3, 2.0, 16);
  const boosterMat = new THREE.MeshStandardMaterial({ color: bodyColor, roughness: 0.1, metalness: 0.9 });
  const boosterNoseGeo = new THREE.ConeGeometry(0.22, 0.5, 16);

  for (let side = -1; side <= 1; side += 2) {
    const booster = new THREE.Mesh(boosterGeo, boosterMat);
    booster.position.set(side * 1.1, -0.4, 0);
    rocketGroup.add(booster);

    const boosterNose = new THREE.Mesh(boosterNoseGeo, noseMat);
    boosterNose.position.set(side * 1.1, 0.75, 0);
    rocketGroup.add(boosterNose);

    // Booster nozzle
    const bNozzle = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.14, 0.3, 12), nozzleMat);
    bNozzle.position.set(side * 1.1, -1.55, 0);
    rocketGroup.add(bNozzle);

    // Booster exhaust ring
    const bRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.17, 0.03, 8, 20),
      new THREE.MeshBasicMaterial({ color: exhaustColorVal, transparent: true, opacity: 0.7 })
    );
    bRing.position.set(side * 1.1, -1.7, 0);
    bRing.rotation.x = Math.PI / 2;
    rocketGroup.add(bRing);

    // Booster flame cones
    const bInner = new THREE.Mesh(
      new THREE.ConeGeometry(0.1, 0.8, 8, 1, true),
      new THREE.MeshBasicMaterial({ color: 0xffffcc, transparent: true, opacity: 0.75, side: THREE.DoubleSide })
    );
    bInner.position.set(side * 1.1, -2.1, 0);
    bInner.rotation.x = Math.PI;
    flameGroup.add(bInner);

    const bOuter = new THREE.Mesh(
      new THREE.ConeGeometry(0.18, 1.4, 8, 1, true),
      new THREE.MeshBasicMaterial({ color: 0xff6600, transparent: true, opacity: 0.3, side: THREE.DoubleSide })
    );
    bOuter.position.set(side * 1.1, -2.4, 0);
    bOuter.rotation.x = Math.PI;
    flameGroup.add(bOuter);

    // Booster fins
    for (let f = 0; f < 2; f++) {
      const bFin = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.6, 0.5), finMat);
      const fAngle = f === 0 ? 0 : Math.PI;
      bFin.position.set(side * 1.1 + Math.cos(fAngle) * 0.3, -1.1, Math.sin(fAngle) * 0.3);
      bFin.rotation.y = -fAngle;
      rocketGroup.add(bFin);
    }
  }

  // ── Decorative body ring ──
  const ringMat = new THREE.MeshStandardMaterial({
    color: windowColor, emissive: windowColor, emissiveIntensity: 0.5, roughness: 0.1, metalness: 0.9
  });
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.62, 0.04, 8, 32), ringMat);
  ring.rotation.x = Math.PI / 2;
  rocketGroup.add(ring);

  rocketGroup.position.set(0, 0, 0);
  scene.add(rocketGroup);
}

// ═════════════════════════════════════════════════════════════════
// EXHAUST PARTICLES (ring pattern)
// ═════════════════════════════════════════════════════════════════

function createExhaustParticle() {
  const mappedSpeed = currentSpeed * 0.7;
  const count = Math.max(1, Math.floor(mappedSpeed / 2.5));
  const rocketCfg = configData?.rocket || {};
  const exhaustColor = new THREE.Color(rocketCfg.exhaustColor || '#ff6a00');

  const spawnPoints = [
    { x: 0, y: -2.2, z: 0, ringR: 0.3, spread: 0.2 },
    { x: -1.1, y: -1.8, z: 0, ringR: 0.14, spread: 0.1 },
    { x: 1.1, y: -1.8, z: 0, ringR: 0.14, spread: 0.1 }
  ];

  for (let k = 0; k < count; k++) {
    const sp = spawnPoints[k % spawnPoints.length];
    const size = 0.06 + Math.random() * 0.1;
    const geo = new THREE.SphereGeometry(size, 4, 4);

    // Ring spawn pattern
    const ringAngle = Math.random() * Math.PI * 2;
    const ringOffset = sp.ringR * (0.5 + Math.random() * 0.5);

    const colorMix = Math.random();
    const particleColor = exhaustColor.clone();
    if (colorMix > 0.6) particleColor.lerp(new THREE.Color(0xffff44), 0.5);
    if (colorMix > 0.85) particleColor.lerp(new THREE.Color(0xffffff), 0.4);

    const mat = new THREE.MeshBasicMaterial({ color: particleColor, transparent: true, opacity: 0.9 });
    const mesh = new THREE.Mesh(geo, mat);

    mesh.position.set(
      sp.x + Math.cos(ringAngle) * ringOffset + (Math.random() - 0.5) * sp.spread,
      sp.y,
      sp.z + Math.sin(ringAngle) * ringOffset + (Math.random() - 0.5) * sp.spread
    );

    // Velocity primarily downward (-Y)
    const velocity = new THREE.Vector3(
      (Math.random() - 0.5) * 0.12 + Math.cos(ringAngle) * 0.05,
      -(1.0 + Math.random() * (0.6 + mappedSpeed * 0.06)),
      (Math.random() - 0.5) * 0.12 + Math.sin(ringAngle) * 0.05
    );

    cometParticles.push({ mesh, velocity, age: 0, maxAge: 16 + Math.random() * 10, type: 'exhaust' });
    scene.add(mesh);
  }
}

// ═════════════════════════════════════════════════════════════════
// CELESTIAL BODIES
// ═════════════════════════════════════════════════════════════════

function setupCelestialBodies() {
  // ── Sun ──
  const sunTex = generateSunTexture();
  const sunGeo = new THREE.IcosahedronGeometry(6, 3);
  const sunMat = new THREE.MeshBasicMaterial({ map: sunTex });
  const sun = new THREE.Mesh(sunGeo, sunMat);
  sun.position.set(85, 40, -60);
  scene.add(sun);

  // Sun corona glow
  const coronaGeo = new THREE.SphereGeometry(9, 24, 24);
  const coronaMat = new THREE.MeshBasicMaterial({
    color: 0xff8800, transparent: true, opacity: 0.08, side: THREE.BackSide
  });
  const corona = new THREE.Mesh(coronaGeo, coronaMat);
  corona.position.copy(sun.position);
  scene.add(corona);

  // Sun light
  const sunLight = new THREE.PointLight(0xffaa44, 1.0, 200);
  sunLight.position.copy(sun.position);
  scene.add(sunLight);

  celestialBodies.push({ mesh: sun, corona, type: 'sun', rotSpeed: 0.001 });

  // ── Moons ──
  const moonConfigs = [
    { pos: new THREE.Vector3(-45, -15, 35), size: 2.5 },
    { pos: new THREE.Vector3(50, 25, 50), size: 1.8 },
    { pos: new THREE.Vector3(-30, 40, -45), size: 1.2 }
  ];

  moonConfigs.forEach(cfg => {
    const moonTex = generateMoonTexture();
    const moonGeo = new THREE.SphereGeometry(cfg.size, 24, 24);
    const moonMat = new THREE.MeshStandardMaterial({
      map: moonTex, roughness: 0.85, metalness: 0.05
    });
    const moon = new THREE.Mesh(moonGeo, moonMat);
    moon.position.copy(cfg.pos);
    scene.add(moon);
    celestialBodies.push({ mesh: moon, type: 'moon', rotSpeed: 0.002 + Math.random() * 0.003 });
  });

  // ── Meteorites ──
  const metTex = generateMeteoriteTexture();
  for (let i = 0; i < 10; i++) {
    const size = 0.3 + Math.random() * 1.2;
    const geo = new THREE.IcosahedronGeometry(size, 1);
    // Displace vertices for rocky look
    const pos = geo.attributes.position;
    for (let v = 0; v < pos.count; v++) {
      const displacement = 0.65 + Math.random() * 0.7;
      pos.setX(v, pos.getX(v) * displacement);
      pos.setY(v, pos.getY(v) * displacement);
      pos.setZ(v, pos.getZ(v) * displacement);
    }
    geo.computeVertexNormals();

    const hasGlow = Math.random() > 0.6;
    const mat = new THREE.MeshStandardMaterial({
      map: metTex,
      roughness: 0.9,
      metalness: 0.15,
      emissive: hasGlow ? new THREE.Color(0xff4400) : new THREE.Color(0x000000),
      emissiveIntensity: hasGlow ? 0.15 : 0
    });

    const met = new THREE.Mesh(geo, mat);
    // Place in the space between skill spheres and far away objects
    const angle1 = Math.random() * Math.PI * 2;
    const angle2 = Math.random() * Math.PI - Math.PI / 2;
    const dist = 25 + Math.random() * 55;
    met.position.set(
      Math.cos(angle1) * Math.cos(angle2) * dist,
      Math.sin(angle2) * dist,
      Math.sin(angle1) * Math.cos(angle2) * dist
    );
    met.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
    scene.add(met);

    celestialBodies.push({
      mesh: met,
      type: 'meteorite',
      rotSpeed: new THREE.Vector3(
        (Math.random() - 0.5) * 0.008,
        (Math.random() - 0.5) * 0.008,
        (Math.random() - 0.5) * 0.008
      )
    });
  }

  // ── Galaxy Disc ──
  const galaxyTex = generateGalaxyTexture();
  galaxyTex.minFilter = THREE.LinearFilter;
  const galaxyGeo = new THREE.PlaneGeometry(50, 50);
  const galaxyMat = new THREE.MeshBasicMaterial({
    map: galaxyTex, transparent: true, opacity: 0.6, side: THREE.DoubleSide
  });
  const galaxy = new THREE.Mesh(galaxyGeo, galaxyMat);
  galaxy.position.set(-70, 60, -90);
  galaxy.rotation.set(Math.PI * 0.15, Math.PI * 0.3, 0);
  scene.add(galaxy);
  celestialBodies.push({ mesh: galaxy, type: 'galaxy', rotSpeed: 0.0003 });

  // Second smaller galaxy
  const galaxy2Tex = generateGalaxyTexture();
  galaxy2Tex.minFilter = THREE.LinearFilter;
  const galaxy2 = new THREE.Mesh(
    new THREE.PlaneGeometry(25, 25),
    new THREE.MeshBasicMaterial({ map: galaxy2Tex, transparent: true, opacity: 0.35, side: THREE.DoubleSide })
  );
  galaxy2.position.set(80, -30, -100);
  galaxy2.rotation.set(-Math.PI * 0.1, Math.PI * 0.6, Math.PI * 0.2);
  scene.add(galaxy2);
  celestialBodies.push({ mesh: galaxy2, type: 'galaxy', rotSpeed: 0.0005 });
}

// ═════════════════════════════════════════════════════════════════
// SPHERICAL NEBULA SKILLS
// ═════════════════════════════════════════════════════════════════

function setupNebulaSkills() {
  skillsNebulaGroup = new THREE.Group();
  scene.add(skillsNebulaGroup);

  const skills = skillsData?.skills || [];
  const labelContainer = document.getElementById('labels-container');
  if (labelContainer) labelContainer.replaceChildren();

  const corridors = {
    high:   { min: 5.5,  max: 7.5,  color: themeColors.high },
    medium: { min: 11.0, max: 13.5, color: themeColors.medium },
    low:    { min: 17.5, max: 20.5, color: themeColors.low }
  };

  const categories = new Set();
  const grouped = { high: [], medium: [], low: [] };

  skills.forEach((skill, idx) => {
    const prof = skill.proficiency.toLowerCase();
    if (grouped[prof]) {
      grouped[prof].push({ skill, idx });
    } else {
      grouped.medium.push({ skill, idx });
    }
  });

  Object.keys(grouped).forEach(prof => {
    const items = grouped[prof];
    const corridor = corridors[prof];
    const n = items.length;

    items.forEach((item, i) => {
      categories.add(item.skill.category);

      const goldenAngle = Math.PI * (3 - Math.sqrt(5));
      const theta = goldenAngle * i;
      const phi = Math.acos(1 - (2 * (i + 0.5)) / Math.max(n, 1));
      const radius = corridor.min + Math.random() * (corridor.max - corridor.min);

      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.cos(phi);
      const z = radius * Math.sin(phi) * Math.sin(theta);

      const nodeSize = prof === 'high' ? 0.55 : prof === 'medium' ? 0.45 : 0.38;
      const nodeGeo = new THREE.SphereGeometry(nodeSize, 16, 16);
      const nodeMat = new THREE.MeshBasicMaterial({ color: corridor.color, transparent: true, opacity: 0.95 });
      const mesh = new THREE.Mesh(nodeGeo, nodeMat);
      mesh.position.set(x, y, z);

      // Glow ring
      const glowGeo = new THREE.RingGeometry(nodeSize * 1.2, nodeSize * 1.7, 24);
      const glowMat = new THREE.MeshBasicMaterial({
        color: corridor.color, transparent: true, opacity: 0.15, side: THREE.DoubleSide
      });
      const glowRing = new THREE.Mesh(glowGeo, glowMat);
      glowRing.position.copy(mesh.position);
      glowRing.lookAt(0, 0, 0);
      skillsNebulaGroup.add(glowRing);

      mesh.userData = {
        skill: item.skill, baseColor: corridor.color, index: item.idx,
        proficiency: prof, radius, glowRing
      };
      skillsNebulaGroup.add(mesh);

      // HTML Label
      const label = document.createElement('div');
      label.setAttribute('class', 'node-label');
      label.setAttribute('id', `label-${item.idx}`);
      label.textContent = item.skill.name;

      const hexColor = '#' + corridor.color.toString(16).padStart(6, '0');
      label.style.borderColor = `${hexColor}44`;
      label.style.boxShadow = `0 0 10px ${hexColor}22`;

      labelContainer.appendChild(label);
      mesh.userData.labelElement = label;
    });
  });

  setupCategoryChips(categories);
  drawOrbitalConstellations();
}

function drawOrbitalConstellations() {
  const meshNodes = skillsNebulaGroup.children.filter(c => c instanceof THREE.Mesh && c.userData.skill);
  const categoriesMap = {};

  meshNodes.forEach(node => {
    const cat = node.userData.skill.category;
    if (!categoriesMap[cat]) categoriesMap[cat] = [];
    categoriesMap[cat].push(node);
  });

  Object.keys(categoriesMap).forEach(cat => {
    const catNodes = categoriesMap[cat];
    if (catNodes.length < 2) return;

    catNodes.sort((a, b) => {
      return Math.atan2(a.position.z, a.position.x) - Math.atan2(b.position.z, b.position.x);
    });

    const points = [];
    for (let i = 0; i < catNodes.length; i++) {
      points.push(catNodes[i].position.clone());
      points.push(catNodes[(i + 1) % catNodes.length].position.clone());
    }

    const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
    const lineMat = new THREE.LineBasicMaterial({
      color: themeColors.constellation, transparent: true, opacity: 0.12
    });
    const lines = new THREE.LineSegments(lineGeo, lineMat);
    lines.userData = { category: cat };
    skillsNebulaGroup.add(lines);
  });
}

// ═════════════════════════════════════════════════════════════════
// CATEGORY CHIPS
// ═════════════════════════════════════════════════════════════════

function setupCategoryChips(categories) {
  const chipsContainer = document.getElementById('filter-chips');
  if (!chipsContainer) return;

  const allChip = document.getElementById('btn-cat-all');
  chipsContainer.replaceChildren(allChip);

  categories.forEach(cat => {
    const chip = document.createElement('button');
    chip.setAttribute('class', 'chip');
    chip.setAttribute('data-category', cat);
    chip.textContent = cat;
    chip.addEventListener('click', () => {
      document.querySelectorAll('.filter-chips .chip').forEach(btn => btn.classList.remove('active'));
      chip.classList.add('active');
      activeCategory = cat;
      filterNebulaNodes();
    });
    chipsContainer.appendChild(chip);
  });

  allChip.addEventListener('click', () => {
    document.querySelectorAll('.filter-chips .chip').forEach(btn => btn.classList.remove('active'));
    allChip.classList.add('active');
    activeCategory = 'all';
    filterNebulaNodes();
  });
}

function filterNebulaNodes() {
  skillsNebulaGroup.children.forEach(child => {
    if (child instanceof THREE.Mesh && child.userData.skill) {
      const match = (activeCategory === 'all' || child.userData.skill.category === activeCategory);
      child.material.opacity = match ? 0.95 : 0.12;
      child.scale.set(match ? 1 : 0.5, match ? 1 : 0.5, match ? 1 : 0.5);
      if (child.userData.glowRing) child.userData.glowRing.material.opacity = match ? 0.15 : 0.03;
    } else if (child instanceof THREE.LineSegments && child.userData.category) {
      child.material.opacity = (activeCategory === 'all' || child.userData.category === activeCategory) ? 0.12 : 0.02;
    }
  });
}

// ═════════════════════════════════════════════════════════════════
// INTERACTION
// ═════════════════════════════════════════════════════════════════

function setupInteraction() {
  const container = document.getElementById('canvas-container');

  container.addEventListener('mousemove', (e) => {
    const rect = container.getBoundingClientRect();
    mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
  });

  container.addEventListener('click', onClick);

  // Speed Slider
  const slider = document.getElementById('speed-slider');
  if (slider) {
    slider.addEventListener('input', (e) => {
      const speed = parseInt(e.target.value);
      updateSpeed(speed);
      previousSpeed = speed;
    });
  }

  // Close Details
  const closeBtn = document.getElementById('close-details-btn');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      document.getElementById('details-card').classList.remove('visible');
      document.getElementById('details-card').classList.add('hidden');
      selectedNode = null;

      // Restore previous speed
      const slider = document.getElementById('speed-slider');
      if (slider) slider.value = previousSpeed;
      updateSpeed(previousSpeed);
    });
  }

  // ── Sidebar Toggle ──
  const sidebarToggle = document.getElementById('sidebar-toggle');
  const sidebar = document.getElementById('profile-sidebar');
  const toggleIcon = document.getElementById('sidebar-toggle-icon');
  if (sidebarToggle && sidebar) {
    sidebarToggle.addEventListener('click', () => {
      sidebar.classList.toggle('collapsed');
      sidebarToggle.classList.toggle('sidebar-hidden');
      if (toggleIcon) {
        toggleIcon.textContent = sidebar.classList.contains('collapsed') ? '\u25b6' : '\u25c0';
      }
    });
  }

  // ── Star Density Slider ──
  const starCountSlider = document.getElementById('star-count-slider');
  const starCountValue = document.getElementById('star-count-value');
  if (starCountSlider) {
    starCountSlider.addEventListener('input', (e) => {
      starCount = parseInt(e.target.value);
      if (starCountValue) starCountValue.textContent = starCount;
      setupWarpStars();
    });
  }

  // ── Star Size Slider ──
  const starSizeSlider = document.getElementById('star-size-slider');
  const starSizeValue = document.getElementById('star-size-value');
  if (starSizeSlider) {
    starSizeSlider.addEventListener('input', (e) => {
      starSizeMultiplier = parseInt(e.target.value);
      if (starSizeValue) starSizeValue.textContent = starSizeMultiplier;
    });
  }
}

function updateSpeed(speed) {
  currentSpeed = speed;
  const display = document.getElementById('speed-value');
  if (display) {
    display.textContent = `${speed}x`;
  }
}

function onClick() {
  raycaster.setFromCamera(mouse, camera);
  const meshNodes = skillsNebulaGroup.children.filter(c => c instanceof THREE.Mesh && c.userData.skill);
  const intersects = raycaster.intersectObjects(meshNodes);

  if (intersects.length > 0) {
    const clickedMesh = intersects[0].object;
    if (activeCategory === 'all' || clickedMesh.userData.skill.category === activeCategory) {
      selectedNode = clickedMesh;
      showSkillDetails(clickedMesh.userData.skill);

      if (currentSpeed > 0) {
        previousSpeed = currentSpeed;
      }
      const slider = document.getElementById('speed-slider');
      if (slider) slider.value = 0;
      updateSpeed(0);
    }
  }
}

function showSkillDetails(skill) {
  const card = document.getElementById('details-card');
  const sName = document.getElementById('skill-name');
  const sCat = document.getElementById('skill-category');
  const sProf = document.getElementById('skill-proficiency');
  const sDesc = document.getElementById('skill-description');
  const sFill = document.getElementById('proficiency-fill');
  const sPercent = document.getElementById('proficiency-percent');
  const sRegion = document.getElementById('skill-region');
  if (!card) return;

  sName.textContent = skill.name;
  sCat.textContent = skill.category;
  sDesc.textContent = skill.description;

  const prof = skill.proficiency.toLowerCase();
  sProf.className = 'proficiency-badge';

  let fillWidth = '0%';
  let orbitDesc = '';

  if (prof === 'high') {
    sProf.textContent = 'Expert Proficiency';
    sProf.classList.add('badge-high');
    fillWidth = '90%';
    orbitDesc = 'Inner Sphere (Closest to rocket core)';
  } else if (prof === 'medium') {
    sProf.textContent = 'Moderate Proficiency';
    sProf.classList.add('badge-medium');
    fillWidth = '65%';
    orbitDesc = 'Middle Sphere (Intermediate orbit)';
  } else {
    sProf.textContent = 'Basic Familiarity';
    sProf.classList.add('badge-low');
    fillWidth = '35%';
    orbitDesc = 'Outer Sphere (Periphery orbit)';
  }

  sPercent.textContent = fillWidth;
  sRegion.textContent = orbitDesc;

  setTimeout(() => {
    sFill.style.width = fillWidth;
    sFill.style.backgroundColor = `var(--${prof === 'high' ? 'high-prof' : prof === 'medium' ? 'med-prof' : 'low-prof'})`;
  }, 50);

  card.classList.remove('hidden');
  card.classList.add('visible');
}

function onWindowResize() {
  const container = document.getElementById('canvas-container');
  camera.aspect = container.clientWidth / container.clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(container.clientWidth, container.clientHeight);
}

// ═════════════════════════════════════════════════════════════════
// COMET TRAILS
// ═════════════════════════════════════════════════════════════════

function createCometTrail(node) {
  if (currentSpeed < 1 || Math.random() > 0.3) return;
  const worldPos = new THREE.Vector3();
  node.getWorldPosition(worldPos);
  const size = 0.05 + Math.random() * 0.05;
  const geo = new THREE.SphereGeometry(size, 4, 4);
  const mat = new THREE.MeshBasicMaterial({ color: node.userData.baseColor, transparent: true, opacity: 0.5 });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.copy(worldPos);
  const velocity = new THREE.Vector3(
    (Math.random() - 0.5) * 0.03,
    (Math.random() - 0.5) * 0.03,
    (Math.random() - 0.5) * 0.03
  );
  cometParticles.push({ mesh, velocity, age: 0, maxAge: 14 + Math.random() * 10, type: 'comet' });
  scene.add(mesh);
}

function updateParticles() {
  for (let i = cometParticles.length - 1; i >= 0; i--) {
    const p = cometParticles[i];
    p.mesh.position.add(p.velocity);
    p.age++;
    const ratio = p.age / p.maxAge;
    p.mesh.material.opacity = 0.8 * (1 - ratio);
    p.mesh.scale.multiplyScalar(0.97);
    if (p.age >= p.maxAge) {
      scene.remove(p.mesh);
      p.mesh.geometry.dispose();
      p.mesh.material.dispose();
      cometParticles.splice(i, 1);
    }
  }
}

// ═════════════════════════════════════════════════════════════════
// ANIMATION LOOP
// ═════════════════════════════════════════════════════════════════

function animate() {
  requestAnimationFrame(animate);

  const delta = clock.getDelta();
  const elapsed = clock.getElapsedTime();

  controls.update();

  // ── 1. Beacon blink ──
  if (beaconLight) {
    const blink = Math.sin(elapsed * 4.0) > 0.3 ? 1.0 : 0.0;
    beaconLight.intensity = blink * 2.5;
    rocketGroup.children.forEach(c => {
      if (c.geometry && c.geometry.type === 'SphereGeometry' && Math.abs(c.position.y - 4.05) < 0.01) {
        c.material.opacity = 0.3 + blink * 0.7;
      }
    });
  }

  // ── 2. Rocket idle bob ──
  if (rocketGroup) {
    rocketGroup.position.y = Math.sin(elapsed * 1.5) * 0.08;
    rocketGroup.rotation.y = Math.sin(elapsed * 0.3) * 0.04;

    if (currentSpeed > 0) createExhaustParticle();
  }

  // ── 3. Animate flame cones (pulse with speed) ──
  const mappedSpeed = currentSpeed * 0.7;
  if (flameGroup) {
    const speedFactor = mappedSpeed / 20;
    const pulse = 0.85 + Math.sin(elapsed * 12) * 0.15;
    const flameScale = (0.4 + speedFactor * 0.6) * pulse;

    flameGroup.children.forEach(child => {
      child.scale.set(flameScale, flameScale * (0.8 + speedFactor * 0.5), flameScale);
      child.material.opacity = child.material.opacity > 0.5
        ? (0.5 + speedFactor * 0.4) * pulse
        : (0.15 + speedFactor * 0.15) * pulse;
    });

    // Slight rotation for flickering effect
    flameGroup.rotation.y = elapsed * 3;
  }

  // ── 4. Camera FOV ──
  if (camera) {
    const targetFov = baseFov + (mappedSpeed / 20) * 12;
    if (Math.abs(camera.fov - targetFov) > 0.05) {
      camera.fov += (targetFov - camera.fov) * 0.05;
      camera.updateProjectionMatrix();
    }
    if (currentSpeed > 7) {
      const shake = (currentSpeed - 7) * 0.0025;
      camera.position.x += (Math.random() - 0.5) * shake;
      camera.position.y += (Math.random() - 0.5) * shake;
    }
  }

  // ── 5. Stars streak downward (-Y) ──
  if (stars && starPositions) {
    const velocityScale = mappedSpeed * 0.7 + 0.04;
    const sizeMul = starSizeMultiplier / 3; // Normalize around default of 3

    for (let i = 0; i < starCount; i++) {
      let headY = starPositions.getY(i * 2);
      headY -= starSpeeds[i] * velocityScale;

      const lineStretch = (0.15 + mappedSpeed * 0.7 * starSpeeds[i]) * sizeMul;

      if (headY < -125) {
        headY = 125;
        const x = (Math.random() - 0.5) * 250;
        const z = (Math.random() - 0.5) * 250;
        starPositions.setXYZ(i * 2, x, headY, z);
        starPositions.setXYZ(i * 2 + 1, x, headY - lineStretch, z);
      } else {
        starPositions.setY(i * 2, headY);
        starPositions.setY(i * 2 + 1, headY - lineStretch);
      }
    }
    starPositions.needsUpdate = true;
  }

  // ── 6. Rotate nebula ──
  if (skillsNebulaGroup) {
    const rotSpeed = 0.0002 + (mappedSpeed / 20) * 0.006;
    skillsNebulaGroup.rotation.y += rotSpeed;
    skillsNebulaGroup.rotation.x = Math.sin(elapsed * 0.15) * 0.06;

    skillsNebulaGroup.children.forEach(node => {
      if (node instanceof THREE.Mesh && node.userData.skill) createCometTrail(node);
    });
  }

  // ── 7. Animate celestial bodies ──
  celestialBodies.forEach(body => {
    if (body.type === 'sun') {
      body.mesh.rotation.y += body.rotSpeed;
      if (body.corona) {
        body.corona.scale.setScalar(1 + Math.sin(elapsed * 0.5) * 0.04);
        body.corona.material.opacity = 0.06 + Math.sin(elapsed * 0.8) * 0.02;
      }
    } else if (body.type === 'moon') {
      body.mesh.rotation.y += body.rotSpeed;
    } else if (body.type === 'meteorite') {
      body.mesh.rotation.x += body.rotSpeed.x;
      body.mesh.rotation.y += body.rotSpeed.y;
      body.mesh.rotation.z += body.rotSpeed.z;
    } else if (body.type === 'galaxy') {
      body.mesh.rotation.z += body.rotSpeed;
    }
  });

  // ── 8. Particles ──
  updateParticles();

  // ── 9. Raycaster hover ──
  raycaster.setFromCamera(mouse, camera);
  const meshNodes = skillsNebulaGroup.children.filter(c => c instanceof THREE.Mesh && c.userData.skill);
  const intersects = raycaster.intersectObjects(meshNodes);

  if (hoveredNode) {
    hoveredNode.scale.set(1, 1, 1);
    if (hoveredNode.userData.labelElement) hoveredNode.userData.labelElement.classList.remove('hovered');
    document.body.style.cursor = 'default';
  }

  if (intersects.length > 0) {
    const node = intersects[0].object;
    if (activeCategory === 'all' || node.userData.skill.category === activeCategory) {
      hoveredNode = node;
      hoveredNode.scale.set(1.5, 1.5, 1.5);
      if (hoveredNode.userData.labelElement) hoveredNode.userData.labelElement.classList.add('hovered');
      document.body.style.cursor = 'pointer';
    } else {
      hoveredNode = null;
    }
  } else {
    hoveredNode = null;
  }

  // ── 10. Project labels ──
  const tempV = new THREE.Vector3();
  skillsNebulaGroup.children.forEach(node => {
    if (node instanceof THREE.Mesh && node.userData.skill) {
      const label = node.userData.labelElement;
      if (!label) return;

      node.getWorldPosition(tempV);
      const dist = camera.position.distanceTo(tempV);
      tempV.project(camera);

      const cx = (tempV.x * 0.5 + 0.5) * renderer.domElement.clientWidth;
      const cy = (tempV.y * -0.5 + 0.5) * renderer.domElement.clientHeight;
      label.style.left = `${cx}px`;
      label.style.top = `${cy}px`;

      const isBehind = tempV.z > 1;
      const inActive = (activeCategory !== 'all' && node.userData.skill.category !== activeCategory);

      if (isBehind || inActive || dist > 40 || dist < 3) {
        label.classList.remove('visible');
      } else if (dist < 30 || node === hoveredNode) {
        label.classList.add('visible');
      } else {
        label.classList.remove('visible');
      }
    }
  });

  renderer.render(scene, camera);
}

// ═════════════════════════════════════════════════════════════════
// BOOT
// ═════════════════════════════════════════════════════════════════
window.onload = () => {
  startIntro((visitorName) => {
    initApp(visitorName);
  });
};
