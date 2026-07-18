import './style.css';
import './mobile.css';
import { startIntro } from './intro.js';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

import { appState } from './three-js-files/state.js';
import { setupRocket, updateRocketAnimation } from './three-js-files/rocket.js';
import { setupWarpStars, setupCelestialBodies, updateEnvironmentAnimation } from './three-js-files/environment.js';
import { setupNebulaSkills, updateSolarSystemsAnimation } from './three-js-files/solarSystems.js';
import { applyConfigToUI, setupCategoryChips, setupInteraction, updateHover, updateLabels } from './three-js-files/ui.js';

async function initApp(visitorName) {
  try {
    const configRes = await fetch('./config.json');
    appState.configData = await configRes.json();

    const skillsRes = await fetch('./skills.json');
    appState.skillsData = await skillsRes.json();

    applyConfigToUI(appState.configData);

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

    const categories = setupNebulaSkills();
    setupCategoryChips(categories);

    setupCelestialBodies();
    setupInteraction();

    animate();
  } catch (error) {
    console.error("Initialization error:", error);
    const nameEl = document.getElementById('dev-name');
    if (nameEl) nameEl.textContent = "Error Loading Portfolio";
  }
}

function setupScene() {
  const container = document.getElementById('canvas-container');

  appState.scene = new THREE.Scene();
  appState.scene.fog = new THREE.FogExp2(0x03030c, 0.003);

  appState.camera = new THREE.PerspectiveCamera(appState.baseFov, container.clientWidth / container.clientHeight, 0.1, 2000);
  appState.camera.position.set(0, 8, 28);

  appState.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
  appState.renderer.setSize(container.clientWidth, container.clientHeight);
  appState.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  appState.renderer.setClearColor(appState.scene.fog.color);
  container.appendChild(appState.renderer.domElement);

  appState.controls = new OrbitControls(appState.camera, appState.renderer.domElement);
  appState.controls.enableDamping = true;
  appState.controls.dampingFactor = 0.05;
  appState.controls.maxDistance = 60;
  appState.controls.minDistance = 6;
  appState.controls.enablePan = false;
  appState.controls.target.set(0, 0, 0);

  appState.scene.add(new THREE.AmbientLight(0xffffff, 0.2));

  const keyLight = new THREE.DirectionalLight(0xffffff, 1.5);
  keyLight.position.set(10, 20, 10);
  appState.scene.add(keyLight);

  const rimLight = new THREE.DirectionalLight(0x4488ff, 0.5);
  rimLight.position.set(-10, -5, -10);
  appState.scene.add(rimLight);

  const engineGlow = new THREE.PointLight(0xffaa44, 2.5, 20);
  engineGlow.position.set(0, -2.5, 0);
  appState.scene.add(engineGlow);

  window.addEventListener('resize', onWindowResize);
}

function onWindowResize() {
  const container = document.getElementById('canvas-container');
  appState.camera.aspect = container.clientWidth / container.clientHeight;
  appState.camera.updateProjectionMatrix();
  appState.renderer.setSize(container.clientWidth, container.clientHeight);
}

function updateCamera(mappedSpeed) {
  if (appState.camera) {
    const targetFov = appState.baseFov + (mappedSpeed / 20) * 12;
    if (Math.abs(appState.camera.fov - targetFov) > 0.05) {
      appState.camera.fov += (targetFov - appState.camera.fov) * 0.05;
      appState.camera.updateProjectionMatrix();
    }

    const desiredTarget = appState.rocketState !== 'idle' ? appState.cameraFollowTarget : new THREE.Vector3(0, 0, 0);
    const prevSmoothed = appState.smoothedTarget.clone();
    appState.smoothedTarget.lerp(desiredTarget, 0.05);
    
    const targetDelta = appState.smoothedTarget.clone().sub(prevSmoothed);
    appState.camera.position.add(targetDelta);
    
    if (appState.controls) {
      appState.controls.target.copy(appState.smoothedTarget);
    }

    if (appState.currentSpeed > 7) {
      const shake = (appState.currentSpeed - 7) * 0.0025;
      appState.camera.position.x += (Math.random() - 0.5) * shake;
      appState.camera.position.y += (Math.random() - 0.5) * shake;
    }
  }
}

function animate() {
  requestAnimationFrame(animate);

  const delta = appState.clock.getDelta();
  const elapsed = appState.clock.getElapsedTime();

  appState.controls.update();

  updateRocketAnimation(elapsed);

  const mappedSpeed = appState.currentSpeed * 0.7;
  updateCamera(mappedSpeed);
  updateEnvironmentAnimation(elapsed);
  updateSolarSystemsAnimation();

  updateHover();
  updateLabels(appState.renderer);

  appState.renderer.render(appState.scene, appState.camera);
}

window.onload = () => {
  startIntro((visitorName) => {
    initApp(visitorName);
  });
};
