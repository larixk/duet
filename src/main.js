import autoscale from 'canvas-autoscale';
import webAudioAnalyser from 'web-audio-analyser';
import { max, sum, lerp, twice } from './util.js';

let walkers;
let analyser;
let ctx;
let canvas;

const drawLine = (color, thickness, fromX, fromY, toX, toY) => {
  if (fromX === toX && fromY === toY) {
    toX += 1;
  }
  ctx.beginPath();
  ctx.moveTo(fromX, fromY);
  ctx.strokeStyle = color ? 'black' : 'white';
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

  const speed = (Math.pow(volume * 10, 1 / 3) * 80) + 1;

  const startX = walker.x;
  const startY = walker.y;

  // walker.angle += (Math.random() - 0.5) * lerp(1 - peak, 1, 0.5);
  walker.angle += lerp(Math.pow(peak, 4), 0, 0.9);
  walker.x += Math.cos(walker.angle) * speed;
  walker.y += Math.sin(walker.angle) * speed;
  walker.x = lerp(walker.x, canvas.width / 2, 0.2);
  walker.y = lerp(walker.y, canvas.height / 2, 0.2);

  drawLine(index, (Math.pow(volume * 10, 1 / 3) * 40) + 10, startX, startY, walker.x, walker.y);
};


const tick = () => {
  requestAnimationFrame(tick);
  ctx.fillStyle = 'rgba(128,128,128,1)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  twice(update);
};

const init = () => {
  canvas = document.createElement('canvas');
  document.body.appendChild(canvas);
  autoscale(canvas);

  ctx = canvas.getContext('2d');

  const audio = new Audio();
  audio.crossOrigin = 'Anonymous';
  audio.src = '/test.mp3';

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
