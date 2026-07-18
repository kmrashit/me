import * as THREE from 'three';
import { appState } from './state.js';
import { generateSunburstTexture, generateMoonTexture, generateGalaxyTexture, generateMeteoriteTexture } from './textures.js';

export function setupWarpStars() {
  if (appState.stars) {
    appState.scene.remove(appState.stars);
    appState.stars.geometry.dispose();
    appState.stars.material.dispose();
  }

  const geo = new THREE.BufferGeometry();
  const positions = new Float32Array(appState.starCount * 2 * 3);
  appState.starSpeeds = new Float32Array(appState.starCount);

  for (let i = 0; i < appState.starCount; i++) {
    const x = (Math.random() - 0.5) * 250;
    const y = (Math.random() - 0.5) * 250;
    const z = (Math.random() - 0.5) * 250;

    positions[i * 6] = x;
    positions[i * 6 + 1] = y;
    positions[i * 6 + 2] = z;

    positions[i * 6 + 3] = x;
    positions[i * 6 + 4] = y - 0.15;
    positions[i * 6 + 5] = z;

    appState.starSpeeds[i] = 0.8 + Math.random() * 1.6;
  }

  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  appState.starPositions = geo.attributes.position;

  const mat = new THREE.LineBasicMaterial({
    color: appState.themeColors.starfield,
    transparent: true,
    opacity: 0.6
  });

  appState.stars = new THREE.LineSegments(geo, mat);
  appState.scene.add(appState.stars);
}

export function setupCelestialBodies() {
  const sunTex = generateSunburstTexture();
  const sunMat = new THREE.SpriteMaterial({
    map: sunTex,
    color: 0xffffff,
    transparent: true,
    blending: THREE.AdditiveBlending
  });
  const sun = new THREE.Sprite(sunMat);
  sun.scale.set(35, 35, 1.0);
  sun.position.set(100, 100, -100);
  appState.scene.add(sun);

  const sunLight = new THREE.PointLight(0xffddaa, 3.0, 1000);
  sunLight.position.copy(sun.position);
  appState.scene.add(sunLight);

  appState.celestialBodies.push({ mesh: sun, type: 'sun', rotSpeed: 0.019 });

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
    appState.scene.add(moon);
    appState.celestialBodies.push({ mesh: moon, type: 'moon', rotSpeed: 0.002 + Math.random() * 0.003 });
  });

  const galaxyTex = generateGalaxyTexture();
  galaxyTex.minFilter = THREE.LinearFilter;
  const galaxyGeo = new THREE.PlaneGeometry(50, 50);
  const galaxyMat = new THREE.MeshBasicMaterial({
    map: galaxyTex, transparent: true, opacity: 0.6, side: THREE.DoubleSide
  });
  const galaxy = new THREE.Mesh(galaxyGeo, galaxyMat);
  galaxy.position.set(-70, 60, -90);
  galaxy.rotation.set(Math.PI * 0.15, Math.PI * 0.3, 0);
  appState.scene.add(galaxy);
  appState.celestialBodies.push({ mesh: galaxy, type: 'galaxy', rotSpeed: 0.0013 });

  const galaxy2Tex = generateGalaxyTexture();
  galaxy2Tex.minFilter = THREE.LinearFilter;
  const galaxy2 = new THREE.Mesh(
    new THREE.PlaneGeometry(25, 25),
    new THREE.MeshBasicMaterial({ map: galaxy2Tex, transparent: true, opacity: 0.35, side: THREE.DoubleSide })
  );
  galaxy2.position.set(80, -30, -100);
  galaxy2.rotation.set(-Math.PI * 0.1, Math.PI * 0.6, Math.PI * 0.2);
  appState.scene.add(galaxy2);
  appState.celestialBodies.push({ mesh: galaxy2, type: 'galaxy', rotSpeed: 0.005 });
}

export function createCometTrail(node) {
  if (appState.currentSpeed < 1 || Math.random() > 0.3) return;
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
  appState.cometParticles.push({ mesh, velocity, age: 0, maxAge: 14 + Math.random() * 10, type: 'comet' });
  appState.scene.add(mesh);
}

export function updateParticles() {
  for (let i = appState.cometParticles.length - 1; i >= 0; i--) {
    const p = appState.cometParticles[i];
    p.mesh.position.add(p.velocity);
    p.age++;
    const ratio = p.age / p.maxAge;
    p.mesh.material.opacity = 0.8 * (1 - ratio);
    p.mesh.scale.multiplyScalar(0.97);
    if (p.age >= p.maxAge) {
      appState.scene.remove(p.mesh);
      p.mesh.geometry.dispose();
      p.mesh.material.dispose();
      appState.cometParticles.splice(i, 1);
    }
  }
}

export function updateEnvironmentAnimation(elapsed) {
  const mappedSpeed = appState.currentSpeed * 0.7;

  if (appState.stars && appState.starPositions) {
    const velocityScale = mappedSpeed * 0.7 + 0.04;
    const sizeMul = appState.starSizeMultiplier / 3;

    for (let i = 0; i < appState.starCount; i++) {
      let headY = appState.starPositions.getY(i * 2);
      headY -= appState.starSpeeds[i] * velocityScale;

      const lineStretch = (0.15 + mappedSpeed * 0.7 * appState.starSpeeds[i]) * sizeMul;

      if (headY < -125) {
        headY = 125;
        const x = (Math.random() - 0.5) * 250;
        const z = (Math.random() - 0.5) * 250;
        appState.starPositions.setXYZ(i * 2, x, headY, z);
        appState.starPositions.setXYZ(i * 2 + 1, x, headY - lineStretch, z);
      } else {
        appState.starPositions.setY(i * 2, headY);
        appState.starPositions.setY(i * 2 + 1, headY - lineStretch);
      }
    }
    appState.starPositions.needsUpdate = true;
  }

  appState.celestialBodies.forEach(body => {
    if (body.type === 'sun') {
      body.mesh.material.rotation += body.rotSpeed * 0.05;
      if (body.corona) {
        body.corona.scale.setScalar(1 + Math.sin(elapsed * 1.5) * 0.02);
        body.corona.material.opacity = 0.22 + Math.sin(elapsed * 2.0) * 0.02;
      }
      if (body.flare) {
        body.flare.scale.setScalar(1 + Math.sin(elapsed * 1.0) * 0.015);
        body.flare.material.opacity = 0.14 + Math.sin(elapsed * 1.5) * 0.01;
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

  updateParticles();
}
