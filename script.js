/* ── Neural Network Canvas ── */
(function () {
  const canvas = document.getElementById('heroCanvas');
  const ctx = canvas.getContext('2d');
  let W, H, nodes, mouse = { x: -999, y: -999 };
  const NODE_COUNT = 70;
  const CONN_DIST = 130;
  const MOUSE_DIST = 160;

  function resize() {
    W = canvas.width = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }

  function rand(min, max) { return min + Math.random() * (max - min); }

  function createNodes() {
    nodes = Array.from({ length: NODE_COUNT }, () => ({
      x: rand(0, W), y: rand(0, H),
      vx: rand(-0.25, 0.25), vy: rand(-0.25, 0.25),
      r: rand(1.2, 2.4),
      color: Math.random() > 0.5 ? 'violet' : 'cyan',
    }));
  }

  function getColor(node, alpha) {
    return node.color === 'violet'
      ? `rgba(167,139,250,${alpha})`
      : `rgba(103,232,249,${alpha})`;
  }

  function step() {
    ctx.clearRect(0, 0, W, H);

    nodes.forEach(n => {
      // mouse attraction
      const dx = mouse.x - n.x, dy = mouse.y - n.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < MOUSE_DIST) {
        const force = (1 - dist / MOUSE_DIST) * 0.012;
        n.vx += dx * force; n.vy += dy * force;
      }

      // dampen velocity
      n.vx *= 0.99; n.vy *= 0.99;

      n.x += n.vx; n.y += n.vy;

      // bounce
      if (n.x < 0) { n.x = 0; n.vx *= -1; }
      if (n.x > W) { n.x = W; n.vx *= -1; }
      if (n.y < 0) { n.y = 0; n.vy *= -1; }
      if (n.y > H) { n.y = H; n.vy *= -1; }
    });

    // draw connections
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i], b = nodes[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < CONN_DIST) {
          const alpha = (1 - d / CONN_DIST) * 0.18;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = getColor(a, alpha);
          ctx.lineWidth = 0.7;
          ctx.stroke();
        }
      }
    }

    // draw nodes
    nodes.forEach(n => {
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fillStyle = getColor(n, 0.55);
      ctx.fill();
    });

    requestAnimationFrame(step);
  }

  window.addEventListener('mousemove', e => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  });

  window.addEventListener('resize', () => { resize(); createNodes(); });

  resize();
  createNodes();
  step();
})();

/* ── Custom Cursor ── */
(function () {
  const dot = document.getElementById('cursorDot');
  const ring = document.getElementById('cursorRing');
  if (!dot || !ring) return;

  let mx = 0, my = 0, rx = 0, ry = 0;

  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    dot.style.left = mx + 'px';
    dot.style.top  = my + 'px';
  });

  (function loop() {
    rx += (mx - rx) * 0.11;
    ry += (my - ry) * 0.11;
    ring.style.left = rx + 'px';
    ring.style.top  = ry + 'px';
    requestAnimationFrame(loop);
  })();
})();

/* ── Magnetic Buttons ── */
document.querySelectorAll('.magnetic').forEach(btn => {
  btn.addEventListener('mousemove', e => {
    const r = btn.getBoundingClientRect();
    const x = e.clientX - r.left - r.width / 2;
    const y = e.clientY - r.top  - r.height / 2;
    btn.style.transform = `translate(${x * 0.22}px, ${y * 0.22}px)`;
  });
  btn.addEventListener('mouseleave', () => {
    btn.style.transform = '';
  });
});

/* ── Nav Scroll ── */
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 20);
}, { passive: true });

/* ── Mobile Menu ── */
const toggle = document.getElementById('navToggle');
const menu   = document.getElementById('mobileMenu');
toggle.addEventListener('click', () => menu.classList.toggle('open'));
document.querySelectorAll('.mobile-link').forEach(l => l.addEventListener('click', () => menu.classList.remove('open')));
document.addEventListener('click', e => {
  if (!nav.contains(e.target) && !menu.contains(e.target)) menu.classList.remove('open');
});

/* ── Active Nav Link ── */
const sections  = document.querySelectorAll('section[id]');
const navAnchors = document.querySelectorAll('.nav-links a:not(.btn-nav)');
const navObs = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navAnchors.forEach(a => {
        a.style.color = a.getAttribute('href') === `#${entry.target.id}` ? 'var(--text)' : '';
      });
    }
  });
}, { rootMargin: '-40% 0px -55% 0px' });
sections.forEach(s => navObs.observe(s));

/* ── Scroll Reveal ── */
const revealObs = new IntersectionObserver(entries => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => entry.target.classList.add('visible'), i * 70);
      revealObs.unobserve(entry.target);
    }
  });
}, { threshold: 0.08 });
document.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));

/* ── Number Counter ── */
const countObs = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const el = entry.target;
    const target = +el.dataset.target;
    const duration = 1400;
    const start = performance.now();
    (function tick(now) {
      const p = Math.min((now - start) / duration, 1);
      el.textContent = Math.round(p * target);
      if (p < 1) requestAnimationFrame(tick);
    })(performance.now());
    countObs.unobserve(el);
  });
}, { threshold: 0.5 });
document.querySelectorAll('.count').forEach(el => countObs.observe(el));

/* ── Typed Text ── */
const phrases = [
  'AI / ML Engineer',
  'Computer Vision & Deep Learning',
  'NLP & Transformer Models',
  'Multimodal AI Systems',
  'MLOps & Scalable Inference',
];

let pi = 0, ci = 0, deleting = false;
const el = document.getElementById('typed');

function type() {
  const cur = phrases[pi];
  if (deleting) {
    el.textContent = cur.slice(0, --ci);
  } else {
    el.textContent = cur.slice(0, ++ci);
  }
  let delay = deleting ? 35 : 70;
  if (!deleting && ci === cur.length) { delay = 2200; deleting = true; }
  else if (deleting && ci === 0) { deleting = false; pi = (pi + 1) % phrases.length; delay = 350; }
  setTimeout(type, delay);
}
setTimeout(type, 900);

/* ── Card 3D Tilt ── */
document.querySelectorAll('.bento-card, .edu-card').forEach(card => {
  card.addEventListener('mousemove', e => {
    const r = card.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width  - 0.5;
    const y = (e.clientY - r.top)  / r.height - 0.5;
    card.style.transform = `translateY(-3px) rotateX(${-y * 4}deg) rotateY(${x * 4}deg)`;
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
  });
});
