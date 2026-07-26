#!/usr/bin/env node
/*
 * analyze-web.js — 轮播内容选题 + 网站分析
 * 双模式：
 *   1) 有 target_url 且未强制 use_seed → Playwright 抓取真实卖点（需 npm i playwright + npx playwright install chromium）
 *   2) 否则 → 从 seed-content.json 按 learnings.json 的 rotation 指针选一篇，输出 analysis.json
 * 输出：carousel/analysis.json { selected, carousel, brand, disclaimer, source }
 */
const fs = require('fs');
const path = require('path');

const DIR = __dirname;
const cfg = JSON.parse(fs.readFileSync(path.join(DIR, 'config.json'), 'utf8'));
const learn = JSON.parse(fs.readFileSync(path.join(DIR, 'learnings.json'), 'utf8'));
const seed = JSON.parse(fs.readFileSync(path.join(DIR, cfg.seed_file), 'utf8'));

function pickByRotation() {
  const list = seed.carousels;
  const idx = learn.rotation % list.length;
  return { idx, carousel: list[idx] };
}

function writeAnalysis(source, carousel) {
  const out = {
    source,
    selected: carousel.id,
    pillar: carousel.pillar,
    hookType: carousel.hookType,
    tags: carousel.tags,
    slides: carousel.slides,
    brand: cfg.brand,
    disclaimer: cfg.disclaimer,
    project: cfg.project
  };
  fs.writeFileSync(path.join(DIR, 'analysis.json'), JSON.stringify(out, null, 2), 'utf8');
  // 推进轮转指针并落盘
  learn.rotation = (learn.rotation + 1) % seed.carousels.length;
  fs.writeFileSync(path.join(DIR, 'learnings.json'), JSON.stringify(learn, null, 2), 'utf8');
  return out;
}

(async () => {
  const url = (cfg.target_url || '').trim();
  if (!url || cfg.use_seed) {
    const { idx, carousel } = pickByRotation();
    const a = writeAnalysis('seed', carousel);
    console.log(`[analyze] seed 模式 · 选用轮播 #${idx} (id=${a.selected}, ${a.pillar}/${a.hookType})`);
    console.log(`[analyze] 下一步运行 generate_image.py 生成 6 屏；rotation 已推进至 ${learn.rotation}`);
    return;
  }

  // —— 真实抓取模式（Playwright）——
  let playwright;
  try { playwright = require('playwright'); }
  catch (e) {
    console.error('[analyze] 未安装 playwright，请先：`npm i playwright && npx playwright install chromium`。已回退 seed 模式。');
    const { idx, carousel } = pickByRotation();
    const a = writeAnalysis('seed(fallback)', carousel);
    console.log(`[analyze] 选用轮播 id=${a.selected}`);
    return;
  }
  const browser = await playwright.chromium.launch();
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
  const text = await page.evaluate(() => document.body.innerText.replace(/\s+/g, ' ').slice(0, 4000));
  await browser.close();
  // 真实抓取时仍从 seed 选结构，仅把抓到的文案注入首屏钩子参考（简化实现）
  const { carousel } = pickByRotation();
  carousel.slides[0].scrapedContext = text.slice(0, 300);
  const a = writeAnalysis('web:' + url, carousel);
  console.log(`[analyze] 已抓取 ${url}（${text.length} 字）· 选用轮播 id=${a.selected}`);
})().catch(e => { console.error('[analyze] 错误:', e.message); process.exit(1); });
