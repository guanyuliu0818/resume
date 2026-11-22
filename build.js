/* build.js — 由 content.json 生成中英文两套完整静态页面
 * 用法： node build.js [--base=https://你的网址]  临时用某网址生成
 *        node build.js --set-base=https://你的网址  把网址写进 content.json 并生成
 *       网址也可手动固化在 content.json 的 site.canonicalBase
 * 产物： index.html（中文）、en.html（英文）
 *       配置网址后额外生成 sitemap.xml、robots.txt，并输出绝对 canonical / hreflang
 */
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const CONTENT = path.join(ROOT, 'content.json');
const data = JSON.parse(fs.readFileSync(CONTENT, 'utf8'));

// 证件照原图 jpg → 纯文本 SVG（内嵌 base64）。这样整站没有二进制文件，
// 只支持纯文本的发布通道（如 GitHub 连接器）也能一次性上传完整站点。
const AVATAR_JPG = path.join(ROOT, 'assets', 'avatar.jpg');
const AVATAR_SVG = path.join(ROOT, 'assets', 'avatar.svg');
if (fs.existsSync(AVATAR_JPG)) {
  const buf = fs.readFileSync(AVATAR_JPG);
  let w = 420, h = 420;
  for (let i = 2; i < buf.length - 9;) {
    if (buf[i] !== 0xFF) { i++; continue; }
    const m = buf[i + 1];
    if (m >= 0xC0 && m <= 0xCF && m !== 0xC4 && m !== 0xC8 && m !== 0xCC) {
      h = buf.readUInt16BE(i + 5); w = buf.readUInt16BE(i + 7); break;
    }
    i += 2 + buf.readUInt16BE(i + 2);
  }
  const href = `data:image/jpeg;base64,${buf.toString('base64')}`;
  fs.writeFileSync(AVATAR_SVG,
    `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><image width="${w}" height="${h}" href="${href}" xlink:href="${href}"/></svg>\n`, 'utf8');
  console.log(`✓ 已由 assets/avatar.jpg 生成纯文本 assets/avatar.svg（${w}×${h}）`);
}

// --set-base=URL：把最终网址固化进 content.json，之后每次直接 node build.js 即可
const setBase = (process.argv.find(a => a.startsWith('--set-base=')) || '').slice('--set-base='.length);
if (setBase) {
  data.site.canonicalBase = setBase.replace(/\/+$/, '');
  fs.writeFileSync(CONTENT, JSON.stringify(data, null, 2) + '\n', 'utf8');
  console.log(`✓ 已把 site.canonicalBase 固化为 ${data.site.canonicalBase}`);
}

// 站点最终网址：命令行 --base=https://... 优先，其次 content.json 的 site.canonicalBase。
// 未配置时只输出相对 hreflang，不生成 sitemap / robots / canonical（避免写出错误绝对地址）。
const argBase = (process.argv.find(a => a.startsWith('--base=')) || '').slice('--base='.length);
const SITE_BASE = String(argBase || data.site.canonicalBase || '').replace(/\/+$/, '');
const ABS = rel => SITE_BASE ? `${SITE_BASE}/${String(rel).replace(/^\/+/, '')}` : '';
const ZH_URL = SITE_BASE ? `${SITE_BASE}/` : 'index.html';
const EN_URL = SITE_BASE ? `${SITE_BASE}/en.html` : 'en.html';

const esc = s => String(s ?? '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;');

/** 轻量行内标记： [[待补充]] / **加粗** / *斜体* / [文字](链接) */
function inline(raw) {
  if (!raw) return '';
  const todos = [];
  let s = String(raw).replace(/\[\[([\s\S]*?)\]\]/g, (_, t) => {
    todos.push(`<span class="todo" title="待补充 / to be filled in">${esc(t)}</span>`);
    return `\u0001${todos.length - 1}\u0001`;
  });
  s = esc(s);
  s = s.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (m, label, url) => {
    const external = /^https?:\/\//i.test(url);
    const attr = external ? ' target="_blank" rel="noopener noreferrer"' : '';
    return `<a class="inline-link" href="${url}"${attr}>${label}</a>`;
  });
  s = s.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  s = s.replace(/(^|[^*])\*([^*\n]+?)\*(?!\*)/g, '$1<em>$2</em>');
  s = s.replace(/\\\*/g, '*');
  s = s.replace(/\u0001(\d+)\u0001/g, (_, i) => todos[Number(i)]);
  return s;
}

const L = (obj, lang) => inline(typeof obj === 'object' && obj !== null && !Array.isArray(obj)
  ? (obj[lang] ?? obj.zh ?? '') : (obj ?? ''));

const ICONS = {
  scholar: '<path d="M22 10 12 5 2 10l10 5 10-5Z"/><path d="M6 12v4.5c0 1.3 2.7 2.5 6 2.5s6-1.2 6-2.5V12"/><path d="M22 10v6"/>',
  orcid: '<circle cx="12" cy="12" r="9.5"/><text x="12" y="15.5" text-anchor="middle" font-size="9" font-weight="700" fill="currentColor" stroke="none">iD</text>',
  researchgate: '<circle cx="12" cy="12" r="9.5"/><text x="12" y="15.5" text-anchor="middle" font-size="9" font-weight="700" fill="currentColor" stroke="none">RG</text>',
  cv: '<path d="M14 2.5H6.5a2 2 0 0 0-2 2v15a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V8Z"/><path d="M14 2.5V8h5.5"/><path d="M8.5 13h7M8.5 17h5"/>',
  mail: '<rect x="2.5" y="5" width="19" height="14" rx="2"/><path d="m3 6.5 9 6 9-6"/>',
  github: '<path d="M9 19c-4 1.5-4-2.5-6-3m12 6v-3.9a3.4 3.4 0 0 0-1-2.6c3.3-.4 6.8-1.6 6.8-7.3A5.7 5.7 0 0 0 19.2 4a5.3 5.3 0 0 0-.1-4s-1.2-.4-4 1.5a13.4 13.4 0 0 0-7 0C5.3-.4 4.1 0 4.1 0A5.3 5.3 0 0 0 4 4a5.7 5.7 0 0 0-1.5 4.1c0 5.7 3.5 6.9 6.8 7.3a3.4 3.4 0 0 0-1 2.6V22"/>'
};
const icon = name => `<svg class="side-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name] || ICONS.cv}</svg>`;

function renderSidebar(lang) {
  // 未填 url 的链接直接不渲染，避免公开页面上出现灰色「待补充」占位
  const links = data.sidebarLinks.filter(item => item.url).map(item => {
    const label = L(item.label, lang);
    const content = `${icon(item.icon)}<span>${label}</span>`;
    const external = /^https?:\/\//i.test(item.url);
    return `<li><a href="${esc(item.url)}"${external ? ' target="_blank" rel="noopener noreferrer"' : ''}>${content}</a></li>`;
  }).join('\n            ');

  return `        <div class="sidebar sticky" itemscope itemtype="https://schema.org/Person">
          <div class="author__avatar">
            <img src="${esc(data.site.avatar)}" alt="${esc(data.site.avatarAlt[lang])}" itemprop="image">
          </div>
          <div class="author__content">
            <h3 class="author__name" itemprop="name">${L(data.site.sidebarName, lang)}</h3>
            <p class="author__bio">${L(data.site.sidebarBio, lang)}</p>
            <p class="author__email">${L(data.site.sidebarEmailLabel, lang)}</p>
          </div>
          <div class="author__urls-wrapper">
            <button class="btn btn--inverse" type="button" id="follow-toggle" aria-expanded="true" aria-controls="author-links">${L(data.labels.follow, lang)}</button>
            <ul class="author__urls social-icons" id="author-links">
              ${links}
            </ul>
          </div>
          <div class="site-visits" id="site-visits" title="${esc(L(data.labels.visitHint, lang))}">
            <div class="site-visits__item">
              <span class="site-visits__num" data-visit="today">—</span>
              <span class="site-visits__label">${esc(L(data.labels.visitToday, lang))}</span>
            </div>
            <span class="site-visits__sep" aria-hidden="true"></span>
            <div class="site-visits__item">
              <span class="site-visits__num" data-visit="total">—</span>
              <span class="site-visits__label">${esc(L(data.labels.visitTotal, lang))}</span>
            </div>
          </div>
        </div>`;
}

function renderEntry(e, lang) {
  const sep = lang === 'zh' ? '，' : ', ';
  // 工作经历等「单条职位 + 普通要点」排版：只有第一行加粗，后续要点不加粗
  if (e.bullets && e.bullets.length) {
    const headBody = e.orgBreak
      ? `${L(e.role, lang)}<span class="entry__org">${L(e.org, lang)}</span>`
      : `${L(e.role, lang)}<span class="entry__sep">${sep}</span>${L(e.org, lang)}`;
    return `          <div class="entry entry--work">
            <div class="entry__head entry__head--work">
              <span class="entry__headline">${headBody}</span>
              <em class="entry__date">${L(e.date, lang)}</em>
            </div>
            <ul class="entry__bullets">
              ${e.bullets.map(b => `<li>${L(b, lang)}</li>`).join('\n              ')}
            </ul>
          </div>`;
  }
  return `          <div class="entry">
            <div class="entry__head">${L(e.role, lang)}<span class="entry__sep">${sep}</span>${L(e.org, lang)}</div>
            <div class="entry__meta"><span class="entry__detail">${L(e.detail, lang)}</span><em class="entry__date">${L(e.date, lang)}</em></div>
          </div>`;
}

function renderPaper(p, lang) {
  const links = (p.links || []).filter(l => l.url).map(l => {
    const label = typeof l.label === 'object' ? (l.label[lang] ?? l.label.zh) : l.label;
    return `<a href="${esc(l.url)}" target="_blank" rel="noopener noreferrer">[${esc(label)}]</a>`;
  }).join(' ');
  // 影响因子 / 中科院分区
  const m = p.metrics || {};
  const metricBits = [];
  if (m.if) metricBits.push(`<span class="metric metric--if" title="Impact Factor">IF ${esc(m.if)}</span>`);
  if (m.tier) metricBits.push(`<span class="metric metric--tier">${L(m.tier, lang)}</span>`);
  const media = (p.media || []).map(x => `<span class="media-chip">${L(x, lang)}</span>`).join('');
  const mediaExtra = p.mediaExtra ? `<span class="media-note">${L(p.mediaExtra, lang)}</span>` : '';
  const noteLabel = p.note ? `<span class="paper__label">${L(data.labels.paperNote, lang)}</span>` : '';
  const mediaLabel = (media || mediaExtra) ? `<span class="paper__label">${L(data.labels.paperMedia, lang)}</span>` : '';
  return `          <div class="paper">
            <div class="paper__line">
              <span class="badge badge--${esc(p.tone || 'blue')}"><span class="badge__key">${L(p.badge, lang)}</span><span class="badge__val">${L(p.badgeValue, lang)}</span></span>
              <span class="paper__title">${L(p.title, lang)}</span>
            </div>
            <div class="paper__authors">${L(p.authors, lang)}</div>
            ${metricBits.length ? `<div class="paper__meta">${metricBits.join('')}</div>` : ''}
            ${p.note ? `<div class="paper__note">${noteLabel}${L(p.note, lang)}</div>` : ''}
            ${(media || mediaExtra) ? `<div class="paper__media">${mediaLabel}${media}${mediaExtra}</div>` : ''}
            ${links ? `<div class="paper__links">${links}</div>` : ''}
          </div>`;
}

// 媒体报道条目下的原文链接（可多条）
function pressLinks(it, lang) {
  const list = (it.links || []).filter(l => l.url);
  if (!list.length) return '';
  const anchors = list.map(l => {
    const label = typeof l.label === 'object' ? (l.label[lang] ?? l.label.zh) : l.label;
    return `<a class="press__link" href="${esc(l.url)}" target="_blank" rel="noopener noreferrer">${esc(label)}</a>`;
  }).join('');
  return `\n              <div class="press__links">${anchors}</div>`;
}

const groupTitle = (g, lang) => `<h3 class="group-title"><span class="group-title__bar"></span>${L(g.title, lang)}</h3>`;
function renderSection(section, lang, index, total) {
  let body = '';
  if (section.type === 'paragraphs') {
    body = section.paragraphs.map(p => `<p>${L(p, lang)}</p>`).join('\n          ');
    if (section.tags && section.tags.length) {
      const label = data.labels.researchAreas ? L(data.labels.researchAreas, lang) : '';
      body += `\n          <ul class="tag-row" aria-label="${esc(label)}">
            ${label ? `<li class="tag-row__label">${label}</li>` : ''}
            ${section.tags.map(t => `<li>${L(t, lang)}</li>`).join('\n            ')}
          </ul>`;
    }
  } else if (section.type === 'press') {
    const pressItem = it => `<li class="press__item">
              <div class="press__head"><span class="press__source">${L(it.source, lang)}</span>${it.tag ? `<span class="press__tag">${L(it.tag, lang)}</span>` : ''}</div>
              <p class="press__desc">${L(it.desc, lang)}</p>${pressLinks(it, lang)}
            </li>`;
    const pressList = list => `<ul class="press">
            ${list.map(pressItem).join('\n            ')}
          </ul>`;
    // 支持两种写法：扁平 items，或按主题分组的 groups（每组含 title / note / items）
    const pressGroups = section.groups || [{ items: section.items || [] }];
    body = [
      section.intro ? `<p class="papers__note">${L(section.intro, lang)}</p>` : '',
      pressGroups.map(g => `<div class="press-group">
          ${g.title ? `<h3 class="press-group__title"><span class="press-group__num">${esc(g.num || '')}</span>${L(g.title, lang)}</h3>` : ''}
          ${g.note ? `<p class="press-group__note">${L(g.note, lang)}</p>` : ''}
          ${pressList(g.items)}
        </div>`).join('\n          ')
    ].filter(Boolean).join('\n          ');
  } else if (section.type === 'entries') {
    body = section.entries.map(e => renderEntry(e, lang)).join('\n          ');
  } else if (section.type === 'groups') {
    body = section.groups.map(g => `          <div class="entry-group">
            ${groupTitle(g, lang)}
            ${g.entries.map(e => renderEntry(e, lang)).join('\n            ')}
          </div>`).join('\n          ');
  } else if (section.type === 'groups-list') {
    body = section.groups.map(g => `          <div class="entry-group">
            ${groupTitle(g, lang)}
            <ul class="content-list content-list--tight">
              ${g.items.map(i => `<li>${L(i, lang)}</li>`).join('\n              ')}
            </ul>
          </div>`).join('\n          ');
  } else if (section.type === 'list') {
    body = `<ul class="content-list">\n            ${section.items.map(i => `<li>${L(i, lang)}</li>`).join('\n            ')}\n          </ul>`;
  } else if (section.type === 'definitions') {
    body = `<dl class="def-list">\n            ${section.items.map(i => `<div class="def-row"><dt>${L(i.key, lang)}</dt><dd>${L(i.value, lang)}</dd></div>`).join('\n            ')}\n          </dl>`;
  } else if (section.type === 'papers') {
    const paperGroups = section.groups
      ? section.groups.map(g => `          <div class="paper-group">
            ${groupTitle(g, lang)}
            ${g.papers.map(p => renderPaper(p, lang)).join('\n            ')}
          </div>`).join('\n          ')
      : (section.papers || []).map(p => renderPaper(p, lang)).join('\n          ');
    body = [
      section.note ? `<p class="papers__note">${L(section.note, lang)}</p>` : '',
      paperGroups,
      section.footnote ? `<p class="papers__footnote">${L(section.footnote, lang)}</p>` : ''
    ].filter(Boolean).join('\n          ');
  }

  const divider = index < total - 1 ? '\n        <hr class="section-divider">' : '';
  return `        <section class="content-section" id="${esc(section.id)}">
          <h2 class="section-title"><span class="section-emoji" aria-hidden="true">${section.emoji}</span>${L(section.title, lang)}<a class="section-anchor" href="#${esc(section.id)}" aria-label="Link to this section">#</a></h2>
          <div class="section-body">
          ${body}
          </div>
        </section>${divider}`;
}

function renderNav(lang) {
  return data.nav.map(n =>
    `<li class="masthead__menu-item"><a href="#${esc(n.id)}">${L(n.label, lang)}</a></li>`
  ).join('\n              ');
}

function render(lang) {
  const other = data.labels.otherLangFile[lang];
  // 结构化数据用纯文本，不走行内标记解析，避免 & 被转成 HTML 实体
  const T = o => (o && typeof o === 'object' ? (o[lang] ?? o.zh ?? '') : (o ?? ''));
  const desc = T(data.site.seoDescription) || `${T(data.site.brand)} — ${T(data.site.sidebarBio)}`;
  const canonical = lang === 'zh' ? ZH_URL : EN_URL;
  const imageUrl = ABS(data.site.ogImage || data.site.avatar);
  const imageAlt = T(data.site.ogImageAlt) || T(data.site.avatarAlt) || T(data.site.brand);
  const absTags = SITE_BASE ? `
<link rel="canonical" href="${esc(canonical)}">
<meta property="og:url" content="${esc(canonical)}">
<meta property="og:image" content="${esc(imageUrl)}">
<meta property="og:image:secure_url" content="${esc(imageUrl)}">
<meta property="og:image:type" content="image/png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="${esc(imageAlt)}">
<meta name="twitter:image" content="${esc(imageUrl)}">
<meta name="twitter:image:alt" content="${esc(imageAlt)}">` : '';
  const mailLink = (data.sidebarLinks.find(l => l.icon === 'mail') || {}).url || '';
  const sameAs = data.sidebarLinks.filter(l => /^https?:\/\//i.test(l.url || '')).map(l => l.url);
  // 教育经历 → alumniOf（去掉行内加粗标记）
  const eduEntries = (data.sections.find(s => s.id === 'education') || {}).entries || [];
  const alumni = [...new Set(eduEntries
    .map(e => String(T(e.org) || '').replace(/\*\*/g, '').replace(/\s+/g, ' ').trim())
    .filter(Boolean))];
  const personId = (SITE_BASE ? canonical : '') + '#person';
  const orcid = sameAs.find(u => /orcid\.org/i.test(u));
  const jsonld = {
    '@context': 'https://schema.org', '@type': 'Person', '@id': personId,
    'name': T(data.site.pageTitle),
    'alternateName': T(data.site.alternateName),
    'description': desc,
    'jobTitle': T(data.site.jobTitle),
    'affiliation': { '@type': 'Organization', 'name': T(data.site.affiliation) },
    'worksFor': { '@type': 'Organization', 'name': T(data.site.affiliation) },
    'alumniOf': alumni.map(n => ({ '@type': 'CollegeOrUniversity', 'name': n })),
    'knowsAbout': data.site.knowsAbout || [],
    'sameAs': sameAs,
    'hasCredential': {
      '@type': 'EducationalOccupationalCredential',
      'credentialCategory': lang === 'zh' ? '博士学位' : 'Ph.D.',
      'educationalLevel': lang === 'zh' ? '博士' : 'Doctoral',
      'about': lang === 'zh' ? '大气物理学与大气环境' : 'Atmospheric Physics and Atmospheric Environment',
      'recognizedBy': { '@type': 'CollegeOrUniversity', 'name': lang === 'zh' ? '北京大学' : 'Peking University' }
    }
  };
  if (orcid) jsonld.identifier = orcid;
  if (mailLink) jsonld.email = mailLink;
  if (SITE_BASE) {
    jsonld.url = canonical;
    jsonld.image = imageUrl;
    jsonld.mainEntityOfPage = { '@id': canonical + '#webpage' };
  }
  const schemaAwards = data.site.schemaAwards ? data.site.schemaAwards[lang] || data.site.schemaAwards.zh : null;
  if (schemaAwards && schemaAwards.length) jsonld.award = schemaAwards;

  // 全部论文 → ScholarlyArticle 列表，帮助搜索引擎理解研究主题与成果
  const allPapers = [];
  for (const s of data.sections) {
    if (s.type !== 'papers') continue;
    if (s.groups) s.groups.forEach(g => (g.papers || []).forEach(p => allPapers.push(p)));
    else (s.papers || []).forEach(p => allPapers.push(p));
  }
  const worksJson = allPapers.length ? {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    'name': lang === 'zh' ? '论文成果' : 'Publications',
    'numberOfItems': allPapers.length,
    'itemListElement': allPapers.map((p, i) => {
      const item = {
        '@type': 'ScholarlyArticle',
        'position': i + 1,
        'name': T(p.title),
        'headline': T(p.title),
        'author': { '@type': 'Person', '@id': personId, 'name': T(data.site.pageTitle) },
        'isPartOf': { '@type': 'Periodical', 'name': String(T(p.badge)).replace(/\s+/g, ' ') }
      };
      const yr = String(T(p.badgeValue)).match(/\d{4}/);
      if (yr) item.datePublished = yr[0];
      if (p.note) item.abstract = T(p.note);
      const doi = (p.links || []).find(l => /doi\.org/i.test(l.url || ''));
      if (doi) { item.identifier = doi.url; item.url = doi.url; item.sameAs = doi.url; }
      if (p.metrics && p.metrics.if) {
        item.additionalProperty = { '@type': 'PropertyValue', 'name': 'Impact Factor', 'value': p.metrics.if };
      }
      return item;
    })
  } : null;
  // ProfilePage 把「这是一个人的资料页」明确告诉搜索引擎，并与 Person / 18 篇论文关联
  const profilePageJson = SITE_BASE ? {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    '@id': canonical + '#webpage',
    'url': canonical,
    'name': T(data.site.docTitle, lang),
    'inLanguage': data.site.htmlLang[lang],
    'dateModified': new Date().toISOString().slice(0, 10),
    'mainEntity': { '@id': personId },
    'isPartOf': {
      '@type': 'WebSite',
      '@id': SITE_BASE + '/#website',
      'url': SITE_BASE + '/',
      'name': T(data.site.brand, lang)
    }
  } : null;
  const sections = data.sections.map((s, i) => renderSection(s, lang, i, data.sections.length)).join('\n');
  const draftBar = data.config.draft ? `
  <div class="draft-bar" role="note">
    <span class="draft-bar__tag">${L(data.labels.draftTag, lang)}</span>
    <span>${L(data.config.draftNote, lang)}</span>
  </div>` : '';

  return `<!doctype html>
<html lang="${esc(data.site.htmlLang[lang])}" data-lang="${lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(T(data.site.docTitle, lang))}</title>
<meta name="description" content="${esc(desc)}">
<meta name="author" content="${esc(T(data.site.brand, lang))}">
<meta name="keywords" content="${esc(T(data.site.keywords, lang))}">
<meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large">
<meta name="applicable-device" content="pc,mobile">
<link rel="alternate" hreflang="zh-CN" href="${esc(ZH_URL)}">
<link rel="alternate" hreflang="en" href="${esc(EN_URL)}">
<link rel="alternate" hreflang="x-default" href="${esc(ZH_URL)}">
${sameAs.map(u => `<link rel="me" href="${esc(u)}">`).join('\n')}${absTags}
<meta property="og:type" content="profile">
<meta property="og:site_name" content="${esc(T(data.site.brand, lang))}">
<meta property="og:locale" content="${lang === 'zh' ? 'zh_CN' : 'en_US'}">
<meta property="og:locale:alternate" content="${lang === 'zh' ? 'en_US' : 'zh_CN'}">
<meta property="og:title" content="${esc(T(data.site.docTitle, lang))}">
<meta property="og:description" content="${esc(desc)}">
<meta property="profile:first_name" content="${lang === 'zh' ? '冠宇' : 'Guanyu'}">
<meta property="profile:last_name" content="${lang === 'zh' ? '刘' : 'Liu'}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(T(data.site.docTitle, lang))}">
<meta name="twitter:description" content="${esc(desc)}">
<link rel="icon" type="image/svg+xml" href="assets/favicon.svg">
<link rel="stylesheet" href="assets/style.css">
<script type="application/ld+json">${JSON.stringify(jsonld)}</script>
${profilePageJson ? `<script type="application/ld+json">${JSON.stringify(profilePageJson)}</script>` : ''}
${worksJson ? `<script type="application/ld+json">${JSON.stringify(worksJson)}</script>` : ''}
</head>
<body id="top">
${draftBar}
<div class="masthead">
  <div class="masthead__inner-wrap">
    <nav class="greedy-nav" id="site-nav" aria-label="Main navigation">
      <a class="site-title" href="#top">${L(data.site.brand, lang)}</a>
      <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="nav-links" aria-label="Menu"><span class="navicon"></span></button>
      <ul class="visible-links" id="nav-links">
              ${renderNav(lang)}
      </ul>
      <a class="lang-switch" href="${esc(other)}" data-langlink title="${esc(T(data.labels.langSwitchTitle, lang))}">
        ${L(data.labels.langSwitch, lang)}
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a15 15 0 0 1 0 18 15 15 0 0 1 0-18Z"/></svg>
      </a>
    </nav>
  </div>
</div>

<div id="main" role="main">
${renderSidebar(lang)}

  <article class="page" itemscope itemtype="https://schema.org/CreativeWork">
    <div class="page__inner-wrap">
      <header class="page__header">
        <h1 class="page__title" itemprop="headline">${L(data.site.pageTitle, lang)}</h1>
        <p class="page__lead">${L(data.site.sidebarBio, lang)}</p>
      </header>
      <div class="page__content" itemprop="text">
${sections}
      </div>
    </div>
  </article>
</div>

<div class="page__footer">
  <footer>
    <div class="footer__inner">
      <div class="footer__links">
        <a href="#top">${L(data.footer.sitemap, lang)}</a>
        <span class="footer__dot">·</span>
        <a href="#top" data-top>${L(data.labels.backToTop, lang)}</a>
      </div>
      <div class="footer__copyright">
        &copy; ${esc(data.config.copyrightYear)} ${esc(T(data.site.pageTitle, lang))}${lang === 'zh' ? ' ·' : '.'} ${L(data.footer.credit, lang)}
        <span class="footer__sep">·</span> ${L(data.config.lastUpdated, lang)}
      </div>
      <div class="footer__lang"><a href="${esc(other)}" data-langlink>${esc(T(data.labels.langSwitchTitle, lang))}</a></div>
    </div>
  </footer>
</div>

<button class="to-top" type="button" data-top aria-label="${esc(T(data.labels.backToTop, lang))}" title="${esc(T(data.labels.backToTop, lang))}">
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 14 6-6 6 6"/></svg>
</button>

<script src="assets/app.js" defer></script>
<script src="assets/visits.js" defer></script>
</body>
</html>
`;
}

fs.writeFileSync(path.join(ROOT, 'index.html'), render('zh'), 'utf8');
fs.writeFileSync(path.join(ROOT, 'en.html'), render('en'), 'utf8');
console.log('✓ 已生成 index.html（中文）与 en.html（英文）');
console.log(`  ${data.sections.length} 个板块 / ${data.nav.length} 个导航项 / ${data.sidebarLinks.length} 个侧栏链接`);
console.log(`  草稿模式：${data.config.draft ? '开启（顶部有提示条、待补充项有虚线标记）' : '关闭'}`);

// sitemap.xml / robots.txt 需要绝对网址，仅在配置 canonicalBase（或 --base）时生成
if (SITE_BASE) {
  const today = new Date().toISOString().slice(0, 10);
  const altLinks = [
    `    <xhtml:link rel="alternate" hreflang="zh-CN" href="${esc(ZH_URL)}"/>`,
    `    <xhtml:link rel="alternate" hreflang="en" href="${esc(EN_URL)}"/>`,
    `    <xhtml:link rel="alternate" hreflang="x-default" href="${esc(ZH_URL)}"/>`
  ].join('\n');
  const block = (loc, priority) => `  <url>\n    <loc>${esc(loc)}</loc>\n${altLinks}\n    <lastmod>${today}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>${priority}</priority>\n  </url>`;
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n`
    + `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n`
    + `${block(ZH_URL, '1.0')}\n${block(EN_URL, '0.8')}\n</urlset>\n`;
  fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), sitemap, 'utf8');
  fs.writeFileSync(path.join(ROOT, 'robots.txt'),
    `User-agent: *\nAllow: /\n\nSitemap: ${SITE_BASE}/sitemap.xml\n`, 'utf8');
  console.log(`  SEO：网址 ${SITE_BASE} → canonical / hreflang 绝对地址、sitemap.xml、robots.txt`);
} else {
  for (const f of ['sitemap.xml', 'robots.txt']) {
    const fp = path.join(ROOT, f);
    if (fs.existsSync(fp)) { fs.unlinkSync(fp); console.log(`  已移除旧的 ${f}（网址未配置）`); }
  }
  console.log('  ⚠ 未配置 site.canonicalBase：hreflang 仍为相对地址，未生成 sitemap.xml / robots.txt');
  console.log('    部署后执行 node build.js --base=https://你的网址，或把网址填入 content.json');
}
