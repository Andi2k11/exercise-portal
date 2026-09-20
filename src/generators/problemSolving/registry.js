// Browser-friendly registry for problem-solving generators.
// Do not use Node-only APIs (fs/path) here so this module can be imported in the browser.
import lcm from './lcm.js';
import roundingInterval from './roundingInterval.js';
import actualValue from './actualValue.js';
import capacity from './capacity.js';
import budget from './budget.js';
import reasoning from './reasoning.js';

const loaders = {
  lcm,
  roundingInterval,
  actualValue,
  capacity,
  budget,
  reasoning
};

export function generate(type, opts, rng) {
  const loader = loaders[type];
  if (!loader) throw new Error(`Unknown problem-solving type ${type}`);
  return loader.generate(opts || {}, rng);
}

export default { generate };
