// Placeholder manifest engine: will be implemented in later steps.
const MANIFEST_PATH = './data/index.json';

export async function loadManifest() {
  try {
    const res = await fetch(MANIFEST_PATH);
    if (!res.ok) throw new Error('Failed to load manifest');
    const data = await res.json();
    return data;
  } catch (err) {
    console.error('manifest load error', err);
    return { books: [] };
  }
}

export default { loadManifest };
