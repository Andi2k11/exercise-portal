export function generate(params = {}, rng = Math.random) {
  const a = params.a ?? 3;
  const b = params.b ?? 4;
  return { type: 'multiplyTenPowers', params: { a, b } };
}

export default { generate };
