import { mulberry32 } from '../../src/core/rng.js';

function rand(rng, min, max) {
  return Math.floor(rng() * (max - min + 1)) + min;
}

export function generate(params = {}, opts = {}) {
  const count = params.count || 15;
  const seed = opts.seed || Date.now();
  const rng = mulberry32(Number(seed) & 0xffffffff);
  const items = [];
  for (let i = 0; i < count; i++) {
    // generate numbers between 50 and 1000 for variety
    const n = rand(rng, params.min || 50, params.max || 1000);
    items.push({ n, answer: null });
  }
  return items;
}

export default { generate };
