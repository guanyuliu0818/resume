# 个人学术主页（中 / 英双语）

仿 [AcademicPages / Minimal Mistakes](https://github.com/academicpages/academicpages.github.io) 版式重写的纯静态个人主页：白底细边导航、左侧圆形证件照粘性侧栏、右侧 emoji 标题 + 细分割线分区、青蓝色链接、期刊徽章式论文列表。无框架、无外部 CDN 依赖，可放在任意静态托管上（GitHub Pages、Netlify、Cloudflare Pages、腾讯云 EdgeOne 等）。

## 文件说明

| 文件 | 作用 |
| --- | --- |
| `index.html` | 中文版（默认首页），**由构建脚本生成** |
| `en.html` | 英文版，**由构建脚本生成** |
| `content.json` | **唯一内容数据源**：中英文所有文案都在这里 |
| `build.js` | 由 `content.json` 一次生成两份 HTML |
| `assets/style.css` | 全站样式 |
| `assets/app.js` | 移动导航、Follow 折叠、滚动高亮、语言切换保留锚点、回到顶部 |
| `assets/avatar.jpg` | 头像（来自简历证件照） |
| `assets/favicon.svg` | 站点图标 |
| `sitemap.xml` | **配置 `site.canonicalBase` 后生成**，供搜索引擎提交 |
| `robots.txt` | **配置 `site.canonicalBase` 后生成**，声明 sitemap 地址 |
| `.nojekyll` | 告诉 GitHub Pages 跳过 Jekyll 构建 |
| `.gitignore` | 默认排除两份原始简历 |

## 本地预览

```bash
cd 本目录
python -m http.server 8765
# 浏览器打开 http://127.0.0.1:8765/index.html
```

直接双击 `index.html` 也能看，但通过本地服务打开可以完整验证相对路径与锚点。

## 改内容（只需两步）

1. 编辑 `content.json`：所有 `zh` / `en` 字段成对填写。文本支持 `**加粗**`、`*斜体*`、`[文字](链接)`；写成 `[[待补充：xxx]]` 会在页面上渲染成琥珀色虚线标记。
2. 运行 `node build.js`，两份 HTML 会同时刷新。

> 不要直接改 `index.html` / `en.html`，下次构建会被覆盖。

常用改动：
- **换照片**：替换 `assets/avatar.jpg`（正方形、白底效果最好），或改 `site.avatar` 的路径。
- **补外链**：`sidebarLinks` 里的 `url` 留空时该链接不会出现在页面上（不留灰色占位）；填上后重新构建即自动显示。
- **加论文**：在 `sections → papers → groups → papers` 里复制一条，`tone` 可选 `red` / `blue` / `gray` / `green`。
- **排序约定**：所有列表一律时间倒序（最新在最前）——奖项 / 论文按年份，经历按起始年月，教育按学位时间线；新增条目要插到对应年份位置，不要追加到末尾。
- **工作经历排版**：该组用 `bullets` 字段（而不是 `detail`），构建时只有职位首行加粗、日期靠右，后续要点统一常规字重。
- **开关草稿提示条**：`config.draft` 改成 `true` / `false`。

## 方案 A：发布到 GitHub Pages

1. 在 GitHub 新建仓库。用 `<你的用户名>.github.io` 可得到根域名；用普通仓库则是项目子路径，两种都支持（站内全部使用相对路径）。
2. 在本目录执行：

```bash
git init
git add .
git commit -m "Add bilingual personal homepage"
git branch -M main
git remote add origin https://github.com/<用户名>/<仓库名>.git
git push -u origin main
```

3. 仓库 **Settings → Pages → Build and deployment → Deploy from a branch**，选 `main` + `/ (root)`，保存。
4. 稍等片刻后访问：
   - 中文：`https://<用户名>.github.io/`（项目站点为 `https://<用户名>.github.io/<仓库名>/`）
   - 英文：在同上地址后加 `en.html`，或点右上角 `中文 / EN` 切换。
5. **拿到网址后必须做一次 SEO 配置**：把 `content.json` 里 `site.canonicalBase` 填成站点根地址（不带结尾斜杠），例如 `https://<用户名>.github.io` 或 `https://<用户名>.github.io/<仓库名>`，然后重新构建并推送：

```bash
node build.js
git add index.html en.html sitemap.xml robots.txt content.json
git commit -m "Set canonical URL and generate sitemap"
git push
```

构建脚本会自动生成 `sitemap.xml` / `robots.txt`，并把 `canonical`、`hreflang`、`og:url`、`og:image` 写成绝对地址。

更省事的一步到位写法（推荐）：

```bash
node build.js --set-base=https://<用户名>.github.io
```

它会把网址写进 `content.json`，同时生成两份 HTML、`sitemap.xml`、`robots.txt`；之后每次改内容只需 `node build.js`。只想临时用某个网址预览、不写入配置，则用 `node build.js --base=https://…`。**未配置网址时这些绝对地址不会生成**（避免把错误域名写进公开页面）。

### 浏览器登录不上 GitHub 时：全程命令行发布

若只是网页登录失败，可以完全不碰浏览器。前提是能在账号设置里生成一个 **Personal Access Token（PAT，勾选 `repo` 权限）**；若连这一步也做不了，直接用方案 B 的免 GitHub 托管。

```bash
# 1) 用 PAT 创建仓库（用户名 guanyuliu0818，根站点仓库名必须是 <用户名>.github.io）
curl -H "Authorization: Bearer <PAT>" https://api.github.com/user/repos \
  -d '{"name":"guanyuliu0818.github.io","private":false}'

# 2) 本地初始化并推送（两份简历和 dist/ 已被 .gitignore 排除）
git init
git add .
git commit -m "Add bilingual personal homepage"
git branch -M main
git remote add origin https://github.com/guanyuliu0818/guanyuliu0818.github.io.git
git push -u origin main
# 凭据提示：用户名填 guanyuliu0818，密码填 PAT（GitHub 已不接受账号密码）

# 3) 用 API 开启 Pages，省去 Settings 页面
curl -X POST -H "Authorization: Bearer <PAT>" \
  -H "Accept: application/vnd.github+json" \
  https://api.github.com/repos/guanyuliu0818/guanyuliu0818.github.io/pages \
  -d '{"source":{"branch":"main","path":"/"}}'
```

> **不要把 PAT 写进 `git remote` 的 URL**，那会明文留在 `.git/config`；推送时按提示输入即可。若 `git push` 超时，先配代理 `git config --global http.proxy http://127.0.0.1:<本地代理端口>`，或换手机热点重试。
>
> 本项目 `site.canonicalBase` 已固化为 `https://guanyuliu0818.github.io`，`sitemap.xml` / `robots.txt` 已生成并放进发布包；上线后直接去 Search Console / Bing / 百度提交 sitemap 即可。

## 方案 B：不登录 GitHub 也能上线

网页是纯静态文件，**换任何托管都只需上传同一批文件**，无需改代码。

| 途径 | 是否需要账号 | 操作 | 适合场景 |
| --- | --- | --- | --- |
| **WorkBuddy 内置发布**（最快） | 不需要任何平台账号 | 直接把 `dist/` 发布成 https 分享链接，几分钟拿到网址 | 快速发给别人打开 / 临时展示；**不能用于搜索收录**，见下方限制说明 |
| **Netlify Drop** | 拖放可免账号，但**未登录的站点是临时的、带访问密码**，需注册认领才能长期公开 | 打开 `app.netlify.com/drop`，把 `personal-homepage-publish.zip` 或 `dist/` 拖进去 | 想自己拖拽操作；注册用邮箱即可，不必 GitHub |
| **Cloudflare Pages（Direct Upload）** | 需要 Cloudflare 账号（邮箱注册，不需 GitHub） | Workers & Pages → 创建 Pages 项目 → 选 Direct Upload → 上传 `dist/` | 免费、静态请求不限量、支持绑自有域名；国内访问速度一般 |
| **腾讯云 EdgeOne Pages / CloudBase 静态托管** | 腾讯云账号（微信 / QQ 即可登录） | 控制台上传 `dist/` 或连接代码仓库 | 国内节点、访问快、百度抓取更友好；**绑自定义域名到大陆节点需 ICP 备案** |
| **绕过网页登录继续用 GitHub** | 已有 GitHub 账号 | 换网络 / 手机热点；或生成 Personal Access Token 后用命令行 `git push`，无需登录网页 | 只是网页登录故障，账号本身仍可用 |

> **Gitee Pages 已不可用**：官方反馈区确认该服务 2024 年 5 月下线、暂无恢复计划；网上标着「2026 最新版」的 Gitee Pages 教程多为过时内容，不要照做。

> **内置发布链接的实测限制（2026-11-16）**：该通道给出的分享链接形如 `https://…app.workbuddy.host/?sharecode=XXXX`，**必须带 `?sharecode=` 才能访问**；首次访问会种下 `__wb_rsc` Cookie，之后同域的 `en.html`、`assets/*` 才放行（所以浏览器里点右上角「中文 / EN」切换是正常的）。但**没有 Cookie 的访问一律 403「链接不完整」**，搜索引擎爬虫、`robots.txt`、`sitemap.xml` 都会被挡在门外。
>
> 结论：这条链接适合**发给别人打开或临时展示**，**不能当作「能被搜到」的正式网址**。要被 Google / Bing / 百度收录，请改用上表其它「无需访问码」的托管（Cloudflare Pages、Netlify、腾讯云 EdgeOne、GitHub Pages），拿到干净的网址后再执行下面的「拿到网址后必做」。
>
> 因此**不要**把带 `?sharecode=` 的链接填进 `site.canonicalBase`：构建脚本会把它拼成畸形 URL，访问码也会写进公开页面源码。当前 `canonicalBase` 保持为空，等确定正式域名后一键 `node build.js --set-base=…` 即可。

> **零账号通道的实测结论（2026-11-16）**：WorkBuddy 内置分享链接需 `?sharecode=`（无 Cookie 时 403）；Netlify 匿名部署 `CI=1 npx netlify-cli deploy --dir=dist --allow-anonymous --json` **能成功创建站点**（例如 `friendly-nasturtium-dd6557.netlify.app`），但整个站点被 **Password Protection** 锁住，首页、`en.html`、`assets/*`、`robots.txt`、`sitemap.xml` 一律 401；Netlify 匿名建站 API `POST /api/v1/sites` 直接 401。匿名站可用返回的 `claim_command`（`netlify claim --site … --token …`）认领到账号后解除密码。
>
> **因此：所有「无需账号」的通道都带访问门槛，爬虫进不来，都无法让网页被搜到。** 要被搜索引擎收录，必须拥有并授权至少一个平台账号（GitHub / Netlify / Cloudflare / 腾讯云任一），拿到无门槛的公开网址后再执行下面的 `--set-base`。

### 干净发布目录 `dist/`

工作区根目录里有两份**含手机号等隐私的原始简历 PDF**、本地记忆目录与压缩包，**不能直接整目录上传**。已备好 `dist/`，只含：

```
dist/index.html   dist/en.html   dist/.nojekyll
dist/assets/style.css   dist/assets/app.js
dist/assets/avatar.jpg  dist/assets/favicon.svg
```

以后改完内容，重新同步一次即可：

```bash
node build.js
cp -f index.html en.html dist/
```

### 拿到网址后必做（否则搜不到）

无论选哪个平台，拿到公网根地址（不带结尾斜杠）后执行：

```bash
node build.js --set-base=https://你的网址
cp -f index.html en.html sitemap.xml robots.txt dist/
```

再把 `dist/` 重新上传 / 发布一次。这样 `canonical`、`hreflang`、`og:url` 才是绝对地址，`sitemap.xml` / `robots.txt` 才会生成，搜索引擎才认。最后按下一节提交收录。

## 让搜索引擎能搜到

**搜索引擎搜不到，必须先有一个「爬虫无需访问码即可访问」的公开网址**（见上一节），再做下面两步。方案 B 里带 `?sharecode=` 的内置分享链接不满足这个条件，只能用于人工打开。

### 1. 站内已内置的 SEO

- 两版 `<title>` 含中英文姓名与领域；`meta description` / `keywords` 含机构、现职与研究方向（电力气象、新能源功率预测、野火与气溶胶等）。
- `<h1>` 是姓名，正文含机构、导师、期刊名，语义化 `article` + `itemprop` 标记。
- `canonical` + `hreflang`（zh-CN / en / x-default）指向绝对地址，避免中英两版被判为重复内容。
- Open Graph / Twitter Card 元数据、`og:image`（头像）、JSON-LD `Person`（姓名、别名、职务、任职机构、母校、`knowsAbout` 研究方向、`sameAs` ORCID / ResearchGate）。
- `sitemap.xml`（中英两页 + 双语互指）与 `robots.txt`（声明 sitemap 地址、允许全站抓取）。
- `.nojekyll` 保证 `assets/` 等下划线无关目录正常发布；全站无 CDN 依赖，抓取无障碍。

### 2. 主动提交收录（上线后做一次）

| 平台 | 操作 |
| --- | --- |
| **Google** | 打开 [Search Console](https://search.google.com/search-console)，添加「网址前缀」资源 → 用 HTML 标签或上传验证文件验证 → 左侧「站点地图」提交 `sitemap.xml` → 「网址检查」里对首页点「请求编入索引」 |
| **Bing**（同时供 Yahoo / DuckDuckGo 部分结果） | [Bing Webmaster Tools](https://www.bing.com/webmasters/) 可直接从 Search Console 一键导入，再提交 sitemap |
| **百度** | [百度搜索资源平台](https://ziyuan.baidu.com/) 添加站点 → 验证 → 「数据引入 / 普通收录」提交 sitemap 或手动提交首页与 `en.html` |

验证是否收录：在搜索引擎输入 `site:你的域名`，或在 Search Console 的「网址检查」看状态。Google 通常几天到两周，百度往往更久。

### 3. 加速被发现（最有效的一招）

新站主要靠**外部链接**被爬虫发现。建议把主页网址填进这些已有公开档案：

- **ORCID** → Edit → Websites & social links → 添加个人主页
- **ResearchGate** → 个人资料里的 website / 联系方式
- **Google Scholar** 档案的「首页」字段、单位或院系人员页、论文页的作者简介、微信/LinkedIn 等个人简介

另外，把主页链接发一次给同事或在学术社交平台露一次面，通常比反复提交 sitemap 更快。

> 国内访问提示：`*.github.io` 在国内连通性不稳定，百度抓取可能失败。若主要面向国内，建议绑定自定义域名（仓库 Settings → Pages → Custom domain，并加一条 CNAME 解析），或改用方案 B 的国内节点托管（腾讯云 EdgeOne / CloudBase）；换域名后记得更新 `site.canonicalBase` 重新构建并重新上传。

## 隐私提醒

两份原始简历 PDF 含手机号、出生年月等信息，已写入 `.gitignore`，**不会被推到公开仓库**。

如果希望在网页上挂简历：请先自行脱敏，另存为 `assets/cv.pdf`，再把 `content.json` 中 `sidebarLinks` 里 `简历 CV (PDF)` 的 `url` 填成 `assets/cv.pdf` 并重新构建。

## 发布包

`personal-homepage-publish.zip` 是定稿的静态站点：解压后即为可上传的完整目录，含 `index.html`、`en.html`、`assets/`、`.nojekyll`、`README.md`、`.gitignore`，以及便于日后改内容的 `content.json` / `build.js`。**不含两份原始简历 PDF 与本地记忆目录**。配置 `site.canonicalBase` 后重新构建并重新打包，包内会多出 `sitemap.xml` 与 `robots.txt`。

最快路径：解压出 `dist/` → 用方案 A 或 B 任一方式上传 → 拿到网址后 `node build.js --set-base=你的网址` 并覆盖 `dist/` 里的页面 → 重新上传一次 → 到 Search Console / Bing / 百度提交 sitemap。只预览的话直接双击 `index.html` 即可。

## 已核实的外链

侧栏 Follow 目前只保留三项：ORCID（`0000-0002-2202-4746`）、发送邮件（`liuguanyu@csg.cn`）、ResearchGate（用户提供的 `Guanyu-Liu-4` 主页）。Google Scholar、CV PDF、GitHub 已移除；如需加回，在 `sidebarLinks` 里补一条并填 `url` 即可自动显示。

页面上 **18 篇论文的 18 个 DOI** 均通过 Crossref 逐条验证，标题、作者与期刊全部匹配，其中中文《科学通报》短文的 DOI 为 `10.1360/tb-2023-0457`。

两版页面均带 `hreflang` 互指、`og:locale`、Open Graph / Twitter Card 与 JSON-LD Person 结构化数据，便于搜索引擎识别中英双版本；配置 `site.canonicalBase` 后还会输出绝对 `canonical`、`sitemap.xml` 和 `robots.txt`。

## 可选的后续补充

- **上线后填写 `site.canonicalBase` 并重新构建**（否则 hreflang 为相对地址、无 sitemap，收录会打折扣）
- 如需恢复 GitHub 主页或脱敏后的 CV PDF，在 `sidebarLinks` 补一条并填 `url` 即自动显示
- 工作经历「2026 – 至今」的准确起始年月（当前按年份粒度）
- ORCID 是从公开档案推断填入的，发布前建议本人再确认一次
- 若论文数量、一作篇数与最新进展有变化，同步修改 `content.json` 后重新构建
