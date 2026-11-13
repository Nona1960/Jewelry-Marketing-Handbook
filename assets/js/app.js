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

// прогресс чтения и время чтения
const prose = document.querySelector('.prose');
if (prose && document.body.classList.contains('reading')) {
  const bar = document.createElement('div'); bar.className = 'rbar'; document.body.appendChild(bar);
  const upd = () => { const r = prose.getBoundingClientRect(), h = r.height - innerHeight; bar.style.width = Math.min(100, Math.max(0, -r.top / (h > 0 ? h : 1) * 100)) + '%'; };
  addEventListener('scroll', upd, { passive: true }); upd();
  const words = prose.innerText.split(/\s+/).length, min = Math.max(1, Math.round(words / 180));
  const k = document.querySelector('.art-h .kicker');
  if (k) { const s = document.createElement('span'); s.className = 'rtime'; s.textContent = document.documentElement.lang === 'ru' ? ` · ${min} мин чтения` : ` · ${min} min read`; k.appendChild(s); }
}

// тесты к главам
document.querySelectorAll('.quiz').forEach(qz => {
  let done = 0, ok = 0; const n = +qz.dataset.n, sc = qz.querySelector('.qscore');
  qz.querySelectorAll('.qz').forEach(item => {
    item.querySelectorAll('.qo').forEach(btn => btn.addEventListener('click', () => {
      if (item.classList.contains('done')) return;
      item.classList.add('done'); done++;
      const right = btn.dataset.ok === '1'; if (right) ok++;
      btn.classList.add(right ? 'ok' : 'bad');
      item.querySelectorAll('.qo').forEach(b => { if (b.dataset.ok === '1') b.classList.add('ok'); b.disabled = true; });
      item.querySelector('.qx').hidden = false;
      if (done === n) { sc.hidden = false; sc.querySelector('b').textContent = ok; }
    }));
  });
});

// глоссарий: фильтр
const glq = document.getElementById('glq');
if (glq) glq.addEventListener('input', () => {
  const v = glq.value.trim().toLowerCase();
  document.querySelectorAll('.glossary .gl').forEach(g => { g.hidden = v && !g.textContent.toLowerCase().includes(v); });
});

// практикум: калькулятор
const pr = document.querySelector('.pr');
if (pr) {
  const V = JSON.parse(pr.dataset.v), loc = pr.dataset.loc, g = id => +document.getElementById(id).value || 0;
  const fmt = x => Math.round(x).toLocaleString(loc) + ' ₽';
  const calc = () => {
    const unit = g('aov') * g('margin') / 100, buys = g('freq') * g('years');
    const own = unit * buys - g('cac');
    const mpUnit = g('aov') * (g('margin') - g('comm')) / 100;
    const mp = mpUnit * (Math.min(1, buys) + Math.max(0, buys - 1) * g('mprep') / 100);
    document.getElementById('o1').textContent = fmt(own);
    document.getElementById('o2').textContent = fmt(mp);
    const d = own - mp, o3 = document.getElementById('o3');
    o3.textContent = Math.abs(d) < Math.max(1, Math.abs(own) * 0.05) ? V.eq : (d > 0 ? V.own : V.mp) + fmt(Math.abs(d));
  };
  pr.addEventListener('input', calc); calc();
}
