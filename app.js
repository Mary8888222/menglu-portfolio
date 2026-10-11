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

document.querySelectorAll('[data-scene]').forEach((button) => {
  const changeScene = () => { scene.src = button.dataset.scene; };
  const restoreScene = () => { scene.src = cover; };
  button.addEventListener('pointerenter', changeScene);
  button.addEventListener('pointerleave', restoreScene);
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
