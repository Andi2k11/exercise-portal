// Lightweight parse/format implementation to avoid external CDN dependencies.
// parseDecimal: accepts Swedish comma or dot, returns normalized string with dot or null on invalid
export function parseDecimal(str) {
  if (str == null) return null;
  let s = String(str).trim();
  if (s === '') return null;
  // remove spaces
  s = s.replace(/\s+/g, '');
  // Only allow digits, optional leading +/-, and one decimal separator (comma or dot)
  const match = s.match(/^([+-]?\d+)([.,](\d+))?$/);
  if (!match) return null;
  const intPart = match[1];
  const fracPart = match[3] || '';
  // normalized to dot as decimal separator
  return fracPart ? `${intPart}.${fracPart}` : `${intPart}`;
}

// formatDecimal: accepts normalized value (string or number), returns Swedish comma string
export function formatDecimal(value, decimals = null) {
  if (value == null) return '';
  // value may be normalized string or number
  let s = String(value);
  // if s contains comma, convert to dot first
  s = s.replace(',', '.');
  if (!/^[+-]?\d+(\.\d+)?$/.test(s)) return String(value);

  if (decimals != null) {
    // fixed decimals using Number for rounding (suitable for UI display)
    const num = Number(s);
    s = num.toFixed(decimals);
  } else {
    // trim trailing zeros up to reasonable precision
    if (s.indexOf('.') >= 0) {
      s = s.replace(/(?:\.0+|(?<=\.[0-9]*?)0+)$/, '');
      s = s.replace(/\.$/, '');
    }
  }
  return s.replace('.', ',');
}

export default { parseDecimal, formatDecimal };
