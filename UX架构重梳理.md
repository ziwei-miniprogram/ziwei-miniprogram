# 拾光驿·星野漫游 — UX 架构重梳理与流畅体验设计

> 文档定位：用户体验架构蓝图 + 开发者交接规范。基于代码事实审计，给出「五空间模型」目标架构与关键流程重设计。
> 适用读者：LuxuryDeveloper（落地实现）、PM（验收）。

---

## 0. 摘要

当前小程序共 **12 个页面**，但仅 **4 个真实 Tab（发现/文旅/消息/我的）+ 1 个中心 UGC（记一笔）**。深度功能入口严重失衡，存在孤儿页、关注漏斗死循环、付费墙无成长引导等断点。

目标架构将 12 页收束为 **5 个用户心智空间**：发现(逛) / 星野(用) / 文旅(行) / 消息(联) / 我的(我)，中心「记一笔」回流发现。孤儿页归位、漏斗打通、付费墙接成长线，形成无死路的体验。

---

## 1. 当前架构审计（事实依据）

### 1.1 页面清单与导航现状

| 页面 | 角色 | 入口来源 | 出口 | 状态 |
|------|------|----------|------|------|
| index（发现） | 每日首页 Hub | Tab | 星图/疗愈/寄愿(navigateTo)、文旅(switchTab)、记一笔、note | 可达 |
| tourism（文旅） | Tab 内容/预订 | Tab | 无外跳 | 可达 |
| chart（星图） | 工具·付费墙 | index 快捷、profile | 不足→merit | 可达但撞墙 |
| healing（疗愈） | 工具 | index 快捷、profile | 无 | 可达 |
| journey（心灵之旅） | 工具 | **无** | 无 | **孤儿页** |
| blessing（祝福视频） | 工具 | **无** | 无 | **孤儿页** |
| mall（商城） | 兑换 | 仅 profile（2 级） | 无 | 入口过深 |
| merit（功德林） | 账户/工具 | index、profile、chart | 内部 5 tab | 可达但无成长引导 |
| note（笔记详情） | 详情 | index、profile | 无 | 可达 |
| message（消息） | Tab | Tab | **无外跳** | 死胡同 |
| profile（我的） | Tab 账户 Hub | Tab | 功德/商城/星图/寄愿/疗愈/笔记 | 可达（双 Hub） |
| publish（记一笔） | UGC | 中心按钮(navigateTo) | navigateBack→发现 | 回流通畅 |

### 1.2 断点清单（B1–B12）

- **B1 孤儿页·心灵之旅**：`pages/journey` 全仓无任何 `navigateTo/switchTab` 入口（grep 零命中）。
- **B2 孤儿页·祝福视频**：`pages/blessing` 同上，零入口。用户原始需求「首页=祝福画面」的核心功能实际不可达。
- **B3 关注漏斗死循环**：发现卡片仅有 赞/藏，无「关注」钮；关注 tab 的 `follow-bar` 仅在 `following.length>0` 显示，空态只提示「去发现逛逛」却无关注入口 → 永远无法关注。
- **B4 搜索死 UI**：`index.wxml` 搜索胶囊无 `bindtap`、无 handler，纯装饰。
- **B5 星图付费墙无成长引导**：`chart.js` 功德不足弹「去积功德」→merit，但 merit 页未展示「如何快速攒功德」；新用户 0 功德点星图即撞墙，无进度感知。
- **B6 消息死胡同**：`pages/message` 无外向导航、无红点驱动；`merit_log` 项不可点回来源页，单向展示。
- **B7 商城价值未定义**：mall 仅从 profile 进入（2 级）；取消金钱后「买什么/用什么买」未与功德经济联动。
- **B8 双 Hub 冗余**：index 与 profile 都暴露 星图/疗愈/寄愿/功德 入口，归属不清、维护双份。
- **B9 功德首页入口缺失**：`index.js` 定义了 `goMerit` 但 `index.wxml` 快捷网格仅 星图/文旅/疗愈/寄愿，功德无首页入口。
- **B10 导航范式不一致**：文旅=switchTab（常驻），其余工具=navigateTo（依赖返回键），深层工具无统一返回/跳转手段。
- **B11 发布回流（良好实践，保留）**：publish→navigateBack→index.onShow→buildLists 重读 `my_publishes`，已发布内容置顶显示，闭环通畅。
- **B12 缺乏首次引导/空状态叙事**：新用户落地无 orientation，五空间心智未建立。

---

## 2. 目标信息架构：五空间模型

### 2.1 空间定义与心智模型

| 空间 | 心智词 | 职责 | 承载页面 |
|------|--------|------|----------|
| 发现 | 逛 | 每日首页：仪式 + 内容流 + 入口 | Hero(天气/万年历/宜忌/点灯/签到) · 三栏 feed · 推荐关注 · 星野入口 |
| 星野 | 用 | 工具与仪式集合（接回孤儿页） | 星图 · 疗愈 · 心灵之旅 · 寄愿墙 · 祝福视频 · 功德林 |
| 文旅 | 行 | 星象旅行内容与预订 | 星象线路 · 预订 |
| 消息 | 联 | 社交与动态 | 通知 · 功德动态 · 私信 |
| 我的 | 我 | 身份与资产 | 功德卡 · 星图人格 · 笔记 · 商城 · 设置 |

中心「记一笔」= UGC，写回发现（B11 闭环保留）。

### 2.2 导航结构（Tab 配置建议）

- **真实 Tab（switchTab，对应 app.json tabBar.list）**：发现 / 文旅 / 消息 / 我的（维持 4 项，不超微信上限）。
- **星野 = 非 Tab 的 section 页**：从发现「星野入口」进入，承载全部工具。避免底栏 6 项拥挤，且工具属「用时才进」。
- **中心 UGC**：记一笔（navigateTo publish）。

> 取舍说明：也曾评估把「星野」升为第 5 个真实 Tab（app.json 允许最多 5），但 5 Tab + 中心 = 6 底栏项偏挤；且工具页高频入口在发现已足够。故采用「发现内常驻星野入口 + 独立 section 页」最小改动方案。

### 2.3 页面归属与角色（收敛双 Hub）

- **星野页（新增）** 成为工具唯一归口：chart/healing/journey/blessing/merit 均从星野进入。
- **profile 收敛**：移除散落的 星图/疗愈/寄愿 入口，改为「星野工具箱 →」+「功德林」+「商城」三项，消除 B8。
- **index 快捷网格**：改为「星野入口」一枚主入口 + 文旅(Tab) + 推荐关注条，消除 B9（功德经星野/我的可达）。

---

## 3. 关键用户流程重设计（去死路）

### 3.1 首次启动引导（修复 B12）
轻量 overlay（仅首次，存 `first_launch`）：一句话讲清五空间 + 引导完成「点灯 +1 / 签到 +3」首日仪式，立刻给正反馈。

### 3.2 每日仪式闭环（发现 Hero）
点灯(+1) / 签到(+3) 已在 Hero，补「今日已得 N 功德」进度，强化日活钩子。

### 3.3 关注漏斗修复（修复 B3）
发现「发现」tab 顶部常驻「推荐关注」横条（取 `following` mock），每张带「关注」钮 → `onToggleFollow`；关注成功后该用户笔记流入「关注」tab。打破「发现无关注钮 ⇄ 关注空态」死循环。

### 3.4 发布回流（保留 B11）
publish→navigateBack→index.onShow 重读，已发布置顶。无需改动，列为规范。

### 3.5 工具使用 → 功德成长闭环（修复 B5）
星图锁屏加：① 当前功德 / 所需 进度条；② 三条明路「点灯+1 / 签到+3 / 发布+8 / 互动+1」一键直达；③ merit 页顶部加「如何攒功德」卡。让付费墙变成长线而非墙。

### 3.6 功德 → 商城兑换闭环（修复 B7）
mall 明确「用功德兑换星野好物」，商品 `cost` 以功德计价，兑换走 `spendMerit`（与 app.js 接口一致，禁止金钱）。

---

## 4. 开发者交接规范

### 4.1 新增 / 调整文件
- **新增** `pages/space/space.{js,wxml,wxss,json}`：星野工具箱（六宫格入口，接回 journey/blessing）。
- **改** `pages/index/index.wxml`：快捷网格→「星野入口」+ 推荐关注条；搜索胶囊接 `bindtap="goSearch"`。
- **改** `pages/index/index.js`：增 `goSpace` / `goSearch` / 发现卡 `onFollow`（取 mock 推荐关注）。
- **改** `pages/profile/profile.wxml`+`js`：收敛为 星野工具箱 / 功德林 / 商城。
- **改** `pages/merit/merit.wxml`+`js`：顶部加「如何攒功德」成长卡。
- **改** `pages/chart/chart.wxml`+`js`：锁屏加进度条 + 三条路径直达。
- **改** `pages/message/message.wxml`+`js`：红点（读 `app.globalData.unread`）+ merit_log 项可点回来源。
- **改** `pages/mall/mall.*`：功德计价 + 兑换走 `spendMerit`。
- **改** `app.js`：增 `unread` 计数与 `markRead()`；`merit_log` 项带 `route` 字段供消息溯源。

### 4.2 app.json / tabBar
维持现有 4 Tab 不变；星野不走 Tab（见 2.2）。如改方案为 5 Tab，则 `tabBar.list` 增 `pages/space/space` 并同步 custom-tab-bar。

### 4.3 导航约定
- 真实 Tab（switchTab）：发现 / 文旅 / 消息 / 我的。
- section 页（navigateTo）：星野、chart、healing、journey、blessing、merit、note、publish、mall。
- 跨空间跳转统一 `navigateTo`，保持页面栈清晰；深层页提供「返回发现/星野」面包屑（修复 B10）。
- 所有 `navigateTo` 页在 `onShow` 调用 `this.getTabBar().setData({selected})` 仅限 Tab 页。

### 4.4 状态与接口（复用现有）
- 功德：`app.addMerit / spendMerit / doCheckin / checkedInToday`（已集中，替换点清晰）。
- 社交：`utils/social.js` `toggleLike/Collect/Follow` + `countStr`（已实时计数）。
- 内容安全：`utils/censor.js` `check/advice`（发布预检）。
- 发布：`wx.setStorageSync('my_publishes')` + `social.log`（消息溯源）。

### 4.5 实施优先级
- **P0 断点止血**：B1/B2（星野接回孤儿页）、B3（关注漏斗）、B4（搜索）、B9（功德首页入口）。
- **P1 闭环强化**：B5（付费墙成长引导）、B6（消息红点+回流）、B8（双 Hub 收敛）。
- **P2 体验打磨**：B7（商城价值）、B12（首次引导）、B10（统一返回）。

---

## 5. 验收标准

1. 孤儿页可达率 100%：从星野可进入 心灵之旅 / 祝福视频。
2. 关注漏斗可走通：发现推荐关注 → 关注 → 关注 tab 出现该用户笔记。
3. 搜索可响应（至少进入搜索/过滤，不再死 UI）。
4. 星图锁屏展示进度条 + 三条攒功德路径，新用户可知如何解锁。
5. 消息有红点驱动，且功德动态项可点回来源页。
6. 双 Hub 收敛：profile 不再散落工具入口，工具唯一归口为星野。
7. 商城以功德计价，兑换走 `spendMerit`，无金钱交易。

---
*架构师：ArchitectUX · 基于 2026-07-24 代码事实审计*
