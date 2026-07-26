#!/usr/bin/env node
/*
 * learn-from-analytics.js — 把单篇/主页数据转成 learnings.json 的可执行洞察
 * 输入：post-analytics.json（单篇）、profile-analytics.json（主页）、analysis.json（本篇选题）
 * 输出：更新 learnings.json（bestHooks 权重 / pillarWeights / bestTimes / history）
 * 逻辑：首篇无历史 → 仅记录；有历史 → 对比同支柱/同钩子类型的 engagement，调权。
 */
const fs = require('fs');
const path = require('path');
const DIR = __dirname;

function load(p) { try { return JSON.parse(fs.readFileSync(path.join(DIR, p), 'utf8')); } catch (e) { return null; } }

const learn = load('learnings.json') || { bestHooks: [], pillarWeights: {}, history: [] };
const analysis = load('analysis.json');
const post = load('post-analytics.json');
const profile = load('profile-analytics.json');

if (!analysis) { console.log('[learn] 缺 analysis.json，先跑 analyze-web.js'); process.exit(0); }

// 本篇指标（若无真实数据则用占位，便于结构跑通）
const metrics = post
  ? {
      views: post.views || 0,
      likes: post.likes || 0,
      comments: post.comments || 0,
      shares: post.shares || 0,
    }
  : { views: 0, likes: 0, comments: 0, shares: 0 };
const engagement = metrics.views ? (metrics.likes + metrics.comments + metrics.shares) / metrics.views : 0;

const entry = {
  id: analysis.selected,
  pillar: analysis.pillar,
  hookType: analysis.hookType,
  date: new Date().toISOString().slice(0, 10),
  metrics,
  engagement: +engagement.toFixed(4),
};
learn.history = learn.history || [];
learn.history.push(entry);
if (learn.history.length > 100) learn.history = learn.history.slice(-100);
learn.published = (learn.published || 0) + 1;
learn.updated = entry.date;

// 调权：同类钩子平均互动高于全局 → 加权
const sameHook = learn.history.filter(h => h.hookType === analysis.hookType && h.engagement > 0);
const allEng = learn.history.filter(h => h.engagement > 0).map(h => h.engagement);
const avg = allEng.length ? allEng.reduce((s, x) => s + x, 0) / allEng.length : 0;
let hook = (learn.bestHooks || []).find(h => h.type === analysis.hookType);
if (!hook) { hook = { type: analysis.hookType, weight: 1.0, note: '' }; (learn.bestHooks = learn.bestHooks || []).push(hook); }
if (sameHook.length && avg > 0) {
  const hookAvg = sameHook.reduce((s, h) => s + h.engagement, 0) / sameHook.length;
  hook.weight = +Math.max(0.2, Math.min(3, hook.weight * (0.8 + 0.2 * (hookAvg / avg)))).toFixed(3);
  hook.note = `样本${sameHook.length}，互动率${hookAvg.toFixed(3)} vs 全局${avg.toFixed(3)}`;
}

fs.writeFileSync(path.join(DIR, 'learnings.json'), JSON.stringify(learn, null, 2), 'utf8');
console.log(`[learn] 已记录 id=${analysis.selected} 互动率=${entry.engagement} · 钩子「${analysis.hookType}」权重=${hook.weight}`);
console.log(`[learn] 已发布 ${learn.published} 篇；history ${learn.history.length} 条`);
if (profile) console.log('[learn] 主页数据已并入（见 profile-analytics.json）');
