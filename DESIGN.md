# DESIGN.md — 拾光驿 · 星野漫游

> 设计系统规范（AI 可读）。参考：Apple（排版克制 / 极致留白）、Stripe（渐变工艺 / 柔和阴影）、Airbnb（人文温度）。
> 风格定位：**星夜拾光** —— 简洁大气、静谧疗愈、温暖有光。

> **统一收口（ Implementation 准则）**：主强调色**唯一**为星辉金（`#c8a35a` / `--gold-500`）；早期残留的紫渐变（`#7b4b94 → #c98a3a`）已在全站清除。深色仅允许出现在**首页顶部「星夜祝福 Hero」**一处（深蓝星夜 `#0B1426 → #16243f`，非紫）；文旅 / 心灵之旅 / 功德 / 商城等其余页面统一走**浅色暖纸 + 白卡 + 轻投影**。星紫不再作为强调色，仅可作疗愈 / 寄愿场景的极少量点缀。

---

## 1. Visual Theme & Atmosphere

品牌哲学：在喧嚣中为人拾起一段安静的光阴，于星野间漫游身心。
视觉基调：夜空般沉静的深色画布 + 星辉暖金的点缀，像深夜抬头看见的第一颗星。
核心特征：**极简 · 留白 · 星辉 · 温润 · 呼吸感**。
质感倾向：玻璃拟态（glassmorphism）为主，辅以极轻的内发光与柔和投影，不做重拟物、不做高饱和。

---

## 2. Color Palette & Roles

```css
:root{
  /* 深夜画布（页面底色 / 手机外壳） */
  --ink-950:#080F1E; --ink-900:#0B1426; --ink-800:#0E1B33; --ink-700:#16243F;
  /* 星辉金（主强调 / 功德 / 心灯） */
  --gold-300:#F4E3B8; --gold-400:#EBD29A; --gold-500:#E0BE78; --gold-600:#C9A25A;
  /* 玉色（疗愈 / 心灵之旅） */
  --jade-400:#9FD0C2; --jade-500:#7FB7A8; --jade-600:#5E9788;
  /* 暖玫（祝福温度） */
  --rose-400:#E3A9A0;
  /* 暖纸（浅色内容面，可选） */
  --paper-50:#F7F3EA; --paper-100:#EFE9DC;
  /* 文字 */
  --text-on-dark:#F4EFE3; --text-muted-dark:#A9B4C9;
  --text-on-light:#2A2418; --text-muted-light:#7A7060;
  /* 线 / 面 */
  --line-dark:rgba(255,255,255,.10); --line-light:rgba(42,36,24,.10);
  --surface-glass:rgba(255,255,255,.06);
  /* 语义 */
  --success:#7FB7A8; --warn:#E0BE78; --error:#D98B7A; --info:#8FB4D9;
  /* 阴影色 */
  --shadow-color:rgba(8,15,30,.45);
}
```

| 角色 | 色值 | 变量 | 使用场景 |
|---|---|---|---|
| 页面底 | `#0B1426` | `--ink-900` | 手机外壳 / 页面背景 |
| 主强调 | `#E0BE78` | `--gold-500` | 主按钮、星辉、功德数字 |
| 品牌深 | `#0E1B33` | `--ink-800` | 卡片底、渐变收口 |
| 疗愈色 | `#7FB7A8` | `--jade-500` | 心灵之旅、冥想进度 |
| 暖玫 | `#E3A9A0` | `--rose-400` | 祝福、情感温度点缀 |
| 表面玻璃 | `rgba(255,255,255,.06)` | `--surface-glass` | 所有浮层卡片 |
| 文字（暗） | `#F4EFE3` | `--text-on-dark` | 深色面正文 |
| 文字（暗·次） | `#A9B4C9` | `--text-muted-dark` | 副文 / 占位 |

---

## 3. Typography Rules

```css
:root{
  --font-serif:"Source Han Serif SC","Songti SC","Noto Serif SC",serif; /* 标题 / 祝福语 */
  --font-sans:"PingFang SC","-apple-system","Helvetica Neue",Arial,sans-serif; /* UI / 正文 */
}
```

| 层级 | 字号 | 字重 | 行高 | 字距 | 用途 |
|---|---|---|---|---|---|
| Display Hero | 34px | 600 | 1.25 | 0 | 祝福语（衬线） |
| H1 | 28px | 600 | 1.3 | 0 | 页面主标题 |
| H2 | 22px | 600 | 1.35 | 0 | 区块标题 |
| H3 | 18px | 600 | 1.4 | 0 | 卡片标题 |
| Body | 15px | 400 | 1.7 | 0 | 正文 |
| Caption | 13px | 400 | 1.5 | .2px | 辅助说明 |
| Nano | 11px | 500 | 1.4 | .4px | 标签 / 角标 |

设计哲学：标题与祝福语用衬线，传递文化感与仪式感；UI 与正文用无衬线，保证可读与克制。字距在 Caption/Nano 微张，营造呼吸感。

---

## 4. Component Stylings

```css
/* 按钮 */
.btn-primary{background:linear-gradient(135deg,var(--gold-400),var(--gold-600));color:#2A2418;
  border:none;border-radius:999rpx;padding:22rpx 36rpx;font-size:28rpx;font-weight:700;
  box-shadow:0 8rpx 24rpx rgba(224,190,120,.35);}
.btn-primary:active{transform:translateY(1rpx);filter:brightness(.97);}
.btn-glass{background:var(--surface-glass);color:var(--text-on-dark);border:1rpx solid var(--line-dark);
  border-radius:999rpx;padding:20rpx 32rpx;font-size:27rpx;backdrop-filter:blur(20px);}
.btn-ghost{background:transparent;color:var(--gold-400);border:1rpx solid rgba(224,190,120,.5);
  border-radius:999rpx;padding:18rpx 30rpx;font-size:26rpx;}

/* 玻璃卡片 */
.card{background:var(--surface-glass);border:1rpx solid var(--line-dark);border-radius:28rpx;
  padding:32rpx;backdrop-filter:blur(20px) saturate(140%);box-shadow:0 10rpx 30rpx var(--shadow-color);}

/* 输入框 */
.input{background:rgba(255,255,255,.05);border:1rpx solid var(--line-dark);border-radius:18rpx;
  padding:24rpx;color:var(--text-on-dark);font-size:28rpx;}
.input:focus{border-color:var(--gold-500);outline:none;}

/* 标签 / 角标 */
.tag{display:inline-block;background:rgba(224,190,120,.14);color:var(--gold-300);
  border-radius:999rpx;padding:6rpx 18rpx;font-size:22rpx;margin:0 8rpx 8rpx 0;}

/* 底部 Tab Bar */
.tabbar{position:fixed;bottom:0;left:0;right:0;height:110rpx;display:flex;
  background:rgba(11,20,38,.82);backdrop-filter:blur(24px);border-top:1rpx solid var(--line-dark);}
.tabbar .item{flex:1;text-align:center;color:var(--text-muted-dark);font-size:22rpx;}
.tabbar .item.active{color:var(--gold-400);}
```

---

## 5. Layout Principles

- 间距基数 **8px**（小程序用 rpx，1 单位≈8rpx 的倍数：8/16/24/32/48）。
- 网格：移动端 4 列，列间距 12rpx；容器 `max-width:420px`，左右 padding **24rpx**。
- 区块间距：卡片间 24rpx；页面顶部留白 48rpx（沉浸式）。
- 留白哲学：首屏只放最重要的一件事（祝福 / 今日一善），其余向下收敛；宁空勿挤。

---

## 6. Depth & Elevation

```css
--shadow-xs:0 1rpx 2rpx rgba(8,15,30,.30);
--shadow-sm:0 4rpx 12rpx rgba(8,15,30,.35);
--shadow-md:0 10rpx 30rpx rgba(8,15,30,.40);
--shadow-lg:0 20rpx 48rpx rgba(8,15,30,.45);
--shadow-glow-gold:0 0 24rpx rgba(224,190,120,.45);
```
- 表面层级：page(`--ink-900`) → surface(glass) → elevated(card+shadow-md) → overlay(modal)。
- Z-index：content 1 / tabbar 50 / overlay 100 / toast 200。
- 玻璃：`backdrop-filter:blur(20px) saturate(140%)`，仅用于浮层，正文区不用。

---

## 7. Do's and Don'ts

**Do's**
- 用大量留白与衬线标题制造仪式感与"大气"。
- 金色只做"光"——点灯、功德、关键行动，不滥用。
- 天气 / 日历用轻玻璃卡片，低对比、不抢戏。
- 图标用单色线描或 emoji 占位，统一圆角 16–28rpx。
- 所有状态文案带温度（"日行一善"而非"完成任务"）。

**Don'ts**
- 不要高饱和、霓虹、重阴影拟物。
- 不要用红/黑做凶煞占卜感配色（规避迷信联想）。
- 不要在首屏堆超过 3 个主入口。
- 不要出现"算命/预测/改运"等敏感词。
- 不要给功德加充值、提现、交易任何入口。

---

## 8. Responsive Behavior

| 断点 | 宽度 | 策略 |
|---|---|---|
| mobile | 375–428 | 单列手机框，4 列网格 |
| tablet | 768+ | 预览操作界面并排：左导航 + 右手机 |
| desktop | 1024+ | 多机对比 / 设计稿 |
| wide | 1440+ | 设计系统总览 |

- 触摸目标 ≥ 44px（88rpx）。
- 字体在 tablet/desktop 预览中不放大，保持手机原生比例（所见即所得）。
- 折叠：导航在窄屏收为底部 Tab；宽屏展开为左侧栏（预览操作界面）。

---

## 9. Agent Prompt Guide

**Quick Reference**：深色星夜底（`--ink-900`）+ 玻璃卡片 + 星辉金（`--gold-500`）+ 衬线标题。简洁大气，留白为王。

**Component Prompts（可直接复制）**
1. 生成"祝福 Hero"：深夜渐变背景 + 微粒星点 + 居中衬线祝福语 + 发光"点亮心灯"金按钮。
2. 生成"万年历"玻璃卡：公历日期 + 农历/节气 + 宜忌两列 + 今日高亮。
3. 生成"天气"迷你组件：城市 + 图标 + 温度 + 一句话星象提示。
4. 生成"文旅线路卡"：渐变封面 + 标题 + 适合星象标签 + 天数/价格 + 预订按钮。
5. 生成"心灵之旅"页：玉色疗愈基调 + 今日冥想 Hero + 冥想列表 + 呼吸圆 animation。
6. 生成"功德中心"：等级徽章 + 功德进度环 + 功德林榜单 + 结缘卡片。

**Iteration Guide**
- 先定底色与金色，再排布首屏唯一主任务。
- 每屏只验证"用户第一眼看见什么"，多余模块下移。
- 玻璃卡片投影统一用 `--shadow-md`，避免每个组件自创阴影。
- 标题一律衬线，正文一律无衬线，勿混。
- 金色出现密度：一屏 ≤ 2 个主金元素。
- 所有列表用"卡片 + 圆角 + 微投影"，拒绝表格感。
- 动效只做"呼吸/淡入/轻位移"，时长 200–400ms，严禁弹跳。
- 交付前跑 `node --check` 与敏感词自检。

---

## 10. 发现流 / 瀑布流（小红书式内容社区）

> 信息架构参考小红书：首页即内容（双列瀑布），结果/游记/疗愈皆封装为"星野笔记"，底部 `+` 发布驱动 UGC。详见 `UI设计方案-小红书风格.html`。

**配色（浅色内容流）**
- 背景 `--bg`（`#f7f5f0` 暖纸）/ 卡片纯白；主强调统一为星辉金 `--gold-500`，疗愈场景玉色（`--jade-500`）、寄愿暖玫（`--rose-400`）作语义点缀，不再使用星紫作主色。
- 品牌灵魂保留：首页顶部"星夜祝福 Hero"（渐变夜空 + 点亮心灯 +1 功德）作首屏沉浸卡，其余走浅色。

**组件**
- 搜索胶囊：圆角 999px、浅灰底、居中占位"搜索 星图·旅行·疗愈·寄愿"。
- 顶 Tab：关注 / 发现 / 视频（发现默认），选中下划线用星辉金。
- 瀑布卡片（`.card`）：渐变封面图（随机高度 120–170px，避免等高呆板）+ 两行标题截断 + 作者头像/昵称 + ♡ 数。双列 `column-count:2; gap:9px`。
- 笔记详情：大图轮播 + 标题 + 正文（带 `#话题`）+ 作者行（关注）+ 底部固定栏（评论 / ♡ / ⭐收藏 / 🪔+1功德）+ 相关双列小卡。
- 发布页"记一笔"：九宫格上传 + 标题 + 正文 + `#话题`芯片 + 关联星图/寄愿 + 发布即 +2 功德。
- 个人主页：封面 + 头像 + 功德卡（等级/进度）+ 统计（笔记/收藏/功德）+ 笔记 3 列网格。

**规格**：卡片圆角 14px；按钮胶囊 999px；双列间距 9px；页面边距 16px；正文 13–15px、标题 18–19px。图标均配文字，对比度达 WCAG AA。

**合规**：笔记/评论/寄愿帖发布前过内容安全 API；星象表述保留"娱乐参考"语境；功德不可购、不可兑，与商城实物电商解耦。

---

## 11. 导航架构（小红书式）

> 参考小红书：底部 5 栏，首页即内容流，中间凸起"发布"钮，个人主页承载资产。

- 底部栏：**发现(index) / 文旅(tourism) / ＋记一笔(publish, 中间凸起圆钮) / 消息(message) / 我的(profile)**。
- `custom-tab-bar` 中间项 `center:true`，点击 `wx.navigateTo` 到发布页（非 tab 页，故发布页不显示底栏）。
- 星图(chart)、心灵之旅(journey)、疗愈(healing)、祝福视频(blessing)、功德中心(merit) 不再作 tab，由发现流卡片、个人页快捷入口、Hero 快捷行触达——保持首屏清爽。
- 选中态：`getTabBar().setData({selected})`，真实 tab 序号 发现=0 / 文旅=1 / 消息=2 / 我的=3。
- 发布页"记一笔"：九宫格 + 标题 + 正文 + #话题 + 关联星图/寄愿，发布即 `app.addMerit(2)`。
