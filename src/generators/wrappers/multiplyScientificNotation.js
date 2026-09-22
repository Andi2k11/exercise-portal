export function generate(params = {}, rng = Math.random) {
  const a = params.a ?? '3e5';
  const b = params.b ?? '2e3';
  return { type: 'multiplyScientificNotation', params: { a, b } };
}

export default { generate };
