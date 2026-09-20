import { makeRng } from '../core/rng.js';

// Decimal division generator: generate decimal factor <10 with 1-3 decimals, multiply by 10/100/1000 to get dividend
export function generate(params, opts = {}) {
  const count = params.count || 10;
  const minF = params.minFactor || 0.1;
  const maxF = params.maxFactor || 9.999;
  // support both old name `multipliers` and clearer `divisors`
  const mults = params.divisors || params.multipliers || [10,100,1000];
  // maximum numerator decimal value (default 999.999)
  const maxNumeratorDecimal = (typeof params.maxNumeratorDecimal === 'number') ? params.maxNumeratorDecimal : 999.999;
  const seed = opts.seed || Date.now();
  const rng = makeRng(seed);
  const items = [];
  for (let i=0;i<count;i++){
    // Allow random dividend with up to 3 decimals in numerator
    const m = mults[Math.floor(rng()*mults.length)];
    const decimals = Math.floor(rng()*3)+1; // decimals in numerator
    const scale = Math.pow(10,decimals);
    const minDividend = Math.ceil(minF * m * scale);
    const maxDividend = Math.floor(Math.min(maxF * m, maxNumeratorDecimal) * scale);
    let raw = Math.floor(rng()*(maxDividend - minDividend + 1)) + minDividend;
    // If caller requires a non-integer numerator, retry until raw is not divisible by scale
    if (params.requireNumeratorDecimal) {
      const maxTries = 10;
      let tries = 0;
      while (raw % scale === 0 && tries < maxTries) {
        raw = Math.floor(rng()*(maxDividend - minDividend + 1)) + minDividend;
        tries++;
      }
      // if we failed to find a non-integer after several tries, and raw % scale === 0, nudge by +1 if possible
      if (raw % scale === 0) {
        if (raw < maxDividend) raw += 1;
        else if (raw > minDividend) raw -= 1;
      }
    }
    const dividend = raw / scale;
    const a = Number(dividend.toString());
    const b = m;
    const answer = a / b; // may be decimal
    items.push({ a, b, answer, decimals });
  }
  return items;
}

export default { generate };
