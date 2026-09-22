export function generate(params = {}, rng = Math.random) {
  const a = params.a ?? 1000000;
  const b = params.b ?? 1000000000;
  return { type: 'ratioBetweenPowersOfTen', params: { a, b } };
}

export default { generate };
