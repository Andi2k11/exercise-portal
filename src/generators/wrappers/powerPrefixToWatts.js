export function generate(params = {}, rng = Math.random) {
  const value = params.value ?? 1;
  const prefix = params.prefix ?? 'k';
  return { type: 'powerPrefixToWatts', params: { value, prefix } };
}

export default { generate };
