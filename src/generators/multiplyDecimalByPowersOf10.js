import { makeRng } from '../core/rng.js';
import { parseDecimal, formatDecimal } from '../core/numbers.js';

// params: { count, minFactor, maxFactor, multipliers }
// For decimal generator: generate a random decimal < 10 with 1-3 decimal places
export function generate(params, opts = {}) {
  const count = params.count || 10;
  const minF = params.minFactor || 0.1;
  const maxF = params.maxFactor || 9.999;
  const mults = params.multipliers || [10, 100, 1000];
  const seed = opts.seed || Date.now();
  const rng = makeRng(seed);
  const items = [];
  for (let i = 0; i < count; i++) {
    // choose number of decimals 1..3
    const decimals = Math.floor(rng() * 3) + 1;
    const scale = Math.pow(10, decimals);
    // random integer in [1, max*scale - 1]
    const minInt = Math.ceil((minF) * scale);
    const maxInt = Math.floor((maxF) * scale);
    const raw = Math.floor(rng() * (maxInt - minInt + 1)) + minInt;
    const factor = raw / scale;
    const m = mults[Math.floor(rng() * mults.length)];
    // ensure one factor is always decimal and randomize order so multiplier can come first
    const decimalFactor = Number(factor.toFixed(decimals));
    const multiplier = m;
    const swap = rng() < 0.5; // true => multiplier first
    const a = swap ? multiplier : decimalFactor;
    const b = swap ? decimalFactor : multiplier;
    const answer = Number((decimalFactor * multiplier).toString());
    items.push({ a, b, answer, decimals });
  }
  return items;
}

export default { generate };
