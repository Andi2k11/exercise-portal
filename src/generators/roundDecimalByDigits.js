import { makeRng } from '../core/rng.js';

// Decimal rounding generator: produce numbers between min and max with exactly 4 decimals.
// Then choose randomly to round to 0.1, 0.01 or 0.001 (tiondel, hundradel, tusendel).
export function generate(params={}, opts={}) {
  const count = params.count || 10;
  const minV = typeof params.min === 'number' ? params.min : 0;
  const maxV = typeof params.max === 'number' ? params.max : 10;
  const seed = opts.seed || Date.now();
  const rng = makeRng(seed);
  const items = [];
  for (let i=0;i<count;i++){
    // produce a value with exactly 4 decimals between minV and maxV (exclusive of maxV)
    const scale = 10000;
    const minInt = Math.ceil(minV * scale);
    const maxInt = Math.floor((maxV - Number.EPSILON) * scale);
    const raw = Math.floor(rng()*(maxInt - minInt + 1)) + minInt;
    const a = raw / scale;
    // choose rounding unit among 0.1,0.01,0.001
    const units = [0.1, 0.01, 0.001];
    const labels = { '0.1': 'tiondel', '0.01': 'hundradel', '0.001': 'tusendel' };
    const unit = units[Math.floor(rng()*units.length)];
    const label = labels[String(unit)];
    const answer = Math.round(a / unit) * unit;
    items.push({ a, roundUnit: unit, roundLabel: label, answer });
  }
  return items;
}

export default { generate };
