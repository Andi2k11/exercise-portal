export function generate(params = {}, rng = Math.random) {
  const expr = params.expr ?? '3.75e7';
  return { type: 'scientificToNumber', params: { expr } };
}

export default { generate };
