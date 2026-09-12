#!/usr/bin/env node
/**
 * check-emoji.js — 图标语言门禁
 *
 * 项目铁律：全站禁用 emoji 图标，统一使用自建天体图谱图标体系
 * （components/icon · 内联 SVG）+ 排印符号（✦ ★ ◈ ◇ → ｜ · ★☆）。
 *
 * 本脚本扫描仓库内所有文本文件，检出「真 emoji」（彩色象形字符），
 * 发现即退出码 1，用于 CI 与本地 pre-commit 双重拦截，防止 emoji 回流。
 *
 * 用法：
 *   node scripts/check-emoji.js              # 扫描 git 已跟踪文件（CI 用）
 *   node scripts/check-emoji.js --all        # 扫描工作区全部文件（含未跟踪）
 *   node scripts/check-emoji.js --quiet      # 仅输出结论
 */
'use strict';

const fs = require('fs');
const cp = require('child_process');
const path = require('path');

// ── 允许的排印符号（非 emoji，项目视觉语言的一部分）─────────────────
// 这些是黑白文字符号 / 几何字符，与彩色 emoji 象形字符有本质区别
const ALLOWED = new Set([
  '\u2726', // ✦ 四芒星
  '\u2727', // ✧ 空心四芒星
  '\u2605', // ★ 实心星
  '\u2606', // ☆ 空心星
  '\u2665', // ♥ 心
  '\u2661', // ♡ 空心心
  '\u25b6', '\u25c0', '\u25b2', '\u25bc', // ▶ ◀ ▲ ▼
  '\u2191', '\u2193', '\u2190', '\u2192', // ↑ ↓ ← →
  '\uff5c', '\u00b7', '\u2014', '\u2013', '\u00b0', // ｜ · — – °
  '\u203b', '\u00a7', '\u22ef', '\u2026', // ※ § ⋯ …
  '✓', '✔', '✗', '✘', '✕', '✖', // ✓ ✔ ✗ ✘ ✕ ✖
  '\u2194', '\u2195', '\u2196', '\u2197', '\u2198', '\u2199', // ↔ ↕ ↖ ↗ ↘ ↙ 双向箭头
  '\u2609', // ☉ 日轮
  '\u25c8', '\u25c7', '\u25cb', '\u25cf', // ◈ ◇ ○ ●
]);

// ── 判定：是否属于「真 emoji」─────────────────────────────────────
function isEmoji(ch) {
  if (ALLOWED.has(ch)) return false;
  const o = ch.codePointAt(0);
  if (o >= 0x1f000 && o <= 0x1faff) return true; // 象形符号 / 表情 / 补充符号
  if (o >= 0x1f1e6 && o <= 0x1f1ff) return true; // 区域旗帜
  if (o >= 0x2600 && o <= 0x27bf) return true;   // 杂项符号 + 装饰符号
  if (o >= 0x2b00 && o <= 0x2bff) return true; // 杂项符号与箭头
  // 注：U+2190–U+21FF 箭头区视为排印符号（本项目 → ↑ ↓ ← 为图标语言的一部分），
  //     真 emoji 化的箭头必带 U+FE0F，由下方变体选择符判定拦截
  if (o === 0xfe0f) return true;                 // emoji 变体选择符
  if ([0x203c, 0x2049, 0x2122, 0x2139, 0x3030, 0x303d, 0x3297, 0x3299].includes(o)) return true;
  return false;
}

// ── 跳过目录 / 二进制扩展名 ───────────────────────────────────────
const SKIP_DIRS = new Set(['.git', 'node_modules', 'coverage', '__pycache__',
  'miniprogram_npm', 'dist', 'build', '.husky']);
const SKIP_EXT = new Set(['.png', '.jpg', '.jpeg', '.gif', '.webp', '.ico', '.bmp',
  '.woff', '.woff2', '.ttf', '.otf', '.eot', '.svg', '.map', '.lock', '.pdf',
  '.pyc', '.zip', '.gz', '.mp4', '.mp3', '.xlsx', '.docx', '.pptx']);

// ── 收集待扫描文件 ────────────────────────────────────────────────
function collect(useGit, all, rootDir) {
  if (useGit) {
    try {
      const out = cp.execSync(
        all ? 'git ls-files -co --exclude-standard' : 'git ls-files',
        { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }
      );
      return out.split('\n').map(s => s.trim()).filter(Boolean);
    } catch (e) {
      // 非 git 环境（如打包分发）回退到遍历
    }
  }
  const acc = [];
  (function walk(dir) {
    let entries;
    try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch (e) { return; }
    for (const ent of entries) {
      const p = path.join(dir, ent.name);
      if (ent.isDirectory()) {
        if (SKIP_DIRS.has(ent.name)) continue;
        walk(p);
      } else {
        acc.push(p.replace(/^\.\//, ''));
      }
    }
  })(rootDir);
  return acc;
}

// ── 单文件扫描 ────────────────────────────────────────────────────
function scanFile(file) {
  if (SKIP_EXT.has(path.extname(file).toLowerCase())) return [];
  const parts = file.split(path.sep);
  if (parts.some(seg => SKIP_DIRS.has(seg))) return [];

  let text;
  try { text = fs.readFileSync(file, 'utf8'); } catch (e) { return []; }
  if (text.includes('\u0000')) return []; // 二进制

  const hits = [];
  const lines = text.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    for (let c = 0; c < line.length; c++) {
      const ch = line[c];
      if (isEmoji(ch)) {
        hits.push({
          file,
          line: i + 1,
          col: c + 1,
          ch,
          hex: 'U+' + ch.codePointAt(0).toString(16).toUpperCase().padStart(4, '0'),
          ctx: line.trim().slice(0, 80),
        });
      }
    }
  }
  return hits;
}

// ── 主流程 ────────────────────────────────────────────────────────
function main() {
  const argv = process.argv.slice(2);
  const all = argv.includes('--all');
  const quiet = argv.includes('--quiet');
  // --dir <path>：指定扫描根目录（用于扫描仓库之外的产物，如 每日命理内容/）
  const di = argv.indexOf('--dir');
  const rootDir = di >= 0 && argv[di + 1] ? argv[di + 1] : './';
  const useGit = !argv.includes('--no-git') && rootDir === './';

  const files = collect(useGit, all, rootDir);
  const hits = [];
  for (const f of files) {
    // 本脚本自身含判定逻辑所需的字符定义，跳过自扫描
    if (f.endsWith('scripts/check-emoji.js')) continue;
    hits.push(...scanFile(f));
  }

  if (hits.length === 0) {
    if (!quiet) console.log(`[OK] 图标语言合规：已扫描 ${files.length} 个文件，未发现 emoji`);
    process.exit(0);
  }

  const byFile = new Map();
  for (const h of hits) {
    if (!byFile.has(h.file)) byFile.set(h.file, []);
    byFile.get(h.file).push(h);
  }
  console.error(`\n[FAIL] 图标语言违规：${hits.length} 处 emoji，涉及 ${byFile.size} 个文件\n`);
  console.error('项目铁律：全站禁用 emoji 图标，请改用 components/icon 图标体系或排印符号（✦ ★ ◈ ◇ →）\n');
  for (const [file, list] of byFile) {
    console.error(`  ${file}  (${list.length} 处)`);
    for (const h of list.slice(0, 6)) {
      console.error(`      L${h.line}:${h.col}  ${h.ch}  ${h.hex}   ${h.ctx}`);
    }
    if (list.length > 6) console.error(`      … 另有 ${list.length - 6} 处`);
  }
  console.error('\n修复方式：删除装饰性 emoji，或用 ✦ 等排印符号替代；\n' +
    '若确认某字符属项目视觉语言，请将其加入 scripts/check-emoji.js 的 ALLOWED 白名单。\n');
  process.exit(1);
}

main();
