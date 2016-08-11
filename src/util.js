export const lerp = (a, b, t) => a + (t * (b - a));

export const sum = (a, b) => a + b;

export const max = (a, b) => Math.max(a, b);

export const distanceBetween = (p1, p2) => Math.sqrt(
  Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2)
);

export const twice = (f) => [0, 1].map(f);
