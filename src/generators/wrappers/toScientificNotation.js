export function generate(params = {}, rng = Math.random) {
  const number = params.number ?? 3500000;
  return { type: 'toScientificNotation', params: { number } };
}

export default { generate };
