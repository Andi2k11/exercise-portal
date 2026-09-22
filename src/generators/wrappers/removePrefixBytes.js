export function generate(params = {}, rng = Math.random) {
  const value = params.value ?? 1024;
  return { type: 'removePrefixBytes', params: { value } };
}

export default { generate };
