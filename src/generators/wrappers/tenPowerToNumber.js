export function generate(params = {}, rng = Math.random) {
  const base = params.base ?? 10;
  const exponent = params.exponent ?? 3;
  return { type: 'tenPowerToNumber', params: { base, exponent } };
}

export default { generate };
