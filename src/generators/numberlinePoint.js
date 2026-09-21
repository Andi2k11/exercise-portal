import { makeRng } from '../core/rng.js';

function pick(arr, rng) {
  return arr[Math.floor(rng() * arr.length)];
}

function generate(opts = {}, rng) {
  const seed = (rng && rng.seed) || Date.now();
  const rngFn = typeof rng === 'function' ? rng : makeRng(seed);
  const count = opts.count || 10;
  const items = [];
  for (let i = 0; i < count; i++) {
    // New rules for start/end and scale
    // Choose kind and step first, then pick a start that is an exact multiple of the step
    const kind = pick(['int','tenth','hundredth'], rngFn);
    let step;
    if (kind === 'hundredth') {
      step = pick([0.01, 0.2], rngFn);
    } else {
      step = pick([0.1, 0.2], rngFn);
    }

    // Determine tentative span based on chosen kind
    let span = (kind === 'hundredth') ? 0.2 : 2;

    // Compute valid start multiples so that start is multiple of step and end = start + span fits in reasonable range
    // We allow start in [0, 2] but ensure end is start+span
      const maxStart = Math.min(2, 4 - span);
    const unit = Math.round(1 / step);
    const maxIndex = Math.floor(maxStart * unit);
    // valid start indices are 0..maxIndex such that (startIndex + span/unit) is integer
    const spanSteps = Math.round(span * unit);
    const validStarts = [];
    for (let si = 0; si <= maxIndex; si++) {
      // endIndex = si + spanSteps; allow any endIndex (no extra bounds)
      validStarts.push(si);
    }
    // pick a random start index
    const startIndex = validStarts[Math.floor(rngFn() * validStarts.length)];
    const start = +(startIndex / unit);
    // Derive span from actual start precision: if start is integer or tenth, span must be 2
    const isTenth = Math.abs(start * 10 - Math.round(start * 10)) < 1e-9;
    const isInteger = Math.abs(start - Math.round(start)) < 1e-9;
    if (isInteger || isTenth) span = 2;
    const end = +(start + span);
    let divisions = spanSteps;
      // Ensure at least two divisions so we can pick an internal index (not start/end)
      if (divisions < 2) {
        divisions = 2;
        // adjust step so divisions fit the span exactly
        step = +(span / divisions).toFixed(5);
      }
    // choose an index between 1 and divisions-1 so the marked point is never exactly start or end
    let idx;
    if (divisions <= 1) {
        // fallback to middle position
        idx = 1;
    } else {
      // choose an internal index but avoid landing on an integer value
      const maxAttempts = 50;
      let attempts = 0;
      do {
        idx = 1 + Math.floor(rngFn() * Math.max(1, divisions - 1));
        if (idx >= divisions) idx = divisions - 1;
        const candidate = +(start + idx * step);
        // consider integer if within tiny epsilon
        const isInteger = Math.abs(candidate - Math.round(candidate)) < 1e-9;
        attempts += 1;
        if (!isInteger) break;
      } while (attempts < maxAttempts);
      // If all attempts failed (rare), fallback: pick nearest non-integer by offsetting by one step
      if (attempts >= maxAttempts) {
        let fallback = 1;
        while (fallback < divisions && Math.abs((start + fallback * step) - Math.round(start + fallback * step)) < 1e-9) {
          fallback += 1;
        }
        if (fallback >= divisions) {
          // as last resort, allow integer (shouldn't happen)
          idx = Math.max(1, Math.min(divisions - 1, idx));
        } else {
          idx = fallback;
        }
      }
    }
    const value = +(start + idx * step).toFixed(3);
    items.push({
      a: start,
      b: end,
      step,
      idx,
      answer: String(value).replace('.', ','),
      template: `Number line from ${start} to ${end} with step ${step}, point at index ${idx}`
    });
  }
  return items;
}

export default { generate };
