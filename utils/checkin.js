// utils/checkin.js — 文旅打卡数据层（P0 + P1，本地存储，零后端）
// 行为助推原理：
//   · 虚高起点：页面层显示「已点亮 1/6 城」（见 tourism 页），给即时成就感
//   · 目标梯度：差 K 城解锁限定礼，制造前进动力
//   · 默认偏置：折扣券打卡即自动到账，无需额外「领取」动作
//   · 损失框架：优先购资格仅 24h，制造「不抢就失效」的轻度紧迫
// P1 新增：GPS 自动打卡——到访真实坐标即点亮最近城市（距离阈值内），免去手动点击负担
// 合规：折扣仅作用于「功德」兑换（零金钱交易）；文案用守护/陪伴，禁改运/逆天/必应。

const KEY = 'checkin_city_state';
const PRIORITY_MS = 24 * 3600 * 1000;   // 优先购资格有效期
const COUPON_MS = 7 * 24 * 3600 * 1000; // 城市折扣券有效期
const NEAR_RADIUS = 1500;               // P1：到访判定半径（米），距离内视为真实到访

// 文旅城市（与 mock.cityLights / tours 调性呼应；接后端后可由接口替换）
// lat/lng 为城市中心近似坐标，用于 P1 GPS 自动打卡的距离判定
const CITIES = [
  { id: 'hangzhou', name: '杭州', star: 'tourism', desc: '西湖星垂，断桥灯暖', lat: 30.2741, lng: 120.1551 },
  { id: 'chengdu', name: '成都', star: 'calm', desc: '锦官城静，茶馆灯长', lat: 30.5728, lng: 106.5516 },
  { id: 'dali', name: '大理', star: 'tourism', desc: '苍山雪映，洱海星移', lat: 25.6065, lng: 100.2676 },
  { id: 'dunhuang', name: '敦煌', star: 'tourism', desc: '大漠星河，飞天灯列', lat: 40.1421, lng: 94.6618 },
  { id: 'putuoshan', name: '普陀山', star: 'lamp', desc: '莲岛潮音，寄愿灯明', lat: 30.0108, lng: 122.3947 },
  { id: 'suzhou', name: '苏州', star: 'blessing', desc: '园林灯影，水巷星移', lat: 31.2989, lng: 120.5853 }
];
const TOTAL = CITIES.length;

function load() {
  try {
    const s = wx.getStorageSync(KEY);
    if (s && typeof s === 'object') return s;
  } catch (e) {}
  return { checked: [], remote: {}, coupons: {}, priorityPass: null, shares: { date: '', count: 0, items: [] } };
}
function save(s) {
  try { wx.setStorageSync(KEY, s); } catch (e) {}
}

function isChecked(cityId) {
  return load().checked.indexOf(cityId) >= 0;
}

// 到访打卡：点亮城市 + 发折扣券（默认偏置，免领取）+ 给优先购资格（损失框架）
// opts.remote=true 表示「遥寄祝福」（不在当地也能守护，与远程祈福定位一致，解 B6 GPS 硬门槛）
function checkIn(cityId, opts) {
  const s = load();
  if (s.checked.indexOf(cityId) >= 0) {
    return { ok: false, reason: 'already' };
  }
  const remote = !!(opts && opts.remote);
  s.checked.push(cityId);
  s.remote[cityId] = remote;
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

// 遥寄祝福打卡（UX 架构 P0-c，解 B6）：不在城市 1500m 内也能远程点亮，与远程祈福定位一致
function remoteCheckIn(cityId) {
  if (isChecked(cityId)) return { ok: false, reason: 'already' };
  return checkIn(cityId, { remote: true });
}
// 某城是否以「遥寄」方式点亮（用于 UI 标记：astro lamp 图标）
function isRemote(cityId) {
  return !!(load().remote[cityId]);
}

function progress() {
  const s = load();
  const done = s.checked.length >= TOTAL;
  return { checked: s.checked, checkedCount: s.checked.length, total: TOTAL, allChecked: done };
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

// ============================================================
// P2：闭环复访 —— 全国守护礼（集满 6 城）+ 晒单返星屑
// ============================================================

const SHARE_DAILY_LIMIT = 3;   // 每日晒单返利上限（防刷）
const SHARE_RETURN = 30;       // 每次晒单返还功德（星屑回馈，零金钱）

// 是否已集齐全部城市（解锁全国守护礼）
function isAllChecked() {
  return load().checked.length >= TOTAL;
}

// 全国守护礼状态：集满 6 城解锁限定大漆星图杯（成就 + 稀缺框架）
function allRewardInfo() {
  const s = load();
  const done = s.checked.length >= TOTAL;
  return {
    done: done,
    remain: Math.max(0, TOTAL - s.checked.length),
    rewardName: '全国守护礼 · 限定大漆星图杯',
    rewardDesc: done
      ? '已集齐 6 城星图，全国守护礼已解锁'
      : '集齐 6 城星图，解锁全国守护礼（含限定大漆星图杯）'
  };
}

// 今日是否还可晒单（返回 { ok, remain }）
function canShare() {
  const s = load();
  const today = new Date().toISOString().slice(0, 10);
  if (s.shares.date !== today) return { ok: true, remain: SHARE_DAILY_LIMIT };
  return { ok: s.shares.count < SHARE_DAILY_LIMIT, remain: Math.max(0, SHARE_DAILY_LIMIT - s.shares.count) };
}

// 记录一次晒单：成功返回 { ok:true, returned }，达上限返回 { ok:false, reason:'limit' }
// 返利数值由调用方（商城页）加到功德账户，本层只管记录与限额
function recordShare(productTitle) {
  const s = load();
  const today = new Date().toISOString().slice(0, 10);
  if (s.shares.date !== today) { s.shares = { date: today, count: 0, items: [] }; }
  if (s.shares.count >= SHARE_DAILY_LIMIT) return { ok: false, reason: 'limit' };
  s.shares.count += 1;
  s.shares.items.push({ title: productTitle, at: Date.now() });
  save(s);
  return { ok: true, returned: SHARE_RETURN };
}

// 已晒单商品标题集合（供商城页标记 shared 防重复）
function sharesSnapshot() {
  const s = load();
  const today = new Date().toISOString().slice(0, 10);
  if (s.shares.date !== today) return [];
  return s.shares.items.map(it => it.title);
}

// ============================================================
// P1：GPS 自动打卡
// ============================================================

// haversine 距离（米），用于判定是否真实到访某城
function distance(lat1, lng1, lat2, lng2) {
  const R = 6371000;
  const toRad = (d) => d * Math.PI / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

// 返回坐标 1.5km 内最近的城市（命中则返回 {city, meters}，否则 null）
function nearbyCity(lat, lng) {
  if (typeof lat !== 'number' || typeof lng !== 'number') return null;
  let best = null;
  for (const c of CITIES) {
    const m = distance(lat, lng, c.lat, c.lng);
    if (m <= NEAR_RADIUS && (!best || m < best.meters)) {
      best = { city: c, meters: m };
    }
  }
  return best;
}

// 自动打卡：传入当前坐标，命中阈值内城市且未打卡则点亮；返回结果对象
//   { status: 'checked'|'already'|'none', city?, meters?, result? }
function autoCheckInByLocation(lat, lng) {
  const hit = nearbyCity(lat, lng);
  if (!hit) return { status: 'none' };
  if (isChecked(hit.city.id)) return { status: 'already', city: hit.city, meters: hit.meters };
  const result = checkIn(hit.city.id);
  return { status: 'checked', city: hit.city, meters: hit.meters, result };
}

module.exports = {
  CITIES, TOTAL, PRIORITY_MS, NEAR_RADIUS, SHARE_DAILY_LIMIT, SHARE_RETURN,
  isChecked, checkIn, remoteCheckIn, isRemote, progress, activeCoupons, couponCount,
  hasPriority, priorityRemainMs, priorityRemainText, hasCoupon,
  discountCost, redeemCoupon, canPriorityBuy,
  distance, nearbyCity, autoCheckInByLocation,
  isAllChecked, allRewardInfo, canShare, recordShare, sharesSnapshot
};
