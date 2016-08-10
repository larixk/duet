import autoscale from 'canvas-autoscale';
import webAudioAnalyser from 'web-audio-analyser';

const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
document.body.appendChild(canvas);

autoscale(canvas);

const audio = new Audio();
audio.crossOrigin = 'Anonymous';
audio.src = '/test.mp3';

const analyser = webAudioAnalyser(audio, {
    stereo: true
});

const twice = (f) => {
    f(0);
    f(1);
};

const lerp = (a, b, t) => a + t * (b - a);
const sum = (a, b) => a + b;
const max = (a, b) => Math.max(a, b);
const walkers = [];

const findHighestBand = (frequencies) => {
    let loudest;
    let maxF = 0;
    frequencies.forEach((f, index) => {
        if (f > maxF) {
            maxF = f;
            loudest = index;
        }
    })
    if (loudest) {
        return Math.log(50) / Math.log(loudest / frequencies.length);
    }
    return 0;
}

const drawLine = (color, thickness, fromX, fromY, toX, toY) => {

    ctx.beginPath();
    ctx.moveTo(fromX, fromY);
    ctx.strokeStyle = color ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';
    ctx.lineWidth = thickness;
    ctx.lineCap = 'round';
    ctx.lineTo(toX, toY);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(fromX, fromY);
    ctx.strokeStyle = color ? 'white' : 'black';
    ctx.lineWidth = thickness * 0.5;
    ctx.lineCap = 'round';
    ctx.lineTo(toX, toY);
    ctx.stroke();
}

const update = (index) => {
    const frequencies = analyser.frequencies(undefined, index);
    let volume = frequencies.reduce(sum) / (1024 * 255) * 10;
    let peak = frequencies.reduce(max) / 255;
    let walker = walkers[index];

    const speed = Math.pow(volume, 1/3) * 80 + 1;
    // walker.angle = angle * Math.PI * 2;

    const startX = walker.x;
    const startY = walker.y;

    // walker.angle += (Math.random() - 0.5) * lerp(1 - peak, 1, 0.5);
    walker.angle += lerp(Math.pow(peak, 3), 0, 0.9);
    walker.x += Math.cos(walker.angle) * speed;
    walker.y += Math.sin(walker.angle) * speed;
    walker.x = lerp(walker.x, canvas.width / 2, 0.2);
    walker.y = lerp(walker.y, canvas.height / 2, 0.2);

    drawLine(index, Math.pow(volume, 1/3) * 40 + 10, startX, startY, walker.x, walker.y);
}

const init = () => {
    if (!canvas.width) {
        requestAnimationFrame(init);
        return;
    }
    ctx.fillStyle = 'rgb(128,128,128)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    twice((i) => walkers.push({
        x: window.innerWidth / 2,
        y: window.innerHeight / 2,
        angle: 0,
        color: `rgb(${i * 255},${i * 255},${i * 255})`,
    }));
    tick();
}

init();

const distanceBetween = (p1, p2) => Math.sqrt(
    Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2)
);

const tick = () => {
    requestAnimationFrame(tick);
    ctx.fillStyle = 'rgba(128,128,128,1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    const d = distanceBetween(walkers[0], walkers[1]);
    // ctx.beginPath();
    // ctx.moveTo(walkers[0].x, walkers[0].y);
    // ctx.strokeStyle = 'rgba(0,0,0,0.05)';
    // ctx.lineWidth = 10;
    // ctx.lineCap = 'round';
    // ctx.lineTo(walkers[1].x, walkers[1].y);
    // ctx.stroke();
    twice(update);
};

audio.play();
