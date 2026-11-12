  /* ── Hamburger menu ── */
  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.getElementById('nav-links');
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    navLinks.classList.toggle('open');
  });
  navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    hamburger.classList.remove('open');
    navLinks.classList.remove('open');
  }));

  /* ── Active nav: current page ── */
  const page = document.body.dataset.page;
  document.querySelectorAll('#nav-links a').forEach(a => a.classList.toggle('active', a.dataset.page === page));

  /* ── Scroll-reveal ── */
  const revealObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); revealObs.unobserve(e.target); }
    });
  }, { threshold: 0.07 });
  document.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));

  /* ── Back to top ── */
  const btn = document.getElementById('back-top');
  window.addEventListener('scroll', () => btn.classList.toggle('show', window.scrollY > 400));
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  /* ── Typing animation ── */
  const phrases = [
    'Postdoctoral Researcher',
    'Ph.D. in Computer Science',
    'HCI & Behavioral AI',
    'XR & Machine Learning',
    'Professional eyeball watcher 👀',
  ].map(p => Array.from(p));            // split by character so emoji don't break
  const el = document.getElementById('typed-subtitle');
  if (el) {
  let pi = 0, ci = 0, deleting = false;
  function type() {
    const phrase = phrases[pi];
    if (!deleting) {
      el.innerHTML = phrase.slice(0, ++ci).join('') + '<span class="cursor">|</span>';
      if (ci === phrase.length) { deleting = true; setTimeout(type, 1800); return; }
    } else {
      el.innerHTML = phrase.slice(0, --ci).join('') + '<span class="cursor">|</span>';
      if (ci === 0) { deleting = false; pi = (pi + 1) % phrases.length; }
    }
    setTimeout(type, deleting ? 45 : 72);
  }
  type();
  }

  /* ── Googly eyes: follow the cursor / finger, wander when idle ── */
  (function () {
    const googly = document.getElementById('googly');
    if (!googly) return;
    const pupils = googly.querySelectorAll('.pupil');
    const MAX = 3.2;                       // px the pupil can travel
    let idleTimer, wanderTimer, crossed = false;

    function setPupil(p, dx, dy) {
      p.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;
    }
    function lookAt(x, y) {
      if (crossed) return;
      pupils.forEach(p => {
        const r = p.parentElement.getBoundingClientRect();
        const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
        const ang = Math.atan2(y - cy, x - cx);
        const d = Math.min(MAX, Math.hypot(x - cx, y - cy) / 25);
        setPupil(p, Math.cos(ang) * d, Math.sin(ang) * d);
      });
    }
    function wander() {
      const a = Math.random() * Math.PI * 2, d = Math.random() * MAX;
      pupils.forEach(p => setPupil(p, Math.cos(a) * d, Math.sin(a) * d));
      wanderTimer = setTimeout(wander, 1600 + Math.random() * 2200);
    }
    function resetIdle() {
      clearTimeout(idleTimer); clearTimeout(wanderTimer);
      idleTimer = setTimeout(wander, 4000);
    }
    window.addEventListener('pointermove', e => { lookAt(e.clientX, e.clientY); resetIdle(); }, { passive: true });
    window.addEventListener('pointerdown', e => { lookAt(e.clientX, e.clientY); resetIdle(); }, { passive: true });

    // Click the eyes: they go cross-eyed for a moment
    const tip = googly.dataset.tip;
    function crossEyes() {
      crossed = true;
      setPupil(pupils[0], MAX, 0.5);
      setPupil(pupils[1], -MAX, 0.5);
      googly.dataset.tip = 'Hey! Poking the eyes is not a valid calibration procedure.';
      setTimeout(() => { crossed = false; googly.dataset.tip = tip; }, 1400);
    }
    googly.addEventListener('click', crossEyes);
    googly.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); crossEyes(); } });

    resetIdle();
  })();

  /* ── First-author badges ── */
  document.querySelectorAll('.pub-item').forEach(item => {
    const authors = item.querySelector('.pub-authors');
    const title = item.querySelector('.pub-title');
    if (authors && title && authors.innerHTML.trim().startsWith('<span class="pub-me">')) {
      title.insertAdjacentHTML('beforeend', ' <span class="badge-first" title="First author">First author</span>');
    }
  });

  /* ── Hello, fellow source-code reader ── */
  console.log(
    '%c👀 Inspecting the source? I respect that.%c\nI work on ML for eye tracking. If you are hiring or want to collaborate: 0.mehedihasanraju@gmail.com',
    'font-size:15px;font-weight:700;color:#1f5fa8;',
    'font-size:12px;color:#3d4a59;'
  );

  /* ── Research interests: description on hover ── */
  document.querySelectorAll('.research-card').forEach(c => {
    const p = c.querySelector('p'); if (p) c.title = p.textContent.trim();
  });

  /* ── Publication flip cards: front = title/authors/venue, back = TL;DR + links ── */
  document.querySelectorAll('.pub-item').forEach(item => {
    const tldr  = item.querySelector('.pub-tldr');
    const links = item.querySelector('.pub-links');
    const front = document.createElement('div'); front.className = 'pub-face pub-front';
    const back  = document.createElement('div'); back.className  = 'pub-face pub-back';
    [...item.childNodes].forEach(n => { if (n !== tldr && n !== links) front.appendChild(n); });
    front.insertAdjacentHTML('beforeend', '<span class="flip-hint">TL;DR + links ↻</span>');

    back.innerHTML = '<div class="back-label">TL;DR</div>';
    const text = document.createElement('p'); text.className = 'back-text';
    text.innerHTML = tldr ? tldr.innerHTML.replace(/^\s*<b>TL;DR<\/b>\s*/, '') : 'Plain-English summary coming soon.';
    back.appendChild(text);

    // links in a fixed order: DOI, arXiv, Code, Summary (arXiv comes from data-arxiv="...")
    const row = document.createElement('div'); row.className = 'pub-links';
    const byLabel = {};
    if (links) [...links.querySelectorAll('a')].forEach(a => { byLabel[a.textContent.trim()] = a; a.rel = 'noopener'; });
    if (item.dataset.arxiv) {
      byLabel['arXiv'] = Object.assign(document.createElement('a'),
        { href: item.dataset.arxiv, target: '_blank', rel: 'noopener', className: 'pub-link', textContent: 'arXiv' });
    }
    ['DOI', 'arXiv', 'Code', 'Summary'].forEach(k => { if (byLabel[k]) row.appendChild(byLabel[k]); });
    Object.keys(byLabel).forEach(k => { if (!row.contains(byLabel[k])) row.appendChild(byLabel[k]); });
    if (row.children.length) back.appendChild(row);
    back.insertAdjacentHTML('beforeend', '<span class="flip-hint">↺ flip back</span>');
    if (tldr) tldr.remove();
    if (links) links.remove();

    const flip = document.createElement('div'); flip.className = 'pub-flip';
    flip.append(front, back); item.appendChild(flip);
    item.tabIndex = 0;
    item.title = 'Click to flip';
    const toggle = () => item.classList.toggle('flipped');
    item.addEventListener('click', e => { if (!e.target.closest('a')) toggle(); });
    item.addEventListener('keydown', e => {
      if ((e.key === 'Enter' || e.key === ' ') && e.target === item) { e.preventDefault(); toggle(); }
    });
  });

  /* ── Travel map (hobbies.html): drawn the first time the map is opened ── */
  (function () {
    const svg = document.getElementById('travel-map');
    if (!svg) return;
    const NS = 'http://www.w3.org/2000/svg';
    const tip = document.getElementById('map-tip');
    const wrap = svg.parentElement;
    let started = false;
    const load = src => new Promise((ok, fail) => {
      const s = document.createElement('script'); s.src = src; s.onload = ok; s.onerror = fail; document.head.appendChild(s);
    });

    window.initTravelMap = async function () {
      if (started) return; started = true;
      const data = JSON.parse(document.getElementById('travel-data').textContent);
      svg.insertAdjacentHTML('afterend', '<p class="map-loading" id="map-loading">Loading the map…</p>');
      try {
        await load('https://cdn.jsdelivr.net/npm/d3-array@3.2.4/dist/d3-array.min.js');
        await load('https://cdn.jsdelivr.net/npm/d3-geo@3.1.0/dist/d3-geo.min.js');
        await load('https://cdn.jsdelivr.net/npm/topojson-client@3.1.0/dist/topojson-client.min.js');
        const world = await (await fetch('https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/countries-110m.json')).json();
        draw(world, data);
      } catch (e) {
        svg.style.display = 'none';
        wrap.insertAdjacentHTML('beforeend', '<p class="map-error">The map couldn’t load right now. Please try again later.</p>');
      } finally {
        const l = document.getElementById('map-loading'); if (l) l.remove();
      }
    };

    function draw(world, data) {
      const features = topojson.feature(world, world.objects.countries).features
        .filter(f => f.properties.name !== 'Antarctica');
      const proj = d3.geoNaturalEarth1().fitSize([960, 470], { type: 'FeatureCollection', features });
      const path = d3.geoPath(proj);
      const born = new Set(data.born || []), lived = new Set(data.lived || []), visited = new Set(data.visited || []);
      const notes = data.notes || {};
      const LABEL = { born: 'Born here', lived: 'Lived here', visited: 'Visited' };
      const g = document.createElementNS(NS, 'g');
      features.forEach(f => {
        const name = f.properties.name;
        const el = document.createElementNS(NS, 'path');
        el.setAttribute('d', path(f));
        const status = born.has(name) ? 'born' : lived.has(name) ? 'lived' : visited.has(name) ? 'visited' : '';
        el.setAttribute('class', 'country ' + status);
        el.dataset.name = name;
        if (status) el.dataset.sub = notes[name] || LABEL[status];
        g.appendChild(el);
      });
      svg.appendChild(g);

      (data.cities || []).forEach(c => {
        const [x, y] = proj([c.lon, c.lat]);
        const pulse = document.createElementNS(NS, 'circle');
        pulse.setAttribute('class', 'pin-pulse'); pulse.setAttribute('cx', x); pulse.setAttribute('cy', y); pulse.setAttribute('r', 5);
        const dot = document.createElementNS(NS, 'circle');
        dot.setAttribute('class', 'pin-dot'); dot.setAttribute('cx', x); dot.setAttribute('cy', y); dot.setAttribute('r', 5);
        dot.dataset.name = c.name; if (c.note) dot.dataset.sub = c.note;
        svg.append(pulse, dot);
      });

      const known = new Set(features.map(f => f.properties.name));
      const all = [...born, ...lived, ...visited];
      all.forEach(n => { if (!known.has(n)) console.warn('Travel map: unknown country name "' + n + '"'); });
      const countries = new Set(all.filter(n => known.has(n))).size;
      const cities = (data.cities || []).length;
      document.getElementById('map-stats').innerHTML =
        `<div class="map-stat"><b>${countries}</b><span>${countries === 1 ? 'country' : 'countries'}</span></div>` +
        (cities ? `<div class="map-stat"><b>${cities}</b><span>${cities === 1 ? 'city pinned' : 'cities pinned'}</span></div>` : '');

      function showTip(e) {
        const t = e.target.closest('[data-name]');
        if (!t) { tip.hidden = true; return; }
        const r = wrap.getBoundingClientRect();
        tip.innerHTML = t.dataset.name + (t.dataset.sub ? '<small>' + t.dataset.sub + '</small>' : '');
        tip.style.left = (e.clientX - r.left) + 'px';
        tip.style.top = (e.clientY - r.top) + 'px';
        tip.hidden = false;
      }
      svg.addEventListener('pointermove', showTip);
      svg.addEventListener('pointerdown', showTip);
      svg.addEventListener('pointerleave', () => { tip.hidden = true; });
    }
  })();

  /* ── Hobbies: cards open their panels (Travelling → map, Reading Books → bookshelf).
        hobbies.html#map or #books opens that panel directly. ── */
  document.querySelectorAll('.hobby-toggle[aria-controls]').forEach(card => {
    const panel = document.getElementById(card.getAttribute('aria-controls'));
    if (!panel) return;
    function setOpen(open, scroll) {
      panel.hidden = !open;
      card.setAttribute('aria-expanded', String(open));
      if (open && panel.id === 'map' && window.initTravelMap) window.initTravelMap();
      if (open && scroll) panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    card.addEventListener('click', () => setOpen(panel.hidden, true));
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setOpen(panel.hidden, true); }
    });
    if (location.hash === '#' + panel.id) setOpen(true, true);
  });

  /* ── Publications: filter + show the newest few ── */
  (function () {
    const LIMIT = Infinity;   // own page: show every paper
    const list = document.querySelector('.pub-list');
    if (!list) return;
    const items = [...list.querySelectorAll('.pub-item')];
    const labels = [...list.querySelectorAll('.pub-year-label')];
    const wrap = document.createElement('div');
    wrap.className = 'pub-more-wrap';
    const btn = document.createElement('button');
    btn.className = 'show-more';
    wrap.appendChild(btn); list.appendChild(wrap);
    let filter = 'all', open = false;

    function render() {
      const matching = items.filter(p => filter === 'all' || p.dataset.type === filter);
      items.forEach(p => { p.style.display = 'none'; });
      matching.forEach((p, i) => { p.style.display = (open || i < LIMIT) ? '' : 'none'; });
      labels.forEach(label => {
        let next = label.nextElementSibling, any = false;
        while (next && !next.classList.contains('pub-year-label') && next !== wrap) {
          if (next.style.display !== 'none') any = true;
          next = next.nextElementSibling;
        }
        label.style.display = any ? '' : 'none';
      });
      wrap.style.display = matching.length > LIMIT ? '' : 'none';
      btn.textContent = open ? 'Show fewer ↑' : `Show all ${matching.length} publications ↓`;
    }
    document.querySelectorAll('.filter-btn').forEach(b => {
      b.addEventListener('click', () => {
        document.querySelectorAll('.filter-btn').forEach(x => x.classList.remove('active'));
        b.classList.add('active');
        filter = b.dataset.filter; open = false; render();
      });
    });
    btn.addEventListener('click', () => {
      open = !open; render();
      if (!open) list.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    render();
  })();
