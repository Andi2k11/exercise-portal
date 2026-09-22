export function generate(params = {}, rng = Math.random) {
  const square = params.square ?? 1;
  return { type: 'powerOfTwoAtSquare', params: { square } };
}

export default { generate };
