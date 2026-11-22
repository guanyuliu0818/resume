/* 访问量统计：busuanzi 开源公共服务，按北京时间日期分虚拟路径计数。
 * - 每次页面文档加载只上报一次（锚点跳转、筛选不会重复计数）
 * - page_pv = 当天虚拟路径访问量；site_pv = 站点累计访问量
 * - 失败时保留 "—"，不显示假的 0；失败不重试，避免重复计数
 * - 只发送规范域名与日期，不发送搜索词、查询参数或来源页面
 */
(function () {
  'use strict';

  var API = 'https://busuanzi.9420.ltd/api';
  var BASE = 'https://guanyuliu0818.github.io/resume/__visits/';

  function beijingDate() {
    var d = new Date(Date.now() + 8 * 60 * 60 * 1000);
    return d.toISOString().slice(0, 10);
  }

  function put(key, value) {
    var el = document.querySelector('[data-visit="' + key + '"]');
    if (el) el.textContent = value;
  }

  function fmt(n) {
    try { return Number(n).toLocaleString('zh-CN'); } catch (e) { return String(n); }
  }

  function send() {
    if (!window.fetch) return;
    fetch(API, {
      method: 'POST',
      headers: { 'x-bsz-referer': BASE + beijingDate() },
      body: '',
      keepalive: true
    }).then(function (r) {
      return r.ok ? r.json() : null;
    }).then(function (res) {
      if (!res || !res.success || !res.data) return;
      put('today', fmt(res.data.page_pv));
      put('total', fmt(res.data.site_pv));
    }).catch(function () {
      /* 网络失败保持 "—"，不重试：请求可能已计入，重试会重复计数 */
    });
  }

  send();
})();
