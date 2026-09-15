#!/usr/bin/env node
/**
 * 星野漫游 · 小程序静态编译校验
 * 目标：在无法使用微信开发者工具/ miniprogram-ci（需私密 key + appid）的环境下，
 *      做等价的结构与契约校验，拦截真实崩溃类问题：
 *   1) 所有 .json 可解析；
 *   2) 所有 .js 通过 node --check（语法）；
 *   3) wxml 中 bindtap/bindinput/bindchange/catchtap 的处理器在对应 .js 的 Page/Component 中已定义；
 *   4) 导航契约：wx.navigateTo / redirectTo 的目标【不可】是 tabBar 页；
 *                 wx.switchTab 的目标【必须】是 tabBar 页（小程序硬约束，违反即真机崩溃）。
 * 退出码：0 通过，1 有错误。
 */
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = process.cwd();
let errors = 0;
let checks = 0;

function fail(msg) {
  errors++;
  console.error('  ✗ ' + msg);
}
function ok(msg) {
  checks++;
  console.log('  ✓ ' + msg);
}

function readJson(p) {
  try {
    return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch (e) {
    fail(`JSON 解析失败 ${p}: ${e.message}`);
    return null;
  }
}

// 提取 wxml 中的事件处理器名（bindtap/catchtap/bind:input 等）
function extractHandlers(wxml) {
  const set = new Set();
  const re = /(?:bind|catch)(?::|[a-z]+)?\s*=\s*["']([A-Za-z_]\w*)["']/g;
  let m;
  while ((m = re.exec(wxml))) set.add(m[1]);
  return set;
}

// 提取 .js 中定义的方法名（函数声明 / 方法 / 箭头属性）
function extractDefined(js) {
  const set = new Set();
  let m;
  const patterns = [
    /function\s+([A-Za-z_]\w*)/g,
    /([A-Za-z_]\w*)\s*:\s*function/g,
    /([A-Za-z_]\w*)\s*\([^)]*\)\s*\{/g,
    /([A-Za-z_]\w*)\s*:\s*\([^)]*\)\s*=>/g
  ];
  for (const re of patterns) {
    while ((m = re.exec(js))) set.add(m[1]);
  }
  return set;
}

// 提取导航调用：wx.navigateTo / switchTab / redirectTo / reLaunch 的字面量 url
function extractNav(js) {
  const out = [];
  const re = /wx\.(navigateTo|switchTab|redirectTo|reLaunch)\(\s*\{\s*url:\s*['"]([^'"]+)['"]/g;
  let m;
  while ((m = re.exec(js))) {
    // 归一化：去掉前导 '/'，与 app.json 中的 pagePath 对齐
    const url = m[2].split('?')[0].replace(/^\//, '');
    out.push({ method: m[1], url });
  }
  return out;
}

console.log('▶ 星野漫游 · 静态编译校验\n');

// 1) app.json
const app = readJson(path.join(ROOT, 'app.json'));
if (!app) process.exit(1);
const pages = app.pages || [];
const tabPages = (app.tabBar && app.tabBar.list ? app.tabBar.list : []).map((t) => t.pagePath);
ok(`app.json 解析通过，注册页面 ${pages.length} 个，tabBar 页 ${tabPages.length} 个`);

// 2) 逐页校验
for (const p of pages) {
  const base = path.join(ROOT, p);
  const js = base + '.js';
  const wxml = base + '.wxml';
  const json = base + '.json';
  console.log(`\n● ${p}`);

  if (!fs.existsSync(js)) fail(`缺少 ${js}`); else { nodeCheck(js); }
  if (!fs.existsSync(wxml)) fail(`缺少 ${wxml}`); else { checkHandlers(js, wxml, p); }
  if (!fs.existsSync(json)) fail(`缺少 ${json}`); else { readJson(json); }
  checkNav(js, p);
}

// 3) tabBar 页文件存在性
for (const t of tabPages) {
  if (!pages.includes(t)) fail(`tabBar 页 ${t} 未注册到 pages`);
}

function nodeCheck(js) {
  try {
    execFileSync(process.execPath, ['--check', js], { stdio: 'pipe' });
    ok('JS 语法检查通过: ' + path.basename(js));
  } catch (e) {
    fail('JS 语法错误 ' + js + ': ' + (e.stderr ? e.stderr.toString() : e.message));
  }
}

function checkHandlers(js, wxml, p) {
  const jsSrc = fs.existsSync(js) ? fs.readFileSync(js, 'utf8') : '';
  const wxmlSrc = fs.readFileSync(wxml, 'utf8');
  const handlers = extractHandlers(wxmlSrc);
  if (handlers.size === 0) { ok('无事件处理器绑定'); return; }
  const defined = extractDefined(jsSrc);
  const missing = [...handlers].filter((h) => !defined.has(h));
  if (missing.length) fail(`wxml 处理器在 ${path.basename(js)} 未定义: ${missing.join(', ')}`);
  else ok(`事件处理器全部已定义 (${handlers.size})`);
}

function checkNav(js, p) {
  if (!fs.existsSync(js)) return;
  const jsSrc = fs.readFileSync(js, 'utf8');
  const navs = extractNav(jsSrc);
  if (navs.length === 0) return;
  for (const n of navs) {
    if (n.method === 'switchTab') {
      if (!tabPages.includes(n.url)) fail(`${p}: switchTab 目标 ${n.url} 不是 tabBar 页（真机会崩）`);
    } else if (n.method === 'navigateTo' || n.method === 'redirectTo') {
      if (!pages.includes(n.url)) fail(`${p}: ${n.method} 目标 ${n.url} 未注册到 pages`);
      else if (tabPages.includes(n.url)) fail(`${p}: ${n.method} 指向 tabBar 页 ${n.url}（应改用 switchTab，真机会崩）`);
    }
  }
  if (errors === 0 || navs.every((n) => (n.method === 'reLaunch'))) ok(`导航契约校验通过 (${navs.length})`);
}

console.log(`\n=== 校验完成：通过 ${checks} 项，错误 ${errors} 项 ===`);
process.exit(errors ? 1 : 0);
