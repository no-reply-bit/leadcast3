/* ==========================================================================
   LEAD CAST – app.js（完全版：フェード強化＆ふわふわ）
   ========================================================================== */

console.log("app.js loaded ✅");
document.documentElement.classList.add('js-enabled');

(() => {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  /* -------------------- 1) 年号 -------------------- */
  const yearEl = $('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* -------------------- 2) ヘッダーの表示制御 -------------------- */
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
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.setAttribute('aria-label', 'メニューを開く');
  };
  const openNav = () => {
    if (!navToggle || !gnav) return;
    gnav.classList.add('is-open');
    navToggle.setAttribute('aria-expanded', 'true');
    navToggle.setAttribute('aria-label', 'メニューを閉じる');
  };

  navToggle?.addEventListener('click', () => {
    if (gnav?.classList.contains('is-open')) closeNav();
    else openNav();
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeNav(); });
  document.addEventListener('click', e => {
    if (!gnav || !navToggle) return;
    const inside = gnav.contains(e.target) || navToggle.contains(e.target);
    if (!inside) closeNav();
  });

  /* -------------------- 4) スムーススクロール -------------------- */
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  $$('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
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

  /* -------------------- 5) Team 横スクロール -------------------- */
  const track = $('.team__track');
  if (track) {
    track.addEventListener('wheel', e => {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        track.scrollLeft += e.deltaY;
        e.preventDefault();
      }
    }, { passive: false });
    track.addEventListener('keydown', e => {
      const step = track.clientWidth * 0.9;
      if (e.key === 'ArrowRight') { track.scrollBy({ left: step, behavior: 'smooth' }); e.preventDefault(); }
      if (e.key === 'ArrowLeft')  { track.scrollBy({ left: -step, behavior: 'smooth' }); e.preventDefault(); }
    });
  }

  /* -------------------- 6) 自動再生ビデオ制御 -------------------- */
  const autoVideo = $('.about__video');
  if (autoVideo && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(ent => { if (ent.isIntersecting) autoVideo.play?.(); else autoVideo.pause?.(); });
    }, { threshold: 0.25 });
    io.observe(autoVideo);
  }

  /* -------------------- 7) フェードイン（.fade-up を厳密監視） -------------------- */
// 親[data-stagger]の子に --i を付与（そのままでOK）
document.querySelectorAll('[data-stagger]').forEach(parent => {
  Array.from(parent.children).forEach((child, i) => child.style.setProperty('--i', i));
});

// Observer: かなり緩め（=必ず発火）
const fadeObserver = new IntersectionObserver((entries, obs) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      obs.unobserve(entry.target);
    }
  });
}, {
  root: null,
  rootMargin: '0px 0px -20% 0px', // 下側を早めに
  threshold: 0.01                  // 1%出たら発火
});

// 監視開始（.fade-up 全部）
document.querySelectorAll('.fade-up').forEach(el => fadeObserver.observe(el));

// 初期キック：初回ロード時に画面内の要素へ即付与
window.addEventListener('load', () => {
  const vh = window.innerHeight || document.documentElement.clientHeight;
  document.querySelectorAll('.fade-up').forEach(el => {
    const r = el.getBoundingClientRect();
    if (r.top < vh * 0.9) el.classList.add('is-visible');
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
