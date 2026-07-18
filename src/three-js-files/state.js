import * as THREE from 'three';

export const appState = {
  scene: null,
  camera: null,
  renderer: null,
  controls: null,
  configData: null,
  skillsData: null,

  rocketGroup: null,
  flameGroup: null,

  stars: null,
  starPositions: null,
  starSpeeds: null,
  starCount: 1200,
  starSizeMultiplier: 3,
  
  skillsNebulaGroup: null,
  solarSystems: [],
  cometParticles: [],
  beaconLight: null,
  celestialBodies: [],

  rocketState: 'idle',
  selectedSystem: null,
  rocketOrbitAngle: 0,
  cameraFollowTarget: new THREE.Vector3(0, 0, 0),
  autopilotState: 'inactive', // 'inactive', 'playing', 'paused'
  autopilotSystemIndex: 0,
  autopilotPlanetIndex: 0,
  autopilotTimer: 0,
  smoothedTarget: new THREE.Vector3(0, 0, 0),
  defaultCameraOffset: new THREE.Vector3(0, 8, 28),

  raycaster: new THREE.Raycaster(),
  mouse: new THREE.Vector2(),

  currentSpeed: 1,
  previousSpeed: 1,
  activeCategory: 'all',
  hoveredNode: null,
  selectedNode: null,
  baseFov: 60,
  clock: new THREE.Clock(),

  themeColors: {
    high: 0xff3b70,
    medium: 0x00ffd2,
    low: 0xbd00ff,
    accent: 0x00f0ff,
    starfield: 0xffffff,
    constellation: 0xffffff
  }
};
