import * as THREE from 'three';
import { appState } from './state.js';

function getCollisionFreePosition(radius, existingSystems, targetY, minZ, maxZ, isWrapping = false) {
  let attempts = 0;
  const maxAttempts = 150;
  const safetyMargin = 6.0; // Comfort distance between systems

  while (attempts < maxAttempts) {
    attempts++;

    let y = targetY;
    if (isWrapping) {
      // Stagger Y when wrapping to stagger vertical layout
      y = 135 + Math.random() * 30;
    }

    const x = (Math.random() - 0.5) * 16;
    const zSign = Math.random() > 0.5 ? 1 : -1;
    const z = zSign * (minZ + Math.random() * (maxZ - minZ));

    const candidate = new THREE.Vector3(x, y, z);

    let collision = false;
    for (const other of existingSystems) {
      if (other.group) {
        const otherPos = other.group.position;
        const dist = candidate.distanceTo(otherPos);
        const minDist = radius + (other.radius || 8) + safetyMargin;
        if (dist < minDist) {
          collision = true;
          break;
        }
      }
    }

    if (!collision) {
      return candidate;
    }
  }

  // Fallback
  const x = (Math.random() - 0.5) * 16;
  const zSign = Math.random() > 0.5 ? 1 : -1;
  const z = zSign * (minZ + Math.random() * (maxZ - minZ));
  return new THREE.Vector3(x, targetY + (isWrapping ? Math.random() * 30 : 0), z);
}

export function setupNebulaSkills() {
  appState.skillsNebulaGroup = new THREE.Group();
  appState.scene.add(appState.skillsNebulaGroup);
  appState.solarSystems = [];

  const skills = appState.skillsData?.skills || [];
  const labelContainer = document.getElementById('labels-container');
  if (labelContainer) labelContainer.replaceChildren();

  const categoriesMap = {};
  skills.forEach((skill, idx) => {
    if (!categoriesMap[skill.category]) {
      categoriesMap[skill.category] = [];
    }
    categoriesMap[skill.category].push({ skill, idx });
  });

  const categories = new Set(Object.keys(categoriesMap));

  Object.keys(categoriesMap).forEach(cat => {
    const catSkills = categoriesMap[cat];

    const profCounts = { high: 0, medium: 0, low: 0 };
    catSkills.forEach(item => {
      const p = item.skill.proficiency.toLowerCase();
      if (profCounts[p] !== undefined) profCounts[p]++;
    });

    let domProf = 'medium';
    let maxCount = -1;
    Object.keys(profCounts).forEach(p => {
      if (profCounts[p] > maxCount) {
        maxCount = profCounts[p];
        domProf = p;
      }
    });

    let minR, maxR;
    if (domProf === 'high') { minR = 5; maxR = 10; }
    else if (domProf === 'medium') { minR = 10; maxR = 18; }
    else { minR = 18; maxR = 28; }

    let minZ, maxZ;
    if (domProf === 'high') { minZ = 8; maxZ = 13; }
    else if (domProf === 'medium') { minZ = 13; maxZ = 20; }
    else { minZ = 20; maxZ = 28; }

    const sunRadius = 0.8 + catSkills.length * 0.1;
    const maxOrbitRadius = sunRadius + 1.0 + Math.max(0, catSkills.length - 1) * 1.2;

    const catKeys = Object.keys(categoriesMap);
    const catIdx = catKeys.indexOf(cat);
    const targetY = -100 + catIdx * (200 / catKeys.length);

    const pos = getCollisionFreePosition(maxOrbitRadius, appState.solarSystems, targetY, minZ, maxZ, false);
    const x = pos.x;
    const y = pos.y;
    const z = pos.z;

    const h = Math.random();
    const s = 0.7 + Math.random() * 0.2;
    const l = 0.5 + Math.random() * 0.15;
    const color = new THREE.Color().setHSL(h, s, l);

    const group = new THREE.Group();
    group.position.set(x, y, z);
    appState.skillsNebulaGroup.add(group);

    const sunGeo = new THREE.IcosahedronGeometry(sunRadius, 2);
    const sunMat = new THREE.MeshBasicMaterial({ color: color });
    const sunMesh = new THREE.Mesh(sunGeo, sunMat);
    group.add(sunMesh);

    const coronaGeo = new THREE.RingGeometry(sunRadius * 1.2, sunRadius * 1.6, 32);
    const coronaMat = new THREE.MeshBasicMaterial({
      color: color, transparent: true, opacity: 0.2, side: THREE.DoubleSide
    });
    const corona = new THREE.Mesh(coronaGeo, coronaMat);
    corona.rotation.x = Math.PI / 2;
    group.add(corona);

    const planetMeshes = [];
    const orbitLines = [];

    catSkills.forEach((item, i) => {
      const p = item.skill.proficiency.toLowerCase();
      const nodeSize = p === 'high' ? 0.55 : p === 'medium' ? 0.45 : 0.38;
      const orbitRadius = sunRadius + 1.0 + i * 1.2;

      const orbitGeo = new THREE.BufferGeometry();
      const orbitPoints = [];
      for (let j = 0; j <= 64; j++) {
        const a = (j / 64) * Math.PI * 2;
        orbitPoints.push(new THREE.Vector3(Math.cos(a) * orbitRadius, 0, Math.sin(a) * orbitRadius));
      }
      orbitGeo.setFromPoints(orbitPoints);
      const orbitMat = new THREE.LineBasicMaterial({ color: color, transparent: true, opacity: 0.3 });
      const orbitLine = new THREE.LineLoop(orbitGeo, orbitMat);
      group.add(orbitLine);
      orbitLines.push(orbitLine);

      const planetGeo = new THREE.SphereGeometry(nodeSize, 16, 16);
      const planetMat = new THREE.MeshBasicMaterial({ color: color, transparent: true, opacity: 0.95 });
      const planet = new THREE.Mesh(planetGeo, planetMat);

      const angle = Math.random() * Math.PI * 2;
      planet.position.set(Math.cos(angle) * orbitRadius, 0, Math.sin(angle) * orbitRadius);

      planet.userData = {
        skill: item.skill,
        baseColor: color,
        index: item.idx,
        proficiency: p,
        orbitRadius: orbitRadius,
        angle: angle,
        orbitSpeed: 0.01 + Math.random() * 0.02
      };

      group.add(planet);
      planetMeshes.push(planet);

      const label = document.createElement('div');
      label.setAttribute('class', 'node-label');
      label.setAttribute('id', `label-${item.idx}`);
      label.textContent = item.skill.name;

      const hexColor = '#' + color.getHexString();
      label.style.borderColor = `${hexColor}44`;
      label.style.boxShadow = `0 0 10px ${hexColor}22`;

      if (labelContainer) labelContainer.appendChild(label);
      planet.userData.labelElement = label;
    });

    const sunLabel = document.createElement('div');
    sunLabel.setAttribute('class', 'node-label sun-label');
    sunLabel.setAttribute('id', `sun-label-${cat.replace(/[^a-zA-Z0-9]/g, '_')}`);
    sunLabel.textContent = cat;
    const hexColor = '#' + color.getHexString();
    sunLabel.style.borderColor = `${hexColor}66`;
    sunLabel.style.boxShadow = `0 0 12px ${hexColor}44`;
    sunLabel.style.color = hexColor;
    if (labelContainer) labelContainer.appendChild(sunLabel);
    sunMesh.userData.labelElement = sunLabel;

    const hitBoxRadius = Math.max(sunRadius * 2.2, 4.0);
    const hitBoxGeo = new THREE.SphereGeometry(hitBoxRadius, 16, 16);
    const hitBoxMat = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false });
    const hitBox = new THREE.Mesh(hitBoxGeo, hitBoxMat);
    group.add(hitBox);

    appState.solarSystems.push({
      group,
      category: cat,
      skills: catSkills,
      color,
      proficiency: domProf,
      corridorRange: { min: minR, max: maxR },
      sunMesh,
      corona,
      hitBox,
      orbitLines,
      planetMeshes,
      sunLabel,
      radius: maxOrbitRadius
    });
  });

  return categories;
}

export function filterNebulaNodes() {
  appState.solarSystems.forEach(sys => {
    const match = (appState.activeCategory === 'all' || sys.category === appState.activeCategory);
    const sunOpacity = match ? 1.0 : 0.1;
    const coronaOpacity = match ? 0.2 : 0.02;
    const planetOpacity = match ? 0.95 : 0.12;
    const orbitOpacity = match ? 0.3 : 0.02;
    const scale = match ? 1.0 : 0.5;

    sys.sunMesh.material.opacity = sunOpacity;
    sys.sunMesh.material.transparent = true;
    sys.sunMesh.scale.set(scale, scale, scale);

    sys.corona.material.opacity = coronaOpacity;
    sys.corona.scale.set(scale, scale, scale);

    sys.orbitLines.forEach(line => {
      line.material.opacity = orbitOpacity;
      line.scale.set(scale, scale, scale);
    });

    sys.planetMeshes.forEach(planet => {
      planet.material.opacity = planetOpacity;
      planet.scale.set(scale, scale, scale);
    });
  });
}

export function updateSolarSystemsAnimation() {
  const mappedSpeed = appState.currentSpeed * 0.7;

  appState.solarSystems.forEach(sys => {
    sys.group.position.y -= mappedSpeed * 0.3;

    if (sys.group.position.y < -140) {
      const otherSystems = appState.solarSystems.filter(s => s !== sys);
      const freePos = getCollisionFreePosition(
        sys.radius || 8,
        otherSystems,
        140,
        sys.corridorRange.min,
        sys.corridorRange.max,
        true
      );
      sys.group.position.copy(freePos);
    }

    const sysWorldPos = new THREE.Vector3();
    sys.group.getWorldPosition(sysWorldPos);
    const distToCam = appState.camera.position.distanceTo(sysWorldPos);

    const maxDist = 45;
    const minDist = 30;
    let closeFactor = 0;
    if (distToCam <= minDist) {
      closeFactor = 1;
    } else if (distToCam >= maxDist) {
      closeFactor = 0;
    } else {
      closeFactor = 1 - (distToCam - minDist) / (maxDist - minDist);
    }

    const isMatch = (appState.activeCategory === 'all' || sys.category === appState.activeCategory);
    const targetScale = isMatch ? 1.0 : 0.5;

    sys.sunMesh.scale.setScalar(1.0);
    sys.sunMesh.material.opacity = 0.95;
    sys.sunMesh.material.transparent = false;

    sys.corona.scale.setScalar(1.0);
    sys.corona.material.opacity = 0.2;

    sys.orbitLines.forEach(line => {
      line.scale.setScalar(targetScale);
      line.material.opacity = (isMatch ? 0.3 : 0.02) * closeFactor;
    });

    sys.planetMeshes.forEach(planet => {
      const data = planet.userData;
      let speedMult = 0.15 + closeFactor * 0.85;
      if (appState.selectedSystem === sys) {
        speedMult *= 0.15;
      }
      data.angle += data.orbitSpeed * speedMult;
      planet.position.set(
        Math.cos(data.angle) * data.orbitRadius,
        0,
        Math.sin(data.angle) * data.orbitRadius
      );

      if (planet === appState.hoveredNode || planet === appState.selectedNode) {
        planet.scale.setScalar(1.4);
      } else {
        planet.scale.setScalar(targetScale * closeFactor);
      }
      planet.material.opacity = (isMatch ? 0.95 : 0.12) * closeFactor;
    });
  });
}
