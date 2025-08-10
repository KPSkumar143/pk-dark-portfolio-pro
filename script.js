// Canvas Background particles (Green Neon)
const canvas = document.getElementById('bg');
const ctx = canvas.getContext('2d');

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resize();
window.addEventListener('resize', resize);

class Particle {
  constructor() {
    this.reset();
  }
  reset() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.vx = (Math.random() - 0.5) * 1;
    this.vy = (Math.random() - 0.5) * 1;
    this.r = Math.random() * 2.5 + 0.5;
    this.alpha = 0.5 + Math.random() * 0.5;
  }
  update() {
    this.x += this.vx;
    this.y += this.vy;
    if (this.x < -10) this.x = canvas.width + 10;
    if (this.x > canvas.width + 10) this.x = -10;
    if (this.y < -10) this.y = canvas.height + 10;
    if (this.y > canvas.height + 10) this.y = -10;
  }
  draw() {
    ctx.beginPath();
    ctx.fillStyle = `rgba(0,255,127,${this.alpha})`;
    ctx.shadowColor = 'rgba(0,255,127,0.9)';
    ctx.shadowBlur = 14;
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }
}

let particles = [];
function initParticles() {
  particles = [];
  let count = Math.floor((canvas.width * canvas.height) / 90000);
  count = Math.max(count, 60);
  for (let i = 0; i < count; i++) {
    particles.push(new Particle());
  }
}
initParticles();

function connect() {
  for (let i = 0; i < particles.length; i++) {
    for (let j = i+1; j < particles.length; j++) {
      let p1 = particles[i];
      let p2 = particles[j];
      let dx = p1.x - p2.x;
      let dy = p1.y - p2.y;
      let dist = Math.sqrt(dx*dx + dy*dy);
      if (dist < 140) {
        ctx.strokeStyle = `rgba(0,255,127,${0.2 * (1 - dist / 140)})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
      }
    }
  }
}

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // subtle dark gradient overlay
  let grad = ctx.createLinearGradient(0,0,canvas.width,canvas.height);
  grad.addColorStop(0, 'rgba(0,20,10,0.18)');
  grad.addColorStop(1, 'rgba(0,0,0,0.6)');
  ctx.fillStyle = grad;
  ctx.fillRect(0,0,canvas.width,canvas.height);

  particles.forEach(p => {
    p.update();
    p.draw();
  });
  connect();

  requestAnimationFrame(animate);
}
animate();

// Navigation page switching with 3D effect
const navButtons = document.querySelectorAll('.nav-btn');
const pages = document.querySelectorAll('.page');

navButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    // Remove active from all
    navButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const target = btn.getAttribute('data-target');
    pages.forEach(p => {
      if (p.id === target) {
        p.classList.add('active');
      } else {
        p.classList.remove('active');
      }
    });
  });

  // Cursor glow effect on nav buttons
  btn.addEventListener('mousemove', e => {
    btn.classList.add('hovered');
  });
  btn.addEventListener('mouseleave', e => {
    btn.classList.remove('hovered');
  });
});

// Animate skill bars width based on data-percent
window.addEventListener('load', () => {
  const skillBars = document.querySelectorAll('.skill-bar-3d');
  skillBars.forEach(bar => {
    const percent = bar.getAttribute('data-percent');
    const level = bar.querySelector('.skill-level-3d');
    level.style.width = percent + '%';
  });
});

// Contact form submission with Formspree backend
const form = document.getElementById('contactForm');
const formStatus = document.getElementById('formStatus');

form.addEventListener('submit', e => {
  e.preventDefault();

  formStatus.textContent = 'Sending message...';

  const data = new FormData(form);
  fetch(form.action, {
    method: 'POST',
    body: data,
    headers: {
      'Accept': 'application/json'
    }
  }).then(response => {
    if (response.ok) {
      formStatus.textContent = 'Thank you! Your message has been sent.';
      form.reset();
    } else {
      response.json().then(data => {
        if (Object.hasOwn(data, 'errors')) {
          formStatus.textContent = data["errors"].map(e => e.message).join(", ");
        } else {
          formStatus.textContent = 'Oops! There was a problem submitting your form.';
        }
      });
    }
  }).catch(() => {
    formStatus.textContent = 'Oops! There was a problem submitting your form.';
  });
});
