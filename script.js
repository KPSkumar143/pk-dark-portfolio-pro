/* Pro portfolio script.js
   - custom cursor
   - nav smooth scrolling + 3D tilt effect
   - theme toggle (persisted)
   - skill bar animation
   - contact form posting to Formspree (with local fallback)
   - technical canvas background (particles + grid)
*/

/* -------------------------
   Theme toggle (persist)
   ------------------------- */
const root = document.documentElement;
const themeToggle = document.getElementById('themeToggle');
const stored = localStorage.getItem('pk_theme') || (window.matchMedia && window.matchMedia('(prefers-color-scheme:light)').matches ? 'light' : 'dark');
document.documentElement.setAttribute('data-theme', stored);

function toggleTheme(){
  const cur = document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', cur);
  localStorage.setItem('pk_theme', cur);
}
themeToggle.addEventListener('click', toggleTheme);

/* -------------------------
   Custom cursor & button effects
   ------------------------- */
const cursor = document.getElementById('cursor');
let cx = window.innerWidth / 2, cy = window.innerHeight / 2;

window.addEventListener('mousemove', e => {
  cx = e.clientX; cy = e.clientY;
  cursor.style.left = cx + 'px';
  cursor.style.top = cy + 'px';
});

// Enlarges cursor on interactive elements
const interactive = 'button, a, .btn-3d, input, textarea, .nav-3d-btn';
document.addEventListener('mouseover', e => {
  if (e.target.closest(interactive)) {
    cursor.style.transform = 'translate(-50%, -50%) scale(1.6)';
    cursor.style.opacity = '1';
  }
});
document.addEventListener('mouseout', e => {
  if (e.target.closest(interactive) === null) {
    cursor.style.transform = 'translate(-50%, -50%) scale(1)';
    cursor.style.opacity = '0.95';
  }
});

// 3D tilt on nav & other 3D buttons
function addTiltEffect(el, intensity = 12){
  el.addEventListener('mousemove', (ev) => {
    const rect = el.getBoundingClientRect();
    const px = (ev.clientX - rect.left) / rect.width;
    const py = (ev.clientY - rect.top) / rect.height;
    const rx = (py - 0.5) * intensity;
    const ry = (px - 0.5) * intensity * -1;
    el.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateZ(10px)`;
  });
  el.addEventListener('mouseleave', () => {
    el.style.transform = '';
  });
}
document.querySelectorAll('.nav-3d-btn, .btn-3d, .card-3d, .project-card-3d, .project-link').forEach(el => addTiltEffect(el, 8));

/* -------------------------
   Smooth scrolling when nav clicked
   ------------------------- */
document.querySelectorAll('.nav-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const t = document.querySelector(btn.dataset.target);
    if (!t) return;
    t.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

/* -------------------------
   Skill bar animation (init on view)
   ------------------------- */
const skillBars = document.querySelectorAll('.skill-bar-3d');

function animateSkillBars(){
  skillBars.forEach(bar => {
    const target = Number(bar.dataset.percent || 0);
    const fill = bar.querySelector('.bar-fill');
    const badge = bar.querySelector('.percent-badge');
    // animate fill width and badge counting
    let start = 0;
    const dur = 900;
    const t0 = performance.now();
    function tick(now){
      const p = Math.min(1, (now - t0) / dur);
      const eased = p * (2 - p); // simple ease
      const val = Math.round(eased * target);
      fill.style.width = (val) + '%';
      badge.textContent = val + '%';
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  });
}

// Use IntersectionObserver to trigger only when visible
const skillsSection = document.getElementById('skills');
if (skillsSection) {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { animateSkillBars(); obs.disconnect(); } });
  }, { threshold: 0.25 });
  obs.observe(skillsSection);
}

/* -------------------------
   Contact form: Formspree + local fallback
   - Form action points to Formspree (index.html).
   - We intercept and POST via fetch to that action (CORS depends on Formspree config).
   - If fetch fails (network or CORS), we show a friendly message and fallback to "local test".
   ------------------------- */
const contactForm = document.getElementById('contactForm3d');
const contactStatus = document.getElementById('contactStatus');
const contactTest = document.getElementById('contactTest');

contactForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  contactStatus.textContent = 'Sending…';
  const formData = new FormData(contactForm);
  const action = contactForm.getAttribute('action') || '';

  try {
    // Try to POST to Formspree endpoint
    const resp = await fetch(action, {
      method: 'POST',
      headers: { 'Accept': 'application/json' },
      body: formData
    });
    if (resp.ok) {
      contactStatus.textContent = '✅ Message sent. Thank you!';
      contactForm.reset();
    } else {
      // If server returns validation or 4xx/5xx
      const json = await resp.json().catch(()=>null);
      contactStatus.textContent = json && json.error ? `Error: ${json.error}` : 'Error sending message (server).';
    }
  } catch (err) {
    // network/CORS: show error and offer local fallback
    contactStatus.innerHTML = 'Network error or blocked by CORS. <strong>Use "Test Local"</strong> to simulate.';
    console.warn('Contact send failed:', err);
  }
});

// Local test (simulation)
contactTest.addEventListener('click', () => {
  contactStatus.textContent = 'Simulated send (local test): message queued — success ✅';
  setTimeout(()=>contactStatus.textContent = 'Simulated delivered. Replace Formspree action to enable live sending.', 1400);
});

/* -------------------------
   Canvas: Technical background
   - Particle network + rotating wire grid
   ------------------------- */
const canvas = document.getElementById('tech-bg');
const ctx = canvas.getContext('2d');

function resizeCanvas(){
  canvas.width = innerWidth;
  canvas.height = innerHeight;
}
resizeCanvas();
addEventListener('resize', () => { resizeCanvas(); init(); });

/* Particles */
let particles = [];
function rand(min,max){ return Math.random()*(max-min)+min; }
function init(){
  particles = [];
  const count = Math.max(60, Math.floor((canvas.width*canvas.height)/140000));
  for (let i=0;i<count;i++){
    particles.push({
      x: rand(0,canvas.width),
      y: rand(0,canvas.height),
      vx: rand(-0.25,0.25),
      vy: rand(-0.25,0.25),
      r: rand(0.6,2.2),
      a: rand(0.2,0.9)
    });
  }
}
init();

/* rotating grid parameters */
let gridRotation = 0;
function draw(){
  ctx.clearRect(0,0,canvas.width,canvas.height);

  // subtle radial vignette
  const g = ctx.createRadialGradient(canvas.width/2,canvas.height/2,0, canvas.width/2,canvas.height/2, Math.max(canvas.width,canvas.height)/1.2);
  g.addColorStop(0, 'rgba(0,0,0,0)');
  g.addColorStop(1, 'rgba(0,0,0,0.45)');
  ctx.fillStyle = g;
  ctx.fillRect(0,0,canvas.width,canvas.height);

  // rotating wire grid
  ctx.save();
  ctx.translate(canvas.width/2, canvas.height/2);
  gridRotation += 0.0008;
  ctx.rotate(gridRotation);
  ctx.strokeStyle = 'rgba(0,255,127,0.03)';
  ctx.lineWidth = 1;
  const size = Math.min(canvas.width, canvas.height) * 1.2;
  for (let i=-10;i<11;i++){
    const x = (i/10) * size;
    ctx.beginPath();
    ctx.moveTo(x,-size);
    ctx.lineTo(x,size);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-size, x);
    ctx.lineTo(size, x);
    ctx.stroke();
  }
  ctx.restore();

  // particles and connections
  for (let p of particles){
    p.x += p.vx;
    p.y += p.vy;
    if (p.x < -10) p.x = canvas.width + 10;
    if (p.x > canvas.width + 10) p.x = -10;
    if (p.y < -10) p.y = canvas.height + 10;
    if (p.y > canvas.height + 10) p.y = -10;
  }

  // draw connections
  for (let i=0;i<particles.length;i++){
    for (let j=i+1;j<particles.length;j++){
      const a = particles[i], b = particles[j];
      const dx = a.x - b.x, dy = a.y - b.y;
      const d = Math.sqrt(dx*dx + dy*dy);
      if (d < 140){
        ctx.beginPath();
        ctx.strokeStyle = `rgba(0,255,127,${0.12*(1 - d/140)})`;
        ctx.lineWidth = 1;
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
    }
  }

  // draw particles
  for (let p of particles){
    ctx.beginPath();
    ctx.fillStyle = `rgba(0,255,127,${p.a})`;
    ctx.shadowBlur = 8;
    ctx.shadowColor = 'rgba(0,255,127,0.9)';
    ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  requestAnimationFrame(draw);
}
requestAnimationFrame(draw);

/* -------------------------
   Small UI niceties: Scroll to top on load, opacity transitions
   ------------------------- */
window.addEventListener('load', () => {
  // small fade in
  document.body.style.transition = 'opacity 600ms ease';
  document.body.style.opacity = '1';
  // animate skill bars if near top
  if (document.getElementById('skills').getBoundingClientRect().top < window.innerHeight) {
    animateSkillBars();
  }
});
