import { lcm } from './problemUtils.js';

const generate = (opts = {}, rng = Math.random) => {
  const minTotal = opts.minTotal || 100;
  const numFactors = opts.numFactors || 3;
  const factors = [];
  while (factors.length < numFactors) {
    const f = Math.floor(rng() * 11) + 2; // 2..12
    if (!factors.includes(f)) factors.push(f);
  }
  const value = lcm(...factors);
  // find smallest > minTotal that is multiple
  const k = Math.ceil((minTotal + 1) / value);
  const answer = value * k;

  // description template not used in generated text; kept for future use
  return {
    id: `lcm-${Date.now()}`,
    questionText: `Hitta minsta talet större än ${minTotal} som är delbart med ${factors.join(', ')}.`,
    meta: { factors },
    answer
  };
};

export { generate };
export default { generate };
