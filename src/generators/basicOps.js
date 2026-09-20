import { mulberry32 } from '../../src/core/rng.js';

function rand(rng, min, max) {
  return Math.floor(rng() * (max - min + 1)) + min;
}

export function generate(params = {}, opts = {}) {
  const count = params.count || 15;
  const seed = opts.seed || Date.now();
  const rng = mulberry32(Number(seed) & 0xffffffff);
  const items = [];
  const ops = ['kvot', 'produkt', 'summa', 'differens'];
  for (let i = 0; i < count; i++) {
    const op = ops[Math.floor(rng() * ops.length)];
    let a = 0, b = 0, answer = 0;
    if (op === 'kvot') {
      // integer division: numerator < 145, denominator 2..12, divisible
      b = rand(rng, 2, 12);
      const q = rand(rng, 1, Math.floor((144) / b));
      a = q * b;
      answer = q;
    } else if (op === 'produkt') {
      a = rand(rng, 5, 25);
      const choices = [2,3,4,5,10];
      b = choices[Math.floor(rng() * choices.length)];
      answer = a * b;
    } else if (op === 'summa') {
      a = rand(rng, 50, 500);
      b = rand(rng, 50, 500);
      answer = a + b;
    } else if (op === 'differens') {
      // first term three-digit (100..750), second 50..min(750, first-1)
      a = rand(rng, 100, 750);
      const maxB = Math.min(750, a - 1);
      b = rand(rng, 50, Math.max(50, maxB));
      // ensure b < a
      if (b >= a) b = Math.max(50, a - 1);
      answer = a - b;
    }
    items.push({ a, b, op, answer });
  }
  return items;
}

export default { generate };
