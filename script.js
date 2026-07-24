
const qs = (sel, root = document) => root.querySelector(sel);
const qsa = (sel, root = document) => Array.from(root.querySelectorAll(sel));

const state = {
  tracks: [
    { title: 'Cưới Luôn Được Không Remix', artist: 'Phuong Linh', src: 'music1.wav', cover: 'music.JPG' },
    { title: 'Chấp Niệm Trong Em Remix', artist: 'Phuong Linh', src: 'music2.wav', cover: 'music.JPG' },
  ],
  current: 0,
  repeat: false,
  muted: false,
  loaded: false,
};

const audio = qs('#audio');
const songTitle = qs('#songTitle');
const artistName = qs('#artistName');
const cover = qs('.music-cover');
const currentTimeEl = qs('#currentTime');
const durationEl = qs('#duration');
const progress = qs('#progress');
const playBtn = qs('#playBtn');
const prevBtn = qs('#prevBtn');
const nextBtn = qs('#nextBtn');
const repeatBtn = qs('#repeatBtn');
const volumeBtn = qs('#volumeBtn');
const trackButtons = qsa('.track');
const lightbox = qs('#lightbox');
const lightboxImage = qs('#lightboxImage');
const lightboxClose = qs('#lightboxClose');
const lightboxPrev = qs('#lightboxPrev');
const lightboxNext = qs('#lightboxNext');
const galleryButtons = qsa('.gallery-item');
const loadingScreen = qs('#loadingScreen');
const menuToggle = qs('#menuToggle');
const body = document.body;
const effectsLayer = qs('#effectsLayer');
const nav = qs('#siteNav');

function fmtTime(sec){
  if(!isFinite(sec) || sec < 0) return '00:00';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
}

function setProgressFill(range){
  if(!range) return;
  const val = Number(range.value || 0);
  range.style.setProperty('--p', `${val}%`);
}

function setTrackMeta(index){
  const track = state.tracks[index];
  songTitle.textContent = track.title;
  artistName.textContent = track.artist;
  cover.src = track.cover;
  trackButtons.forEach(btn => btn.classList.toggle('active', Number(btn.dataset.index) === index));
  document.title = `Phuong Linh Cutee | ${track.title}`;
}

function loadTrack(index, autoplay = false){
  state.current = (index + state.tracks.length) % state.tracks.length;
  const track = state.tracks[state.current];
  audio.src = track.src;
  audio.load();
  setTrackMeta(state.current);
  if(autoplay){
    audio.play().catch(() => {});
  }
}

function setPlaying(on){
  body.classList.toggle('is-playing', on);
}

function toggleMute(force){
  state.muted = typeof force === 'boolean' ? force : !state.muted;
  audio.muted = state.muted;
  body.classList.toggle('audio-muted', state.muted);
}

function playPause(){
  if(audio.paused){
    audio.play().catch(() => {});
  }else{
    audio.pause();
  }
}

function nextTrack(autoplay = true){
  loadTrack(state.current + 1, autoplay);
}

function prevTrack(autoplay = true){
  if(audio.currentTime > 4){
    audio.currentTime = 0;
    return;
  }
  loadTrack(state.current - 1, autoplay);
}

function updateTimes(){
  currentTimeEl.textContent = fmtTime(audio.currentTime);
  durationEl.textContent = fmtTime(audio.duration);
  const percent = audio.duration ? (audio.currentTime / audio.duration) * 100 : 0;
  progress.value = percent || 0;
  setProgressFill(progress);
}

function setLoadingDone(){
  body.classList.add('loaded');
  loadingScreen.setAttribute('aria-hidden','true');
}

function createParticle(type){
  const el = document.createElement('span');
  el.className = type;
  const left = Math.random() * 100;
  const dur = (type === 'particle' ? 5 + Math.random() * 5 : 8 + Math.random() * 6).toFixed(2);
  const delay = (-Math.random() * 12).toFixed(2);
  const size = type === 'particle' ? (2 + Math.random() * 4) : (10 + Math.random() * 7);
  el.style.left = `${left}%`;
  el.style.setProperty('--dur', `${dur}s`);
  el.style.animationDelay = `${delay}s`;
  el.style.width = `${size}px`;
  el.style.height = `${size}px`;
  if(type === 'petal'){
    el.style.opacity = (0.45 + Math.random() * 0.45).toFixed(2);
    el.style.setProperty('--x', `${(Math.random() * 140 - 70).toFixed(0)}px`);
  }
  if(type === 'heart'){
    el.style.fontSize = `${size}px`;
    el.style.opacity = (0.35 + Math.random() * 0.45).toFixed(2);
    el.style.setProperty('--x', `${(Math.random() * 120 - 60).toFixed(0)}px`);
  }
  return el;
}

function initEffects(){
  const counts = { particle: 14, petal: 14, heart: 10 };
  Object.entries(counts).forEach(([type, count]) => {
    for(let i=0;i<count;i++) effectsLayer.appendChild(createParticle(type));
  });

  // subtle floating sparkles across the viewport
  setInterval(() => {
    if (document.hidden) return;
    const types = ['particle','petal','heart'];
    const pick = types[Math.floor(Math.random()*types.length)];
    const el = createParticle(pick);
    effectsLayer.appendChild(el);
    setTimeout(() => el.remove(), pick === 'particle' ? 7000 : 12000);
  }, 2200);
}

function openLightbox(src, index){
  lightbox.classList.add('open');
  lightbox.setAttribute('aria-hidden','false');
  lightboxImage.src = src;
  lightbox.dataset.index = String(index);
  document.body.style.overflow = 'hidden';
}
function closeLightbox(){
  lightbox.classList.remove('open');
  lightbox.setAttribute('aria-hidden','true');
  lightboxImage.src = '';
  document.body.style.overflow = '';
}
function moveLightbox(delta){
  const imgs = galleryButtons.map(btn => btn.dataset.full);
  let idx = Number(lightbox.dataset.index || 0);
  idx = (idx + delta + imgs.length) % imgs.length;
  lightbox.dataset.index = String(idx);
  lightboxImage.src = imgs[idx];
}

galleryButtons.forEach((btn, idx) => {
  btn.addEventListener('click', () => openLightbox(btn.dataset.full, idx));
  btn.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openLightbox(btn.dataset.full, idx);
    }
  });
});

lightbox.addEventListener('click', (e) => {
  if (e.target === lightbox) closeLightbox();
});
lightboxClose.addEventListener('click', closeLightbox);
lightboxPrev.addEventListener('click', () => moveLightbox(-1));
lightboxNext.addEventListener('click', () => moveLightbox(1));
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeLightbox();
  if (!lightbox.classList.contains('open')) return;
  if (e.key === 'ArrowLeft') moveLightbox(-1);
  if (e.key === 'ArrowRight') moveLightbox(1);
});

// touch swipe
let touchStartX = 0;
lightbox.addEventListener('touchstart', (e) => {
  touchStartX = e.changedTouches[0].clientX;
}, {passive:true});
lightbox.addEventListener('touchend', (e) => {
  const dx = e.changedTouches[0].clientX - touchStartX;
  if (Math.abs(dx) > 45) moveLightbox(dx > 0 ? -1 : 1);
}, {passive:true});

// smooth menu close and navigation
qsa('a[href^="#"]').forEach(a => {
  a.addEventListener('click', () => {
    body.classList.remove('nav-open');
    menuToggle?.setAttribute('aria-expanded','false');
  });
});

if (menuToggle && nav){
  menuToggle.addEventListener('click', () => {
    body.classList.toggle('nav-open');
    const open = body.classList.contains('nav-open');
    menuToggle.setAttribute('aria-expanded', String(open));
    menuToggle.setAttribute('aria-label', open ? 'Đóng menu' : 'Mở menu');
  });
}

trackButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    loadTrack(Number(btn.dataset.index), true);
  });
});

audio.addEventListener('loadedmetadata', updateTimes);
audio.addEventListener('timeupdate', updateTimes);
audio.addEventListener('play', () => setPlaying(true));
audio.addEventListener('pause', () => setPlaying(false));
audio.addEventListener('ended', () => {
  if (state.repeat) {
    audio.currentTime = 0;
    audio.play().catch(() => {});
  } else {
    nextTrack(true);
  }
});

progress.addEventListener('input', () => {
  if (!audio.duration) return;
  const seek = (Number(progress.value) / 100) * audio.duration;
  audio.currentTime = seek;
  setProgressFill(progress);
});
progress.addEventListener('change', () => setProgressFill(progress));

playBtn.addEventListener('click', playPause);
prevBtn.addEventListener('click', () => prevTrack(true));
nextBtn.addEventListener('click', () => nextTrack(true));
repeatBtn.addEventListener('click', () => {
  state.repeat = !state.repeat;
  repeatBtn.style.background = state.repeat ? 'linear-gradient(135deg,#ff7fb4,#ffabc9)' : '';
  repeatBtn.style.color = state.repeat ? '#fff' : '';
});
volumeBtn.addEventListener('click', () => toggleMute());

audio.addEventListener('volumechange', () => {
  body.classList.toggle('audio-muted', audio.muted);
});

window.addEventListener('load', () => {
  initEffects();
  setTimeout(() => setLoadingDone(), 1900);
  setProgressFill(progress);
  loadTrack(0, false);
  toggleMute(false);
});

document.addEventListener('visibilitychange', () => {
  if (document.hidden) audio.pause();
});
