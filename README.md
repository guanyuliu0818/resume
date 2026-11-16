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
| `bced4a16983c0370b2c634a7cee8c18c.txt` | **IndexNow 归属验证文件**（内容即 key），供 Bing / Yandex 主动推送时校验，不要删 |
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
- **换照片**：替换 `assets/avatar.jpg`（正方形、白底效果最好）后重新执行 `node build.js`，脚本会自动生成纯文本 `assets/avatar.svg`（内嵌 base64），页面与 `og:image` 都引用它。整站因此没有二进制文件，纯文本通道（GitHub 网页拖放、代码连接器）也能一次上传完整站点。
- **补外链**：`sidebarLinks` 里的 `url` 留空时该链接不会出现在页面上（不留灰色占位）；填上后重新构建即自动显示。
- **加论文**：在 `sections → papers → groups → papers` 里复制一条，`tone` 可选 `red` / `blue` / `gray` / `green`。
- **科研项目板块**：`sections → projects`（`type: "groups"`），两组 `项目主持` / `项目参与`；每条用 `role`（项目名）、`org`（资助来源）、`date`（周期）、`bullets`（一句话说明承担内容）四字段，渲染成「项目名，资助来源 …… 周期」的单行头 + 要点。项目名与来源都特别长时（如未名学者项目），加 `"orgBreak": true` 让来源单独起一行，标题不再折出孤字。
- **荣誉与奖励板块**：`sections → awards`（`type: "groups-list"`），三组 `奖学金` / `科研与竞赛` / `荣誉与实践`，组内 **一年一条**，同一年获得的多项奖合并成一条、年份统一放在句末括号里；跨年度的奖项（如校长奖学金 2025、2021）归入最近一年那一条。
- **学术报告板块**：`sections → talks`（`type: "groups-list"`），两组 `口头报告` / `海报`，每条一个 `{zh, en}`，会议名加粗、年份放括号。原「技能与学术服务」板块已按此收窄——软件技能、语言资质等内容不再在页面上展示。
- **论文的指标与报道**：每条论文可带三个可选字段 —— `metrics`（`{"if": "18.1", "tier": {"zh": "中科院一区 Top", "en": "CAS Tier 1 (Top)"}}`，`if` 与 `tier` 都可省略）、`note`（"主要内容"，中英各一句）、`media`（报道来源数组，如 `[{"zh": "北大物理人 公众号", "en": "PKU Physics WeChat"}]`）与 `mediaExtra`（报道的补充说明，如被选作试题）。影响因子与分区随 JCR 年度更新时，改 `content.json` 后重新构建即可。
- **媒体报道板块**：`sections → media`（`type: "press"`）。每条含 `source`（媒体名）、`tag`（媒体类型）、`desc`（报道了哪篇论文或哪项活动）、`links`（可点开的原文链接数组，`[{"label": {"zh": "...", "en": "..."}, "url": "https://..."}]`，一条可带多个链接，渲染成下方并排的胶囊按钮）。板块支持两种写法：扁平的 `items`，或按主题分组的 `groups: [{num, title, note, items}]`——`num` 是分组序号（`"01"`…），`title` 为组标题，`note` 为组说明，渲染成带序号与分隔线的分组区块。当前采用分组写法，按「研究成果 → 人物荣誉 → 学术交流 → 科普服务」排列；**只保留能找到原文链接的报道**，找不到的宁可不写，避免出现死链。
- **板块收录范围**（`tag` 取值参考）：期刊与门户转载、期刊宣传、院系公众号、公众号转载、学院官网 / 科研进展、人物专访、荣誉表彰、学术报告、学术论坛、学科竞赛、学术自媒体解读、科技媒体、科普宣讲、科普竞赛、科普解读、科普创作、社会实践与分享、朋辈经验分享、本科教学与经验分享、国际科技媒体（Phys.org、EurekAlert）。论文报道、人物专访、学术与科普活动同属广义「学术传播」，混排时靠 `tag` 区分类型。
- **公众号链接取哪种形式**：优先用 `https://mp.weixin.qq.com/s/<短码>`。带 `?__biz=...&mid=...&sn=...` 的长链在非微信环境下容易被拦成「环境异常，完成验证后即可继续访问」，短链可正常打开；两者指向同一篇时只留短链。
- **研究方向标签**：`sections → biography → tags`，会渲染成简介下方的圆角标签行，同时提升页面关键词覆盖。
- **排序约定**：所有列表一律时间倒序（最新在最前）——奖项 / 论文按年份，经历按起始年月，教育按学位时间线；新增条目要插到对应年份位置，不要追加到末尾。
- **工作经历排版**：该组用 `bullets` 字段（而不是 `detail`），构建时只有职位首行加粗、日期靠右，后续要点统一常规字重。
- **开关草稿提示条**：`config.draft` 改成 `true` / `false`。

## 方案 A：发布到 GitHub Pages

> **已上线（2026-11-16）**：中文首页 **`https://guanyuliu0818.github.io/resume/`**，英文版 **`https://guanyuliu0818.github.io/resume/en.html`**，右上角可切换语言。仓库 https://github.com/guanyuliu0818/resume 为公开 `main` 分支，Pages 从 `main` + `/ (root)` 构建；`.github/workflows/pages.yml` 自动部署工作流也已运行成功（`pages build and deployment` 与 `Deploy GitHub Pages` 均 `success`）。
>
> 实测匿名访问：`/`、`/en.html`、`/sitemap.xml`、`/robots.txt`、`/assets/style.css`、`/assets/avatar.svg` **全部 HTTP 200**，首页 `<title>` 与 `canonical` 正确。`site.canonicalBase` 已固化为上述子路径，两版 HTML、`sitemap.xml`、`robots.txt` 无需再改。
>
> 上线过程两条路都走了：先在仓库网页上传 `personal-homepage-upload.zip` 的 6 个文件（GitHub 自动提交 `Add files via upload`），再用 `repo` 权限的 PAT 从本地 `git push` 补齐完整源码结构（`content.json` / `build.js` / `assets/` 等），合并时以本地版本为准。**PAT 只在单次命令行环境变量中使用，未写入 `.git/config`、任何文件或提交；请到 GitHub → Settings → Developer settings 里 Revoke 撤销。**
>
> 现在只差「让人搜到」这一步：按下面「让搜索引擎能搜到」一节，把 `https://guanyuliu0818.github.io/resume/sitemap.xml` 提交到 Google Search Console / Bing / 百度，并把主页链接填进 ORCID、ResearchGate 等公开档案；Bing 侧已用 IndexNow 接口主动推送过。
>
> **2026-11-16 内容与曝光升级**：工作经历改为「主管，中国南方电力调度控制中心 水电及新能源处 / 2026.07 – 至今」；18 篇论文（含共同作者）全部标出影响因子、中科院分区、主要内容与报道来源；新增「媒体报道与学术传播」板块与「研究方向」标签行；新增 18 条 `ScholarlyArticle` 结构化数据。
>
> **2026-11-16 报道板块扩容（19 卡 / 34 链接 → 25 卡 / 45 链接）**：新增南大招生小蓝鲸专访、王绍武优秀博士毕业生奖（系公众号 + 气象学家转载）、Clearsky Science 科普解读、南大汇彩课堂与「学长学姐来支招」、澎湃《云上说云》科普视频、钟盛标研究生学术论坛；燕园街道条目补北大新闻网报道，科普竞赛条目补北京气象学会与今日头条。同时修正一处归属错误——此前挂在「南大青春风采」下的今日头条链接实为「南大招生小蓝鲸」专访的转载，已移入对应条目。45 条链接实测 43 条 200/202，仅 2 条 phys.org 因本机出口 IP 被 Cloudflare 拦截返回 403（站点本身正常）。
>
> **2026-11-16 报道板块重构（25 卡 → 30 卡 / 51 链接，改为分组呈现）**：板块由平铺改为按「研究成果 → 人物荣誉 → 学术交流 → 科普服务」四条线索分为 6 组（`groups` 写法，每组带序号 `01`–`06`、标题与一句说明），组内仍按时间倒序。同步补入：AAS《大气科学进展》科研热点（经新浪新闻转载）、生物通长篇报道、happy科研转载、EARTH随享学术解读、北大新闻网研究生骨干门头沟宣讲，燕园街道条目补第三场社区宣讲（蔚秀园，2023 年世界气象日）。51 条链接实测 48 条 200 + 1 条 202（EurekAlert）+ 2 条 phys.org 403（同上，本机 IP 限制）。
>
> **2026-11-16 报道板块再扩容（30 卡 / 51 链接 → 36 卡 / 60 链接）**：围绕 *PNAS* 加拿大破纪录野火这一成果补齐传播链——新增「天候玄机」学术解读、Book学术转载；另补全国大学生气象科技知识竞赛（首届一等奖/季军）、榆林高新中学「高新大讲堂」讲座、北大「知行计划」2023 烟台团分享会、物理学院研究生新老生交流会（预告 + 回顾双链接）、第八届青年地学论坛快闪报告。第 05 组更名为「学术报告、学科竞赛与学术交流」，第 06 组说明补入社会实践与朋辈分享。同时把「博士生未名学者」专访换成 `mp.weixin.qq.com/s/<短码>` 短链——带 `__biz/mid/sn` 的长链会被微信环境校验拦成验证页，短链稳定可读。60 条链接实测 57 条 200 + 1 条 202（EurekAlert）+ 2 条 phys.org 403（同上）；`booksci.cn` 需带证书校验放宽（`curl -k`）才能取到 200，浏览器访问正常。
>
> **2026-11-17 板块重整（8 → 9 个板块）**：① 新增「科研项目」板块，插在「工作与科研经历」之后：「项目主持」2 项（未名学者项目《当前和未来全球野火碳排放的气候反馈》2024.10–2026.06；2018 年欧洲热浪机理分析，南大国家级大创，优秀结题）、「项目参与」4 项（杰青「气溶胶卫星遥感与辐射效应」2025–2029；面上「DPC 单次散射反照率反演算法开发」2024.01–2027.12；面上「A-Train 气溶胶直接辐射强迫」2020.01–2023.12；科技部国家重点研发课题「植被生态气候数据集」2023.12–2028.11）。② 原「技能与学术服务」收窄为「学术报告」，只保留口头报告（10 项）与海报（3 项）两组，板块移到「主要论文」之后，导航标签由「技能」改为「报告」。③ 荣誉与奖励按简历补全 9 条（中国绿色创新夏季学院奖学金、郑钢海外学习奖学金、杨蓝云领导型人才奖学金、人民奖学金、南京大学气象科普风采大赛三等奖、「华教杯」数学竞赛一等奖、南京大学优秀共青团干部 / 优秀学生干部 / 优秀共青团员），已有条目未改动。④ CSS 新增 `.entry__head--work .entry__headline { flex: 1 1 22rem; min-width: 0 }`——项目名较长时标题正常换行，不再压住右侧日期。⑤ 荣誉板块按「一年一条」重整：同年度多项奖合并，条目由 25 条压缩为 21 条（奖学金 8 / 科研与竞赛 7 / 荣誉与实践 6）。（后续修订：未名学者项目周期定为 2024.10–2026.06，并加 `orgBreak` 让资助来源单独换行。）
>
> 下面的 1–5 是通用发布步骤，当前仓库已全部完成，仅作日后迁移参考。


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

### 浏览器登录不上 GitHub 时：全程命令行发布（PAT）

若只是网页登录失败，可以完全不碰浏览器。前提是能在账号设置里生成一个 **Personal Access Token（PAT，勾选 `repo` 权限）**；若连这一步也做不了，用上面的 A2 网页拖放，或方案 B 的免 GitHub 托管。

仓库已经存在（`guanyuliu0818/resume`），所以**不需要再建仓库**：

```bash
# 1) 把本地仓库的远端指向实际仓库
git remote set-url origin https://github.com/guanyuliu0818/resume.git

# 2) 合并远端那个初始 README（本地与远端无共同祖先）
git fetch origin main
git merge --allow-unrelated-histories -X ours origin/main -m "Merge remote README"

# 3) 推送；凭据提示里用户名填 guanyuliu0818，密码填 PAT（GitHub 已不接受账号密码）
git push -u origin main

# 4) 用 API 开启 Pages，省去 Settings 页面
curl -X POST -H "Authorization: Bearer <PAT>" \
  -H "Accept: application/vnd.github+json" \
  https://api.github.com/repos/guanyuliu0818/resume/pages \
  -d '{"source":{"branch":"main","path":"/"}}'
```

> **不要把 PAT 写进 `git remote` 的 URL**，那会明文留在 `.git/config`；推送时按提示输入即可。若 `git push` 超时，先配代理 `git config --global http.proxy http://127.0.0.1:<本地代理端口>`，或换手机热点重试。
>
> 本项目 `site.canonicalBase` 已固化为 `https://guanyuliu0818.github.io/resume`，`sitemap.xml` / `robots.txt` 已生成并放进发布包；上线后直接去 Search Console / Bing / 百度提交 sitemap 即可。
>
> 若希望网址是根域名 `https://guanyuliu0818.github.io/` 而不是 `/resume/`：在仓库 Settings 里把仓库改名为 `guanyuliu0818.github.io`，改完告诉我，我执行一次 `node build.js --set-base=https://guanyuliu0818.github.io` 并重新推送即可。

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
> 因此**不要**把带 `?sharecode=` 的链接填进 `site.canonicalBase`：构建脚本会把它拼成畸形 URL，访问码也会写进公开页面源码。当前 `canonicalBase` 已填正式 GitHub Pages 地址 `https://guanyuliu0818.github.io/resume`，与带访问码的分享链接无关。

> **零账号通道的实测结论（2026-11-16）**：WorkBuddy 内置分享链接需 `?sharecode=`（无 Cookie 时 403）；Netlify 匿名部署 `CI=1 npx netlify-cli deploy --dir=dist --allow-anonymous --json` **能成功创建站点**（例如 `friendly-nasturtium-dd6557.netlify.app`），但整个站点被 **Password Protection** 锁住，首页、`en.html`、`assets/*`、`robots.txt`、`sitemap.xml` 一律 401；Netlify 匿名建站 API `POST /api/v1/sites` 直接 401。匿名站可用返回的 `claim_command`（`netlify claim --site … --token …`）认领到账号后解除密码。
>
> **因此：所有「无需账号」的通道都带访问门槛，爬虫进不来，都无法让网页被搜到。** 要被搜索引擎收录，必须拥有并授权至少一个平台账号（GitHub / Netlify / Cloudflare / 腾讯云任一），拿到无门槛的公开网址后再执行下面的 `--set-base`。

### 干净发布目录 `dist/`

工作区根目录里有两份**含手机号等隐私的原始简历 PDF**、本地记忆目录与压缩包，**不能直接整目录上传**。已备好 `dist/`，只含：

```
dist/index.html   dist/en.html   dist/.nojekyll
dist/sitemap.xml  dist/robots.txt
dist/assets/style.css   dist/assets/app.js
dist/assets/avatar.svg  dist/assets/favicon.svg
```

以后改完内容，重新同步一次即可：

```bash
node build.js
cp -f index.html en.html sitemap.xml robots.txt dist/
cp -f assets/avatar.svg dist/assets/
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

- 两版 `<title>` 含中英文姓名、学位与领域关键词；`meta description`（约 150 字，含机构、现职、代表期刊）与 `meta keywords`（含沙尘、印度洋偶极子 IOD、气溶胶光学厚度 AOD、单次散射反照率、功率预测等，主要供百度使用）。
- `<h1>` 是姓名，正文含机构、导师、期刊名，语义化 `article` + `itemprop` 标记。
- 论文条目全部带**影响因子 / 中科院分区 / 主要内容 / 报道来源**，正文可索引文本量大幅增加（18 篇 × 双语的标题、期刊与摘要式描述）。
- 「研究方向」标签行与「媒体报道与学术传播」板块，覆盖电力气象、野火、气溶胶、卫星遥感、AI for Science 等长尾检索词。
- `canonical` + `hreflang`（zh-CN / en / x-default）指向绝对地址，避免中英两版被判为重复内容。
- Open Graph（`og:type=profile`，含 `profile:first_name` / `profile:last_name`）/ Twitter Card、`og:image`（头像）。
- JSON-LD **两段**：① `Person`（姓名、别名、职务、任职机构、4 条 `alumniOf`、`award` 获奖、`knowsAbout` 研究方向、`sameAs` ORCID / ResearchGate、`email`）；② `ItemList` 内含 **18 条 `ScholarlyArticle`**（标题、`datePublished`、期刊 `isPartOf`、DOI `identifier`、主要内容 `abstract`、`Impact Factor` 属性），让搜索引擎理解"这个人写过哪些论文"。
- `<link rel="me">` 指向 ORCID / ResearchGate，帮助引擎把多个身份档案归并到同一个人。
- `sitemap.xml`（中英两页 + 双语互指 + `lastmod`）与 `robots.txt`（声明 sitemap 地址、允许全站抓取）。
- `<meta name="applicable-device" content="pc,mobile">`（百度移动适配声明）；`.nojekyll` 保证资源正常发布；全站无 CDN 依赖，抓取无障碍。

> **项目子路径站点的 `robots.txt` 限制**：站点挂在 `/resume/` 下时，`robots.txt` 的实际地址是 `https://guanyuliu0818.github.io/resume/robots.txt`，而搜索引擎只认域名根目录的 `/robots.txt`。所以包里那句 `Sitemap:` 声明**不会被自动发现**；但这不影响抓取（根 `robots.txt` 返回 404 等于默认允许全站）。对策：按下一节在 Search Console / Bing / 百度里**主动提交** `https://guanyuliu0818.github.io/resume/sitemap.xml`；若想让 robots.txt 也生效，把仓库改名为 `guanyuliu0818.github.io` 变成根站点即可。

### 2. 主动提交收录（上线后做一次）

| 平台 | 操作 |
| --- | --- |
| **Google** | 打开 [Search Console](https://search.google.com/search-console)，添加「网址前缀」资源 → 用 HTML 标签或上传验证文件验证 → 左侧「站点地图」提交 `sitemap.xml` → 「网址检查」里对首页点「请求编入索引」 |
| **Bing**（同时供 Yahoo / DuckDuckGo 部分结果） | [Bing Webmaster Tools](https://www.bing.com/webmasters/) 可直接从 Search Console 一键导入，再提交 sitemap |
| **百度** | [百度搜索资源平台](https://ziyuan.baidu.com/) 添加站点 → 验证 → 「数据引入 / 普通收录」提交 sitemap 或手动提交首页与 `en.html` |

验证是否收录：在搜索引擎输入 `site:你的域名`，或在 Search Console 的「网址检查」看状态。Google 通常几天到两周，百度往往更久。

### 3. IndexNow 主动推送（Bing / Yandex / DuckDuckGo，已内置）

仓库根目录放了验证文件 `bced4a16983c0370b2c634a7cee8c18c.txt`（内容就是这个 key），用于向 IndexNow 证明站点归属。改完内容后一条命令即可主动通知 Bing：

```bash
curl -X POST https://api.indexnow.org/indexnow \
  -H "Content-Type: application/json; charset=utf-8" \
  -d '{
    "host": "guanyuliu0818.github.io",
    "key": "bced4a16983c0370b2c634a7cee8c18c",
    "keyLocation": "https://guanyuliu0818.github.io/resume/bced4a16983c0370b2c634a7cee8c18c.txt",
    "urlList": [
      "https://guanyuliu0818.github.io/resume/",
      "https://guanyuliu0818.github.io/resume/en.html"
    ]
  }'
```

返回 `200` / `202` 即已接收。**注意**：Google 与百度不支持 IndexNow（Google 的 sitemap ping 接口已于 2023 年废弃），它们仍要靠 Search Console / 百度资源平台手动提交；Bing 收录后会同步给 DuckDuckGo、Yahoo，而 ChatGPT 等 AI 搜索也使用 Bing 索引，所以这一步的间接收益不小。

### 4. 加速被发现（最有效的一招）

新站主要靠**外部链接**被爬虫发现。建议把主页网址填进这些已有公开档案（都是免费、十几分钟能填完）：

| 渠道 | 位置 | 价值 |
| --- | --- | --- |
| **ORCID** | Edit → Websites & social links 添加主页；再把 18 篇论文的 DOI 补成 Works | 学术身份核心节点，Google 权重高 |
| **ResearchGate** | 个人资料的 website / contact info | 学术搜索常居首屏 |
| **Google Scholar** | 档案里的「首页」字段 | 名字检索时直接出现在学者卡片里 |
| **Semantic Scholar / OpenAlex** | 作者页的 homepage 字段 | 供 AI 与学术搜索抓取 |
| **单位或院系人员页** | 南方电网 / 北大院系介绍页 | 权威站点外链，最有说服力 |
| **GitHub 个人 README** | 新建 `guanyuliu0818/guanyuliu0818` 仓库，README 里放主页链接 | GitHub 自身权重高，且会被 Bing 快速收录 |
| **知乎 / 微信公众号 / LinkedIn / 小红书** | 个人简介里放主页链接 | 中文检索与社交曝光；公众号文章可分别介绍每篇论文 |

中文场景还有一个低成本高收益的做法：把「Middle East dust」「中东沙尘与印度洋偶极子」「夜间气溶胶反演」这类主题写成科普短文发在公众号或知乎，文末挂主页链接——媒体与社交平台的外链比反复提交 sitemap 有效得多。

> 国内访问提示：`*.github.io` 在国内连通性不稳定，百度抓取可能失败。若主要面向国内，建议绑定自定义域名（仓库 Settings → Pages → Custom domain，并加一条 CNAME 解析），或改用方案 B 的国内节点托管（腾讯云 EdgeOne / CloudBase）；换域名后记得更新 `site.canonicalBase` 重新构建并重新上传。

## 隐私提醒

两份原始简历 PDF 含手机号、出生年月等信息，已写入 `.gitignore`，**不会被推到公开仓库**。

如果希望在网页上挂简历：请先自行脱敏，另存为 `assets/cv.pdf`，再把 `content.json` 中 `sidebarLinks` 里 `简历 CV (PDF)` 的 `url` 填成 `assets/cv.pdf` 并重新构建。

## 发布包

两个包按用途区分，均已用正斜杠路径打包并校验，**都不含两份原始简历 PDF 与本地记忆目录**：

| 包 | 文件数 | 用途 |
| --- | --- | --- |
| `personal-homepage-static.zip` | 10（含 `assets/`） | 标准静态站，适合直接上传到 Cloudflare Pages、腾讯云 EdgeOne 或任何静态托管 |
| `personal-homepage-publish.zip` | 15 | 完整源码包：额外含 `content.json` / `build.js` / `README.md` / `.gitignore` 与 Pages 自动部署工作流，便于日后改内容 |

`site.canonicalBase` 已配置，`sitemap.xml` / `robots.txt` 都在包内。最快路径：解压 → 用方案 A 或 B 任一方式上传 → 拿到网址（已确定是 `https://guanyuliu0818.github.io/resume`）→ 到 Search Console / Bing / 百度提交 sitemap。只预览的话直接双击 `index.html` 即可。

## 已核实的外链

侧栏 Follow 目前只保留三项：ORCID（`0000-0002-2202-4746`）、发送邮件（`liuguanyu@csg.cn`）、ResearchGate（用户提供的 `Guanyu-Liu-4` 主页）。Google Scholar、CV PDF、GitHub 已移除；如需加回，在 `sidebarLinks` 里补一条并填 `url` 即可自动显示。

页面上 **18 篇论文的 18 个 DOI** 均通过 Crossref 逐条验证，标题、作者与期刊全部匹配，其中中文《科学通报》短文的 DOI 为 `10.1360/tb-2023-0457`。

两版页面均带 `hreflang` 互指、`og:locale`、Open Graph / Twitter Card 与 JSON-LD Person 结构化数据，便于搜索引擎识别中英双版本；配置 `site.canonicalBase` 后还会输出绝对 `canonical`、`sitemap.xml` 和 `robots.txt`。

## 可选的后续补充

- **上线后填写 `site.canonicalBase` 并重新构建**（否则 hreflang 为相对地址、无 sitemap，收录会打折扣）
- 如需恢复 GitHub 主页或脱敏后的 CV PDF，在 `sidebarLinks` 补一条并填 `url` 即自动显示
- 论文影响因子与分区取自 `北京大学_刘冠宇_科研.pdf`，随 JCR 年度更新时同步修改 `content.json` 的 `metrics`
- 报道来源目前只写媒体名；若拿到具体文章链接，可把 `media` 里的对象改成 `{"zh": "...", "en": "...", "url": "..."}` 后再扩展渲染
- ORCID 是从公开档案推断填入的，发布前建议本人再确认一次
- 若论文数量、一作篇数与最新进展有变化，同步修改 `content.json` 后重新构建
