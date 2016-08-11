import autoscale from 'canvas-autoscale';
import webAudioAnalyser from 'web-audio-analyser';
import { max, sum, lerp, twice } from './util.js';

let walkers;
let analyser;
let ctx;
let canvas;

const drawLine = (color, alpha, thickness, fromX, fromY, toX, toY) => {
  if (fromX === toX && fromY === toY) {
    toX += 1;
  }
  alpha *= 0.3;
  ctx.beginPath();
  ctx.moveTo(fromX, fromY);
  const colors = [
    `rgba(0,0,0,${alpha * 0.3})`,
    `rgba(255,255,255,${alpha})`,
    `rgba(255,255,255,${alpha})`
  ]
  ctx.strokeStyle = colors[color];
  ctx.lineWidth = thickness;
  ctx.lineCap = 'round';
  ctx.lineTo(toX, toY);
  ctx.stroke();
};

const update = (index) => {
  const frequencies = analyser.frequencies(undefined, index);
  const volume = (frequencies.reduce(sum) / (1024 * 255));
  const peak = frequencies.reduce(max) / 255;
  const walker = walkers[index];

  const speed = (Math.pow(volume * 10, 1 / 4) * 80) + 1;

  const startX = walker.x;
  const startY = walker.y;

  walker.angle += lerp(Math.pow(peak, 20), 0, 0.8);
  walker.x += Math.cos(walker.angle) * speed;
  walker.y += Math.sin(walker.angle) * speed;
  walker.x = lerp(walker.x, canvas.width / 2, 0.25);
  walker.y = lerp(walker.y, canvas.height / 2, 0.25);

  drawLine(index, Math.pow(peak, 2), (Math.pow(volume * 10, 1 / 3) * 40) + 10, startX, startY, walker.x, walker.y);
};


let rotate = 0;
let scale = 1;
let flameDirection = 0;
let flameSize = 1;

const tick = () => {
  requestAnimationFrame(tick);

  flameDirection -= 0.01;
  const flameX = Math.cos(flameDirection) * flameSize;
  const flameY = Math.sin(flameDirection) * flameSize;

  ctx.translate(canvas.width / 2, canvas.height / 2);
  rotate = 0.01;
  scale += (Math.random() - 0.5) * 0.003 * (1 - analyser.frequencies(undefined, 0).reduce(sum) / (1024 * 255));
  scale = Math.min(1.01, Math.max(0.99, scale));
  ctx.scale(scale, scale);
  ctx.rotate(rotate);
  ctx.globalAlpha = 0.99;
  ctx.translate(flameX, flameY);
  ctx.drawImage(canvas, -canvas.width / 2, -canvas.height / 2);
  ctx.translate(-flameX, -flameY);
  ctx.globalAlpha = 1;
  ctx.rotate(-rotate);
  ctx.scale(1/scale, 1/scale);
  ctx.translate(-canvas.width / 2, -canvas.height / 2);

  drawLine(0, 0.1, 100, canvas.width / 2 - 1, canvas.height / 2, canvas.width / 2 + 1, canvas.height / 2);
  drawLine(2, 0.1, 90, canvas.width / 2 - 1, canvas.height / 2, canvas.width / 2 + 1, canvas.height / 2);
  twice(update);

  ctx.fillStyle = 'rgba(128,128,128,0.01)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
};

const init = () => {
  canvas = document.createElement('canvas');
  document.body.appendChild(canvas);
  autoscale(canvas, {
    target: [0,0]
  });

  ctx = canvas.getContext('2d');
  ctx.fillStyle = 'rgba(128,128,128,1)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const audio = new Audio();
  audio.crossOrigin = 'Anonymous';
  audio.src = 'test.mp3';

  analyser = webAudioAnalyser(audio, {
    stereo: true,
  });

  audio.play();
  walkers = twice((i) => ({
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
    angle: Math.PI * 1.5,
    color: `rgb(${i * 255},${i * 255},${i * 255})`,
  }));
  tick();
};


init();
