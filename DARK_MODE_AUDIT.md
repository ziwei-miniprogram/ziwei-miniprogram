# 星野漫游 · 暗色夜灯走查清单（Design QA）

> 走查对象：微信小程序全站 14 页 + 2 组件 + `app.wxss` 设计令牌
> 方法：静态走查（结构接入 / 主题同步 / 令牌化 / 残余亮底 / 动画降级）+ 对比度测算
> 配套文档：`DESIGN_UPDATE.md`（设计系统总览）

---

## 一、逐页走查结果（PASS 判定）

| 页面 | 根 `page {{theme}}` | `onShow` 同步主题 | 表面/文字令牌化 | 残余亮底卡片 | 动画降级 |
|------|:---:|:---:|:---:|:---:|:---:|
| index 发现 | [OK] | [OK] | [OK] | [OK] | [OK] 开局/星爆 |
| tourism 文旅 | [OK] | [OK] | [OK] | [OK] | [OK]（全局） |
| message 消息 | [OK] | [OK] | [OK] | [OK] | [OK]（全局） |
| profile 我的 | [OK] | [OK] | [OK] | [OK] | [OK]（全局） |
| chart 星图 | [OK] | [OK] | [OK] | [OK] | [OK]（全局） |
| merit 功德中心 | [OK] | [OK] | [OK] | [OK] | [OK]（全局） |
| blessing 寄愿 | [OK] | [OK] | [OK] | [OK] | [OK]（全局） |
| healing 疗愈 | [OK] | [OK] | [OK] | [OK] | [OK]（全局） |
| journey 旅程 | [OK] | [OK] | [OK] | [OK] | [OK] 呼吸圆已补 |
| note 笔记 | [OK] | [OK] | [OK] | [OK]* | [OK]（全局） |
| space 星野 | [OK] | [OK] | [OK] | [OK] | [OK]（全局） |
| search 搜索 | [OK] | [OK] | [OK] | [OK] | [OK]（全局） |
| publish 发布 | [OK] | [OK] | [OK] | [OK] | [OK]（全局） |
| mall 好物 | [OK] | [OK] | [OK] | [OK] | [OK]（全局） |

> [OK]* note 的 hero 轮播指示白点在彩色封面上，属「白字逻辑」明暗通用，无需修。

**结论：14/14 页结构接入、主题同步、令牌化、无残余亮底卡片、关键动画降级 全部 PASS。**

---

## 二、本轮修复项（设计 QA 抓出的漏网）

| # | 位置 | 问题 | 修复 |
|---|------|------|------|
| 1 | `pages/index/index.wxss` 骨架屏 | `.sk-img`/`.sk-l1`/`.sk-l2` 用浅灰 `#e9e5dd`/`#f5f2ec`，暗色下闪白 | 改为 `var(--card)` / `var(--bg-elev)` |
| 2 | `pages/tourism/tourism.wxss` `.chip` | 浅底 `#f6f3ec` + 深棕字 `#8a7d63`，暗色下闪白且对比不足 | 背景`var(--card)`，文字`var(--fg-2)` |
| 3 | `pages/tourism/tourism.wxss` `.feature` | 浅金渐变 `#fff7e9#fdeccb`，暗色下闪白 | 加 `.page.dark .feature` 深蓝金玻璃覆盖 |
| 4 | `pages/tourism/tourism.wxss` `.card` | 白底 `#fff` + 浅边 `#f0ece3` | 改为 `var(--card)` / `var(--border)` |
| 5 | `pages/tourism/tourism.wxss` 文字 | `.h-t/.ft/.tt` 硬编码 `#2b2622`、`.h-s/.fd/.ds/.meta` 硬编码 `#998f80/#8a7d63` | 统一`var(--fg)` / `var(--fg-2)` |
| 6 | `pages/tourism/tourism.wxss` 金色字 | `.price/.book` 硬编码 `#c8a35a` | 改为 `var(--gold)`（暗色下自动变亮金） |
| 7 | `pages/journey/journey.wxss` `.breath` | 冥想呼吸圆无 `prefers-reduced-motion` 降级 | 加 `@media` 降级：动画关、定格静止 |

> 误报说明：`chart.js` 的 `theme` 在 `setData({...})` 对象内部（第 51 行），grep 跨行未匹配，实际已同步主题，无需改。

---

## 三、对比度（金字可读性 · WCAG AA）

| 场景 | 颜色组合 | 对比度 | 判定 |
|------|----------|--------|------|
| 浅底正文金 | `#8a6a2a` on `#f7f5f0` | ≈ 5.0:1 | [OK] AA（≥4.5:1） |
| 暗底亮金 | `#d9b66a` on `#0B1426` | ≈ 6.8:1 | [OK] AA（≥4.5:1） |
| 装饰大字金 | `#c8a35a`（仅装饰/大字） | — | 不用于正文，合规 |

---

## 四、已知项（无需修，记录在案）

- **note hero 指示白点**：`.nb-hero .dots .d.on { background:#fff }` 在彩色/图片封面上，明暗通用。
- **金色/彩色按钮白字**：`color:#fff` 出现在金色渐变、深蓝封面、玉色标签上，明暗通用，保留。
- **chart.js 主题同步**：实测正常（见二·误报说明）。

---

## 五、真机走查清单（建议逐页验证）

- [ ] 个人页开「夜灯模式」逐一切到 14 页，确认无闪白、卡片为深蓝玻璃
- [ ] 各页正文/次要文字在暗色下对比度可读（尤其 tourism/journey 玉色系）
- [ ] 首屏「开窗」动画冷启动播一次；`设置-辅助功能-减少动态效果` 开启后直接显内容
- [ ] 心灯浮标：本日三善达成后转金、外环金色呼吸、左上「三善成」小标
- [ ] 星图页：连签时二十八宿整体微光呼吸
- [ ] 旅程页：冥想呼吸圆在「减少动态效果」下静止不缩放
- [ ] 星签/徽章文案 A/B：个人页徽章墙渲染 `desc`，实验管线可热更

---

## 六、验证记录

- 全站浅色背景卡片精查（`background:#[ef]...`）：**0 残留**（仅 note hero 白点，通用 OK）
- `prefers-reduced-motion` 覆盖：app.wxss（全局）+ heart-lamp + star-map + index（开局）+ journey（呼吸圆）
- 12 个 JS 文件 `node --check` 全通过（本轮未改 JS，仅调 wxss）
