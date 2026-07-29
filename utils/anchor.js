// utils/anchor.js
// 数字锚点（精神胶囊）逻辑层 —— B 模型核心身份载体。
//
// 锚点 = 与用户绑定的数字「定星」：立愿即生成，三善 / 连签 / 守护 / 点亮逐层「沉星」。
// 它越长越像这个人，竞品抄走功能也抄不走「我锚点里沉着的那些时刻」。
//
// 纯本地存储 mock（无登录 / 支付前置）。接真实 API 时仅需替换本文件的存储层，
// 页面与组件调用签名不变。
const KEY = 'anchor_state';
const WISH_KEY = 'my_wish';

// 长明灯档位（真实供灯，演示用 mock 支付）
const LAMP_TIERS = {
  '7d': { key: '7d', days: 7, price: 19.9, label: '一盏长明灯 · 7 日' },
  '49d': { key: '49d', days: 49, price: 99, label: '一盏长明灯 · 49 日' }
};

function fmtDate(ts) {
  const t = new Date(ts);
  return `${t.getMonth() + 1}月${t.getDate()}日`;
}

function sameDay(ts, now) {
  const d = new Date(ts), n = new Date(now);
  return d.getFullYear() === n.getFullYear() && d.getMonth() === n.getMonth() && d.getDate() === n.getDate();
}

function _save(a) {
  try { wx.setStorageSync(KEY, a); } catch (e) {}
}
function getAnchor() {
  try { return wx.getStorageSync(KEY) || null; } catch (e) { return null; }
}

// 锚点诞生：首个星愿触发；无星愿则给温和默认。返回 anchor 对象。
function ensureBorn() {
  let a = getAnchor();
  if (a) return a;
  let wish = '';
  try { wish = wx.getStorageSync(WISH_KEY) || ''; } catch (e) {}
  a = {
    name: '启明',                 // 定星名（未来可由星图生成 / 用户命名）
    wish: wish || '愿心有所安',
    bornAt: Date.now(),
    stars: [],                   // 沉星记录
    deeds: []                    // 已点亮的真实善举
  };
  _save(a);
  return a;
}

function isBorn() { return !!getAnchor(); }

// 沉星：记录一层「用户投注」。type ∈ lamp | deed | streak | daily | return
function addStar(type, label) {
  const a = ensureBorn();
  a.stars.unshift({ type, label, at: Date.now() });
  if (a.stars.length > 99) a.stars.length = 99;
  _save(a);
  return a;
}

// 今日是否已归锚（每日保温层，避免焦虑式打卡）
function returnedToday() {
  const a = getAnchor();
  if (!a) return false;
  return a.stars.some(s => s.type === 'return' && sameDay(s.at, Date.now()));
}

function lampTiers() { return Object.values(LAMP_TIERS); }

// 回音时间线（相对点亮时刻）。done 由真实流逝时间决定，诚实体现「回音来自真实发生」。
function buildTimeline(paidAt) {
  const now = Date.now();
  const t7 = paidAt + 7 * 86400000;
  const t49 = paidAt + 49 * 86400000;
  const tLong = paidAt + 365 * 86400000;
  return [
    { at: paidAt, date: fmtDate(paidAt), title: '点亮 d0', desc: '灯已安位 · 坐标与守护星认领', done: true },
    { at: t7, date: fmtDate(t7), title: '七日回响', desc: '寺传灯仍亮着的照片将回传，邀你默念一分钟', done: t7 <= now },
    { at: t49, date: fmtDate(t49), title: '四十九日圆满', desc: '邀你为这盏灯命名一颗守护星', done: t49 <= now },
    { at: tLong, date: fmtDate(tLong), title: '常年长明', desc: '成为锚点里的长明证物', done: tLong <= now }
  ];
}

// 模拟支付（演示，无真实扣款）。返回善举记录并写入锚点。
function lightLamp(tierKey, opts) {
  const tier = LAMP_TIERS[tierKey] || LAMP_TIERS['7d'];
  const now = Date.now();
  const deed = {
    kind: 'lamp',
    tier: tier.key,
    price: tier.price,
    temple: (opts && opts.temple) || '浙江·国清寺',
    lampNo: (opts && opts.lampNo) || ('№' + String(Math.floor(1000 + Math.random() * 9000))),
    birthStar: (opts && opts.birthStar) || '开阳',
    paidAt: now,
    timeline: buildTimeline(now)
  };
  const a = ensureBorn();
  a.deeds = a.deeds || [];
  a.deeds.unshift(deed);
  _save(a);
  // 点亮本身也是一层投注
  addStar('lamp', `点亮${tier.label}`);
  return deed;
}

function getDeeds() {
  const a = getAnchor();
  return a && a.deeds ? a.deeds : [];
}

module.exports = {
  ensureBorn, getAnchor, isBorn, addStar, returnedToday,
  lampTiers, lightLamp, getDeeds, buildTimeline, fmtDate
};
