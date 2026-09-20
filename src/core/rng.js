// Mulberry32 PRNG
export function mulberry32(a) {
  return function() {
    let t = a += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  }
}

export function makeRng(seed) {
  // seed can be string or number
  let h = 2166136261 >>> 0;
  const s = String(seed || Date.now());
  for (let i = 0; i < s.length; i++) {
    h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  }
  return mulberry32(h >>> 0);
}

export default { mulberry32, makeRng };
