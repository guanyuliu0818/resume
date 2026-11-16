/* 轻量交互：移动导航、Follow 折叠、滚动高亮、语言切换保留锚点、回到顶部 */
(function () {
  'use strict';

  /* 语言切换时把当前锚点带到另一份页面，避免跳回顶部 */
  document.querySelectorAll('[data-langlink]').forEach(function (a) {
    a.addEventListener('click', function () {
      if (window.location.hash && a.getAttribute('href').indexOf('#') === -1) {
        a.href = a.getAttribute('href') + window.location.hash;
      }
    });
  });

  /* 移动端导航 */
  var toggle = document.getElementById('nav-toggle') || document.querySelector('.nav-toggle');
  var links = document.getElementById('nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', function () {
      var open = links.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(open));
    });
    links.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        links.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && links.classList.contains('is-open')) {
        links.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.focus();
      }
    });
  }

  /* 侧栏 Follow 折叠 */
  var follow = document.getElementById('follow-toggle');
  var urls = document.getElementById('author-links');
  if (follow && urls) {
    follow.addEventListener('click', function () {
      var collapsed = urls.classList.toggle('is-collapsed');
      follow.setAttribute('aria-expanded', String(!collapsed));
    });
  }

  /* 滚动高亮当前板块 */
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('#nav-links a[href^="#"]'));
  var sections = navLinks
    .map(function (a) { return document.getElementById(a.getAttribute('href').slice(1)); })
    .filter(Boolean);

  function setActive(id) {
    navLinks.forEach(function (a) {
      a.classList.toggle('is-active', a.getAttribute('href') === '#' + id);
    });
  }
  if ('IntersectionObserver' in window && sections.length) {
    var visible = {};
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        visible[entry.target.id] = entry.isIntersecting ? entry.boundingClientRect.top : Infinity;
      });
      var best = null, top = Infinity;
      Object.keys(visible).forEach(function (id) {
        if (visible[id] < top) { top = visible[id]; best = id; }
      });
      if (best && top !== Infinity) setActive(best);
    }, { rootMargin: '-15% 0px -70% 0px', threshold: 0 });
    sections.forEach(function (s) { observer.observe(s); });
  }

  /* 回到顶部 */
  var toTop = document.querySelector('.to-top');
  var topTargets = document.querySelectorAll('[data-top]');
  function scrollTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  topTargets.forEach(function (el) {
    el.addEventListener('click', function (e) { e.preventDefault(); scrollTop(); });
  });
  if (toTop) {
    toTop.addEventListener('click', scrollTop);
    var ticking = false;
    window.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(function () {
        toTop.classList.toggle('is-visible', window.pageYOffset > 420);
        ticking = false;
      });
    }, { passive: true });
    toTop.classList.toggle('is-visible', window.pageYOffset > 420);
  }
})();
