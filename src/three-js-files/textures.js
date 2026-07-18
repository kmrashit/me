import * as THREE from 'three';

export function generateSunTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;

  const ctx = canvas.getContext('2d');

  const grad = ctx.createRadialGradient(256, 256, 0, 256, 256, 256);

  // Brighter core
  grad.addColorStop(0.00, '#ffffff');
  grad.addColorStop(0.08, '#ffffff');
  grad.addColorStop(0.22, '#fff9d8');
  grad.addColorStop(0.45, '#ffe066');
  grad.addColorStop(0.72, '#ff9900');
  grad.addColorStop(0.92, '#ff5500');
  grad.addColorStop(1.00, '#440000');

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 512);

  // More visible solar surface
  for (let i = 0; i < 350; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 512;
    const r = 3 + Math.random() * 16;

    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);

    ctx.fillStyle = `rgba(
      255,
      ${220 + Math.floor(Math.random() * 35)},
      ${20 + Math.floor(Math.random() * 40)},
      ${0.15 + Math.random() * 0.25}
    )`;

    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;

  return texture;
}

export function generateMoonTexture() {
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

export function generateGalaxyTexture() {
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

export function generateMeteoriteTexture() {
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

export function generateSunburstTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  const cx = 256;
  const cy = 256;

  // Clear background (transparent)
  ctx.clearRect(0, 0, 512, 512);

  // 1. Radial glow (smooth soft fallback background)
  const glowGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 180);
  glowGrad.addColorStop(0.0, 'rgba(255, 255, 255, 1.0)');
  glowGrad.addColorStop(0.1, 'rgba(255, 253, 245, 0.95)');
  glowGrad.addColorStop(0.2, 'rgba(255, 240, 220, 0.75)');
  glowGrad.addColorStop(0.4, 'rgba(255, 200, 150, 0.35)');
  glowGrad.addColorStop(0.7, 'rgba(255, 150, 80, 0.08)');
  glowGrad.addColorStop(1.0, 'rgba(255, 100, 50, 0.0)');
  ctx.fillStyle = glowGrad;
  ctx.beginPath();
  ctx.arc(cx, cy, 250, 0, Math.PI * 2);
  ctx.fill();

  // 2. Draw sharp spikes/rays (like a compass rose or lens flare starburst)
  const numRays = 48;
  for (let i = 0; i < numRays; i++) {
    const angle = (i / numRays) * Math.PI * 2;
    
    // Determine the ray length
    // Make cardinal directions (0, 90, 180, 270 deg) and diagonals (45, 135...) longer
    let maxLength = 80 + Math.random() * 60;
    const isCardinal = (i % (numRays / 4) === 0);
    const isDiagonal = (i % (numRays / 8) === 0 && !isCardinal);
    
    if (isCardinal) {
      maxLength = 180 + Math.random() * 50;
    } else if (isDiagonal) {
      maxLength = 130 + Math.random() * 40;
    } else {
      maxLength = 50 + Math.random() * 60;
    }

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle);

    // Draw a thin long triangle/needle
    const gradRay = ctx.createLinearGradient(0, 0, maxLength, 0);
    gradRay.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
    gradRay.addColorStop(0.15, 'rgba(255, 253, 245, 0.7)');
    gradRay.addColorStop(0.5, 'rgba(255, 220, 180, 0.3)');
    gradRay.addColorStop(1, 'rgba(255, 150, 80, 0)');

    ctx.fillStyle = gradRay;
    ctx.beginPath();
    ctx.moveTo(0, -3);   // start at center-left
    ctx.lineTo(maxLength, 0);  // tip of the needle
    ctx.lineTo(0, 3);    // start at center-right
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  // 3. Central white hot core
  const coreGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 40);
  coreGrad.addColorStop(0, 'rgba(255, 255, 255, 1.0)');
  coreGrad.addColorStop(0.7, 'rgba(255, 255, 255, 1.0)');
  coreGrad.addColorStop(1, 'rgba(255, 255, 255, 0.0)');
  ctx.fillStyle = coreGrad;
  ctx.beginPath();
  ctx.arc(cx, cy, 40, 0, Math.PI * 2);
  ctx.fill();

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}
