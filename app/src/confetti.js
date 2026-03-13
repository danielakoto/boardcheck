// confetti.js — BoardCheck celebration burst

export const launchConfetti = (colors) => {
  const canvas = document.createElement('canvas');
  canvas.style.cssText = `
    position: fixed; top: 0; left: 0;
    width: 100%; height: 100%;
    pointer-events: none; z-index: 9999;
  `;
  document.body.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const COLORS = [colors.keyBg, colors.keyText, colors.keyShadow, colors.boarBg, colors.activeHighlight,colors.clickedKeyBg, colors.clickedKeyText];
  const SHAPES = ['rect', 'circle', 'ribbon'];
  const particles = [];

  // Two burst origins
  const origins = [
    { x: canvas.width * 0.3, y: canvas.height * 0.6 },
    { x: canvas.width * 0.7, y: canvas.height * 0.6 },
  ];

  for (let i = 0; i < 160; i++) {
    const origin = origins[i % 2];
    const angle = (Math.random() * Math.PI) - Math.PI; // full upward arc
    const speed = 8 + Math.random() * 14;

    particles.push({
      x: origin.x,
      y: origin.y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 6, // extra upward bias
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 12,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      shape: SHAPES[Math.floor(Math.random() * SHAPES.length)],
      width: 6 + Math.random() * 8,
      height: 10 + Math.random() * 6,
      opacity: 1,
      gravity: 0.35 + Math.random() * 0.2,
    });
  }

  let frame;
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let alive = false;
    for (const p of particles) {
      p.vy += p.gravity;
      p.x += p.vx;
      p.y += p.vy;
      p.rotation += p.rotationSpeed;
      p.vx *= 0.99; // air resistance
      if (p.y < canvas.height + 20) alive = true;

      // Fade out near bottom
      if (p.y > canvas.height * 0.75) {
        p.opacity = Math.max(0, 1 - (p.y - canvas.height * 0.75) / (canvas.height * 0.25));
      }

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);
      ctx.globalAlpha = p.opacity;
      ctx.fillStyle = p.color;

      if (p.shape === 'rect') {
        ctx.fillRect(-p.width / 2, -p.height / 2, p.width, p.height);
      } else if (p.shape === 'circle') {
        ctx.beginPath();
        ctx.arc(0, 0, p.width / 2, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.shape === 'ribbon') {
        // Thin elongated streamer
        ctx.fillRect(-p.width / 4, -p.height, p.width / 2, p.height * 1.8);
      }

      ctx.restore();
    }

    if (alive) {
      frame = requestAnimationFrame(animate);
    } else {
      canvas.remove();
    }
  }

  animate();
}