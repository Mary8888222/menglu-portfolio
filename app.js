const cover = 'assets/cover.png';
const scene = document.querySelector('#scene');
const modal = document.querySelector('#resumeModal');
const modalContent = document.querySelector('#modalContent');
const closeButton = document.querySelector('.modal-close');
const intro = document.querySelector('#intro');
const video = document.querySelector('#introVideo');
const skip = document.querySelector('#skip');
const replay = document.querySelector('#replay');
const share = document.querySelector('#share');
const shareStatus = document.querySelector('#shareStatus');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const skipIntro = new URLSearchParams(window.location.search).get('skipIntro') === '1';

const panels = {
  projects: document.querySelector('#projects-panel'),
  growth: document.querySelector('#growth-panel'),
  achievements: document.querySelector('#achievements-panel'),
  future: document.querySelector('#future-panel')
};

const sceneImages = new Map();
let requestedScene = cover;

function preloadScene(src) {
  if (sceneImages.has(src)) return sceneImages.get(src);
  const image = new Image();
  image.decoding = 'async';
  image.src = src;
  sceneImages.set(src, image);
  return image;
}

function displayScene(src) {
  requestedScene = src;
  const image = preloadScene(src);

  const apply = () => {
    if (requestedScene !== src || scene.getAttribute('src') === src) return;
    scene.classList.add('is-switching');
    scene.src = src;
    window.requestAnimationFrame(() => scene.classList.remove('is-switching'));
  };

  if (image.complete && image.naturalWidth > 0) {
    apply();
    return;
  }

  if (typeof image.decode === 'function') {
    image.decode().then(apply).catch(() => image.addEventListener('load', apply, { once: true }));
  } else {
    image.addEventListener('load', apply, { once: true });
  }
}

function hideIntro() {
  intro.classList.add('is-hidden');
  video.pause();
}

function playIntro() {
  if (reduceMotion) return;
  intro.classList.remove('is-hidden');
  video.currentTime = 0;
  const playback = video.play();
  if (playback) playback.catch(hideIntro);
}

function openPanel(name) {
  const template = panels[name];
  if (!template) return;
  modalContent.replaceChildren(template.content.cloneNode(true));
  modal.showModal();
}

document.querySelectorAll('[data-panel]').forEach((button) => {
  button.addEventListener('click', () => openPanel(button.dataset.panel));
});

const sceneButtons = [...document.querySelectorAll('[data-scene]')];
sceneButtons.forEach((button) => preloadScene(button.dataset.scene));

sceneButtons.forEach((button) => {
  const changeScene = () => displayScene(button.dataset.scene);
  const restoreScene = () => displayScene(cover);
  button.addEventListener('pointerenter', changeScene);
  button.addEventListener('pointermove', changeScene, { passive: true });
  button.addEventListener('pointerleave', restoreScene);
  button.addEventListener('mouseenter', changeScene);
  button.addEventListener('mouseleave', restoreScene);
  button.addEventListener('focus', changeScene);
  button.addEventListener('blur', restoreScene);
});

closeButton.addEventListener('click', () => modal.close());
modal.addEventListener('click', (event) => {
  if (event.target === modal) modal.close();
});

skip.addEventListener('click', hideIntro);
video.addEventListener('ended', hideIntro);
video.addEventListener('error', hideIntro);
replay.addEventListener('click', playIntro);

share.addEventListener('click', async () => {
  const data = { title: document.title, text: '蒙璐的动态个人简历', url: window.location.href };
  try {
    if (navigator.share) {
      await navigator.share(data);
    } else {
      await navigator.clipboard.writeText(window.location.href);
      shareStatus.textContent = '链接已复制';
      window.setTimeout(() => { shareStatus.textContent = ''; }, 1800);
    }
  } catch (error) {
    if (error.name !== 'AbortError') {
      shareStatus.textContent = '请复制浏览器地址栏链接';
      window.setTimeout(() => { shareStatus.textContent = ''; }, 2400);
    }
  }
});

if (skipIntro) {
  window.history.replaceState(null, '', 'index.html');
}

if (reduceMotion || skipIntro) {
  hideIntro();
} else {
  window.addEventListener('load', playIntro, { once: true });
}
