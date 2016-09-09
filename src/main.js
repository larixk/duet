import autoscale from 'canvas-autoscale';
import webAudioAnalyser from 'web-audio-analyser';
import { max, sum, lerp, times } from './util.js';
import particles from './particles.js';

let walkers;
let analyser;
let ctx;
let canvas;


const drawLine = (color, alpha, thickness, fromX, fromY, toX, toY) => {
  const colors = [
    `rgba(32,32,32,${alpha})`,
    `rgba(255,255,255,${alpha})`,
    `rgba(128,128,128,${alpha})`,
  ];
  ctx.beginPath();
  ctx.moveTo(fromX, fromY);
  ctx.strokeStyle = colors[color];
  ctx.lineWidth = thickness * 2;
  ctx.lineCap = 'round';
  ctx.lineTo(toX, toY);
  ctx.stroke();
};

const update = (index) => {
  const frequencies = analyser.frequencies(undefined, (index) % 2);
  const volume = (frequencies.reduce(sum) / (1024 * 255));
  const peak = frequencies.reduce(max) / 255;
  const walker = walkers[index];

  const speed = (Math.pow(volume * 10, 1 / 4) * 90);

  const startX = walker.x;
  const startY = walker.y;

  walker.angle += lerp(Math.pow(peak, 8), 0, 0.85);
  walker.x += Math.cos(walker.angle) * speed;
  walker.y += Math.sin(walker.angle) * speed;
  walker.x = lerp(walker.x, canvas.width / 2, 0.25);
  walker.y = lerp(walker.y, canvas.height / 2, 0.25);

  // particles(Math.pow(volume, 1), walker.x, walker.y, walker.color, canvas);
  drawLine(
    index % 2,
    Math.pow(peak, 2),
    (Math.pow(volume * 10, 1 / 3) * 30),
    startX,
    startY,
    walker.x,
    walker.y
  );
  const colors = [
    'rgba(32,32,32,1)',
    'rgba(255,255,255,1)',
    'rgba(0,0,0,1)',
  ];
  particles(Math.pow(volume, 1/2), walker.x, walker.y, colors[index % 2], canvas);
};


let rotate = 0;
let scale = 1;
let scaleD = 0;
let flameDirection = 0;
let wipeCount = 0;
let flameSize = 2;

const tick = () => {
  requestAnimationFrame(tick);

  const loudness = analyser.frequencies(undefined, 0).reduce(sum) / (1024 * 255);

  flameDirection += 0.01;
  const flameX = Math.cos(flameDirection) * flameSize;
  const flameY = Math.sin(flameDirection) * flameSize;
  ctx.translate(canvas.width / 2, canvas.height / 2);
  rotate = 0.01 * Math.pow(loudness, 1 / 10);
  scaleD += ((1 - Math.pow(loudness, 1 / 3)) - 0.5) * 0.01;
  scaleD = Math.min(0.1, Math.max(-0.1, scaleD));
  scale += scaleD;
  scale = Math.min(0.995, Math.max(0.99, scale));
  ctx.scale(scale, scale);
  ctx.rotate(rotate);
  ctx.translate(flameX, flameY);

  ctx.globalCompositeOperation = 'source-over';
  ctx.imageSmoothingEnabled = true;
  ctx.globalAlpha = 0.992;
  ctx.drawImage(canvas, -canvas.width / 2, -canvas.height / 2);
  // ctx.imageSmoothingEnabled = true;

  ctx.translate(-flameX, -flameY);
  ctx.rotate(-rotate);
  ctx.scale(1 / scale, 1 / scale);
  ctx.translate(-canvas.width / 2, -canvas.height / 2);

  ctx.globalCompositeOperation = 'source-over';
  ctx.globalAlpha = 1;

  drawLine(
    0,
    0.1,
    (180 * Math.pow(loudness, 1 / 4)) + 20,
    (canvas.width / 2) - 1,
    canvas.height / 2,
    (canvas.width / 2) + 1,
    canvas.height / 2
  );
  drawLine(
    2,
    0.5,
    (160 * Math.pow(loudness, 1 / 4)) + 15,
    (canvas.width / 2) - 1,
    canvas.height / 2,
    (canvas.width / 2) + 1,
    canvas.height / 2
  );

  times(walkers.length, update);

  ctx.fillStyle = 'rgba(32,32,32,1)';
  ctx.fillRect(1 - 1, 0, 1, canvas.height);
  ctx.fillRect(0, canvas.height - 1, canvas.width, 1);
  ctx.fillRect(canvas.width - 1, 0, 1, canvas.height);
  ctx.fillRect(0, 1 - 1, canvas.width, 1);

  ctx.fillStyle = 'rgba(255,255,255,1)';
  ctx.fillRect(2 - 1, 0, 1, canvas.height);
  ctx.fillRect(0, canvas.height - 2, canvas.width, 1);
  ctx.fillRect(canvas.width - 2, 0, 1, canvas.height);
  ctx.fillRect(0, 2 - 1, canvas.width, 1);
};

const init = () => {
  canvas = document.createElement('canvas');
  document.body.appendChild(canvas);
  autoscale(canvas, {
    target: [0, 0],
  });

  ctx = canvas.getContext('2d');
  ctx.fillStyle = 'rgba(0,0,0,1)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const audio = new Audio();
  audio.crossOrigin = 'Anonymous';
  audio.src = 'test.mp3';

  analyser = webAudioAnalyser(audio, {
    stereo: true,
  });

  audio.play();
  walkers = times(2, (i) => ({
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
    angle: Math.PI * 1.5 * Math.random(),
    color: `rgb(${(i % 2) * 255},${(i % 2) * 255},${(i % 2) * 255})`,
  }));
  tick();
};

init();
