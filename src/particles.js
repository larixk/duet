import autoscale from 'canvas-autoscale';

const canvas = document.createElement('canvas');
canvas.style.zIndex = 100;
const ctx = canvas.getContext('2d');

let particles = [];

document.body.appendChild(canvas);
autoscale(canvas, {
  target: [0, 0],
});

const tick = () => {
  requestAnimationFrame(tick);
  canvas.width = canvas.width;
  particles = particles.forEach((particle) => {
    particle.x += Math.random() - 0.5;
    particle.y += Math.random() - 0.5;
    particle.life -= 0.1;
    const { x, y } = particle;
    ctx.fillRect(x, y, 20 * life, 20 * life);
  });
};

tick();

export default (x, y, color) => {
  particles.push({
    x, y, color,
    life: 1,
  });
};
