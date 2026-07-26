# 轮播增长管线 · 交付概览（开工落地）

## 已交付（可运行代码，非纯方案）
`ziwei-miniprogram/carousel/` 下一套完整 autonomous 轮播管线，已实跑验证（`--no-publish` 模式通过）：

| 文件 | 作用 |
|---|---|
| `config.json` | 品牌令牌/平台/节奏/Gemini 模型/免责声明 |
| `seed-content.json` | 5 套样例轮播（无落地页时驱动管线） |
| `learnings.json` | 滚动学习库（钩子权重/支柱占比/轮转指针/history） |
| `analyze-web.js` | 选题+网站分析：Playwright 抓真实卖点，或无 URL 时按轮转指针从 seed 选一篇 |
| `generate_image.py` | Gemini `gemini-3.1-flash-image-preview`：第1屏文生图定 DNA，2-6屏图生图保一致；无 key 仅出提示词计划 |
| `publish-carousel.sh` | Upload-Post 发布（TikTok/IG）；无密钥时生成 `pending-post.json` 待发布包 |
| `check-analytics.sh` | 拉取 Upload-Post 主页/单篇数据 |
| `learn-from-analytics.js` | 数据 → 调权写入 learnings.json（胜出钩子加权、支柱占比动态） |
| `run-pipeline.sh` | 总编排：分析→生成→发布→学习 |
| `README.md` | 运行/接入/国内平台适配/合规 |

## 实跑结果（无密钥安全降级）
- `bash run-pipeline.sh --no-publish` 全过：语法校验 6/6 OK
- 产出 `analysis.json`（选用轮播 A / 痛点共鸣 / 提问型 / 6 屏）、`slide-prompts.json`（6 屏标题+视觉提示词）
- `learnings.json` 轮转指针已推进（rotation 0→1），证明选题轮询闭环可用

## 接真实生成+发布只需三行
```bash
export GEMINI_API_KEY=... UPLOADPOST_TOKEN=... UPLOADPOST_USER=...
bash run-pipeline.sh
```

## 关键决策（务必知悉）
1. **双模式**：小程序无公开落地页 → 默认 seed 模式用 5 套样例驱动；填 `config.target_url`+装 Playwright 即切真实抓取。
2. **国内平台缺口**：Upload-Post 仅 TikTok/IG。小红书/抖音/视频号需各自开放平台 API，README 已留适配位（`publish-carousel.sh` 无密钥时输出 `pending-post.json` 可手动/API 发布）。下一步接国内密钥即可实现「每日 1 条」。
3. **合规护栏**：全篇娱乐参考定位、文末统一 disclaimer；真实抓取内容需经 `censor` 预检再生成（已在 README 标注）。

## 下一步
- 提供 GEMINI/Upload-Post 密钥 → 真出图 + 真发布
- 或提供小红书/抖音开放平台资质 → 替换发布步骤，落地国内每日轮播
- 接真实数据后 learnings.json 自动调权，第 4 周互动率目标 +20%
