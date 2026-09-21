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

// ===== Partida: sorteio de objetivo + calculadora de recursos =====
(() => {
  const objectiveCards = [
    { name: "Livre Comércio", file: "https://opaulofelipe.github.io/objetivos8empires/assets/cards/livre-comercio.jpeg" },
    { name: "Prosperidade", file: "https://opaulofelipe.github.io/objetivos8empires/assets/cards/prosperidade.jpeg" },
    { name: "Militarismo", file: "https://opaulofelipe.github.io/objetivos8empires/assets/cards/militarismo.jpeg" },
    { name: "Talassocracia", file: "https://opaulofelipe.github.io/objetivos8empires/assets/cards/talassocracia.jpeg" },
    { name: "Ascensão", file: "https://opaulofelipe.github.io/objetivos8empires/assets/cards/ascensao.jpeg" },
    { name: "Imperialismo", file: "https://opaulofelipe.github.io/objetivos8empires/assets/cards/imperialismo.jpeg" },
    { name: "Engenharia", file: "https://opaulofelipe.github.io/objetivos8empires/assets/cards/engenharia.jpeg" },
    { name: "Expansionismo", file: "https://opaulofelipe.github.io/objetivos8empires/assets/cards/expansionismo.jpeg" },
    { name: "Ciência", file: "https://opaulofelipe.github.io/objetivos8empires/assets/cards/ciencia.jpeg" },
    { name: "Urbanização", file: "https://opaulofelipe.github.io/objetivos8empires/assets/cards/urbanizacao.jpeg" }
  ];

  const OBJECTIVE_STORAGE_KEY = "8empires:selectedObjective";
  const RESOURCE_STORAGE_KEY = "8empires:resources";
  const SHUFFLE_DURATION = 850;
  const REVEAL_DELAY = 170;

  const drawButton = document.querySelector("#objectiveDrawButton");
  const resetButton = document.querySelector("#objectiveResetButton");
  const buttonText = document.querySelector("#objectiveButtonText");
  const statusText = document.querySelector("#objectiveStatus");
  const deck = document.querySelector("#objectiveDeck");
  const resultCard = document.querySelector("#objectiveResultCard");
  const cardImage = document.querySelector("#objectiveCardImage");
  const resourceCalculator = document.querySelector("#resourceCalculator");

  if (!drawButton || !resetButton || !deck || !resultCard || !cardImage) return;

  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  function randomObjective() {
    return objectiveCards[Math.floor(Math.random() * objectiveCards.length)];
  }

  function saveObjective(card) {
    try {
      localStorage.setItem(OBJECTIVE_STORAGE_KEY, JSON.stringify(card));
    } catch (_) {}
  }

  function readObjective() {
    try {
      const saved = JSON.parse(localStorage.getItem(OBJECTIVE_STORAGE_KEY));
      if (!saved?.name || !saved?.file) return null;
      return saved;
    } catch (_) {
      return null;
    }
  }

  function clearObjective() {
    try {
      localStorage.removeItem(OBJECTIVE_STORAGE_KEY);
    } catch (_) {}
  }

  function showSavedObjective(card) {
    cardImage.src = card.file;
    cardImage.alt = `Carta ${card.name}`;
    resultCard.setAttribute("aria-label", `Carta sorteada: ${card.name}`);
    deck.hidden = true;
    resultCard.hidden = false;
    resultCard.classList.add("is-visible", "is-revealed");
    drawButton.hidden = true;
    resetButton.hidden = false;
    statusText.textContent = `Carta sorteada: ${card.name}`;
  }

  async function drawObjective() {
    drawButton.disabled = true;
    resultCard.hidden = true;
    resultCard.classList.remove("is-visible", "is-revealed");
    deck.hidden = false;
    deck.classList.remove("is-leaving");
    deck.classList.add("is-shuffling");

    statusText.textContent = "Embaralhando…";
    buttonText.textContent = "Sorteando…";

    await wait(SHUFFLE_DURATION);

    const selected = randomObjective();
    cardImage.src = selected.file;
    cardImage.alt = `Carta ${selected.name}`;
    resultCard.setAttribute("aria-label", `Carta sorteada: ${selected.name}`);

    deck.classList.remove("is-shuffling");
    deck.classList.add("is-leaving");
    await wait(REVEAL_DELAY);

    deck.hidden = true;
    resultCard.hidden = false;

    requestAnimationFrame(() => {
      resultCard.classList.add("is-visible");
      requestAnimationFrame(() => resultCard.classList.add("is-revealed"));
    });

    await wait(620);

    saveObjective(selected);
    statusText.textContent = `Carta sorteada: ${selected.name}`;
    drawButton.hidden = true;
    drawButton.disabled = false;
    buttonText.textContent = "Sortear objetivo";
    resetButton.hidden = false;
  }

  function resetObjective() {
    clearObjective();
    resultCard.hidden = true;
    resultCard.classList.remove("is-visible", "is-revealed");
    cardImage.src = "";
    cardImage.alt = "";
    deck.hidden = false;
    deck.classList.remove("is-leaving", "is-shuffling");
    drawButton.hidden = false;
    drawButton.disabled = false;
    resetButton.hidden = true;
    buttonText.textContent = "Sortear objetivo";
    statusText.textContent = "10 cartas disponíveis";
  }

  drawButton.addEventListener("click", drawObjective);
  resetButton.addEventListener("click", resetObjective);

  const savedObjective = readObjective();
  if (savedObjective) {
    showSavedObjective(savedObjective);
  }

  objectiveCards.forEach(({ file }) => {
    const image = new Image();
    image.src = file;
  });

  // Calculadora de recursos: salva automaticamente no aparelho.
  const resources = ["madeira", "minerio", "alimento", "pedra"];
  const resourceState = Object.fromEntries(resources.map((name) => [name, 0]));

  try {
    const savedResources = JSON.parse(localStorage.getItem(RESOURCE_STORAGE_KEY));
    resources.forEach((name) => {
      const value = Number(savedResources?.[name]);
      if (Number.isFinite(value) && value >= 0) {
        resourceState[name] = Math.floor(value);
      }
    });
  } catch (_) {}

  function saveResources() {
    try {
      localStorage.setItem(RESOURCE_STORAGE_KEY, JSON.stringify(resourceState));
    } catch (_) {}
  }

  function renderResource(name) {
    const output = document.querySelector(`[data-count-for="${name}"]`);
    const counter = document.querySelector(`.resource-counter[data-resource="${name}"]`);
    if (!output || !counter) return;

    output.value = resourceState[name];
    output.textContent = resourceState[name];

    const decrement = counter.querySelector('[data-action="decrement"]');
    if (decrement) decrement.disabled = resourceState[name] <= 0;
  }

  resources.forEach(renderResource);

  resourceCalculator?.addEventListener("click", (event) => {
    const button = event.target.closest(".counter-button");
    if (!button) return;

    const counter = button.closest(".resource-counter");
    const resource = counter?.dataset.resource;
    if (!resource || !(resource in resourceState)) return;

    if (button.dataset.action === "increment") {
      resourceState[resource] += 1;
    } else if (button.dataset.action === "decrement") {
      resourceState[resource] = Math.max(0, resourceState[resource] - 1);
    }

    saveResources();
    renderResource(resource);
  });
})();
