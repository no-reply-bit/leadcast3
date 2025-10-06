/* ==========================================================================
   LEAD CAST – app.js（完全版：スクロールでふわっと＋既存機能）
   ========================================================================== */

console.log("app.js loaded ✅");
document.documentElement.classList.add('js-enabled'); // JS有効時だけ初期透明を適用

(() => {
  const $  = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  /* -------------------- 1) 年号 -------------------- */
  const yearEl = $('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* -------------------- 2) ヘッダーの表示制御（下スクロールで隠す） -------------------- */
  const header = $('.site-header');
  let lastY = window.scrollY;
  const HIDE_THRESHOLD = 240;

  const onScroll = () => {
    const y = window.scrollY;
    if (y < HIDE_THRESHOLD || y < lastY) header?.classList.remove('is-hidden');
    else header?.classList.add('is-hidden');
    lastY = y;
  };
  window.addEventListener('scroll', onScroll, { passive: true });

  /* -------------------- 3) モバイル ナビ開閉 -------------------- */
  const navToggle = $('.nav-toggle');
  const gnav = $('#gnav');

  const closeNav = () => {
    if (!navToggle || !gnav) return;
    gnav.classList.remove('is-open');
    document.body.classList.remove('no-scroll');  
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.setAttribute('aria-label', 'メニューを開く');
  };
  const openNav = () => {
    if (!navToggle || !gnav) return;
    gnav.classList.add('is-open');
    document.body.classList.add('no-scroll');
    navToggle.setAttribute('aria-expanded', 'true');
    navToggle.setAttribute('aria-label', 'メニューを閉じる');
  };

  navToggle?.addEventListener('click', () => {
    if (gnav?.classList.contains('is-open')) closeNav();
    else openNav();
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeNav(); });
  document.addEventListener('click', (e) => {
    if (!gnav || !navToggle) return;
    const inside = gnav.contains(e.target) || navToggle.contains(e.target);
    if (!inside) closeNav();
  });

  /* -------------------- 4) スムーススクロール -------------------- */
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  $$('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (!id || id === '#') return;
      const target = document.querySelector(id);
      if (!target) return;

      e.preventDefault();
      closeNav();

      const headerH = header ? header.getBoundingClientRect().height : 0;
      const top = Math.max(0, target.getBoundingClientRect().top + window.pageYOffset - headerH - 8);
      window.scrollTo({ top, behavior: prefersReduced ? 'auto' : 'smooth' });
    });
  });

  /* -------------------- 5) Team 横スクロール（ホイール横流し） -------------------- */
  const track = $('.team__track');
  if (track) {
    track.addEventListener('wheel', (e) => {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        track.scrollLeft += e.deltaY;
        e.preventDefault();
      }
    }, { passive: false });

    track.addEventListener('keydown', (e) => {
      const step = track.clientWidth * 0.9;
      if (e.key === 'ArrowRight') { track.scrollBy({ left: step,  behavior: 'smooth' }); e.preventDefault(); }
      if (e.key === 'ArrowLeft')  { track.scrollBy({ left: -step, behavior: 'smooth' }); e.preventDefault(); }
    });
  }

  /* -------------------- 6) about動画の自動再生/一時停止 -------------------- */
  const autoVideo = $('.about__video');
  if (autoVideo && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((ent) => { if (ent.isIntersecting) autoVideo.play?.(); else autoVideo.pause?.(); });
    }, { threshold: 0.25 });
    io.observe(autoVideo);
  }

  /* -------------------- 7) スクロールで“ふわっ”表示（.fade-up を監視） -------------------- */

  // 段階表示：親[data-stagger] の子に --i を自動付与
  document.querySelectorAll('[data-stagger]').forEach(parent => {
    Array.from(parent.children).forEach((child, i) => child.style.setProperty('--i', i));
  });

  // IntersectionObserver（かなり緩め＝確実に発火）
  const fadeObserver = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      obs.unobserve(entry.target); // 一度表示したら監視解除
    });
  }, {
    root: null,
    rootMargin: '0px 0px -20% 0px', // 画面下に来る少し前に発火
    threshold: 0.06                 // 6%見えたら発火
  });

  // 監視開始：.fade-up 全部
  document.querySelectorAll('.fade-up:not(#gnav)').forEach((el) => fadeObserver.observe(el));

  // 初回ロード時、既に画面内の要素は即表示
  window.addEventListener('load', () => {
    const vh = window.innerHeight || document.documentElement.clientHeight;
    document.querySelectorAll('.fade-up:not(#gnav)').forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.top < vh * 0.92) el.classList.add('is-visible');
    });
  });

  /* -------------------- 8) 画像ふわふわ（上下アニメ） -------------------- */
  function floatImage(selector, speed = 4000, distance = 16) {
    const el = document.querySelector(selector);
    if (!el) return;
    let direction = 1;
    setInterval(() => {
      el.style.transform = `translateY(${direction * distance}px)`;
      el.style.transition = `transform ${speed / 1000}s ease-in-out`;
      direction *= -1;
    }, speed);
  }
  floatImage("img[src*='illust_08.png']", 4200, 14);
  floatImage("img[src*='illust_04.png']", 4600, 18);
})();







// 先頭付近で参照している navToggle / gnav は既存のままでOK

// ① オーバーレイを用意（1回だけ作る）
let navOverlay = document.getElementById('nav-overlay');
if (!navOverlay) {
  navOverlay = document.createElement('div');
  navOverlay.id = 'nav-overlay';
  document.body.appendChild(navOverlay);
  navOverlay.addEventListener('click', () => closeNav());
}

const closeNav = () => {
  if (!navToggle || !gnav) return;
  gnav.classList.remove('is-open');
  document.body.classList.remove('no-scroll');
  if (navOverlay) navOverlay.classList.remove('show');

  navToggle.setAttribute('aria-expanded', 'false');
  navToggle.setAttribute('aria-label', 'メニューを開く');
};

const openNav = () => {
  if (!navToggle || !gnav) return;
  gnav.classList.add('is-open');
  document.body.classList.add('no-scroll');
  if (navOverlay) navOverlay.classList.add('show');

  navToggle.setAttribute('aria-expanded', 'true');
  navToggle.setAttribute('aria-label', 'メニューを閉じる');
};

// 既存のクリック/ESCハンドラはそのまま利用（toggleしている箇所も既存でOK）
