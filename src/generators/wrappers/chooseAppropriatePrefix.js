export function generate(params = {}, rng = Math.random) {
  const value = params.value ?? 1500;
  return { type: 'chooseAppropriatePrefix', params: { value } };
}

export default { generate };
