import * as THREE from 'three';
import { appState } from './state.js';

export function setupRocket() {
  appState.rocketGroup = new THREE.Group();
  appState.flameGroup = new THREE.Group();

  const rocketCfg = appState.configData?.rocket || {};
  const bodyColor = new THREE.Color(rocketCfg.bodyColor || '#ffffff');
  const finColor = new THREE.Color(rocketCfg.finColor || '#ff3b70');
  const windowColor = new THREE.Color(rocketCfg.windowColor || '#00ffd2');
  const exhaustColorVal = new THREE.Color(rocketCfg.exhaustColor || '#ff6a00');

  // ── Main Fuselage ──
  const bodyGeo = new THREE.CylinderGeometry(0.55, 0.7, 3.2, 24);
  const bodyMat = new THREE.MeshStandardMaterial({ color: bodyColor, roughness: 0.08, metalness: 0.95 });
  appState.rocketGroup.add(new THREE.Mesh(bodyGeo, bodyMat));

  // ── Nose Cone ──
  const noseGeo = new THREE.ConeGeometry(0.55, 1.6, 24);
  const noseMat = new THREE.MeshStandardMaterial({ color: finColor, roughness: 0.15, metalness: 0.7 });
  const nose = new THREE.Mesh(noseGeo, noseMat);
  nose.position.y = 2.4;
  appState.rocketGroup.add(nose);

  // ── Antenna + Beacon ──
  const antenna = new THREE.Mesh(
    new THREE.CylinderGeometry(0.02, 0.02, 0.8, 8),
    new THREE.MeshStandardMaterial({ color: 0xcccccc, roughness: 0.3, metalness: 0.9 })
  );
  antenna.position.y = 3.6;
  appState.rocketGroup.add(antenna);

  const beaconGeo = new THREE.SphereGeometry(0.07, 12, 12);
  const beaconMat = new THREE.MeshBasicMaterial({ color: 0xff0000, transparent: true, opacity: 1.0 });
  const beacon = new THREE.Mesh(beaconGeo, beaconMat);
  beacon.position.y = 4.05;
  appState.rocketGroup.add(beacon);

  appState.beaconLight = new THREE.PointLight(0xff0000, 2.0, 5);
  appState.beaconLight.position.y = 4.05;
  appState.rocketGroup.add(appState.beaconLight);

  // ── Cabin Window ──
  const windowMat = new THREE.MeshStandardMaterial({
    color: windowColor, emissive: windowColor, emissiveIntensity: 0.9, roughness: 0.05, metalness: 0.3
  });
  const cabinWindow = new THREE.Mesh(new THREE.SphereGeometry(0.22, 16, 16), windowMat);
  cabinWindow.position.set(0, 0.7, 0.58);
  appState.rocketGroup.add(cabinWindow);

  // Side windows
  for (let i = -1; i <= 1; i += 2) {
    const sw = new THREE.Mesh(new THREE.SphereGeometry(0.12, 12, 12), windowMat.clone());
    const angle = i * Math.PI * 0.35;
    sw.position.set(Math.sin(angle) * 0.6, 0.7, Math.cos(angle) * 0.6);
    appState.rocketGroup.add(sw);
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
    appState.rocketGroup.add(fin);
  }

  // ── Main Nozzle ──
  const nozzleMat = new THREE.MeshStandardMaterial({ color: 0x1a1a2e, roughness: 0.4, metalness: 0.95 });
  const nozzle = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.3, 0.5, 16), nozzleMat);
  nozzle.position.y = -1.85;
  appState.rocketGroup.add(nozzle);

  // ── Exhaust Ring (Glowing torus at nozzle mouth) ──
  const exhaustRingGeo = new THREE.TorusGeometry(0.38, 0.05, 12, 32);
  const exhaustRingMat = new THREE.MeshBasicMaterial({
    color: exhaustColorVal, transparent: true, opacity: 0.85
  });
  const exhaustRing = new THREE.Mesh(exhaustRingGeo, exhaustRingMat);
  exhaustRing.position.y = -2.1;
  exhaustRing.rotation.x = Math.PI / 2;
  appState.rocketGroup.add(exhaustRing);

  // ── Layered Flame Cones ──
  const innerFlameGeo = new THREE.ConeGeometry(0.2, 1.8, 12, 1, true);
  const innerFlameMat = new THREE.MeshBasicMaterial({
    color: 0xffffcc, transparent: true, opacity: 0.85, side: THREE.DoubleSide
  });
  const innerFlame = new THREE.Mesh(innerFlameGeo, innerFlameMat);
  innerFlame.position.y = -3.0;
  innerFlame.rotation.x = Math.PI;
  appState.flameGroup.add(innerFlame);

  const midFlameGeo = new THREE.ConeGeometry(0.35, 2.6, 12, 1, true);
  const midFlameMat = new THREE.MeshBasicMaterial({
    color: 0xff8800, transparent: true, opacity: 0.5, side: THREE.DoubleSide
  });
  const midFlame = new THREE.Mesh(midFlameGeo, midFlameMat);
  midFlame.position.y = -3.4;
  midFlame.rotation.x = Math.PI;
  appState.flameGroup.add(midFlame);

  const outerFlameGeo = new THREE.ConeGeometry(0.5, 3.5, 12, 1, true);
  const outerFlameMat = new THREE.MeshBasicMaterial({
    color: 0xff3300, transparent: true, opacity: 0.2, side: THREE.DoubleSide
  });
  const outerFlame = new THREE.Mesh(outerFlameGeo, outerFlameMat);
  outerFlame.position.y = -3.8;
  outerFlame.rotation.x = Math.PI;
  appState.flameGroup.add(outerFlame);

  appState.rocketGroup.add(appState.flameGroup);

  // ── Side Boosters ──
  const boosterGeo = new THREE.CylinderGeometry(0.22, 0.3, 2.0, 16);
  const boosterMat = new THREE.MeshStandardMaterial({ color: bodyColor, roughness: 0.1, metalness: 0.9 });
  const boosterNoseGeo = new THREE.ConeGeometry(0.22, 0.5, 16);

  for (let side = -1; side <= 1; side += 2) {
    const booster = new THREE.Mesh(boosterGeo, boosterMat);
    booster.position.set(side * 1.1, -0.4, 0);
    appState.rocketGroup.add(booster);

    const boosterNose = new THREE.Mesh(boosterNoseGeo, noseMat);
    boosterNose.position.set(side * 1.1, 0.75, 0);
    appState.rocketGroup.add(boosterNose);

    const bNozzle = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.14, 0.3, 12), nozzleMat);
    bNozzle.position.set(side * 1.1, -1.55, 0);
    appState.rocketGroup.add(bNozzle);

    const bRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.17, 0.03, 8, 20),
      new THREE.MeshBasicMaterial({ color: exhaustColorVal, transparent: true, opacity: 0.7 })
    );
    bRing.position.set(side * 1.1, -1.7, 0);
    bRing.rotation.x = Math.PI / 2;
    appState.rocketGroup.add(bRing);

    const bInner = new THREE.Mesh(
      new THREE.ConeGeometry(0.1, 0.8, 8, 1, true),
      new THREE.MeshBasicMaterial({ color: 0xffffcc, transparent: true, opacity: 0.75, side: THREE.DoubleSide })
    );
    bInner.position.set(side * 1.1, -2.1, 0);
    bInner.rotation.x = Math.PI;
    appState.flameGroup.add(bInner);

    const bOuter = new THREE.Mesh(
      new THREE.ConeGeometry(0.18, 1.4, 8, 1, true),
      new THREE.MeshBasicMaterial({ color: 0xff6600, transparent: true, opacity: 0.3, side: THREE.DoubleSide })
    );
    bOuter.position.set(side * 1.1, -2.4, 0);
    bOuter.rotation.x = Math.PI;
    appState.flameGroup.add(bOuter);

    for (let f = 0; f < 2; f++) {
      const bFin = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.6, 0.5), finMat);
      const fAngle = f === 0 ? 0 : Math.PI;
      bFin.position.set(side * 1.1 + Math.cos(fAngle) * 0.3, -1.1, Math.sin(fAngle) * 0.3);
      bFin.rotation.y = -fAngle;
      appState.rocketGroup.add(bFin);
    }
  }

  // ── Decorative body ring ──
  const ringMat = new THREE.MeshStandardMaterial({
    color: windowColor, emissive: windowColor, emissiveIntensity: 0.5, roughness: 0.1, metalness: 0.9
  });
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.62, 0.04, 8, 32), ringMat);
  ring.rotation.x = Math.PI / 2;
  appState.rocketGroup.add(ring);

  appState.rocketGroup.position.set(0, 0, 0);
  appState.scene.add(appState.rocketGroup);
}

export function createExhaustParticle() {
  const mappedSpeed = appState.currentSpeed * 0.7;
  const count = Math.max(1, Math.floor(mappedSpeed / 2.5));
  const rocketCfg = appState.configData?.rocket || {};
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

    const velocity = new THREE.Vector3(
      (Math.random() - 0.5) * 0.12 + Math.cos(ringAngle) * 0.05,
      -(1.0 + Math.random() * (0.6 + mappedSpeed * 0.06)),
      (Math.random() - 0.5) * 0.12 + Math.sin(ringAngle) * 0.05
    );

    appState.cometParticles.push({ mesh, velocity, age: 0, maxAge: 16 + Math.random() * 10, type: 'exhaust' });
    appState.scene.add(mesh);
  }
}

export function updateRocketAnimation(elapsed) {
  if (appState.beaconLight) {
    const blink = Math.sin(elapsed * 4.0) > 0.3 ? 1.0 : 0.0;
    appState.beaconLight.intensity = blink * 2.5;
    appState.rocketGroup.children.forEach(c => {
      if (c.geometry && c.geometry.type === 'SphereGeometry' && Math.abs(c.position.y - 4.05) < 0.01) {
        c.material.opacity = 0.3 + blink * 0.7;
      }
    });
  }

  if (appState.rocketGroup) {
    if (appState.rocketState === 'idle') {
      appState.rocketGroup.position.x = 0;
      appState.rocketGroup.position.z = 0;
      appState.rocketGroup.position.y = Math.sin(elapsed * 1.5) * 0.08;
      appState.rocketGroup.rotation.x *= 0.9;
      appState.rocketGroup.rotation.z *= 0.9;
      appState.rocketGroup.rotation.y = Math.sin(elapsed * 0.3) * 0.04;
      appState.cameraFollowTarget.set(0, 0, 0);
    } else if (appState.rocketState === 'traveling' && appState.selectedSystem) {
      const sysPos = appState.selectedSystem.group.position;
      const orbitRadius = appState.selectedSystem.planetMeshes.length * 1.2 + 5;
      const targetPos = new THREE.Vector3(sysPos.x + orbitRadius, sysPos.y, sysPos.z);

      appState.rocketGroup.position.lerp(targetPos, 0.05);
      const dir = targetPos.clone().sub(appState.rocketGroup.position).normalize();

      if (appState.rocketGroup.position.distanceTo(targetPos) < 1.0) {
        appState.rocketState = 'orbiting';
      } else if (dir.lengthSq() > 0.001) {
        const up = new THREE.Vector3(0, 1, 0);
        const targetQuat = new THREE.Quaternion().setFromUnitVectors(up, dir);
        appState.rocketGroup.quaternion.slerp(targetQuat, 0.1);
      }
      appState.cameraFollowTarget.copy(sysPos);
    } else if (appState.rocketState === 'orbiting' && appState.selectedSystem) {
      const sysPos = appState.selectedSystem.group.position;
      const orbitRadiusX = appState.selectedSystem.planetMeshes.length * 1.2 + 5;
      const orbitRadiusZ = orbitRadiusX * 0.8;

      appState.rocketOrbitAngle += 0.02;

      const nextPos = new THREE.Vector3(
        sysPos.x + Math.cos(appState.rocketOrbitAngle) * orbitRadiusX,
        sysPos.y,
        sysPos.z + Math.sin(appState.rocketOrbitAngle) * orbitRadiusZ
      );

      const currentPos = appState.rocketGroup.position.clone();
      appState.rocketGroup.position.copy(nextPos);

      const dir = nextPos.clone().sub(currentPos).normalize();
      if (dir.lengthSq() > 0.001) {
        const up = new THREE.Vector3(0, 1, 0);
        const targetQuat = new THREE.Quaternion().setFromUnitVectors(up, dir);
        appState.rocketGroup.quaternion.slerp(targetQuat, 0.2);
      }
      appState.cameraFollowTarget.copy(sysPos);
    } else if (appState.rocketState === 'returning') {
      const targetPos = new THREE.Vector3(0, 0, 0);
      appState.rocketGroup.position.lerp(targetPos, 0.05);

      const dir = targetPos.clone().sub(appState.rocketGroup.position).normalize();
      if (appState.rocketGroup.position.distanceTo(targetPos) < 1.0) {
        appState.rocketState = 'idle';
      } else if (dir.lengthSq() > 0.001) {
        const up = new THREE.Vector3(0, 1, 0);
        const targetQuat = new THREE.Quaternion().setFromUnitVectors(up, dir);
        appState.rocketGroup.quaternion.slerp(targetQuat, 0.1);
      }
      appState.cameraFollowTarget.copy(appState.rocketGroup.position);
    }

    if (appState.currentSpeed > 0) createExhaustParticle();
  }

  const mappedSpeed = appState.currentSpeed * 0.7;
  if (appState.flameGroup) {
    const speedFactor = mappedSpeed / 20;
    const pulse = 0.85 + Math.sin(elapsed * 12) * 0.15;
    const flameScale = (0.4 + speedFactor * 0.6) * pulse;

    appState.flameGroup.children.forEach(child => {
      child.scale.set(flameScale, flameScale * (0.8 + speedFactor * 0.5), flameScale);
      child.material.opacity = child.material.opacity > 0.5
        ? (0.5 + speedFactor * 0.4) * pulse
        : (0.15 + speedFactor * 0.15) * pulse;
    });

    appState.flameGroup.rotation.y = elapsed * 3;
  }
}
