export function generate(params = {}, rng = Math.random) {
  const items = params.items ?? [{a:3,b:2},{a:4,b:1}];
  return { type: 'computeTenPowerMultiplication', params: { items } };
}

export default { generate };
