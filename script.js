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

// Dot globe animation
function initGlobe(canvasId) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const size = canvas.parentElement.offsetWidth;
  canvas.width = size;
  canvas.height = size;
  const cx = size / 2, cy = size / 2;
  const R = size * 0.46;
  const rows = 22, cols = 22;
  let angle = 0;

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
initGlobe('globe');
