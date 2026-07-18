import * as THREE from 'three';
import { appState } from './state.js';
import { filterNebulaNodes } from './solarSystems.js';
import { setupWarpStars } from './environment.js';

export function applyConfigToUI(config) {
  const nameEl = document.getElementById('dev-name');
  const titleEl = document.getElementById('dev-title');
  const bioEl = document.getElementById('dev-bio');

  if (nameEl) nameEl.textContent = config.developer.name;
  if (titleEl) titleEl.textContent = config.developer.title;
  if (bioEl) bioEl.textContent = config.developer.bio;

  const avatarGlowEl = document.querySelector('.avatar-glow');
  if (avatarGlowEl) {
    avatarGlowEl.replaceChildren();
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
    appState.themeColors.high = parseInt(config.theme.highProficiencyColor.replace('#', '0x'));
    appState.themeColors.medium = parseInt(config.theme.mediumProficiencyColor.replace('#', '0x'));
    appState.themeColors.low = parseInt(config.theme.lowProficiencyColor.replace('#', '0x'));
    appState.themeColors.accent = parseInt(config.theme.accentColor.replace('#', '0x'));
    appState.themeColors.starfield = parseInt(config.theme.starfieldColor.replace('#', '0x'));
    appState.themeColors.constellation = parseInt(config.theme.constellationLinesColor.replace('#', '0x'));

    document.documentElement.style.setProperty('--accent', config.theme.accentColor);
    document.documentElement.style.setProperty('--high-prof', config.theme.highProficiencyColor);
    document.documentElement.style.setProperty('--med-prof', config.theme.mediumProficiencyColor);
    document.documentElement.style.setProperty('--low-prof', config.theme.lowProficiencyColor);
    document.documentElement.style.setProperty('--bg-color', config.theme.backgroundGradStart);
    document.documentElement.style.setProperty('--bg-gradient', `radial-gradient(circle at center, ${config.theme.backgroundGradEnd} 0%, ${config.theme.backgroundGradStart} 100%)`);
  }

  const slider = document.getElementById('speed-slider');
  if (slider) slider.value = appState.currentSpeed;
  const sliderVal = document.getElementById('speed-value');
  if (sliderVal) sliderVal.textContent = `${appState.currentSpeed}x`;

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

export function setupCategoryChips(categories) {
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
      appState.activeCategory = cat;
      filterNebulaNodes();
    });
    chipsContainer.appendChild(chip);
  });

  allChip.addEventListener('click', () => {
    document.querySelectorAll('.filter-chips .chip').forEach(btn => btn.classList.remove('active'));
    allChip.classList.add('active');
    appState.activeCategory = 'all';
    filterNebulaNodes();
  });
}

export function setupInteraction() {
  const container = document.getElementById('canvas-container');

  container.addEventListener('mousemove', (e) => {
    const rect = container.getBoundingClientRect();
    appState.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
  });

  let mouseDownPos = { x: 0, y: 0 };
  container.addEventListener('mousedown', (e) => {
    mouseDownPos = { x: e.clientX, y: e.clientY };
  });

  container.addEventListener('mouseup', (e) => {
    const dist = Math.hypot(e.clientX - mouseDownPos.x, e.clientY - mouseDownPos.y);
    if (dist < 15) {
      onClick();
    }
  });

  const labelContainer = document.getElementById('labels-container');
  if (labelContainer) {
    labelContainer.addEventListener('click', (e) => {
      if (e.target.classList.contains('node-label')) {
        let foundSys = null;
        let clickedMesh = null;
        appState.solarSystems.forEach(sys => {
          if (sys.sunLabel === e.target) {
            foundSys = sys;
            clickedMesh = sys.sunMesh;
          }
          sys.planetMeshes.forEach(p => {
            if (p.userData.labelElement === e.target) {
              foundSys = sys;
              clickedMesh = p;
            }
          });
        });
        if (foundSys) {
          e.stopPropagation();
          handleSelection(foundSys, clickedMesh);
        }
      }
    });
  }

  const slider = document.getElementById('speed-slider');
  if (slider) {
    slider.addEventListener('input', (e) => {
      const speed = parseInt(e.target.value);
      updateSpeed(speed);
      appState.previousSpeed = speed;
    });
  }

  const closeBtn = document.getElementById('close-details-btn');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      document.getElementById('details-card').classList.remove('visible');
      document.getElementById('details-card').classList.add('hidden');
      appState.selectedNode = null;
      appState.selectedSystem = null;
      appState.rocketState = 'returning';

      const spdSlider = document.getElementById('speed-slider');
      if (spdSlider) spdSlider.value = appState.previousSpeed;
      updateSpeed(appState.previousSpeed);

      const escapeBtn = document.getElementById('escape-system-btn');
      if (escapeBtn) escapeBtn.classList.add('hidden');
    });
  }

  const escapeBtn = document.getElementById('escape-system-btn');
  if (escapeBtn) {
    escapeBtn.addEventListener('click', () => {
      document.getElementById('details-card').classList.remove('visible');
      document.getElementById('details-card').classList.add('hidden');
      appState.selectedNode = null;
      appState.selectedSystem = null;
      appState.rocketState = 'returning';

      const spdSlider = document.getElementById('speed-slider');
      if (spdSlider) spdSlider.value = appState.previousSpeed;
      updateSpeed(appState.previousSpeed);

      escapeBtn.classList.add('hidden');
    });
  }

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

  const starCountSlider = document.getElementById('star-count-slider');
  const starCountValue = document.getElementById('star-count-value');
  if (starCountSlider) {
    starCountSlider.addEventListener('input', (e) => {
      appState.starCount = parseInt(e.target.value);
      if (starCountValue) starCountValue.textContent = appState.starCount;
      setupWarpStars();
    });
  }

  const starSizeSlider = document.getElementById('star-size-slider');
  const starSizeValue = document.getElementById('star-size-value');
  if (starSizeSlider) {
    starSizeSlider.addEventListener('input', (e) => {
      appState.starSizeMultiplier = parseInt(e.target.value);
      if (starSizeValue) starSizeValue.textContent = appState.starSizeMultiplier;
    });
  }
}

export function updateSpeed(speed) {
  appState.currentSpeed = speed;
  const display = document.getElementById('speed-value');
  if (display) {
    display.textContent = `${speed}x`;
  }
}

export function showEscapePopup() {
  let popup = document.getElementById('escape-popup');
  if (!popup) {
    popup = document.createElement('div');
    popup.id = 'escape-popup';
    popup.textContent = 'ESCAPE THIS SOLAR SYSTEM FIRST!';
    popup.style.position = 'absolute';
    popup.style.top = '20%';
    popup.style.left = '50%';
    popup.style.transform = 'translate(-50%, -50%)';
    popup.style.padding = '12px 24px';
    popup.style.background = 'rgba(255, 0, 60, 0.8)';
    popup.style.color = '#fff';
    popup.style.fontFamily = 'var(--font-display)';
    popup.style.fontSize = '14px';
    popup.style.fontWeight = '800';
    popup.style.letterSpacing = '0.1em';
    popup.style.borderRadius = '8px';
    popup.style.border = '1px solid rgba(255, 255, 255, 0.4)';
    popup.style.boxShadow = '0 0 20px rgba(255, 0, 60, 0.6)';
    popup.style.zIndex = '1000';
    popup.style.pointerEvents = 'none';
    popup.style.opacity = '0';
    popup.style.transition = 'opacity 0.3s, top 0.3s';

    const uiContainer = document.querySelector('.ui-container');
    if (uiContainer) uiContainer.appendChild(popup);
  }

  popup.style.opacity = '1';
  popup.style.top = '15%';

  if (appState.escapePopupTimeout) clearTimeout(appState.escapePopupTimeout);
  appState.escapePopupTimeout = setTimeout(() => {
    popup.style.opacity = '0';
    popup.style.top = '20%';
  }, 2000);
}

export function handleSelection(foundSys, clickedMesh) {
  if (foundSys) {
    if (appState.activeCategory === 'all' || foundSys.category === appState.activeCategory) {

      const isSameSystem = (appState.selectedSystem === foundSys);

      if (!isSameSystem) {
        if (appState.selectedSystem) {
          showEscapePopup();
          return;
        }

        appState.selectedSystem = foundSys;
        appState.rocketState = 'traveling';
        appState.rocketOrbitAngle = 0;

        if (appState.currentSpeed > 0) {
          appState.previousSpeed = appState.currentSpeed;
        }
        const slider = document.getElementById('speed-slider');
        if (slider) slider.value = 0;
        updateSpeed(0);

        const escapeBtn = document.getElementById('escape-system-btn');
        if (escapeBtn) escapeBtn.classList.remove('hidden');
      }

      if (clickedMesh && clickedMesh !== foundSys.sunMesh && clickedMesh !== foundSys.corona && clickedMesh !== foundSys.hitBox && clickedMesh.userData && clickedMesh.userData.skill) {
        appState.selectedNode = clickedMesh;
        showSkillDetails(clickedMesh.userData.skill);
      } else {
        document.getElementById('details-card').classList.remove('visible');
        document.getElementById('details-card').classList.add('hidden');
        appState.selectedNode = null;
      }
    }
  }
}

export function onClick() {
  appState.raycaster.setFromCamera(appState.mouse, appState.camera);
  const allClickables = [];
  appState.solarSystems.forEach(sys => {
    allClickables.push(...sys.planetMeshes, sys.sunMesh, sys.hitBox);
    if (sys.corona) allClickables.push(sys.corona);
  });
  const intersects = appState.raycaster.intersectObjects(allClickables);

  if (intersects.length > 0) {
    let clickedMesh = intersects[0].object;
    let foundSys = null;
    let clickedPlanet = null;

    // Check if any intersected object is a planet (prioritize planet over hitbox)
    for (let i = 0; i < intersects.length; i++) {
      if (intersects[i].object.userData && intersects[i].object.userData.skill) {
        clickedPlanet = intersects[i].object;
        break;
      }
    }

    if (clickedPlanet) {
      clickedMesh = clickedPlanet;
    }

    appState.solarSystems.forEach(sys => {
      if (sys.sunMesh === clickedMesh || sys.corona === clickedMesh || sys.hitBox === clickedMesh || sys.planetMeshes.includes(clickedMesh)) {
        foundSys = sys;
      }
    });

    handleSelection(foundSys, clickedMesh);
  } else {
    if (appState.selectedSystem) {
      appState.selectedSystem = null;
      appState.rocketState = 'returning';
      document.getElementById('details-card').classList.remove('visible');
      document.getElementById('details-card').classList.add('hidden');
      appState.selectedNode = null;

      const slider = document.getElementById('speed-slider');
      if (slider) slider.value = appState.previousSpeed;
      updateSpeed(appState.previousSpeed);

      const escapeBtn = document.getElementById('escape-system-btn');
      if (escapeBtn) escapeBtn.classList.add('hidden');
    }
  }
}

export function showSkillDetails(skill) {
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
  let fillWidth = `${skill.percentage}%`;

  let prof = skill.percentage > 75 ? 'high' : skill.percentage > 50 ? 'medium' : 'low';
  sProf.className = 'proficiency-badge';

  let orbitDesc = skill.point;

  if (prof === 'high') {
    sProf.textContent = 'Expert Proficiency';
    sProf.classList.add('badge-high');
    orbitDesc = 'Inner Sphere (Closest to rocket core)';
  } else if (prof === 'medium') {
    sProf.textContent = 'Moderate Proficiency';
    sProf.classList.add('badge-medium');
    orbitDesc = 'Middle Sphere (Intermediate orbit)';
  } else {
    sProf.textContent = 'Basic Proficiency';
    sProf.classList.add('badge-low');
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

export function updateHover() {
  appState.raycaster.setFromCamera(appState.mouse, appState.camera);
  const allPlanets = [];
  appState.solarSystems.forEach(sys => {
    allPlanets.push(...sys.planetMeshes);
  });
  const intersects = appState.raycaster.intersectObjects(allPlanets);

  if (appState.hoveredNode) {
    appState.hoveredNode.scale.set(1.4, 1.4, 1.4);
    if (appState.hoveredNode.userData.labelElement) {
      appState.hoveredNode.userData.labelElement.classList.remove('hovered');
    }
    document.body.style.cursor = 'default';
  }

  if (intersects.length > 0) {
    const node = intersects[0].object;
    if (appState.activeCategory === 'all' || node.userData.skill.category === appState.activeCategory) {
      appState.hoveredNode = node;
      appState.hoveredNode.scale.set(1.4, 1.4, 1.4);
      if (appState.hoveredNode.userData.labelElement) {
        appState.hoveredNode.userData.labelElement.classList.add('hovered');
      }
      document.body.style.cursor = 'pointer';
    } else {
      appState.hoveredNode = null;
    }
  } else {
    appState.hoveredNode = null;
  }
}

export function updateLabels(renderer) {
  const tempV = new THREE.Vector3();
  appState.solarSystems.forEach(sys => {
    const sunNode = sys.sunMesh;
    const sunLabel = sunNode.userData.labelElement;
    if (sunLabel) {
      sunNode.getWorldPosition(tempV);
      const dist = appState.camera.position.distanceTo(tempV);
      tempV.project(appState.camera);

      const cx = (tempV.x * 0.5 + 0.5) * renderer.domElement.clientWidth;
      const cy = (tempV.y * -0.5 + 0.5) * renderer.domElement.clientHeight;
      sunLabel.style.left = `${cx}px`;
      sunLabel.style.top = `${cy}px`;

      const isBehind = tempV.z > 1;
      const inActive = (appState.activeCategory !== 'all' && sys.category !== appState.activeCategory);

      if (isBehind || inActive || dist < 30 || dist > 120) {
        sunLabel.classList.remove('visible');
      } else {
        sunLabel.classList.add('visible');
      }
    }

    sys.planetMeshes.forEach(node => {
      const label = node.userData.labelElement;
      if (!label) return;

      node.getWorldPosition(tempV);
      const dist = appState.camera.position.distanceTo(tempV);
      tempV.project(appState.camera);

      const cx = (tempV.x * 0.5 + 0.5) * renderer.domElement.clientWidth;
      const cy = (tempV.y * -0.5 + 0.5) * renderer.domElement.clientHeight;
      label.style.left = `${cx}px`;
      label.style.top = `${cy}px`;

      const isBehind = tempV.z > 1;
      const inActive = (appState.activeCategory !== 'all' && node.userData.skill.category !== appState.activeCategory);

      if (isBehind || inActive || dist >= 30 || dist < 3) {
        label.classList.remove('visible');
      } else if (dist < 28 || node === appState.hoveredNode) {
        label.classList.add('visible');
      } else {
        label.classList.remove('visible');
      }
    });
  });
}
