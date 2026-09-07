const lightbox = document.querySelector('.lightbox');
const lightboxImage = document.querySelector('.lightbox__image');
const closeButton = document.querySelector('.lightbox__close');
const imageButtons = document.querySelectorAll('[data-full]');
const navLinks = [...document.querySelectorAll('.section-nav a')];
const sections = [...document.querySelectorAll('main section[id]')];

imageButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const preview = button.querySelector('img');
    lightboxImage.src = button.dataset.full;
    lightboxImage.alt = preview?.alt || 'Imagem ampliada';
    lightbox.showModal();
    lightbox.scrollTop = 0;
  });
});

function closeLightbox() {
  if (lightbox.open) lightbox.close();
}

closeButton.addEventListener('click', closeLightbox);

lightbox.addEventListener('click', (event) => {
  if (event.target === lightbox) closeLightbox();
});

lightbox.addEventListener('close', () => {
  lightboxImage.src = '';
});

const observer = new IntersectionObserver((entries) => {
  const visible = entries
    .filter(entry => entry.isIntersecting)
    .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

  if (!visible) return;

  navLinks.forEach(link => {
    const active = link.getAttribute('href') === `#${visible.target.id}`;
    link.classList.toggle('is-active', active);
  });
}, {
  rootMargin: '-25% 0px -60% 0px',
  threshold: [0, .15, .4]
});

sections.forEach(section => observer.observe(section));
