import { makeRng } from '../core/rng.js';

// Mixed generator: for each item, randomly choose either an integer factor or a decimal factor (<10 with 1-3 decimals)
// and multiply with a multiplier from [10,100,1000].
export function generate(params, opts = {}) {
  const count = params.count || 10;
  const intMin = params.minFactorInt || 1;
  const intMax = params.maxFactorInt || 999;
  const decMin = params.minFactorDec || 0.1;
  const decMax = params.maxFactorDec || 9.999;
  const mults = params.multipliers || [10, 100, 1000];
  const seed = opts.seed || Date.now();
  const rng = makeRng(seed);
  const items = [];
  for (let i = 0; i < count; i++) {
    const useDecimal = rng() < 0.5;
    const m = mults[Math.floor(rng() * mults.length)];
    if (useDecimal) {
      const decimals = Math.floor(rng() * 3) + 1;
      const scale = Math.pow(10, decimals);
      const minInt = Math.ceil(decMin * scale);
      const maxInt = Math.floor(decMax * scale);
      const raw = Math.floor(rng() * (maxInt - minInt + 1)) + minInt;
      const decimalFactor = Number((raw / scale).toFixed(decimals));
      const swap = rng() < 0.5;
      const a = swap ? m : decimalFactor;
      const b = swap ? decimalFactor : m;
      const answer = Number((decimalFactor * m).toString());
      items.push({ a, b, answer, decimals, type: 'decimal' });
    } else {
      const intFactor = Math.floor(rng() * (intMax - intMin + 1)) + intMin;
      const swap = rng() < 0.5;
      const a = swap ? m : intFactor;
      const b = swap ? intFactor : m;
      const answer = intFactor * m;
      items.push({ a, b, answer, type: 'integer' });
    }
  }
  return items;
}

export default { generate };
