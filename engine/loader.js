// Placeholder loader engine: will be implemented in later steps.
import manifestModule from './manifest.js';
import { getGenerator } from '../src/generators/registry.js';
import { dev } from '../src/config.js';

const bookSelect = document.getElementById('book-select');
const chapterSelect = document.getElementById('chapter-select');
const exerciseSelect = document.getElementById('exercise-select');
const fullCard = document.querySelector('.full-card');

function clearSelect(sel) {
  sel.innerHTML = '';
  const opt = document.createElement('option'); opt.value = ''; opt.textContent = sel === exerciseSelect ? 'Välj övning' : sel === chapterSelect ? 'Välj kapitel' : 'Välj bok';
  sel.appendChild(opt);
}

function toggleNoExercise(has) {
  if (has) fullCard.classList.remove('no-exercise');
  else fullCard.classList.add('no-exercise');
}

export async function initLoader() {
  const manifest = await manifestModule.loadManifest();
  const books = manifest.books || [];
  clearSelect(bookSelect); clearSelect(chapterSelect); clearSelect(exerciseSelect);
  books.forEach(b => {
    const o = document.createElement('option'); o.value = b.id; o.textContent = b.title; bookSelect.appendChild(o);
  });

  bookSelect.addEventListener('change', () => {
    const book = books.find(b => b.id === bookSelect.value);
    clearSelect(chapterSelect); clearSelect(exerciseSelect);
    if (!book) return toggleNoExercise(false);
    (book.chapters || []).forEach(c => { const o = document.createElement('option'); o.value = c.id; o.textContent = c.title; chapterSelect.appendChild(o); });
    toggleNoExercise(false);
  });

  chapterSelect.addEventListener('change', () => {
    const book = books.find(b => b.id === bookSelect.value);
    if (!book) return toggleNoExercise(false);
    const chap = (book.chapters || []).find(c => c.id === chapterSelect.value);
    clearSelect(exerciseSelect);
    if (!chap) return toggleNoExercise(false);
    (chap.exercises || []).forEach(e => { const o = document.createElement('option'); o.value = e.id; o.textContent = e.title; exerciseSelect.appendChild(o); });
    toggleNoExercise(false);
  });

  exerciseSelect.addEventListener('change', () => {
    const book = books.find(b => b.id === bookSelect.value);
    if (!book) return toggleNoExercise(false);
    const chap = (book.chapters || []).find(c => c.id === chapterSelect.value);
    if (!chap) return toggleNoExercise(false);
    const exRef = (chap.exercises || []).find(x => x.id === exerciseSelect.value);
    if (!exRef) { toggleNoExercise(false); return; }
    // if the exercise is a reference with a path (or file), lazy-load its full JSON
    const pathProp = exRef.path || exRef.file || null;
    console.log('loader: selected exercise ref', exRef.id, 'pathProp=', pathProp);
    if (pathProp) {
      fetch(pathProp).then(r => {
        if (!r.ok) throw new Error('Fetch failed: ' + r.status);
        return r.json();
      }).then(full => {
        const ex = Object.assign({}, exRef, full || {});
        console.log('loader: loaded exercise JSON', ex.id || exRef.id, ex);
        showExercise(ex);
      }).catch(err => { console.error('Failed to load exercise', err, exRef); showExercise(exRef); });
    } else {
      console.log('loader: no path property on exercise ref, using ref directly', exRef);
      showExercise(exRef);
    }
    // ensure question text element has a default font size
    const qEl = typeof document !== 'undefined' ? document.getElementById('question-text') : null;
    if (qEl) qEl.style.fontSize = qEl.style.fontSize || '2.1rem';

  // centralised exercise display logic so it can be invoked from URL shortcuts
  function showExercise(ex) {
    const qEl = document.getElementById('question-text');
    const tEl = document.getElementById('task-expression');
    // ensure link container
    let linksEl = document.getElementById('exercise-links');
    if (!linksEl) {
      linksEl = document.createElement('div');
      linksEl.id = 'exercise-links';
      linksEl.style.marginTop = '8px';
      const container = document.getElementById('question-card') || qEl.parentElement;
      container.appendChild(linksEl);
    }

    if (ex.generator) {
      const gen = getGenerator(ex.generator);
      if (gen && typeof gen.generate === 'function') {
        const params = Object.assign({}, ex.params || {});
        try { const qs = typeof location !== 'undefined' ? new URLSearchParams(location.search) : null; if (qs && qs.get('dev') === '1') params.count = 5; } catch (e) {}
        const items = gen.generate(params, { seed: Date.now() });
        ex._items = items; ex._current = 0; ex._score = 0; ex._attempts = 0;
        ex._genParams = Object.assign({}, params);
        window.currentExerciseData = ex;
          const first = items[0] || { a: '', b: '', answer: '' };
          // If generator returned a single descriptive item in `a`, promote it to exercise task
          if (!ex.task && first && typeof first.a === 'string' && first.a.length > 0 && first.a.includes(':')) {
            ex.task = first.a;
          }
          // choose display based on generator/item properties
          const isDiv = ex.generator && String(ex.generator).toLowerCase().includes('div');
          const hasRound = first && typeof first.roundUnit !== 'undefined';
          let expr;
          // Special-case: problem-solving generator returns full question text in `a`.
          if (ex.generator === 'problem-solving') {
            // normalize whitespace and use as main task text
            const raw = first.a || '';
            const norm = String(raw).replace(/\s+/g, ' ').trim();
            ex.task = norm || ex.task || '';
            expr = ''; // hide the task-expression area for this exercise
          } else if (isDiv) {
            // show as a fraction using \frac inside inline $...$ so auto-render picks it up
            expr = `$\\frac{${first.a}}{${first.b}}$`;
          } else if (hasRound) {
            // rounding prompt: show plain text; UI showCurrentItem will render nicely
            expr = `Avrunda ${first.a} till ${first.roundLabel}`;
          } else if (ex.generator === 'numberlinePoint') {
            // Render a simple ASCII/SVG-friendly numberline description for now.
            // The real interactive numberline answer-type will draw the line inside #answer-area.
            const start = first.a; const end = first.b; const step = first.step;
            // show start and end and a marker for the point index
            expr = `Tallinje: ${start} — ${end} med steg ${step}. Pil pekar på position ${first.idx} (svar ${first.answer})`;
          } else if (first && typeof first.op === 'string') {
            // basic ops generator: use operation word in the question area
            let label = '';
            if (first.op === 'kvot') label = `Beräkna kvoten av ${first.a} och ${first.b}`;
            else if (first.op === 'produkt') label = `Beräkna produkten av ${first.a} och ${first.b}`;
            else if (first.op === 'summa') label = `Beräkna summan av ${first.a} och ${first.b}`;
            else if (first.op === 'differens') label = `Beräkna differensen av ${first.a} och ${first.b}`;
            expr = label;
          } else {
            expr = `$${first.a} \\times ${first.b}$`;
          }
        // For problem-solving show only the normalized task in the question area
        // Use `displayText` as a fallback when `task` isn't provided in the JSON.
        const taskText = ex.task || ex.displayText || ex.title || '';
        if (ex.generator === 'problem-solving') {
          qEl.textContent = ex.task || ex.displayText || '';
          qEl.style.fontStyle = 'normal';
          qEl.style.fontWeight = '800';
          tEl.textContent = '';
          tEl.style.display = 'none';
        } else {
          qEl.textContent = taskText;
          tEl.textContent = expr;
          tEl.style.display = '';
        }
        // invoke app's renderer to initialise input area for the first item
        try { if (typeof window !== 'undefined' && typeof window.showCurrentItem === 'function') window.showCurrentItem(ex); } catch (e) {}
      } else {
        qEl.textContent = ex.task || '';
        tEl.textContent = ex.question || '';
      }
    } else {
      window.currentExerciseData = null;
      qEl.textContent = ex.task || '';
      tEl.textContent = ex.question || '';
    }

    // hide any visible summary and links when switching exercises, and clear current exercise data
    try {
      const summaryEl = document.getElementById('exercise-summary');
      if (summaryEl) summaryEl.classList.add('visually-hidden');
      const restartBtn = document.getElementById('summary-restart');
      if (restartBtn) restartBtn.classList.add('visually-hidden');
      const linksEl = document.getElementById('exercise-links');
      if (linksEl) { linksEl.classList.add('visually-hidden'); linksEl.innerHTML = ''; }
    } catch (e) {}

    const tryRender = () => {
      // Skip KaTeX auto-render for the combined problem-solving exercise
      if (ex.generator === 'problem-solving') return;
      if (window.katexAutoRenderLoaded && typeof renderMathInElement === 'function') {
        try {
          renderMathInElement(qEl, { delimiters: [{left: '$$', right: '$$', display: true}, {left: '$', right: '$', display: false}] });
          renderMathInElement(tEl, { delimiters: [{left: '$$', right: '$$', display: true}, {left: '$', right: '$', display: false}] });
          qEl.classList.add('katex-rendered');
        } catch (e) { console.warn('KaTeX render failed', e); }
      }
    };
    [0,200,600,1200].forEach(ms => setTimeout(tryRender, ms));
    qEl.style.fontWeight = '800'; qEl.style.fontSize = qEl.style.fontSize || '2.1rem';
    toggleNoExercise(true);
    // update exercise links (copy link + download QR)
    try { updateExerciseLinks(ex); } catch (e) {}
  }
    toggleNoExercise(true);
  });

  // initial state: no exercise selected
  toggleNoExercise(false);
  // Auto-select exercise via URL: ?exercise=<id> optionally with ?book=... & ?chapter=
  try {
    const qs = typeof location !== 'undefined' ? new URLSearchParams(location.search) : null;
    const exId = qs && qs.get('exercise');
    if (exId) {
      // find the exercise location
      for (const b of books) {
        for (const c of (b.chapters || [])) {
          const found = (c.exercises || []).find(e => e.id === exId);
          if (found) {
            bookSelect.value = b.id;
            // populate chapterSelect and exerciseSelect similar to change handlers
            clearSelect(chapterSelect);
            (b.chapters || []).forEach(c2 => { const o = document.createElement('option'); o.value = c2.id; o.textContent = c2.title; chapterSelect.appendChild(o); });
            chapterSelect.value = c.id;
            clearSelect(exerciseSelect);
            (c.exercises || []).forEach(e2 => { const o = document.createElement('option'); o.value = e2.id; o.textContent = e2.title; exerciseSelect.appendChild(o); });
            exerciseSelect.value = exId;
            if (found.path) {
              fetch(found.path).then(r => r.ok ? r.json() : null).then(full => {
                const ex = Object.assign({}, found, full || {});
                showExercise(ex);
              }).catch(err => { console.error('Failed to load exercise', err); showExercise(found); });
            } else {
              showExercise(found);
            }
            return;
          }
        }
      }
    }
  } catch (e) {}
}

// Helper: update copy/download links for an exercise
function updateExerciseLinks(ex) {
  // previously had QR button here; removed per request
}

function downloadQrPng(targetUrl, filename) {
  try {
    // Use a public QR image API to generate a PNG. Size 300x300.
    const api = 'https://api.qrserver.com/v1/create-qr-code/';
    const src = `${api}?size=300x300&format=png&data=${encodeURIComponent(targetUrl)}`;
    const a = document.createElement('a');
    a.href = src; a.download = filename; document.body.appendChild(a); a.click(); a.remove();
  } catch (e) { console.error('Failed to download QR', e); alert('Kunde inte skapa QR-kod'); }
}

// Auto-init when script loads in browser
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => { initLoader().catch(err => console.error(err)); });
}

export default { initLoader };
