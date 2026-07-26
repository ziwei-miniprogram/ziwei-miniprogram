# 星野漫游 · 轮播增长管线（Carousel Growth Pipeline）

自动把内容素材变成可发布的 6 屏社媒轮播，并据数据自我迭代。

## 目录结构
```
carousel/
  config.json            品牌令牌/平台/节奏/模型
  seed-content.json      5 套样例轮播（无落地页时驱动管线）
  learnings.json         滚动学习库（钩子权重/支柱占比/轮转指针/history）
  analyze-web.js         选题+网站分析（Playwright 或 seed）
  generate_image.py      Gemini 生成 6 屏（图生图保一致）
  publish-carousel.sh    Upload-Post 发布（TikTok/IG）
  check-analytics.sh     拉取 Upload-Post 数据
  learn-from-analytics.js 数据 → learnings.json 洞察
  run-pipeline.sh        总编排
```

## 快速开始（无需任何密钥，先看产物）
```bash
cd carousel
bash run-pipeline.sh --no-publish
```
会产出 `analysis.json`（选定轮播）、`slide-prompts.json`（6 屏标题+视觉提示词）。
无 `GEMINI_API_KEY` 时不会生成 JPG，但提示词计划完整可用。

## 接入真实生成 + 发布
```bash
export GEMINI_API_KEY="你的key"          # https://aistudio.google.com/app/apikey
export UPLOADPOST_TOKEN="你的token"
export UPLOADPOST_USER="你的upload-post用户名"
bash run-pipeline.sh
```
- Gemini：`gemini-3.1-flash-image-preview`，第 1 屏文生图定视觉 DNA，2-6 屏以 `slide-1.jpg` 图生图。
- 发布：Upload-Post `POST /api/upload_photos`（TikTok+IG，自动配乐，公开）。
- 学习：`check-analytics.sh` + `learn-from-analytics.js` 调权后，下一篇自动套用胜出钩子与支柱占比。

## 切到真实落地页（可选）
编辑 `config.json`：
```json
{ "target_url": "https://你的小程序落地页或官网", "use_seed": false }
```
`analyze-web.js` 会用 Playwright 抓取真实卖点（需 `npm i playwright && npx playwright install chromium`）。
无 Playwright 时自动回退 seed 模式。

## 国内平台适配（重要）
Upload-Post **仅支持 TikTok / Instagram**。本产品主阵地是小红书/抖音/视频号，三种落地方式：
1. **待发布包**：无 UPLOADPOST 密钥时，`publish-carousel.sh` 会生成 `pending-post.json`（6 图路径+文案+标签），可手动发布或对接各平台开放平台。
2. **小红书**：官方 `open.xiaohongshu.com` 图文笔记接口（需企业资质），后续可替换 publish 步骤。
3. **抖音/视频号**：抖音开放平台图文 API / 视频号「小程序卡片」组件直接跳转，需各自接入。

> 自动化目标：有国内平台密钥后，把 `publish-carousel.sh` 换成对应 API 调用即可实现「每日 1 条」autonomous 轮播。

## 合规护栏（玄学类内容）
- 全篇定位「传统文化 + 心理慰藉的娱乐参考」，禁「改运/逆天/必应/医疗承诺/付费算命」。
- 每篇文末统一 `disclaimer`（见 config.json）。
- `seed-content.json` 已逐条标注合规；真实抓取内容需经 `censor` 预检后再生成。

## 成功指标（首月 OKR）
- 发布 ≥ 26 条；封面钩子 A/B ≥ 3 组
- 社媒 UV 占小程序来源 ≥ 15%；新增关注 ≥ 3000
- 第 4 周互动率较第 1 周 +20%
- 0 合规投诉/下架
