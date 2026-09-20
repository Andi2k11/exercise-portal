import manifestModule from '../../engine/manifest.js';

async function init() {
  const qs = new URLSearchParams(location.search);
  const token = qs.get('tokken') || qs.get('token');
  const authMsg = document.getElementById('auth-message');
  const list = document.getElementById('list');
  if (token !== '4074') {
    authMsg.textContent = 'Ogiltig token. Ange ?tokken=4074 för att visa listan.';
    return;
  }
  authMsg.textContent = '';

  const manifest = await manifestModule.loadManifest();
  const books = manifest.books || [];
  const base = location.origin + location.pathname.replace(/[^/]*$/, 'index.html');

  const api = 'https://api.qrserver.com/v1/create-qr-code/';

  for (const b of books) {
    const header = document.createElement('div'); header.className = 'list-group-item active'; header.textContent = b.title; list.appendChild(header);
    for (const c of (b.chapters || [])) {
      const chapHeader = document.createElement('div'); chapHeader.className = 'list-group-item'; chapHeader.textContent = '  ' + c.title; list.appendChild(chapHeader);
      for (const e of (c.exercises || [])) {
        const item = document.createElement('div'); item.className = 'list-group-item d-flex justify-content-between align-items-center';
        const title = document.createElement('div'); title.textContent = e.title + ' (' + e.id + ')';
        const btn = document.createElement('button'); btn.type='button'; btn.className='btn btn-sm btn-primary'; btn.textContent='Ladda ner QR';
        btn.onclick = async () => {
          try {
            const qs2 = new URLSearchParams(); qs2.set('exercise', e.id);
            const url = `${base}?${qs2.toString()}`;
            const src = `${api}?size=300x300&format=png&data=${encodeURIComponent(url)}`;
            const safe = e.title.replace(/[^a-z0-9]/gi,'_').toLowerCase();
            const filename = `${safe}.png`;
            const res = await fetch(src);
            if (!res.ok) throw new Error('QR API svarade med ' + res.status);
            const blob = await res.blob();
            const obj = URL.createObjectURL(blob);
            const a = document.createElement('a'); a.href = obj; a.download = filename; document.body.appendChild(a); a.click(); a.remove();
            URL.revokeObjectURL(obj);
          } catch (err) { console.error(err); alert('Kunde inte ladda ner QR: ' + err.message); }
        };
        item.appendChild(title); item.appendChild(btn); list.appendChild(item);
      }
    }
  }
}

init().catch(err => { document.getElementById('auth-message').textContent = 'Fel vid laddning: ' + err; console.error(err); });
