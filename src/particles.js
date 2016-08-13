import { lerp } from './util.js';
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
  particles = particles.filter((particle) => {
    particle.life -= 0.01;
    if (particle.life < 0) {
      return false;
    }
    const { x, y, direction, color, life, shape, speed } = particle;

    particle.direction += (Math.random() - 0.5) * 0.5;

    particle.x += Math.cos(direction) * speed;
    particle.y += Math.sin(direction) * speed;

    particle.x = lerp(particle.x, canvas.width / 2, 0.01);
    particle.y = lerp(particle.y, canvas.height / 2, 0.01);
    const size = Math.pow(life, 2) * 30;
    ctx.fillStyle = color;
    if (shape) {
      ctx.beginPath();
      ctx.arc(x, y, size / 2,0,2*Math.PI);
      ctx.fill();
    } else {
      ctx.fillRect(x, y, size, size)
    }
    // ctx.fillRect(x, y, 40 * life, 40 * life);
    return true;
  });
};

tick();

export default (amount, x, y, color) => {
  if (!particles) {
    particles = [];
  }
  for (let i = 0; i < amount * 10; i++) {
    particles.push({
      x, y, color,
      shape: Math.random() > 0.5,
      direction: Math.random() * Math.PI * 2,
      life: Math.random() * amount,
      speed: 2 + Math.random() * 10,
    });
  }
};
