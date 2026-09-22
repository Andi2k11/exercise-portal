export function generate(params = {}, rng = Math.random) {
  const a = params.a ?? '3e7';
  const b = params.b ?? '3e1';
  return { type: 'divideScientificNotation', params: { a, b } };
}

export default { generate };
