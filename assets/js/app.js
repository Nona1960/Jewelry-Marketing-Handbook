// меню на телефоне
const b = document.querySelector('.burger'), n = document.querySelector('.nav');
if (b) b.addEventListener('click', () => { const o = n.classList.toggle('open'); b.setAttribute('aria-expanded', o); });

// подсветка текущего раздела в оглавлении главы
const links = [...document.querySelectorAll('.toc a')];
if (links.length && 'IntersectionObserver' in window) {
  const map = new Map(links.map(a => [a.getAttribute('href').slice(1), a]));
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { links.forEach(a => a.classList.remove('on')); map.get(e.target.id)?.classList.add('on'); }
  }), { rootMargin: '-20% 0px -70% 0px' });
  document.querySelectorAll('.prose h2[id]').forEach(h => io.observe(h));
}

// поиск по учебнику
const q = document.getElementById('q');
if (q) {
  let idx = null;
  const res = document.getElementById('res');
  const esc = s => s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const run = async () => {
    idx = idx || await (await fetch('/search-index.json')).json();
    const v = q.value.trim().toLowerCase();
    if (v.length < 3) { res.innerHTML = ''; return; }
    const out = [];
    for (const d of idx) {
      const t = d.x.toLowerCase(); let i = t.indexOf(v), c = 0;
      while (i >= 0 && c < 3) {
        const s = Math.max(0, i - 90), frag = d.x.slice(s, i + v.length + 120);
        out.push(`<li><a href="${d.u}">${esc(d.t)}</a><p>…${esc(frag).replace(new RegExp(esc(v).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'ig'), m => `<mark>${m}</mark>`)}…</p></li>`);
        i = t.indexOf(v, i + 400); c++;
      }
    }
    res.innerHTML = out.length ? out.slice(0, 60).join('') : '<li>Ничего не найдено</li>';
  };
  let tm; q.addEventListener('input', () => { clearTimeout(tm); tm = setTimeout(run, 200); });
}

// приложение (PWA): офлайн и установка на телефон
if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch(() => {});
let deferred;
const ib = document.querySelector('.install');
window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); deferred = e; if (ib) ib.hidden = false; });
ib?.addEventListener('click', async () => { if (!deferred) return; deferred.prompt(); await deferred.userChoice; deferred = null; ib.hidden = true; });
