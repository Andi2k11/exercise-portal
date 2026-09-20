import { makeRng } from '../core/rng.js';

// Mixed division generator: randomly produce integer or decimal factors and create dividend = factor * multiplier
export function generate(params, opts = {}) {
  const count = params.count || 10;
  const intMin = params.minFactorInt || 1;
  const intMax = params.maxFactorInt || 999;
  const decMin = params.minFactorDec || 0.1;
  const decMax = params.maxFactorDec || 9.999;
  const mults = params.divisors || params.multipliers || [10,100,1000];
  const maxNumeratorDecimal = (typeof params.maxNumeratorDecimal === 'number') ? params.maxNumeratorDecimal : 999.999;
  const seed = opts.seed || Date.now();
  const rng = makeRng(seed);
  const items = [];
  for (let i=0;i<count;i++){
    const m = mults[Math.floor(rng()*mults.length)];
    const useDecimal = rng()<0.5;
    if (useDecimal) {
      const decimals = Math.floor(rng()*3)+1;
      const scale = Math.pow(10,decimals);
      const minDividend = Math.ceil(decMin * m * scale);
      const maxDividend = Math.floor(Math.min(decMax * m, maxNumeratorDecimal) * scale);
      const raw = Math.floor(rng()*(maxDividend - minDividend + 1)) + minDividend;
      const dividend = raw / scale;
      const answer = dividend / m;
      items.push({ a: Number(dividend.toString()), b: m, answer, type: 'decimal', decimals });
    } else {
      const factor = Math.floor(rng()*(intMax-intMin+1)) + intMin;
      const dividend = factor * m;
      items.push({ a: dividend, b: m, answer: factor, type: 'integer' });
    }
  }
  return items;
}

export default { generate };
