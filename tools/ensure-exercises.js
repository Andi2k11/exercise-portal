const fs = require('fs');
const path = require('path');

const EX_DIR = path.join(__dirname, '..', 'data', 'exercises');

function readJson(p) { return JSON.parse(fs.readFileSync(p, 'utf8')); }
function writeJson(p, obj) { fs.writeFileSync(p, JSON.stringify(obj, null, 2) + '\n', 'utf8'); }

function ensureForFile(filePath) {
  const stat = fs.statSync(filePath);
  if (stat.isDirectory()) return;
  if (!filePath.endsWith('.json')) return;
  const rel = path.relative(EX_DIR, filePath);
  try {
    const data = readJson(filePath);
    // If file is an array (index of exercises), ensure each entry has displayText
    if (Array.isArray(data)) {
      let changed = false;
      data.forEach(item => {
        if (!item.displayText) {
          item.displayText = item.title || (item.id ? item.id.replace(/[-_]/g, ' ') : 'Uppgift');
          changed = true;
        }
        if (!item._sample) {
          item._sample = { a: item.displayText, answer: item.params && item.params.answer ? item.params.answer : null };
          changed = true;
        }
      });
      if (changed) writeJson(filePath, data);
    } else if (typeof data === 'object' && data !== null) {
      let changed = false;
      if (!data.displayText) {
        data.displayText = data.title || data.id || 'Uppgift';
        changed = true;
      }
      if (!data._sample) {
        // create a minimal sample item usable by loader
        let sampleAnswer = null;
        if (data.answerType === 'number' && data.params) {
          // try to infer an answer
          if (data.params.target) sampleAnswer = data.params.target;
          else if (data.params.seconds) sampleAnswer = Math.round(data.params.seconds / (60*60*24));
        }
        data._sample = { a: data.displayText, answer: sampleAnswer };
        changed = true;
      }
      if (changed) writeJson(filePath, data);
    }
  } catch (e) {
    console.error('Failed to process', rel, e.message);
  }
}

function walk(dir) {
  const files = fs.readdirSync(dir);
  files.forEach(f => {
    const p = path.join(dir, f);
    const stat = fs.statSync(p);
    if (stat.isDirectory()) walk(p);
    else ensureForFile(p);
  });
}

if (require.main === module) {
  console.log('Ensuring exercises under', EX_DIR);
  walk(EX_DIR);
  console.log('Done. Review changes and commit if OK.');
}

module.exports = { ensureForFile, walk };
