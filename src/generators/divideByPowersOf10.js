import { makeRng } from '../core/rng.js';

// Integer division generator: generate integer factor and multiplier, present a = factor * multiplier, ask for factor
export function generate(params, opts = {}) {
  const count = params.count || 10;
  const minF = params.minFactor || 1;
  const maxF = params.maxFactor || 999;
  // support both old name `multipliers` and clearer `divisors`
  const mults = params.divisors || params.multipliers || [10,100,1000];
  const seed = opts.seed || Date.now();
  const rng = makeRng(seed);
  const items = [];
  for (let i=0;i<count;i++){
    const m = mults[Math.floor(rng() * mults.length)];
    // choose a random dividend (täljare) such that quotient may be decimal
    const minDividend = minF * m;
    const maxDividend = maxF * m;
    const a = Math.floor(rng() * (maxDividend - minDividend + 1)) + minDividend;
    const b = m;
    const answer = a / b; // may be decimal
    items.push({ a, b, answer });
  }
  return items;
}

export default { generate };
