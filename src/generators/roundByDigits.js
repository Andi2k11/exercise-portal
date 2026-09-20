import { makeRng } from '../core/rng.js';

// Rounding generator: produce integers between min and max with all digits unique.
// Rounds to tens/hundreds/thousands depending on number length (3->10,4->100,5->1000).
export function generate(params={}, opts={}) {
  const count = params.count || 10;
  const minV = Math.max(100, Math.floor(params.min || params.minFactor || 100));
  const maxV = Math.max(minV, Math.floor(params.max || params.maxFactor || 99999));
  const seed = opts.seed || Date.now();
  const rng = makeRng(seed);
  const items = [];
  const triesLimit = 200;
  for (let i=0;i<count;i++){
    let tries=0; let val=null;
    const disallowTrailingZero = params.disallowTrailingZero !== false; // default true for this generator
    while (tries < triesLimit) {
      const r = Math.floor(rng()*(maxV - minV + 1)) + minV;
      const s = String(r);
      // optionally disallow numbers that end with 0 (configurable)
      if (disallowTrailingZero && s.endsWith('0')) { tries++; continue; }
      const set = new Set(s.split(''));
      if (set.size === s.length) { val = r; break; }
      tries++;
    }
    if (val === null) val = Math.floor((minV+maxV)/2);
    const digits = String(val).length;
    // Choose allowed rounding units based on digit count:
    // 3 digits -> can round to 10 or 100
    // 4-5 digits -> can round to 10, 100 or 1000
    const possible = (digits === 3) ? [10, 100] : [10, 100, 1000];
    const choice = possible[Math.floor(rng()*possible.length)];
    let unit = choice;
    let label = unit === 10 ? 'tiotal' : unit === 100 ? 'hundratal' : 'tusental';
    // compute rounded answer: round to nearest unit
    const answer = Math.round(val / unit) * unit;
    items.push({ a: val, roundUnit: unit, roundLabel: label, answer });
  }
  return items;
}

export default { generate };
