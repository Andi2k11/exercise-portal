import { makeRng } from '../core/rng.js';

// params: { count, minFactor, maxFactor, multipliers }
export function generate(params, opts = {}) {
  const count = params.count || 10;
  const minF = params.minFactor || 1;
  const maxF = params.maxFactor || 999;
  const mults = params.multipliers || [10,100,1000];
  const seed = opts.seed || Date.now();
  const rng = makeRng(seed);
  const items = [];
  for (let i = 0; i < count; i++) {
    const factor = Math.floor(rng() * (maxF - minF + 1)) + minF;
    const m = mults[Math.floor(rng() * mults.length)];
    // Randomize order: factor * m or m * factor
    const swap = rng() < 0.5;
    const a = swap ? m : factor;
    const b = swap ? factor : m;
    const answer = a * b;
    items.push({ a, b, answer });
  }
  return items;
}

export default { generate };
