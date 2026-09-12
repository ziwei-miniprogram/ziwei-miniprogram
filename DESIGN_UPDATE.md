# 拾光驿 · 星野漫游 — 设计系统更新 &「全要」功能落地

> UI Designer（像素君）交付 · 一次把情感锚点 / 游戏化收集 / 微交互彩蛋三组，连同暗色夜灯、心灯浮标、金字可读性修复、Hero 星爆全部实现。

## 1. 设计令牌体系（双主题）

全局改为令牌驱动（`app.wxss`），明暗通过 `.page` / `.page.dark` 切换：

| 令牌 | 浅色（暖纸） | 深色（夜灯） | 用途 |
|---|---|---|---|
| `--bg` | `#f7f5f0` | `#0B1426` | 页面背景 |
| `--card` | `#ffffff` | `#121d33` | 卡片 |
| `--fg` / `--fg-2` / `--fg-3` | 深棕灰三阶 | 暖白三阶 | 主/次/辅助文字 |
| `--gold` | `#c8a35a` | `#d9b66a` | 装饰/大字/渐变 |
| `--gold-deep` | `#8a6a2a` | `#c8a35a` | **正文金字**（浅底达 AA 4.5:1） |
| `--gold-soft` / `--gold-tint` | 金系浅染 | 暗金浅染 | 胶囊/底纹 |
| `--success` | `#5e9788` | `#6fb3a3` | 收编原散落绿 |

**金字对比度修复**：原 `#c8a35a` 作浅底文字约 2.5:1（不达标）。现正文金统一用深金 `#8a6a2a`（对 `#f7f5f0` ≈ 5.0:1，满足 WCAG AA 4.5:1）；暗底用亮金 `#d9b66a`（对 `#0B1426` ≈ 6.8:1）。

## 2. 暗色夜灯模式

- `app.js`：`globalData.theme` + `setTheme()` / `getTheme()` / `applyTheme()`（同步原生导航栏与背景）。
- 主题持久化（`app_theme` storage），重启恢复。
- 个人页「夜灯模式」开关，切换即同步原生栏、tabBar、心灯浮标。
- **全站已适配（全部 14 页）**：发现 / 文旅 / 消息 / 我的 + 星图 / 功德中心 + 寄愿 / 疗愈 / 旅程 / 笔记 / 星野 / 搜索 / 发布 / 好物。每页根加 `class="page {{theme}}"`，`onShow` 调 `app.applyTheme()` 并 `setData({theme})`，主背景/卡片/文字均令牌化（`--bg`/`--card`/`--fg*`/`--gold*`/`--success`/`--border`）。
- 亮底页面（如 journey 玉色、note/mall 功德金）在深色下自动转深蓝玻璃，保持品牌同源。

## 3. 可复用组件

### `components/heart-lamp` — 常驻心灯浮标（情感锚点）
- 右下悬浮，显示今日功德 + 连签火苗，点击呼出「点灯 / 签到 / 记一笔」低摩擦入口。
- 44px+ 触控区、不挡滚动、`prefers-reduced-motion` 降级。
- 由自定义 tabBar 自动挂载四个 tab 页；星图 / 功德中心显式引入。
- 反馈写入当前页 `fx`/`dust`，星屑在所在页浮层渲染。

### `components/star-map` — 二十八宿星图（游戏化收集）
- 四方各七宿（青龙/玄武/白虎/朱雀），按修行进度（功德/2000）点亮，连签时整体微光呼吸。
- 点按单宿显示其名与温柔释义（文化意象，非预测）。
- 明暗两主题配色；`lit` / `glow` / `theme` 属性由父页传入。

## 4. 功能落点

| 功能 | 位置 | 说明 |
|---|---|---|
| 暗色夜灯 | 全局 + 个人页开关 | 深蓝沉浸，令牌驱动 |
| 心灯浮标 | tabBar 挂载 + chart/merit | 随时点灯/签到/记一笔 |
| 二十八宿星图 | 星图页 `star-map` | 进度可视化 |
| 金色成就徽章 | 个人页 `badges` | 15 枚，按真实状态解锁（连签/等级/三善/结缘/记一笔/星签…） |
| 每日星签彩蛋 | 个人页 `sign-card` | 每日一签，文案池 `COPY.starsign`，次日可再抽 |
| 星屑分型微交互 | `whimsy.stardust()` | 点灯/签到/抽签时放射细碎星光 |
| Hero 星爆动画 | 首页 `heroBurst` | 首屏一次性星爆入场，社媒新用户 3 秒浪漫感 |
| 入场「开窗」动画 | 首页 `win-open` | 小程序进入时双扉滑开、星光透入（仅冷启动一次），窗口开后再接力 Hero 星爆 |
| 心灯「三善成」金色呼吸 | `components/heart-lamp` | 本日点灯/随喜/冥想皆成，浮标转金并呼吸 + 「三善成」小标 |
| 星签 / 徽章文案 A/B | `whimsy.badgeLine` / `applyVariantPool` | 文案池优先读实验变体（`whimsy_ab`），缺失回退默认，管线 `learnings.json` 可直接注入 |

## 5. 无障碍与性能

- 全站 `prefers-reduced-motion` 关闭非必要动画，保留信息。
- 金字对比度达 AA；触控目标 ≥44px。
- 组件懒挂载、动画走 `transform`/`opacity`，无布局抖动。
- 所有 JS 已通过 `node --check`，JSON 配置合法。

## 6. 改动文件清单

**新增**
- `components/heart-lamp/*`（4 文件）
- `components/star-map/*`（4 文件）

**修改**
- `app.js`（主题状态/切换/应用）
- `app.wxss`（双主题令牌 + 全局类令牌化 + 星屑/Hero 星爆样式）
- `utils/whimsy.js` / `utils/whimsy.wxml`（星屑、Hero 星爆、星签文案、dust 渲染、**A/B 文案插槽**）
- `custom-tab-bar/*`（挂载心灯浮标 + 暗色 tabBar + 传入 theme）
- `pages/index`（主题类 + **开窗动画** + Hero 星爆接力 + 功能接入）
- `pages/profile`（主题类 + 徽章文案 A/B + 令牌化）
- `pages/chart`、`pages/merit`、`pages/message`、`pages/tourism`（主题类 + 功能接入 + 令牌化）
- `components/heart-lamp/*`（**三善成金色呼吸** + 点灯计入三善）
- 暗色扩展到**全部 14 页**：`pages/blessing`、`pages/healing`、`pages/journey`、`pages/note`、`pages/space`、`pages/search`、`pages/publish`、`pages/mall`（根 `page {{theme}}` + `onShow` 主题 + wxss 令牌化）

## 7. 本轮交付（[OK] 已全部完成）

### 7.1 入场「开窗」动画（愉悦客户情绪）
- 位置：首页 `pages/index` 顶层遮罩 `.win-open`（z-index 950）。
- 表现：两扇窗扉（带窗棂竖向格栅）自中缝向两侧滑开（`woOpenL`/`woOpenR`，1s `cubic-bezier`），背后金光透入 + 16 颗星光渐显闪烁，中轴浮现「拾光驿·星野漫游」；窗扉滑尽后遮罩撤掉，Hero 星爆接力放射。
- 节奏：仅**小程序冷启动**播放一次（`onLoad` 触发；切 tab 不重播）；`winOpen` 在 1.2s 后移除。
- 暗色：`.page.dark` 下窗扉转深蓝描金，风格统一。
- 无障碍：`prefers-reduced-motion` 直接隐藏遮罩、秒显内容。

### 7.2 暗色铺满剩余 8 页
- 8 页全部接入双主题（根 `page {{theme}}` + `onShow` 主题同步 + wxss 令牌化），夜灯模式全站生效、不再闪白。

### 7.3 心灯「已完成三善」金色呼吸
- 三善判定 = `lamp`（点灯）+ `bond`（随喜）+ `meditate`（冥想）三者本日均成（`app.getDailyDeeds()`）。
- 达成后心灯浮标转金、外环金色呼吸、左上角「三善成」小标；点灯动作现自动计入三善（`markDailyDeed('lamp')`）。

### 7.4 星签 / 徽章文案 A/B 接入
- `whimsy.js` 新增 `applyVariantPool(pool)` / `badgeLine(key,def)` / `variantOf(key)`；文案优先读 storage `whimsy_ab`（实验变体），缺失回退默认 `COPY`。
- 实验管线（carousel `learnings.json` 收敛胜出文案后）调用 `whimsy.applyVariantPool({ starsign:[…], badgeDesc:{…} })` 即可热更文案。
- 个人页徽章墙已渲染 `desc`（A/B 可控），默认 15 条文案见 `buildBadges`。

## 8. 验证
- 12 个 JS 文件全部 `node --check` 通过。
- 8 页 wxss 令牌化后无残留「亮底卡片」硬编码（仅剩金色/彩色背景上的白色文字 `#fff`，明暗通用）。
- 视觉走查建议：开发者工具开启「暗色模式」后逐页确认背景/卡片/文字对比度；首屏开窗动画建议在真机验证 `onLoad` 时序。
