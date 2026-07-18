import { appState } from './state.js';
import { shiftUniverseOnEscape, showSkillDetails, updateSpeed } from './ui.js';

export function updateAutopilot(delta) {
  if (appState.autopilotState !== 'playing') {
    return;
  }

  // Get systems matching active filter category
  const visibleSystems = appState.solarSystems.filter(
    sys => appState.activeCategory === 'all' || sys.category === appState.activeCategory
  );

  if (visibleSystems.length === 0) {
    return;
  }

  // 1. If no solar system is currently selected, pick the next one
  if (!appState.selectedSystem) {
    if (appState.autopilotSystemIndex < 0 || appState.autopilotSystemIndex >= visibleSystems.length) {
      appState.autopilotSystemIndex = 0;
    }

    const targetSys = visibleSystems[appState.autopilotSystemIndex];
    if (targetSys) {
      appState.selectedSystem = targetSys;
      appState.rocketState = 'traveling';
      appState.rocketOrbitAngle = 0;

      // Stop scrolling speed inside solar system
      const slider = document.getElementById('speed-slider');
      if (slider) slider.value = 0;
      updateSpeed(0);

      // Reset selection state
      const detailsCard = document.getElementById('details-card');
      if (detailsCard) {
        detailsCard.classList.remove('visible');
        detailsCard.classList.add('hidden');
      }
      appState.selectedNode = null;
      appState.autopilotPlanetIndex = 0;
      appState.autopilotTimer = 0;

      // Show escape button
      const escapeBtn = document.getElementById('escape-system-btn');
      if (escapeBtn) escapeBtn.classList.remove('hidden');
    }
    return;
  }

  // 2. If the rocket is currently traveling to the system, wait for it to arrive
  if (appState.rocketState === 'traveling') {
    return;
  }

  // 3. Once orbiting the selected system, cycle through the planets
  if (appState.rocketState === 'orbiting') {
    const sys = appState.selectedSystem;
    const planets = sys.planetMeshes || [];

    if (planets.length === 0) {
      moveToNextSystem(visibleSystems);
      return;
    }

    // Safety bounds check
    if (appState.autopilotPlanetIndex < 0 || appState.autopilotPlanetIndex >= planets.length) {
      appState.autopilotPlanetIndex = 0;
    }

    const currentPlanet = planets[appState.autopilotPlanetIndex];

    // Select the planet and show details card if not selected
    if (appState.selectedNode !== currentPlanet) {
      appState.selectedNode = currentPlanet;
      showSkillDetails(currentPlanet.userData.skill);
      appState.autopilotTimer = 0;
    }

    // Accumulate time
    appState.autopilotTimer += delta;

    // After 3 seconds, select the next planet or transition to next system
    if (appState.autopilotTimer >= 3.0) {
      appState.autopilotTimer = 0;
      appState.autopilotPlanetIndex++;

      if (appState.autopilotPlanetIndex < planets.length) {
        const nextPlanet = planets[appState.autopilotPlanetIndex];
        appState.selectedNode = nextPlanet;
        showSkillDetails(nextPlanet.userData.skill);
      } else {
        moveToNextSystem(visibleSystems);
      }
    }
  }
}

function moveToNextSystem(visibleSystems) {
  // Escape current system
  shiftUniverseOnEscape();

  appState.selectedSystem = null;
  appState.selectedNode = null;
  appState.rocketState = 'returning';

  const detailsCard = document.getElementById('details-card');
  if (detailsCard) {
    detailsCard.classList.remove('visible');
    detailsCard.classList.add('hidden');
  }

  const escapeBtn = document.getElementById('escape-system-btn');
  if (escapeBtn) escapeBtn.classList.add('hidden');

  // Increment system index with wrap around
  if (visibleSystems.length > 0) {
    appState.autopilotSystemIndex = (appState.autopilotSystemIndex + 1) % visibleSystems.length;
  } else {
    appState.autopilotSystemIndex = 0;
  }

  appState.autopilotPlanetIndex = 0;
  appState.autopilotTimer = 0;
}
