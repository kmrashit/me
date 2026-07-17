/**
 * intro.js
 * Handles the Phase 2 onboarding loading sequence, visitor name entry,
 * boarding animation, and transition to the main ThreeJS scene.
 */

export function startIntro(onComplete) {
  // Create warp flash overlay if it doesn't exist
  let flash = document.getElementById('warp-flash');
  if (!flash) {
    flash = document.createElement('div');
    flash.setAttribute('id', 'warp-flash');
    document.body.appendChild(flash);
  }

  // Create intro screen container
  const introScreen = document.createElement('div');
  introScreen.setAttribute('id', 'intro-screen');
  document.body.appendChild(introScreen);

  // 1. Create Glassmorphic Card
  const card = document.createElement('div');
  card.className = 'intro-card';

  const h1 = document.createElement('h1');
  h1.textContent = 'Nebula Voyager';
  card.appendChild(h1);

  const p = document.createElement('p');
  p.textContent = 'Prepare for departure. Enter your explorer name to generate your boarding pass and join Ashit on the rocket ship.';
  card.appendChild(p);

  const inputContainer = document.createElement('div');
  inputContainer.className = 'input-container';

  const input = document.createElement('input');
  input.type = 'text';
  input.id = 'visitor-input';
  input.placeholder = 'Your Name...';
  input.maxLength = 20;
  input.required = true;
  inputContainer.appendChild(input);
  card.appendChild(inputContainer);

  const button = document.createElement('button');
  button.id = 'board-btn';
  button.textContent = 'Initiate Boarding Sequence';
  card.appendChild(button);

  introScreen.appendChild(card);

  // 2. Create Boarding Stage Container (Initially invisible)
  const stage = document.createElement('div');
  stage.className = 'stage-container';
  introScreen.appendChild(stage);

  // Handle board button click
  button.addEventListener('click', () => {
    const rawName = input.value.trim();
    if (!rawName) {
      input.focus();
      return;
    }

    // Sanitize visitor name to prevent any layout breakage (simple alphanumeric + spaces/dashes)
    const visitorName = rawName.replace(/[^a-zA-Z0-9\s-_]/g, '').substring(0, 20) || 'Explorer';

    // Hide input card
    card.classList.add('hidden');
    setTimeout(() => {
      card.remove();
      // Start boarding animation with sanitized name
      runBoardingAnimation(stage, visitorName, onComplete, introScreen, flash);
    }, 500);
  });
}

function runBoardingAnimation(stage, visitorName, onComplete, introScreen, flash) {
  stage.classList.add('active');

  // Build the lunar surface SVG scene
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('class', 'launch-pad-svg');
  svg.setAttribute('viewBox', '0 0 600 450');
  svg.setAttribute('preserveAspectRatio', 'xMidYMid slice');

  // SVG Definitions for Gradients/Filters
  const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');

  // Space sky gradient
  const skyGrad = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
  skyGrad.setAttribute('id', 'sky-grad');
  skyGrad.setAttribute('x1', '0%');
  skyGrad.setAttribute('y1', '0%');
  skyGrad.setAttribute('x2', '0%');
  skyGrad.setAttribute('y2', '100%');
  const skyStop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
  skyStop1.setAttribute('offset', '0%');
  skyStop1.setAttribute('stop-color', '#000010');
  const skyStop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
  skyStop2.setAttribute('offset', '100%');
  skyStop2.setAttribute('stop-color', '#0a0a20');
  skyGrad.appendChild(skyStop1);
  skyGrad.appendChild(skyStop2);
  defs.appendChild(skyGrad);

  // Moon surface gradient
  const moonGrad = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
  moonGrad.setAttribute('id', 'moon-surface');
  moonGrad.setAttribute('x1', '0%');
  moonGrad.setAttribute('y1', '0%');
  moonGrad.setAttribute('x2', '0%');
  moonGrad.setAttribute('y2', '100%');
  const moonStop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
  moonStop1.setAttribute('offset', '0%');
  moonStop1.setAttribute('stop-color', '#3a3a4a');
  const moonStop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
  moonStop2.setAttribute('offset', '100%');
  moonStop2.setAttribute('stop-color', '#1a1a2a');
  moonGrad.appendChild(moonStop1);
  moonGrad.appendChild(moonStop2);
  defs.appendChild(moonGrad);

  // Rocket body gradient
  const rocketBodyGrad = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
  rocketBodyGrad.setAttribute('id', 'rocket-body');
  rocketBodyGrad.setAttribute('x1', '0%');
  rocketBodyGrad.setAttribute('y1', '0%');
  rocketBodyGrad.setAttribute('x2', '100%');
  rocketBodyGrad.setAttribute('y2', '0%');
  const rbStop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
  rbStop1.setAttribute('offset', '0%');
  rbStop1.setAttribute('stop-color', '#e0e0e8');
  const rbStop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
  rbStop2.setAttribute('offset', '50%');
  rbStop2.setAttribute('stop-color', '#ffffff');
  const rbStop3 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
  rbStop3.setAttribute('offset', '100%');
  rbStop3.setAttribute('stop-color', '#b8b8c4');
  rocketBodyGrad.appendChild(rbStop1);
  rocketBodyGrad.appendChild(rbStop2);
  rocketBodyGrad.appendChild(rbStop3);
  defs.appendChild(rocketBodyGrad);

  // Rocket nose gradient
  const rocketNoseGrad = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
  rocketNoseGrad.setAttribute('id', 'rocket-nose');
  rocketNoseGrad.setAttribute('x1', '0%');
  rocketNoseGrad.setAttribute('y1', '0%');
  rocketNoseGrad.setAttribute('x2', '100%');
  rocketNoseGrad.setAttribute('y2', '0%');
  const rnStop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
  rnStop1.setAttribute('offset', '0%');
  rnStop1.setAttribute('stop-color', '#ff3b70');
  const rnStop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
  rnStop2.setAttribute('offset', '100%');
  rnStop2.setAttribute('stop-color', '#b30047');
  rocketNoseGrad.appendChild(rnStop1);
  rocketNoseGrad.appendChild(rnStop2);
  defs.appendChild(rocketNoseGrad);

  // Earth gradient
  const earthGrad = document.createElementNS('http://www.w3.org/2000/svg', 'radialGradient');
  earthGrad.setAttribute('id', 'earth-grad');
  earthGrad.setAttribute('cx', '40%');
  earthGrad.setAttribute('cy', '40%');
  const eStop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
  eStop1.setAttribute('offset', '0%');
  eStop1.setAttribute('stop-color', '#4db8ff');
  const eStop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
  eStop2.setAttribute('offset', '50%');
  eStop2.setAttribute('stop-color', '#1a6ec4');
  const eStop3 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
  eStop3.setAttribute('offset', '100%');
  eStop3.setAttribute('stop-color', '#0d3a6e');
  earthGrad.appendChild(eStop1);
  earthGrad.appendChild(eStop2);
  earthGrad.appendChild(eStop3);
  defs.appendChild(earthGrad);

  // Neon glow filter
  const neonFilter = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
  neonFilter.setAttribute('id', 'neon-glow');
  neonFilter.setAttribute('x', '-20%');
  neonFilter.setAttribute('y', '-20%');
  neonFilter.setAttribute('width', '140%');
  neonFilter.setAttribute('height', '140%');
  const feBlur = document.createElementNS('http://www.w3.org/2000/svg', 'feGaussianBlur');
  feBlur.setAttribute('stdDeviation', '6');
  feBlur.setAttribute('result', 'blur');
  neonFilter.appendChild(feBlur);
  const feMerge = document.createElementNS('http://www.w3.org/2000/svg', 'feMerge');
  const feMergeNode1 = document.createElementNS('http://www.w3.org/2000/svg', 'feMergeNode');
  feMergeNode1.setAttribute('in', 'blur');
  const feMergeNode2 = document.createElementNS('http://www.w3.org/2000/svg', 'feMergeNode');
  feMergeNode2.setAttribute('in', 'SourceGraphic');
  feMerge.appendChild(feMergeNode1);
  feMerge.appendChild(feMergeNode2);
  neonFilter.appendChild(feMerge);
  defs.appendChild(neonFilter);

  // Soft glow filter (for Earth and stars)
  const softGlow = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
  softGlow.setAttribute('id', 'soft-glow');
  softGlow.setAttribute('x', '-30%');
  softGlow.setAttribute('y', '-30%');
  softGlow.setAttribute('width', '160%');
  softGlow.setAttribute('height', '160%');
  const sgBlur = document.createElementNS('http://www.w3.org/2000/svg', 'feGaussianBlur');
  sgBlur.setAttribute('stdDeviation', '3');
  sgBlur.setAttribute('result', 'blur');
  softGlow.appendChild(sgBlur);
  const sgMerge = document.createElementNS('http://www.w3.org/2000/svg', 'feMerge');
  const sgMergeNode1 = document.createElementNS('http://www.w3.org/2000/svg', 'feMergeNode');
  sgMergeNode1.setAttribute('in', 'blur');
  const sgMergeNode2 = document.createElementNS('http://www.w3.org/2000/svg', 'feMergeNode');
  sgMergeNode2.setAttribute('in', 'SourceGraphic');
  sgMerge.appendChild(sgMergeNode1);
  sgMerge.appendChild(sgMergeNode2);
  softGlow.appendChild(sgMerge);
  defs.appendChild(softGlow);

  svg.appendChild(defs);

  // ── Sky Background ──
  const sky = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  sky.setAttribute('x', '0');
  sky.setAttribute('y', '0');
  sky.setAttribute('width', '600');
  sky.setAttribute('height', '450');
  sky.setAttribute('fill', 'url(#sky-grad)');
  svg.appendChild(sky);

  // ── Stars ──
  const starPositions = [
    [45, 30], [120, 55], [200, 20], [280, 45], [350, 15], [430, 60],
    [500, 25], [550, 50], [80, 90], [160, 110], [240, 80], [320, 100],
    [400, 35], [470, 85], [530, 110], [60, 140], [180, 150], [370, 130],
    [500, 140], [140, 170], [420, 160], [260, 165], [35, 200], [560, 180],
    [90, 220], [310, 195], [450, 210], [190, 210], [540, 230], [70, 250],
  ];
  starPositions.forEach(([sx, sy]) => {
    const star = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    star.setAttribute('cx', String(sx));
    star.setAttribute('cy', String(sy));
    star.setAttribute('r', String(0.6 + Math.random() * 1.4));
    star.setAttribute('fill', '#ffffff');
    star.setAttribute('opacity', String(0.3 + Math.random() * 0.7));
    star.setAttribute('class', 'twinkle-star');
    svg.appendChild(star);
  });

  // ── Earth (in the sky) ──
  const earthG = document.createElementNS('http://www.w3.org/2000/svg', 'g');

  // Earth glow aura
  const earthAura = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  earthAura.setAttribute('cx', '120');
  earthAura.setAttribute('cy', '100');
  earthAura.setAttribute('r', '48');
  earthAura.setAttribute('fill', 'none');
  earthAura.setAttribute('stroke', '#4db8ff');
  earthAura.setAttribute('stroke-width', '3');
  earthAura.setAttribute('opacity', '0.15');
  earthAura.setAttribute('filter', 'url(#soft-glow)');
  earthG.appendChild(earthAura);

  // Earth sphere
  const earth = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  earth.setAttribute('cx', '120');
  earth.setAttribute('cy', '100');
  earth.setAttribute('r', '36');
  earth.setAttribute('fill', 'url(#earth-grad)');
  earthG.appendChild(earth);

  // Continent hints (subtle shapes)
  const continents = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  continents.setAttribute('d', 'M 108 85 Q 115 80 122 83 Q 128 78 134 84 Q 130 90 125 88 Q 118 92 110 88 Z M 115 100 Q 122 97 130 102 Q 128 108 120 110 Q 114 106 115 100 Z M 130 112 Q 136 108 140 112 Q 138 118 132 116 Z');
  continents.setAttribute('fill', '#2d8c44');
  continents.setAttribute('opacity', '0.5');
  earthG.appendChild(continents);

  // Cloud wisps on Earth
  const clouds = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  clouds.setAttribute('d', 'M 100 92 Q 110 88 120 92 Q 115 96 105 94 Z M 125 102 Q 135 98 145 103 Q 138 106 128 104 Z');
  clouds.setAttribute('fill', '#ffffff');
  clouds.setAttribute('opacity', '0.25');
  earthG.appendChild(clouds);

  svg.appendChild(earthG);

  // ── Lunar Surface (curved horizon) ──
  const surface = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  surface.setAttribute('d', 'M -20 340 Q 100 310 300 320 Q 500 330 620 340 L 620 460 L -20 460 Z');
  surface.setAttribute('fill', 'url(#moon-surface)');
  svg.appendChild(surface);

  // Surface highlight edge (horizon line glow)
  const horizonLine = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  horizonLine.setAttribute('d', 'M -20 340 Q 100 310 300 320 Q 500 330 620 340');
  horizonLine.setAttribute('fill', 'none');
  horizonLine.setAttribute('stroke', '#5a5a6e');
  horizonLine.setAttribute('stroke-width', '1.5');
  horizonLine.setAttribute('opacity', '0.5');
  svg.appendChild(horizonLine);

  // ── Craters ──
  const craters = [
    { cx: 80, cy: 370, rx: 35, ry: 10 },
    { cx: 200, cy: 385, rx: 22, ry: 7 },
    { cx: 340, cy: 400, rx: 18, ry: 5 },
    { cx: 500, cy: 375, rx: 30, ry: 9 },
    { cx: 150, cy: 410, rx: 15, ry: 4 },
    { cx: 550, cy: 410, rx: 20, ry: 6 },
  ];
  craters.forEach(c => {
    const crater = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
    crater.setAttribute('cx', String(c.cx));
    crater.setAttribute('cy', String(c.cy));
    crater.setAttribute('rx', String(c.rx));
    crater.setAttribute('ry', String(c.ry));
    crater.setAttribute('fill', 'none');
    crater.setAttribute('stroke', '#2a2a3e');
    crater.setAttribute('stroke-width', '1.5');
    crater.setAttribute('opacity', '0.6');
    svg.appendChild(crater);

    // Inner shadow of crater
    const shadow = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
    shadow.setAttribute('cx', String(c.cx + 2));
    shadow.setAttribute('cy', String(c.cy + 1));
    shadow.setAttribute('rx', String(c.rx * 0.7));
    shadow.setAttribute('ry', String(c.ry * 0.6));
    shadow.setAttribute('fill', '#15152a');
    shadow.setAttribute('opacity', '0.3');
    svg.appendChild(shadow);
  });

  // ── Moon Rocks (small details) ──
  const rocks = [
    { x: 45, y: 355, w: 8, h: 5 },
    { x: 260, y: 365, w: 6, h: 4 },
    { x: 400, y: 350, w: 10, h: 6 },
    { x: 520, y: 365, w: 7, h: 4 },
    { x: 160, y: 375, w: 5, h: 3 },
  ];
  rocks.forEach(r => {
    const rock = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
    rock.setAttribute('cx', String(r.x));
    rock.setAttribute('cy', String(r.y));
    rock.setAttribute('rx', String(r.w / 2));
    rock.setAttribute('ry', String(r.h / 2));
    rock.setAttribute('fill', '#4a4a5e');
    rock.setAttribute('opacity', '0.5');
    svg.appendChild(rock);
  });

  // ── Rocket Group (matching 3D scene rocket - sitting on lunar surface) ──
  const rocketGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  rocketGroup.setAttribute('class', 'rocket-vessel');
  // Center X = 450, base Y = 360

  // Landing legs (4 legs, showing 2 front-facing)
  const legPositions = [
    { x1: 435, y1: 345, x2: 415, y2: 365 },
    { x1: 465, y1: 345, x2: 485, y2: 365 },
    { x1: 440, y1: 345, x2: 425, y2: 362 },
    { x1: 460, y1: 345, x2: 475, y2: 362 },
  ];
  legPositions.forEach(lp => {
    const leg = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    leg.setAttribute('x1', String(lp.x1));
    leg.setAttribute('y1', String(lp.y1));
    leg.setAttribute('x2', String(lp.x2));
    leg.setAttribute('y2', String(lp.y2));
    leg.setAttribute('stroke', '#8888aa');
    leg.setAttribute('stroke-width', '2.5');
    rocketGroup.appendChild(leg);
  });

  // Landing pads
  [[412, 367], [488, 367], [422, 364], [478, 364]].forEach(([px, py]) => {
    const pad = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
    pad.setAttribute('cx', String(px));
    pad.setAttribute('cy', String(py));
    pad.setAttribute('rx', '7');
    pad.setAttribute('ry', '2.5');
    pad.setAttribute('fill', '#6e6e88');
    rocketGroup.appendChild(pad);
  });

  // ── Side Boosters (left and right) ──
  [-1, 1].forEach(side => {
    const bx = 450 + side * 28; // booster center X

    // Booster body (cylinder)
    const boosterBody = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    boosterBody.setAttribute('x', String(bx - 7));
    boosterBody.setAttribute('y', '220');
    boosterBody.setAttribute('width', '14');
    boosterBody.setAttribute('height', '120');
    boosterBody.setAttribute('rx', '7');
    boosterBody.setAttribute('fill', 'url(#rocket-body)');
    rocketGroup.appendChild(boosterBody);

    // Booster nose cone
    const boosterNose = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    boosterNose.setAttribute('d', `M ${bx - 7} 220 Q ${bx} 195 ${bx + 7} 220 Z`);
    boosterNose.setAttribute('fill', 'url(#rocket-nose)');
    rocketGroup.appendChild(boosterNose);

    // Booster nozzle
    const bNozzle = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    bNozzle.setAttribute('d', `M ${bx - 6} 340 L ${bx - 4} 350 L ${bx + 4} 350 L ${bx + 6} 340 Z`);
    bNozzle.setAttribute('fill', '#1a1a2e');
    rocketGroup.appendChild(bNozzle);

    // Booster exhaust ring
    const bRing = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
    bRing.setAttribute('cx', String(bx));
    bRing.setAttribute('cy', '351');
    bRing.setAttribute('rx', '5');
    bRing.setAttribute('ry', '2');
    bRing.setAttribute('fill', 'none');
    bRing.setAttribute('stroke', '#ff6a00');
    bRing.setAttribute('stroke-width', '1.5');
    bRing.setAttribute('opacity', '0.7');
    rocketGroup.appendChild(bRing);

    // Booster fins (2 per booster)
    const bFinL = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    bFinL.setAttribute('d', `M ${bx - 7} 340 L ${bx - 14} 348 L ${bx - 7} 315 Z`);
    bFinL.setAttribute('fill', '#ff3b70');
    rocketGroup.appendChild(bFinL);

    const bFinR = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    bFinR.setAttribute('d', `M ${bx + 7} 340 L ${bx + 14} 348 L ${bx + 7} 315 Z`);
    bFinR.setAttribute('fill', '#ff3b70');
    rocketGroup.appendChild(bFinR);

    // Booster flames (hidden, shown on ignition)
    const bFlameOuter = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    bFlameOuter.setAttribute('class', 'engine-flame');
    bFlameOuter.setAttribute('d', `M ${bx - 5} 351 Q ${bx} 395 ${bx + 5} 351 Z`);
    bFlameOuter.setAttribute('fill', '#ff6600');
    bFlameOuter.setAttribute('opacity', '0.4');
    bFlameOuter.setAttribute('filter', 'url(#neon-glow)');
    rocketGroup.appendChild(bFlameOuter);

    const bFlameInner = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    bFlameInner.setAttribute('class', 'engine-flame');
    bFlameInner.setAttribute('d', `M ${bx - 3} 351 Q ${bx} 380 ${bx + 3} 351 Z`);
    bFlameInner.setAttribute('fill', '#ffffcc');
    bFlameInner.setAttribute('opacity', '0.75');
    rocketGroup.appendChild(bFlameInner);
  });

  // ── Main Engine Flames (hidden initially, shown on ignition) ──
  // Outer flame (red, wide)
  const flameOuter = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  flameOuter.setAttribute('class', 'engine-flame');
  flameOuter.setAttribute('d', 'M 436 352 Q 450 430 464 352 Z');
  flameOuter.setAttribute('fill', '#ff3300');
  flameOuter.setAttribute('opacity', '0.3');
  flameOuter.setAttribute('filter', 'url(#neon-glow)');
  rocketGroup.appendChild(flameOuter);

  // Mid flame (orange)
  const flameMid = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  flameMid.setAttribute('class', 'engine-flame');
  flameMid.setAttribute('d', 'M 439 352 Q 450 415 461 352 Z');
  flameMid.setAttribute('fill', '#ff8800');
  flameMid.setAttribute('opacity', '0.55');
  flameMid.setAttribute('filter', 'url(#neon-glow)');
  rocketGroup.appendChild(flameMid);

  // Inner flame (white-hot core)
  const flameInner = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  flameInner.setAttribute('class', 'engine-flame');
  flameInner.setAttribute('d', 'M 443 352 Q 450 400 457 352 Z');
  flameInner.setAttribute('fill', '#ffffcc');
  flameInner.setAttribute('opacity', '0.85');
  rocketGroup.appendChild(flameInner);

  // ── 4 Main Fins (showing 2 front-facing) ──
  const mainFinL = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  mainFinL.setAttribute('d', 'M 432 345 L 418 355 L 432 280 Z');
  mainFinL.setAttribute('fill', '#ff3b70');
  rocketGroup.appendChild(mainFinL);

  const mainFinR = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  mainFinR.setAttribute('d', 'M 468 345 L 482 355 L 468 280 Z');
  mainFinR.setAttribute('fill', '#ff3b70');
  rocketGroup.appendChild(mainFinR);

  // ── Main Nozzle ──
  const nozzle = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  nozzle.setAttribute('d', 'M 437 340 L 434 352 L 466 352 L 463 340 Z');
  nozzle.setAttribute('fill', '#1a1a2e');
  rocketGroup.appendChild(nozzle);

  // Exhaust ring (glowing torus at nozzle mouth)
  const exhaustRing = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
  exhaustRing.setAttribute('cx', '450');
  exhaustRing.setAttribute('cy', '353');
  exhaustRing.setAttribute('rx', '14');
  exhaustRing.setAttribute('ry', '4');
  exhaustRing.setAttribute('fill', 'none');
  exhaustRing.setAttribute('stroke', '#ff6a00');
  exhaustRing.setAttribute('stroke-width', '2');
  exhaustRing.setAttribute('opacity', '0.85');
  rocketGroup.appendChild(exhaustRing);

  // ── Main Fuselage (tapered cylinder — wider at bottom, narrower at top) ──
  const fuselage = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  fuselage.setAttribute('d', 'M 432 340 L 432 180 Q 432 170 438 170 L 462 170 Q 468 170 468 180 L 468 340 Z');
  fuselage.setAttribute('fill', 'url(#rocket-body)');
  rocketGroup.appendChild(fuselage);

  // ── Decorative Body Ring (cyan/green glow ring around body) ──
  const bodyRing = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
  bodyRing.setAttribute('cx', '450');
  bodyRing.setAttribute('cy', '260');
  bodyRing.setAttribute('rx', '19');
  bodyRing.setAttribute('ry', '4');
  bodyRing.setAttribute('fill', 'none');
  bodyRing.setAttribute('stroke', '#00ffd2');
  bodyRing.setAttribute('stroke-width', '2');
  bodyRing.setAttribute('opacity', '0.6');
  bodyRing.setAttribute('filter', 'url(#soft-glow)');
  rocketGroup.appendChild(bodyRing);

  // ── Nose Cone ──
  const nose = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  nose.setAttribute('d', 'M 432 170 Q 450 100 468 170 Z');
  nose.setAttribute('fill', 'url(#rocket-nose)');
  rocketGroup.appendChild(nose);

  // ── Antenna ──
  const antenna = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  antenna.setAttribute('x1', '450');
  antenna.setAttribute('y1', '100');
  antenna.setAttribute('x2', '450');
  antenna.setAttribute('y2', '72');
  antenna.setAttribute('stroke', '#cccccc');
  antenna.setAttribute('stroke-width', '1.5');
  rocketGroup.appendChild(antenna);

  // ── Beacon (blinking red) ──
  const beacon = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  beacon.setAttribute('cx', '450');
  beacon.setAttribute('cy', '70');
  beacon.setAttribute('r', '3');
  beacon.setAttribute('fill', '#ff0000');
  beacon.setAttribute('class', 'beacon-blink');
  beacon.setAttribute('filter', 'url(#soft-glow)');
  rocketGroup.appendChild(beacon);

  // ── Cabin Window (main, front-facing, #00ffd2 glow) ──
  const cabinWindow = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  cabinWindow.setAttribute('cx', '450');
  cabinWindow.setAttribute('cy', '210');
  cabinWindow.setAttribute('r', '9');
  cabinWindow.setAttribute('fill', '#0c0c24');
  cabinWindow.setAttribute('stroke', '#00ffd2');
  cabinWindow.setAttribute('stroke-width', '2');
  rocketGroup.appendChild(cabinWindow);

  // Cabin window inner glow
  const cabinGlow = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  cabinGlow.setAttribute('cx', '450');
  cabinGlow.setAttribute('cy', '210');
  cabinGlow.setAttribute('r', '9');
  cabinGlow.setAttribute('fill', '#00ffd2');
  cabinGlow.setAttribute('opacity', '0.2');
  cabinGlow.setAttribute('filter', 'url(#soft-glow)');
  rocketGroup.appendChild(cabinGlow);

  // Side windows (2 smaller, flanking the main window)
  [-1, 1].forEach(side => {
    const sw = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    sw.setAttribute('cx', String(450 + side * 12));
    sw.setAttribute('cy', '210');
    sw.setAttribute('r', '5');
    sw.setAttribute('fill', '#0c0c24');
    sw.setAttribute('stroke', '#00ffd2');
    sw.setAttribute('stroke-width', '1.5');
    rocketGroup.appendChild(sw);

    const swGlow = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    swGlow.setAttribute('cx', String(450 + side * 12));
    swGlow.setAttribute('cy', '210');
    swGlow.setAttribute('r', '5');
    swGlow.setAttribute('fill', '#00ffd2');
    swGlow.setAttribute('opacity', '0.15');
    rocketGroup.appendChild(swGlow);
  });

  // ── Hatch / Door (on the side, near base for boarding) ──
  const hatch = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  hatch.setAttribute('x', '426');
  hatch.setAttribute('y', '300');
  hatch.setAttribute('width', '14');
  hatch.setAttribute('height', '30');
  hatch.setAttribute('rx', '4');
  hatch.setAttribute('fill', '#0c0c24');
  hatch.setAttribute('stroke', '#00f0ff');
  hatch.setAttribute('stroke-width', '1.5');
  rocketGroup.appendChild(hatch);

  svg.appendChild(rocketGroup);

  // ── Footprint trail (appears as characters walk) ──
  const footprintsG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  footprintsG.setAttribute('class', 'footprints');
  footprintsG.setAttribute('opacity', '0');
  const fpPositions = [
    [140, 350], [170, 348], [200, 350], [230, 347], [260, 350],
    [290, 348], [320, 350], [350, 347], [380, 350], [400, 348],
  ];
  fpPositions.forEach(([fx, fy]) => {
    const fp = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
    fp.setAttribute('cx', String(fx));
    fp.setAttribute('cy', String(fy));
    fp.setAttribute('rx', '4');
    fp.setAttribute('ry', '2');
    fp.setAttribute('fill', '#2a2a3e');
    fp.setAttribute('opacity', '0.4');
    footprintsG.appendChild(fp);
  });
  svg.appendChild(footprintsG);

  // ── Character Avatars ──

  // Ashit Avatar (starts on left side of moon surface)
  const ashitG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  ashitG.setAttribute('class', 'avatar');
  ashitG.style.transform = 'translate(100px, 320px)';

  const ashitCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  ashitCircle.setAttribute('cx', '0');
  ashitCircle.setAttribute('cy', '0');
  ashitCircle.setAttribute('r', '16');
  ashitCircle.setAttribute('fill', '#05051a');
  ashitCircle.setAttribute('stroke', '#ff3b70');
  ashitCircle.setAttribute('stroke-width', '2');
  ashitG.appendChild(ashitCircle);

  const ashitText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  ashitText.setAttribute('x', '0');
  ashitText.setAttribute('y', '5');
  ashitText.setAttribute('text-anchor', 'middle');
  ashitText.setAttribute('font-size', '14');
  ashitText.textContent = '👨‍🚀';
  ashitG.appendChild(ashitText);

  const ashitLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  ashitLabel.setAttribute('x', '0');
  ashitLabel.setAttribute('y', '28');
  ashitLabel.setAttribute('text-anchor', 'middle');
  ashitLabel.setAttribute('fill', '#ffffff');
  ashitLabel.setAttribute('font-family', 'sans-serif');
  ashitLabel.setAttribute('font-size', '10');
  ashitLabel.setAttribute('font-weight', 'bold');
  ashitLabel.textContent = 'Ashit';
  ashitG.appendChild(ashitLabel);

  svg.appendChild(ashitG);

  // Visitor Avatar (starts further left on the surface)
  const visitorG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  visitorG.setAttribute('class', 'avatar');
  visitorG.style.transform = 'translate(50px, 320px)';

  const visitorCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  visitorCircle.setAttribute('cx', '0');
  visitorCircle.setAttribute('cy', '0');
  visitorCircle.setAttribute('r', '16');
  visitorCircle.setAttribute('fill', '#05051a');
  visitorCircle.setAttribute('stroke', '#00ffd2');
  visitorCircle.setAttribute('stroke-width', '2');
  visitorG.appendChild(visitorCircle);

  const visitorText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  visitorText.setAttribute('x', '0');
  visitorText.setAttribute('y', '5');
  visitorText.setAttribute('text-anchor', 'middle');
  visitorText.setAttribute('font-size', '14');
  visitorText.textContent = '👩‍🚀';
  visitorG.appendChild(visitorText);

  const visitorLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  visitorLabel.setAttribute('x', '0');
  visitorLabel.setAttribute('y', '28');
  visitorLabel.setAttribute('text-anchor', 'middle');
  visitorLabel.setAttribute('fill', '#ffffff');
  visitorLabel.setAttribute('font-family', 'sans-serif');
  visitorLabel.setAttribute('font-size', '10');
  visitorLabel.setAttribute('font-weight', 'bold');
  visitorLabel.textContent = visitorName;
  visitorG.appendChild(visitorLabel);

  svg.appendChild(visitorG);

  // ── Speech Bubble ──
  const bubbleG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  bubbleG.setAttribute('class', 'speech-bubble');
  bubbleG.style.transform = 'translate(100px, 280px)';

  const bubbleBg = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  bubbleBg.setAttribute('d', 'M -80 -40 H 80 V 0 H 10 L 0 10 L -10 0 H -80 Z');
  bubbleBg.setAttribute('fill', 'rgba(10, 10, 30, 0.9)');
  bubbleBg.setAttribute('stroke', '#ff3b70');
  bubbleBg.setAttribute('stroke-width', '1');
  bubbleBg.setAttribute('rx', '4');
  bubbleG.appendChild(bubbleBg);

  const bubbleText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  bubbleText.setAttribute('x', '0');
  bubbleText.setAttribute('y', '-16');
  bubbleText.setAttribute('text-anchor', 'middle');
  bubbleText.setAttribute('fill', '#ffffff');
  bubbleText.setAttribute('font-family', 'sans-serif');
  bubbleText.setAttribute('font-size', '9');
  bubbleText.setAttribute('font-weight', '500');
  bubbleText.textContent = `Hey ${visitorName}! Let's board!`;
  bubbleG.appendChild(bubbleText);

  svg.appendChild(bubbleG);

  // ── Dust clouds (appear on ignition) ──
  const dustG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  for (let i = 0; i < 6; i++) {
    const dust = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
    dust.setAttribute('cx', String(430 + Math.random() * 40));
    dust.setAttribute('cy', String(355 + Math.random() * 15));
    dust.setAttribute('rx', String(8 + Math.random() * 12));
    dust.setAttribute('ry', String(4 + Math.random() * 6));
    dust.setAttribute('fill', '#5a5a6e');
    dust.setAttribute('class', 'smoke-cloud');
    dustG.appendChild(dust);
  }
  svg.appendChild(dustG);

  stage.appendChild(svg);

  // ── TIMELINE SEQUENCE ──

  // Step 1: Ashit waves (speech bubble appears)
  setTimeout(() => {
    bubbleG.style.transform = 'translate(100px, 280px)';
    bubbleG.classList.add('visible');
  }, 800);

  // Step 2: Speech bubble fades out
  setTimeout(() => {
    bubbleG.classList.remove('visible');
  }, 3500);

  // Step 3: Both characters walk across the moon surface toward the rocket
  // Footprints appear
  setTimeout(() => {
    footprintsG.setAttribute('opacity', '1');
    footprintsG.style.transition = 'opacity 0.8s ease';
    ashitG.style.transform = 'translate(420px, 310px)';
  }, 4000);

  setTimeout(() => {
    visitorG.style.transform = 'translate(420px, 310px)';
  }, 4600);

  // Step 4: Ashit enters the rocket (fades at hatch)
  setTimeout(() => {
    ashitG.style.opacity = '0';
  }, 5600);

  // Step 5: Visitor enters the rocket
  setTimeout(() => {
    visitorG.style.opacity = '0';
  }, 6400);

  // Step 6: Engines ignite, lunar dust kicks up, screen shakes
  setTimeout(() => {
    stage.classList.add('igniting');
    document.body.classList.add('shaking');
  }, 7400);

  // Step 7: Rocket lifts off the moon
  setTimeout(() => {
    stage.classList.add('liftoff');
  }, 9000);

  // Step 8: Warp flash
  setTimeout(() => {
    flash.classList.add('active');
  }, 10000);

  setTimeout(() => {
    introScreen.style.opacity = '0';
    document.body.classList.remove('shaking');
    onComplete(visitorName);
  }, 10600);

  setTimeout(() => {
    introScreen.remove();
    flash.classList.remove('active');
    setTimeout(() => flash.remove(), 1000);
  }, 11700);
}
