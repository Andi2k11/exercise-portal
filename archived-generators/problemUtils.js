const gcd = (a, b) => {
  a = Math.abs(a); b = Math.abs(b);
  while (b) {
    const t = b; b = a % b; a = t;
  }
  return a;
};

const lcm = (...nums) => {
  if (nums.length === 0) return 1;
  return nums.reduce((acc, n) => Math.abs(acc * n) / gcd(acc, n), 1);
};

export { gcd, lcm };
export default { gcd, lcm };
