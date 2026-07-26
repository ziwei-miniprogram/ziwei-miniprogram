// utils/checkin.js — 文旅打卡数据层（P0 MVP，本地存储，零后端）
// 行为助推原理：
//   · 虚高起点：页面层显示「已点亮 1/6 城」（见 tourism 页），给即时成就感
//   · 目标梯度：差 K 城解锁限定礼，制造前进动力
//   · 默认偏置：折扣券打卡即自动到账，无需额外「领取」动作
//   · 损失框架：优先购资格仅 24h，制造「不抢就失效」的轻度紧迫
// 合规：折扣仅作用于「功德」兑换（零金钱交易）；文案用守护/陪伴，禁改运/逆天/必应。

const KEY = 'checkin_city_state';
const PRIORITY_MS = 24 * 3600 * 1000;   // 优先购资格有效期
const COUPON_MS = 7 * 24 * 3600 * 1000; // 城市折扣券有效期

// 文旅城市（与 mock.cityLights / tours 调性呼应；接后端后可由接口替换）
const CITIES = [
  { id: 'hangzhou', name: '杭州', star: '🌊', desc: '西湖星垂，断桥灯暖' },
  { id: 'chengdu', name: '成都', star: '🍃', desc: '锦官城静，茶馆灯长' },
  { id: 'dali', name: '大理', star: '🏔️', desc: '苍山雪映，洱海星移' },
  { id: 'dunhuang', name: '敦煌', star: '🏜️', desc: '大漠星河，飞天灯列' },
  { id: 'putuoshan', name: '普陀山', star: '🏮', desc: '莲岛潮音，寄愿灯明' },
  { id: 'suzhou', name: '苏州', star: '🪷', desc: '园林灯影，水巷星移' }
];
const TOTAL = CITIES.length;

function load() {
  try {
    const s = wx.getStorageSync(KEY);
    if (s && typeof s === 'object') return s;
  } catch (e) {}
  return { checked: [], coupons: {}, priorityPass: null };
}
function save(s) {
  try { wx.setStorageSync(KEY, s); } catch (e) {}
}

function isChecked(cityId) {
  return load().checked.indexOf(cityId) >= 0;
}

// 到访打卡：点亮城市 + 发折扣券（默认偏置，免领取）+ 给优先购资格（损失框架）
function checkIn(cityId) {
  const s = load();
  if (s.checked.indexOf(cityId) >= 0) {
    return { ok: false, reason: 'already' };
  }
  s.checked.push(cityId);
  const now = Date.now();
  const city = CITIES.find(c => c.id === cityId) || {};
  const coupon = {
    cityId: cityId,
    cityName: city.name || cityId,
    rate: 0.1,
    label: '城市守护 9 折',
    expireAt: now + COUPON_MS
  };
  s.coupons[cityId] = coupon;
  s.priorityPass = { cityId: cityId, expireAt: now + PRIORITY_MS };
  save(s);
  return {
    ok: true,
    checkedCount: s.checked.length,
    total: TOTAL,
    coupon: coupon,
    priorityPass: s.priorityPass
  };
}

function progress() {
  const s = load();
  return { checked: s.checked, checkedCount: s.checked.length, total: TOTAL };
}

function activeCoupons() {
  const s = load();
  const now = Date.now();
  return Object.keys(s.coupons)
    .map(k => s.coupons[k])
    .filter(c => c.expireAt > now);
}

function couponCount() { return activeCoupons().length; }

function hasPriority() {
  const s = load();
  return !!(s.priorityPass && s.priorityPass.expireAt > Date.now());
}

function priorityRemainMs() {
  const s = load();
  if (!s.priorityPass) return 0;
  return Math.max(0, s.priorityPass.expireAt - Date.now());
}

function hasCoupon(cityId) {
  const s = load();
  return !!(s.coupons[cityId] && s.coupons[cityId].expireAt > Date.now());
}

// 商城兑换时调用：拥有任一城市折扣券即享全场 9 折（功德价减 10%，最少减 1）
// 返回 { cost, discounted } —— discounted 为 true 时前端提示「城市守护折扣已抵扣」
function discountCost(baseCost, cityId) {
  const usable = cityId ? hasCoupon(cityId) : couponCount() > 0;
  if (usable) {
    const cut = Math.max(1, Math.round(baseCost * 0.1));
    return { cost: Math.max(1, baseCost - cut), discounted: true };
  }
  return { cost: baseCost, discounted: false };
}

function redeemCoupon(cityId) {
  const s = load();
  if (s.coupons[cityId]) {
    delete s.coupons[cityId];
    save(s);
    return true;
  }
  return false;
}

// 限定款优先购：优先购资格有效即可抢（未开售场景由业务另行判断）
function canPriorityBuy() { return hasPriority(); }

// 给 UI 用的友好倒计时文本（时:分:秒）
function priorityRemainText() {
  let ms = priorityRemainMs();
  if (ms <= 0) return '0:00:00';
  const h = Math.floor(ms / 3600000);
  ms -= h * 3600000;
  const m = Math.floor(ms / 60000);
  ms -= m * 60000;
  const s = Math.floor(ms / 1000);
  const pad = (n) => String(n).padStart(2, '0');
  return `${h}:${pad(m)}:${pad(s)}`;
}

module.exports = {
  CITIES, TOTAL, PRIORITY_MS,
  isChecked, checkIn, progress, activeCoupons, couponCount,
  hasPriority, priorityRemainMs, priorityRemainText, hasCoupon,
  discountCost, redeemCoupon, canPriorityBuy
};
