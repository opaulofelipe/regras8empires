const navLinks = [...document.querySelectorAll('.section-nav a')];
const sections = [...document.querySelectorAll('main section[id]')];
const progress = document.querySelector('.scroll-progress span');
const backTop = document.querySelector('.back-top');

const lightbox = document.querySelector('.lightbox');
const lightboxImage = document.querySelector('.lightbox__image');
const lightboxCaption = document.querySelector('.lightbox__caption');
const lightboxClose = document.querySelector('.lightbox__close');

let lastFocused = null;

function updateScrollUi() {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  const pct = max > 0 ? (window.scrollY / max) * 100 : 0;
  progress.style.width = `${Math.min(100, Math.max(0, pct))}%`;
  backTop.classList.toggle('is-visible', window.scrollY > 700);
}

window.addEventListener('scroll', updateScrollUi, { passive: true });
updateScrollUi();

backTop.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

const observer = new IntersectionObserver((entries) => {
  const current = entries
    .filter(entry => entry.isIntersecting)
    .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

  if (!current) return;

  navLinks.forEach(link => {
    const isActive = link.getAttribute('href') === `#${current.target.id}`;
    link.classList.toggle('is-active', isActive);
  });
}, {
  rootMargin: '-22% 0px -62% 0px',
  threshold: [0, 0.08, 0.2, 0.45]
});

sections.forEach(section => observer.observe(section));

document.addEventListener('click', (event) => {
  const button = event.target.closest('.js-lightbox');
  if (!button) return;

  lastFocused = button;
  lightboxImage.src = button.dataset.full;
  lightboxImage.alt = `Carta ${button.dataset.title}`;
  lightboxCaption.textContent = button.dataset.title;
  lightbox.showModal();
  lightbox.scrollTop = 0;
});

function closeLightbox() {
  if (lightbox.open) lightbox.close();
}

lightboxClose.addEventListener('click', closeLightbox);

lightbox.addEventListener('click', (event) => {
  if (event.target === lightbox) closeLightbox();
});

lightbox.addEventListener('close', () => {
  lightboxImage.src = '';
  lightboxCaption.textContent = '';
  lastFocused?.focus();
});
