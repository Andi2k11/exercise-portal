const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const exts = ['.json', '.js', '.md', '.html', '.css'];
const results = [];

function walk(dir) {
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) { if (name === 'node_modules' || name === '.git') continue; walk(full); }
    else {
      if (exts.includes(path.extname(name))) checkFile(full);
    }
  }
}

function checkFile(file) {
  const rel = path.relative(root, file).replace(/\\/g, '/');
  const text = fs.readFileSync(file, 'utf8');
  const lines = text.split(/\r?\n/);
  lines.forEach((ln, i) => {
    if (/\t/.test(ln)) results.push({ file: rel, line: i+1, kind: 'TAB' });
    if (/\s$/.test(ln)) results.push({ file: rel, line: i+1, kind: 'TRAILING_WHITESPACE' });
    if (/\u0000/.test(ln)) results.push({ file: rel, line: i+1, kind: 'NULL_CHAR' });
  });
  if (path.extname(file) === '.json') {
    try { JSON.parse(text); } catch (e) { results.push({ file: rel, line: 0, kind: 'JSON_ERROR', msg: e.message }); }
  }
}

walk(root);
if (results.length === 0) {
  console.log('OK: no lint issues found');
  process.exit(0);
}
console.log('Lint issues:');
for (const r of results) {
  if (r.kind === 'JSON_ERROR') console.log(`${r.file}: JSON_ERROR: ${r.msg}`);
  else console.log(`${r.file}:${r.line}: ${r.kind}`);
}
process.exit(1);
