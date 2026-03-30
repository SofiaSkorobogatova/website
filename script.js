// Live clock
function updateClock() {
  const now = new Date();
  const h = String(now.getHours()).padStart(2, '0');
  const m = String(now.getMinutes()).padStart(2, '0');
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const dateStr = `${months[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()}`;
  document.querySelectorAll('#clock-time').forEach(el => el.textContent = `${h}:${m}`);
  document.querySelectorAll('#clock-date').forEach(el => el.textContent = dateStr);
}
updateClock();
setInterval(updateClock, 1000);

// Hamburger menu
const menuBtn = document.getElementById('menuBtn');
const navOverlay = document.getElementById('navOverlay');
if (menuBtn && navOverlay) {
  menuBtn.addEventListener('click', () => {
    const open = navOverlay.classList.toggle('open');
    menuBtn.classList.toggle('open', open);
  });
  navOverlay.addEventListener('click', (e) => {
    if (e.target === navOverlay) {
      navOverlay.classList.remove('open');
      menuBtn.classList.remove('open');
    }
  });
}

// ── Active nav indicator ──
(function() {
  const path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-overlay a, nav a').forEach(a => {
    const href = a.getAttribute('href');
    if (href === path || (path === 'index.html' && href === 'index.html')) {
      a.classList.add('active');
    }
  });
})();

// ── Page transitions ──
(function() {
  document.querySelectorAll('a[href]').forEach(a => {
    const href = a.getAttribute('href');
    if (!href || href.startsWith('http') || href.startsWith('#') || href.startsWith('mailto:') || a.getAttribute('target') === '_blank') return;
    a.addEventListener('click', (e) => {
      e.preventDefault();
      const content = document.querySelector('.viewport-container, .projects-root, .cv-root, .contacts-root, .stack-root, .case-root');
      if (content) {
        content.classList.add('page-content', 'exiting');
        setTimeout(() => { window.location.href = href; }, 250);
      } else {
        window.location.href = href;
      }
    });
  });
})();

// ── Custom cursor (dot follower) ──
(function() {
  if (window.matchMedia('(pointer: coarse)').matches) return; // skip on touch devices
  const dot = document.createElement('div');
  dot.className = 'cursor-dot';
  document.body.appendChild(dot);

  let mouseX = 0, mouseY = 0, dotX = 0, dotY = 0;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    if (!dot.classList.contains('visible')) dot.classList.add('visible');
  });

  document.addEventListener('mouseleave', () => dot.classList.remove('visible'));

  function animateCursor() {
    dotX += (mouseX - dotX) * 0.15;
    dotY += (mouseY - dotY) * 0.15;
    dot.style.left = dotX + 'px';
    dot.style.top = dotY + 'px';
    requestAnimationFrame(animateCursor);
  }
  animateCursor();

  // Expand on interactive elements
  const hoverTargets = 'a, button, .bento-card, .social-btn, .pr-card, .cv-btn, .menu-btn, .portrait-card, .sidebar-card';
  document.addEventListener('mouseover', (e) => {
    if (e.target.closest(hoverTargets)) dot.classList.add('expanded');
  });
  document.addEventListener('mouseout', (e) => {
    if (e.target.closest(hoverTargets)) dot.classList.remove('expanded');
  });
})();

// ── Magnetic buttons ──
(function() {
  if (window.matchMedia('(pointer: coarse)').matches) return;
  const magnets = document.querySelectorAll('.arrow-btn, .cv-btn');
  const threshold = 80;

  magnets.forEach(el => {
    el.style.transition = 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)';

    el.closest('a, button, .bento-card')?.addEventListener('mousemove', (e) => {
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < threshold) {
        const pull = (1 - dist / threshold) * 8;
        const baseTransform = el.classList.contains('arrow-btn') ? 'rotate(45deg) scale(1.1)' : '';
        el.style.transform = `${baseTransform} translate(${dx * pull / threshold}px, ${dy * pull / threshold}px)`;
      }
    });

    el.closest('a, button, .bento-card')?.addEventListener('mouseleave', () => {
      el.style.transform = '';
    });
  });
})();

// ── Card tilt effect (3D perspective) ──
(function() {
  if (window.matchMedia('(pointer: coarse)').matches) return;
  const cards = document.querySelectorAll('.bento-card');
  const maxTilt = 3;

  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      const tiltX = -y * maxTilt;
      const tiltY = x * maxTilt;
      card.style.transform = `perspective(800px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateY(-4px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
})();

// ── Scroll-triggered entrance animations ──
(function() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.case-body-card section, .cv-section, .pr-card, .sidebar-card, .portrait-card, .contact-link').forEach(el => {
    el.classList.add('scroll-reveal');
    observer.observe(el);
  });
})();

// ── Globe loading state ──
function initGlobeCanvas(canvas) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const size = canvas.parentElement.offsetWidth;
  canvas.width = size;
  canvas.height = size;
  const cx = size / 2, cy = size / 2;
  const R = size * 0.46;
  const rows = 22, cols = 22;
  let angle = 0;

  // Mark parent as loaded
  const wrap = canvas.closest('.globe-wrap');
  if (wrap) wrap.classList.add('loaded');

  function drawGlobe() {
    ctx.clearRect(0, 0, size, size);
    for (let i = 0; i <= rows; i++) {
      const lat = (i / rows) * Math.PI;
      for (let j = 0; j <= cols; j++) {
        const lon = (j / cols) * 2 * Math.PI + angle;
        const x = R * Math.sin(lat) * Math.cos(lon);
        const y = R * Math.cos(lat);
        const z = R * Math.sin(lat) * Math.sin(lon);
        const scale = (z + R) / (2 * R);
        const px = cx + x;
        const py = cy - y;
        const r = 1.5 + scale * 1.5;
        const alpha = 0.2 + scale * 0.6;
        ctx.beginPath();
        ctx.arc(px, py, r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${alpha})`;
        ctx.fill();
      }
    }
    angle += 0.003;
    requestAnimationFrame(drawGlobe);
  }
  drawGlobe();
}

// Init globe by id (index, projects, stack pages)
const globeById = document.getElementById('globe');
if (globeById) initGlobeCanvas(globeById);

// Init globe by class (case study pages)
document.querySelectorAll('.globe-canvas').forEach(c => initGlobeCanvas(c));

// ── Shimmer loading for images ──
(function() {
  // Wrap all content images in shimmer containers
  const selectors = [
    '.case-photo-wrapper img',
    '.case-gallery img',
    '.portrait-photo img',
    '.project-thumb img',
    '.pr-card img',
    '.bento-projects img',
    '.mosaic img'
  ];

  document.querySelectorAll(selectors.join(', ')).forEach(img => {
    // Skip if already wrapped
    if (img.parentElement.classList.contains('shimmer-wrap')) return;

    const wrapper = document.createElement('div');
    wrapper.className = 'shimmer-wrap';
    img.parentElement.insertBefore(wrapper, img);
    wrapper.appendChild(img);

    // Add lazy loading for gallery images
    if (img.closest('.case-gallery')) {
      img.loading = 'lazy';
    }

    if (img.complete && img.naturalHeight > 0) {
      wrapper.classList.add('loaded');
    } else {
      img.addEventListener('load', () => wrapper.classList.add('loaded'));
      img.addEventListener('error', () => wrapper.classList.add('loaded'));
    }
  });

  // Shimmer for bento cards — add shimmer class and remove after page settled
  document.querySelectorAll('.bento-card').forEach(card => {
    card.classList.add('shimmer-card');
    // Remove shimmer after a short delay to show content loaded
    setTimeout(() => card.classList.add('loaded'), 600 + Math.random() * 400);
  });
})();
