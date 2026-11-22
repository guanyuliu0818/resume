/* 访问量统计：按北京时间日期分虚拟路径计数。
 * - 结果缓存到 localStorage：再次打开页面时数字秒显，不再等待接口
 * - 每次页面文档加载只上报一次（锚点跳转、筛选不会重复计数）
 * - page_pv = 当天虚拟路径访问量；site_pv = 站点累计访问量
 * - 接口超时自动兜底为缓存值，避免一直显示占位符
 * - 只发送规范域名与日期，不发送搜索词、查询参数或来源页面
 */
(function () {
  'use strict';

  var API = 'https://busuanzi.9420.ltd/api';
  var BASE = 'https://guanyuliu0818.github.io/resume/__visits/';
  var CACHE_KEY = 'gy-resume-visits-v1';
  var TIMEOUT = 4000;

  function beijingDate() {
    return new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString().slice(0, 10);
  }

  function fmt(n) {
    try { return Number(n).toLocaleString('zh-CN'); } catch (e) { return String(n); }
  }

  function put(key, value) {
    var el = document.querySelector('[data-visit="' + key + '"]');
    if (el && value !== null && value !== undefined && isFinite(Number(value))) {
      el.textContent = fmt(value);
    }
  }

  function readCache() {
    try {
      var raw = localStorage.getItem(CACHE_KEY);
      if (!raw) return null;
      var c = JSON.parse(raw);
      return (c && isFinite(Number(c.total))) ? c : null;
    } catch (e) { return null; }
  }

  function writeCache(c) {
    try { localStorage.setItem(CACHE_KEY, JSON.stringify(c)); } catch (e) {}
  }

  // 1) 先用缓存立即显示，消除等待感
  var cached = readCache();
  if (cached) {
    put('total', cached.total);
    put('today', cached.date === beijingDate() ? cached.today : null);
  }

  // 2) 后台上报并刷新缓存
  if (!window.fetch) return;
  var controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
  var timer = controller ? setTimeout(function () { controller.abort(); }, TIMEOUT) : null;

  fetch(API, {
    method: 'POST',
    headers: { 'x-bsz-referer': BASE + beijingDate() },
    body: '',
    keepalive: true,
    signal: controller ? controller.signal : undefined
  }).then(function (r) {
    return r.ok ? r.json() : null;
  }).then(function (res) {
    if (timer) clearTimeout(timer);
    if (!res || !res.success || !res.data) return;
    var t = Number(res.data.page_pv);
    var s = Number(res.data.site_pv);
    if (isFinite(t)) put('today', t);
    if (isFinite(s)) put('total', s);
    writeCache({
      date: beijingDate(),
      today: isFinite(t) ? t : (cached ? cached.today : null),
      total: isFinite(s) ? s : (cached ? cached.total : null)
    });
  }).catch(function () {
    if (timer) clearTimeout(timer);
    // 超时或失败：保留缓存值，不重试（请求可能已计数，重试会重复计数）
  });
})();
