# 行为干预 P0 五项 · 落地概览

按 `行为干预方案.md` 的 P0 优先级，已将 5 个良性助推落到真实代码，全部基于现有接口、未破坏经济平衡核心、守住合规与护栏红线。

## 已落地清单

| # | 助推 | 改动文件 | 机制 |
| --- | --- | --- | --- |
| P0-1 | 进度虚高起点 | `app.js` / `index.js` / `whimsy.js` | 纯新用户首启赠「星辉初光 +10 功德」，进度从 33% 起步；首页一次性星光反馈 |
| P0-2 | 目标梯度提示 | `chart.js` / `chart.wxml` / `index.js` / `index.wxml` | 进度 ≥70% 切「再攒 Y 即点亮深度解读」高亮；首页常驻距深度解读进度胶囊 |
| P0-3 | 星愿承诺 | `index.js` / `index.wxml` / `profile.js` / `profile.wxml` | 首启引导加「立本月星愿」一步；个人页展示星愿（蔡格尼克张力驱动复访） |
| P0-4 | 默认关注 + 社会证明 | `social.js` / `index.js` / `index.wxml` | 首次预置关注 3 位星野引路人（可取消）；首页社会证明条 |
| P0-5 | 断签续火 | `app.js` | 连签中断检测，回归首签赠「续火礼 +2」、消息红点提醒、温柔弹窗 |

## 校验
- 6 个改动 JS（`app.js` / `utils/whimsy.js` / `utils/social.js` / `pages/index/index.js` / `pages/chart/chart.js` / `pages/profile/profile.js`）`node --check` 全部通过。
- 跨文件 wiring grep 一致：`index↔social.ensureDefaultFollows / whimsy.COPY.welcome`、`chart.js toUnlock/near ↔ chart.wxml`、`profile.js myWish ↔ profile.wxml`、`app.wxss` 新增样式齐备。

## 备注
- P0-1 欢迎礼仅对「无 merit 存储的纯新用户」触发（存量测试账号需清 storage 才可见），符合「仅赠新用户」设计。
- 全部提醒/动画尊重 `prefers-reduced-motion`；功德仍不可提现/交易/购买；无算命改运/医疗承诺文案。

## 交付文件（已修改，可直接在微信开发者工具编译）
- `app.js`、`utils/whimsy.js`、`utils/social.js`
- `pages/index/index.js`、`pages/index/index.wxml`
- `pages/chart/chart.js`、`pages/chart/chart.wxml`
- `pages/profile/profile.js`、`pages/profile/profile.wxml`
- `app.wxss`

## 下一步
P1（连签里程碑序列 / 今日三善 / 快捷发布 / 共修提醒 / 排行榜跃升 / 行为序列消息）与 P2（抽签彩蛋 / 节气稀缺 / 时段场景 / 结缘互惠 / 损失框架）可按方案第 4 节继续推进。
