// utils/fujian-routes.js — 福建官方线路打卡数据层（静态配置，零后端）
//
// 依据《福建省"十五五"文化和旅游发展规划》重点任务：
//   「两区引领、三带支撑、五圈联动」+「系统打造'5+N'精品旅游线路」
// 国家《旅游强国建设"十五五"规划》对应表述：
//   「积极发展城市旅游，加强旅游休闲城市和街区建设」「在城乡建设管理中体现主客共享理念」
//
// 设计取舍（与既有 checkin.js 城市层刻意不同，两条线互不干扰）：
//   · 城市层（checkin.js）面向「散点城市」，用虚高起点给即时成就感；
//   · 线路层（本文件）面向「一条有起点终点的官方线路」，完成度必须真实——
//     虚报一条线路的进度等于对用户说假话，所以这里不做虚高起点，
//     改用「下一站是谁」的目标梯度做牵引。
//   · 同一个打卡点可属于多条线路（如开元寺同时在滨海线与泉州古城线上），
//     一次打卡可同时推进多条线路——这正是规划「景区联动发展格局」的线上映射。
//
// 合规：打卡仅解锁「线路星 / 星图碎片」等虚拟收集物，零金钱交易、不可提现；
//      文案用守护 / 陪伴 / 巡礼，禁改运 / 逆天 / 必应。

const KEY = 'fujian_route_state';
const NEAR_RADIUS = 1500;      // 到访判定半径（米），与 checkin.js 保持一致
const SHARDS_PER_SPOT = 5;     // 每次打卡返还星屑（虚拟收集物，非金钱）

// ─────────────────────────────────────────────────────────────
// 打卡点（lat/lng 为景区中心近似坐标，供 GPS 到访判定使用）
// star 取值来自 components/icon 自建图标体系
// ─────────────────────────────────────────────────────────────
const SPOTS = [
  // 蓝色海丝特色文化旅游带 · 1 号滨海风景道
  { id: 'sanduao', name: '宁德·三都澳', city: '宁德', star: 'tourism', desc: '海上天湖，渔排如星列', lat: 26.6500, lng: 119.7200 },
  { id: 'sanfang', name: '福州·三坊七巷', city: '福州', star: 'note', desc: '半部中国近代史，里坊如巷星', lat: 26.0817, lng: 119.2965 },
  { id: 'tannan', name: '平潭·坛南湾', city: '平潭', star: 'calm', desc: '风与蓝眼泪，海坛星河', lat: 25.4530, lng: 119.7712 },
  { id: 'meizhou', name: '莆田·湄洲岛', city: '莆田', star: 'blessing', desc: '妈祖故里，潮音如诵', lat: 25.0900, lng: 119.1150 },
  { id: 'kaiyuan', name: '泉州·开元寺', city: '泉州', star: 'lamp', desc: '东西塔下，刺桐灯长', lat: 24.9130, lng: 118.5850 },
  { id: 'gulangyu', name: '厦门·鼓浪屿', city: '厦门', star: 'heart', desc: '琴岛潮声，万国建筑', lat: 24.4440, lng: 118.0660 },

  // 大武夷文化旅游圈（双世遗）
  { id: 'tianyou', name: '武夷山·天游峰', city: '南平', star: 'tourism', desc: '九曲溪畔一峰高', lat: 27.7060, lng: 117.6800 },
  { id: 'jiuqu', name: '武夷山·九曲溪', city: '南平', star: 'journey', desc: '竹筏九曲，水转峰回', lat: 27.6800, lng: 117.6900 },
  { id: 'wufu', name: '武夷山·五夫里', city: '南平', star: 'note', desc: '朱子故里，半亩方塘', lat: 27.5500, lng: 118.0500 },
  { id: 'xiamei', name: '武夷山·下梅古村', city: '南平', star: 'wish', desc: '万里茶道起点，当溪灯影', lat: 27.6300, lng: 118.1100 },
  { id: 'wuyigong', name: '武夷山·武夷宫', city: '南平', star: 'solar', desc: '大王峰前，宋街旧影', lat: 27.6800, lng: 117.7000 },

  // 泰宁丹霞文化旅游圈
  { id: 'dajinhu', name: '泰宁·大金湖', city: '三明', star: 'journey', desc: '水上丹霞，赤壁倒影', lat: 26.9300, lng: 117.1800 },
  { id: 'shangqingxi', name: '泰宁·上清溪', city: '三明', star: 'calm', desc: '九十九曲，一线天光', lat: 26.9800, lng: 117.1300 },
  { id: 'shangshudi', name: '泰宁古城·尚书第', city: '三明', star: 'note', desc: '明代民居，砖石留声', lat: 26.8970, lng: 117.1760 },
  { id: 'zhaixia', name: '泰宁·寨下大峡谷', city: '三明', star: 'chart', desc: '天穹岩下，一线通天', lat: 26.9600, lng: 117.0800 },

  // 福建土楼文化旅游圈
  { id: 'hongkeng', name: '永定·洪坑土楼群', city: '龙岩', star: 'heart', desc: '振成楼前，客家灯火', lat: 24.6300, lng: 116.9200 },
  { id: 'chuxi', name: '永定·初溪土楼群', city: '龙岩', star: 'calm', desc: '五座圆楼，梯田环抱', lat: 24.5500, lng: 116.9200 },
  { id: 'tianluokeng', name: '南靖·田螺坑土楼群', city: '漳州', star: 'chart', desc: '四菜一汤，山间星阵', lat: 24.5700, lng: 117.0900 },
  { id: 'yunshuiyao', name: '南靖·云水谣古镇', city: '漳州', star: 'journey', desc: '古道榕荫，土楼溪声', lat: 24.6400, lng: 117.1200 },
  { id: 'dadi', name: '华安·大地土楼群', city: '漳州', star: 'heart', desc: '二宜楼中，太极圆合', lat: 24.8900, lng: 117.4600 },

  // 泉州古城文化旅游圈 · 世遗点
  { id: 'qingjing', name: '泉州·清净寺', city: '泉州', star: 'lamp', desc: '千年石构，海丝留声', lat: 24.9110, lng: 118.5870 },
  { id: 'luoyangqiao', name: '泉州·洛阳桥', city: '泉州', star: 'chart', desc: '筏形桥基，跨海长虹', lat: 24.9530, lng: 118.6700 },
  { id: 'anpingqiao', name: '晋江·安平桥', city: '泉州', star: 'chart', desc: '天下无桥长此桥', lat: 24.7500, lng: 118.4600 },
  { id: 'laojunyan', name: '泉州·老君岩', city: '泉州', star: 'calm', desc: '老子造像，倚石观山', lat: 24.9330, lng: 118.5900 },
  { id: 'jiurishan', name: '泉州·九日山', city: '泉州', star: 'solar', desc: '祈风石刻，海丝起点', lat: 24.9250, lng: 118.5100 }
];

const SPOT_INDEX = {};
SPOTS.forEach(s => { SPOT_INDEX[s.id] = s; });

// ─────────────────────────────────────────────────────────────
// 线路模板（对应「三带 / 五圈」，全部取自省规划原文点名对象）
// band：政策归属，用于在线路卡上标注「依据」，也是对外材料的引用锚点
// ─────────────────────────────────────────────────────────────
const ROUTES = [
  {
    id: 'haishi',
    name: '蓝色海丝 · 滨海巡礼线',
    band: '三带 · 蓝色海丝特色文化旅游带',
    star: 'tourism',
    desc: '沿 1 号滨海风景道，从三都澳到鼓浪屿，把海丝遗址与海岛串成一条线。',
    spots: ['sanduao', 'sanfang', 'tannan', 'meizhou', 'kaiyuan', 'gulangyu'],
    shard: { id: 'shard-haishi', name: '海丝星' }
  },
  {
    id: 'dawuyi',
    name: '大武夷 · 双世遗山水线',
    band: '五圈 · 大武夷文化旅游圈',
    star: 'journey',
    desc: '以武夷山双世遗为核心，串联朱子文化与万里茶道，山水与人文互为注解。',
    spots: ['tianyou', 'jiuqu', 'wufu', 'xiamei', 'wuyigong'],
    shard: { id: 'shard-dawuyi', name: '武夷星' }
  },
  {
    id: 'taining',
    name: '泰宁丹霞 · 地质研学线',
    band: '五圈 · 泰宁丹霞文化旅游圈',
    star: 'solar',
    desc: '水上丹霞与明代民居同线，一半看地质，一半看人间。',
    spots: ['dajinhu', 'shangqingxi', 'shangshudi', 'zhaixia'],
    shard: { id: 'shard-taining', name: '丹霞星' }
  },
  {
    id: 'tulou',
    name: '福建土楼 · 客家生活线',
    band: '五圈 · 福建土楼文化旅游圈',
    star: 'heart',
    desc: '永定、南靖、华安三地土楼群，看的是建筑，读的是客家人的聚族而居。',
    spots: ['hongkeng', 'chuxi', 'tianluokeng', 'yunshuiyao', 'dadi'],
    shard: { id: 'shard-tulou', name: '土楼星' }
  },
  {
    id: 'quanzhou',
    name: '泉州古城 · 海丝世遗线',
    band: '五圈 · 泉州古城文化旅游圈',
    star: 'blessing',
    desc: '以海丝文化为核心，把 22 处世遗点里最常被走过的几处连成一程。',
    spots: ['kaiyuan', 'qingjing', 'luoyangqiao', 'anpingqiao', 'laojunyan', 'jiurishan'],
    shard: { id: 'shard-quanzhou', name: '刺桐星' }
  }
];

const ROUTE_TOTAL = ROUTES.length;
const SPOT_TOTAL = SPOTS.length;

// ─────────────────────────────────────────────────────────────
// 存储（独立 key，不写 checkin.js 的 checkin_city_state）
// ─────────────────────────────────────────────────────────────
function load() {
  try {
    const s = wx.getStorageSync(KEY);
    if (s && typeof s === 'object' && Array.isArray(s.checked)) return s;
  } catch (e) {}
  return { checked: [], remote: {} };
}
function save(s) {
  try { wx.setStorageSync(KEY, s); } catch (e) {}
}

function isSpotChecked(spotId) { return load().checked.indexOf(spotId) >= 0; }
function isRemoteSpot(spotId) { return !!(load().remote[spotId]); }
function spotsChecked() { return load().checked.slice(); }

// 打卡一个点：记录 + 返回本次新完成的线路（用于提示「解锁 XX 星」）
// opts.remote=true 表示「遥寄巡礼」（不在当地也能记录，解 GPS 硬门槛）
function checkInSpot(spotId, opts) {
  const spot = SPOT_INDEX[spotId];
  if (!spot) return { ok: false, reason: 'unknown' };
  const s = load();
  if (s.checked.indexOf(spotId) >= 0) return { ok: false, reason: 'already', spot };
  const remote = !!(opts && opts.remote);
  const before = completedRoutes(s.checked);
  s.checked.push(spotId);
  s.remote[spotId] = remote;
  save(s);
  const after = completedRoutes(s.checked);
  const beforeIds = before.map(r => r.id);
  const newlyCompleted = after.filter(r => beforeIds.indexOf(r.id) < 0);
  return {
    ok: true,
    spot: spot,
    remote: remote,
    spotCount: s.checked.length,
    spotTotal: SPOT_TOTAL,
    shards: SHARDS_PER_SPOT,
    completedCount: after.length,
    newlyCompleted: newlyCompleted,
    routeProgress: routeProgressOf(spotRouteIds(spotId), s.checked)
  };
}

function remoteCheckInSpot(spotId) {
  if (!SPOT_INDEX[spotId]) return { ok: false, reason: 'unknown' };
  if (isSpotChecked(spotId)) return { ok: false, reason: 'already', spot: SPOT_INDEX[spotId] };
  return checkInSpot(spotId, { remote: true });
}

// 某个打卡点所属的全部线路 id（一点多线）
function spotRouteIds(spotId) {
  return ROUTES.filter(r => r.spots.indexOf(spotId) >= 0).map(r => r.id);
}

function getRoute(routeId) { return ROUTES.filter(r => r.id === routeId)[0] || null; }
function allRoutes() { return ROUTES.slice(); }
function allSpots() { return SPOTS.slice(); }
function spotById(spotId) { return SPOT_INDEX[spotId] || null; }

// ─────────────────────────────────────────────────────────────
// 完成度计算（纯函数：checked 显式传入，便于单测）
// ─────────────────────────────────────────────────────────────
function routeProgressOf(routeIds, checked) {
  const set = {};
  (checked || []).forEach(id => { set[id] = true; });
  return ROUTES
    .filter(r => routeIds.indexOf(r.id) >= 0)
    .map(r => buildProgress(r, set));
}

function buildProgress(route, checkedSet) {
  const spots = route.spots.map(id => {
    const s = SPOT_INDEX[id];
    return {
      id: id,
      name: s ? s.name : id,
      city: s ? s.city : '',
      desc: s ? s.desc : '',
      star: s ? s.star : 'star',
      checked: !!checkedSet[id]
    };
  });
  const done = spots.filter(s => s.checked).length;
  const total = spots.length;
  const next = spots.filter(s => !s.checked)[0] || null;
  return {
    id: route.id,
    name: route.name,
    band: route.band,
    desc: route.desc,
    star: route.star,
    shard: route.shard,
    spots: spots,
    done: done,
    total: total,
    pct: total ? Math.round(done / total * 100) : 0,
    complete: done >= total,
    next: next                    // 目标梯度：给「下一站是谁」，不虚报进度
  };
}

function routeProgress(routeId, checkedOverride) {
  const route = getRoute(routeId);
  if (!route) return null;
  const checked = checkedOverride || load().checked;
  const set = {};
  checked.forEach(id => { set[id] = true; });
  return buildProgress(route, set);
}

function allRouteProgress() {
  const checked = load().checked;
  const set = {};
  checked.forEach(id => { set[id] = true; });
  return ROUTES.map(r => buildProgress(r, set));
}

// 已完成（全部站点点亮）的线路列表
function completedRoutes(checkedOverride) {
  const checked = checkedOverride || load().checked;
  const set = {};
  checked.forEach(id => { set[id] = true; });
  return ROUTES
    .filter(r => r.spots.every(id => set[id]))
    .map(r => ({ id: r.id, name: r.name, star: r.star, shard: r.shard }));
}

// 目标梯度推荐：挑「已开始且最接近完成」的那条线；全未开始时推荐站点最少的一条
// （最容易走完的一条先走，避免一上来给 6 站的线把人劝退）
function recommendRoute() {
  const list = allRouteProgress();
  const started = list.filter(r => r.done > 0 && !r.complete);
  if (started.length) {
    started.sort((a, b) => (b.done / b.total) - (a.done / a.total) || b.done - a.done);
    return started[0];
  }
  const unfinished = list.filter(r => !r.complete);
  if (!unfinished.length) return null;
  unfinished.sort((a, b) => a.total - b.total || (b.pct - a.pct));
  return unfinished[0];
}

// 全局汇总：站点进度 + 线路完成数 + 已收集线路星
function overallProgress() {
  const checked = load().checked;
  const done = completedRoutes(checked);
  return {
    spotsDone: checked.length,
    spotsTotal: SPOT_TOTAL,
    routesDone: done.length,
    routesTotal: ROUTE_TOTAL,
    shards: done.map(d => d.shard),
    shardCount: done.length,
    recommend: recommendRoute()
  };
}

// ─────────────────────────────────────────────────────────────
// GPS 到访判定（与 checkin.js 同一 haversine 口径，但只认本层站点）
// ─────────────────────────────────────────────────────────────
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

function nearbySpot(lat, lng) {
  if (typeof lat !== 'number' || typeof lng !== 'number') return null;
  let best = null;
  for (const s of SPOTS) {
    const m = distance(lat, lng, s.lat, s.lng);
    if (m <= NEAR_RADIUS && (!best || m < best.meters)) best = { spot: s, meters: m };
  }
  return best;
}

function autoCheckInByLocation(lat, lng) {
  const hit = nearbySpot(lat, lng);
  if (!hit) return { status: 'none' };
  if (isSpotChecked(hit.spot.id)) return { status: 'already', spot: hit.spot, meters: hit.meters };
  return { status: 'checked', spot: hit.spot, meters: hit.meters, result: checkInSpot(hit.spot.id) };
}

// 清空（供「重置演示数据」用；不参与业务）
function resetAll() { save({ checked: [], remote: {} }); }

module.exports = {
  KEY, NEAR_RADIUS, SHARDS_PER_SPOT, ROUTE_TOTAL, SPOT_TOTAL,
  ROUTES, SPOTS,
  allRoutes, allSpots, getRoute, spotById, spotRouteIds,
  isSpotChecked, isRemoteSpot, spotsChecked, checkInSpot, remoteCheckInSpot,
  routeProgress, allRouteProgress, completedRoutes, recommendRoute, overallProgress,
  distance, nearbySpot, autoCheckInByLocation, resetAll
};
