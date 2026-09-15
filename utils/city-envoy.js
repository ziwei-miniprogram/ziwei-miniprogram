// utils/city-envoy.js — 「一城一人」城市代言人数据层（静态配置 + 本地覆盖，零后端）
//
// 机制定义（用户原话的工程化）：
//   「一座城市由一个代表性人物来代言，可以是历史文化名人，可以是明星，可以是城市推荐官等，
//    每次代言人只能是一位。」
//   → 每座城市任一时刻只有一位「在任代言人」，席位唯一；换人即换席，旧的记入历任。
//
// 席位唯一性的三条守门规则（本文件即规则的可执行定义）：
//   ① 一城一位：同一城市至多一条 status='serving'；
//   ② 一人一城：同一位代言人不得同时代言两座城（跨城文化人物须显式声明 crossCity，才可例外）；
//   ③ 在世人物须已获授权：明星 / 推荐官 / 传承人属在世人物（live），
//      未拿到书面授权时只能停在候选池，不允许进入在任席位。
//
// 合规边界（写进数据结构，不只是文档）：
//   · 代言人条目不含任何商品 / 价格 / 链接字段——代言人只做文化叙述，不做带货背书，
//     对《旅游强国建设"十五五"规划》「防止过度商业化」的正面回应；
//   · 历史人物须给出可考 source；来源存疑的标 verify:'pending'，由 needsVerify() 汇总待核；
//   · 代言人身份是「文化代表人」，不做任何灵验 / 改运类表述。
//
// 数据提示：在位人物与生卒年以正史 / 地方志 / 官方纪念机构陈展资料为准，
//          标 pending 的条目上线前须逐条核校。

const fujian = require('./fujian-routes.js');

const KEY = 'city_envoy_state';

// 席位种类：perpetual = 无任期（历史人物），term = 任期制（在世人物）
const KINDS = [
  { key: 'sage', name: '历史文化名人', live: false, tenure: 'perpetual' },
  { key: 'keeper', name: '非遗传承人', live: true, tenure: 'term' },
  { key: 'host', name: '城市推荐官', live: true, tenure: 'term' }
];

const KIND_INDEX = {};
KINDS.forEach(k => { KIND_INDEX[k.key] = k; });

// 城市清单直接取自线路层，保证「代言人所在城市」与「能打卡的城市」是同一张表
const CITIES = (function () {
  const seen = {};
  const out = [];
  fujian.SPOTS.forEach(s => {
    if (!seen[s.city]) { seen[s.city] = true; out.push(s.city); }
  });
  return out;
})();

// ─────────────────────────────────────────────────────────────
// 代言人候选池
//   kind          席位种类：sage / keeper / host
//   line/deed/lore 三个内容槽，分别对应当代言的「一句话 / 一件善 / 一条知见」
//   source        可考依据（正史 / 地方志 / 官方纪念机构陈展资料）
//   authorization public-domain = 已过版权与人格权保护期；granted = 已获书面授权；pending = 待取得
//   verify        ok = 已核校；pending = 待逐条核校
//   crossCity     true = 该人物文化上跨越数城，允许出现在多城（默认不允许）
// ─────────────────────────────────────────────────────────────
const ENVOYS = [
  {
    id: 'nd-xuelingzhi', city: '宁德', name: '薛令之', kind: 'sage',
    era: '683—约 756', title: '唐代进士 · 以清廉著称',
    line: '福安廉村，村名就来自他一生的清廉。',
    deed: '今天做一件不图回报的小事，不给任何人讲。',
    lore: '福安「廉村」是福建少见的以「廉」命名的古村，与薛令之的为官名声直接相关。',
    source: '福安廉村地方志与现存遗迹（明月祠）；事迹另见唐宋笔记与族谱，细节待核校',
    authorization: 'public-domain', verify: 'pending', crossCity: false
  },
  {
    id: 'fz-linzexu', city: '福州', name: '林则徐', kind: 'sage',
    era: '1785—1850', title: '清代名臣 · 虎门销烟',
    line: '苟利国家生死以，岂因祸福避趋之。',
    deed: '给一位正在坚持原则的人，留一句明确的肯定。',
    lore: '福州三坊七巷的「林文忠公祠」是后人为他立的专祠，与他的故居同在城中。',
    source: '《清史稿》卷三百六十九 · 林则徐传；福州市林则徐纪念馆陈展资料',
    authorization: 'public-domain', verify: 'ok', crossCity: false
  },
  {
    id: 'pt-linmo', city: '莆田', name: '林默', kind: 'sage',
    era: '960—987', title: '湄洲岛人 · 妈祖信俗的源头人物',
    line: '一个海边女子的名字，被往来船家念了一千年。',
    deed: '替一位出远门的人，说一句一路平安。',
    lore: '妈祖信俗于 2009 年列入 UNESCO 人类非物质文化遗产代表作名录，祖庙在莆田湄洲岛。',
    source: '妈祖信俗（UNESCO 人类非物质文化遗产代表作名录，2009）；湄洲妈祖祖庙沿革资料',
    authorization: 'public-domain', verify: 'ok', crossCity: false
  },
  {
    id: 'qz-hechaozong', city: '泉州', name: '何朝宗', kind: 'sage',
    era: '明代（生卒待考）', title: '德化瓷塑家 · 「何派」瓷塑',
    line: '一抔德化土，被他塑成了「中国白」。',
    deed: '认真对待手上这一件小事，不将就。',
    lore: '德化瓷烧制技艺是国家级非遗；署名「何朝宗」的瓷塑在故宫博物院等机构有藏。',
    source: '德化瓷烧制技艺（国家级非遗）；故宫博物院等机构藏「何朝宗」款瓷塑',
    authorization: 'public-domain', verify: 'ok', crossCity: false
  },
  {
    id: 'xm-chenjiageng', city: '厦门', name: '陈嘉庚', kind: 'sage',
    era: '1874—1961', title: '华侨领袖 · 倾资兴学',
    line: '把钱花在办学上，是他这辈子最不犹豫的一件事。',
    deed: '把一条有用的经验，完整讲给一个需要的人听。',
    lore: '厦门集美的陈嘉庚纪念馆与集美学村，都是他兴学留下的实迹。',
    source: '陈嘉庚纪念馆（厦门集美）陈展资料；《南侨回忆录》',
    authorization: 'public-domain', verify: 'ok', crossCity: false
  },
  {
    id: 'np-zhuxi', city: '南平', name: '朱熹', kind: 'sage',
    era: '1130—1200', title: '南宋理学家 · 朱子故里',
    line: '问渠那得清如许，为有源头活水来。',
    deed: '读完一页就合上，把这一页说给自己听一遍。',
    lore: '武夷山五夫里是朱熹讲学与生活之地，「半亩方塘」一诗即出于此。',
    source: '《宋史》卷四百二十九 · 道学传；武夷山五夫里（朱子故里）相关方志与陈展资料',
    authorization: 'public-domain', verify: 'ok', crossCity: false
  },
  {
    id: 'sm-yangshi', city: '三明', name: '杨时', kind: 'sage',
    era: '1053—1135', title: '将乐人 · 「程门立雪」',
    line: '门外那一场雪，等的是学问，也是敬意。',
    deed: '把一次该道的谢，当面说清楚。',
    lore: '「程门立雪」讲的就是杨时求学的故事；他是将乐人，被推为闽学的重要先导。',
    source: '《宋史》卷四百二十八 · 杨时传；将乐县杨时相关纪念陈展资料',
    authorization: 'public-domain', verify: 'ok', crossCity: false
  },
  {
    id: 'ly-huayan', city: '龙岩', name: '华喦', kind: 'sage',
    era: '1682—1756', title: '上杭人 · 「扬州八怪」之一',
    line: '从闽西的山里出去，画成了扬州城里一个异数。',
    deed: '随手记下今天看见的一处好看，不必给谁看。',
    lore: '华喦是上杭人，清代画家，被归入「扬州八怪」之列；上杭有华喦纪念陈展。',
    source: '上杭县华喦纪念陈展资料；清代画史著录',
    authorization: 'public-domain', verify: 'pending', crossCity: false
  },
  {
    id: 'zz-chenyuanguang', city: '漳州', name: '陈元光', kind: 'sage',
    era: '657—711', title: '开漳圣王 · 漳州建置的起点',
    line: '这座城的第一笔，是他在唐初写下的。',
    deed: '对一个刚来的人，多给一句指点。',
    lore: '「开漳圣王」陈元光是漳州建置史上的关键人物，云霄威惠庙为相关信俗的重要场所。',
    source: '旧唐书相关记载；漳州地方志与云霄威惠庙沿革资料',
    authorization: 'public-domain', verify: 'ok', crossCity: false
  }
  // 平潭：本轮暂无可靠地方文化人物入选，故意留空——见 vacantCities()，空缺是合法状态
];

const ENVOY_INDEX = {};
ENVOYS.forEach(e => { ENVOY_INDEX[e.id] = e; });

// 统一查找入口：先走索引，再回退线性扫描。
// 留这条回退是为了让「运行期新增候选人」（后续从后端拉候选人池）也能被认出来。
function findById(id) {
  return ENVOY_INDEX[id] || ENVOYS.filter(e => e.id === id)[0] || null;
}

// 默认在任：每城第一位历史人物（席位唯一的默认解）
const DEFAULTS = (function () {
  const m = {};
  CITIES.forEach(c => {
    const first = ENVOYS.filter(e => e.city === c && e.kind === 'sage')[0];
    if (first) m[c] = first.id;
  });
  return m;
})();

// ─────────────────────────────────────────────────────────────
// 存储（只存「覆盖默认」的换任记录，静态表保持唯一真源）
// ─────────────────────────────────────────────────────────────
function load() {
  try {
    const s = wx.getStorageSync(KEY);
    if (s && typeof s === 'object') {
      if (!s.serving || typeof s.serving !== 'object') s.serving = {};
      if (!Array.isArray(s.retired)) s.retired = [];
      return s;
    }
  } catch (e) {}
  return { serving: {}, retired: [] };
}
function save(s) {
  try { wx.setStorageSync(KEY, s); } catch (e) {}
}

// 当前在任表：静态默认 + 本地覆盖
function servingMap() {
  const s = load();
  const m = {};
  Object.keys(DEFAULTS).forEach(c => { m[c] = DEFAULTS[c]; });
  Object.keys(s.serving).forEach(c => { m[c] = s.serving[c]; });
  // 覆盖为空串 = 该城主动撤席
  Object.keys(m).forEach(c => { if (!m[c]) delete m[c]; });
  return m;
}

function envoyOf(city) {
  const id = servingMap()[city];
  return id ? findById(id) : null;
}

function allEnvoys() { return ENVOYS.slice(); }
function allCities() { return CITIES.slice(); }
function envoysOfCity(city) { return ENVOYS.filter(e => e.city === city); }
function kindOf(kindKey) { return KIND_INDEX[kindKey] || null; }
function isLive(envoy) {
  const k = envoy ? KIND_INDEX[envoy.kind] : null;
  return !!(k && k.live);
}
function tenureOf(envoy) {
  const k = envoy ? KIND_INDEX[envoy.kind] : null;
  return k ? k.tenure : null;
}

// ─────────────────────────────────────────────────────────────
// 席位守门：一位代言人能不能坐进某城的席位
// ─────────────────────────────────────────────────────────────
function canServe(envoy, city) {
  if (!envoy) return { ok: false, reason: 'unknown' };
  const c = city || envoy.city;
  if (CITIES.indexOf(c) < 0) return { ok: false, reason: 'unknown-city' };
  if (!KIND_INDEX[envoy.kind]) return { ok: false, reason: 'bad-kind' };

  // 在世人物必须已获授权（明星 / 推荐官 / 传承人的硬门槛）
  if (isLive(envoy) && envoy.authorization !== 'granted') {
    return { ok: false, reason: 'unauthorized' };
  }
  // 历史人物必须已过保护期，且给出可考来源
  if (!isLive(envoy) && envoy.authorization !== 'public-domain') {
    return { ok: false, reason: 'bad-authorization' };
  }
  if (!envoy.source) return { ok: false, reason: 'no-source' };
  // 三槽齐备：代言人不是一张头像，是「一句 / 一善 / 一知见」
  if (!envoy.line || !envoy.deed || !envoy.lore) return { ok: false, reason: 'incomplete' };
  // 一人一城：除非显式声明跨城
  if (!envoy.crossCity) {
    const serving = servingMap();
    const elsewhere = Object.keys(serving).filter(x => x !== c && serving[x] === envoy.id);
    if (elsewhere.length) return { ok: false, reason: 'already-serving-elsewhere' };
  }
  return { ok: true };
}

// 自检：有没有哪座城同时坐了两位（正常应为空数组）
function uniqueViolations() {
  const byCity = {};
  ENVOYS.forEach(e => {
    if (e.status === 'serving') {
      if (!byCity[e.city]) byCity[e.city] = [];
      byCity[e.city].push(e.id);
    }
  });
  const serving = servingMap();
  Object.keys(serving).forEach(c => {
    if (!byCity[c]) byCity[c] = [];
    if (byCity[c].indexOf(serving[c]) < 0) byCity[c].push(serving[c]);
  });
  return Object.keys(byCity).filter(c => byCity[c].length > 1)
    .map(c => ({ city: c, ids: byCity[c] }));
}

// 换任：写入覆盖并记入历任
function setEnvoy(city, envoyId) {
  if (CITIES.indexOf(city) < 0) return { ok: false, reason: 'unknown-city' };
  const envoy = findById(envoyId);
  if (!envoy) return { ok: false, reason: 'unknown' };
  if (envoy.city !== city) return { ok: false, reason: 'city-mismatch' };
  const gate = canServe(envoy, city);
  if (!gate.ok) return gate;

  const s = load();
  const prev = servingMap()[city];
  if (prev === envoyId) return { ok: false, reason: 'already-serving' };
  s.serving[city] = envoyId;
  if (prev) {
    s.retired = s.retired.filter(r => !(r.city === city && r.id === prev));
    s.retired.push({ city: city, id: prev, replacedBy: envoyId, at: Date.now() });
  }
  save(s);
  return { ok: true, city: city, envoy: envoy, replaced: prev ? findById(prev) : null };
}

// 撤席（城市可暂无代言人）
function vacate(city) {
  if (CITIES.indexOf(city) < 0) return { ok: false, reason: 'unknown-city' };
  const s = load();
  const prev = servingMap()[city];
  if (!prev) return { ok: false, reason: 'already-vacant' };
  s.serving[city] = '';
  s.retired.push({ city: city, id: prev, replacedBy: null, at: Date.now() });
  save(s);
  return { ok: true, city: city, removed: findById(prev) };
}

// 历任（含主动撤席的在任→离任记录）
function historyOf(city) {
  const s = load();
  return s.retired.filter(r => r.city === city)
    .map(r => ({ id: r.id, name: (findById(r.id) || {}).name || r.id, replacedBy: r.replacedBy, at: r.at }));
}

function vacantCities() {
  const serving = servingMap();
  return CITIES.filter(c => !serving[c]);
}

// 全城点名册：给 UI 用的整齐形态
function rollCall() {
  const serving = servingMap();
  return CITIES.map(c => {
    const e = serving[c] ? findById(serving[c]) : null;
    return {
      city: c,
      vacant: !e,
      envoy: e ? {
        id: e.id, name: e.name, kind: e.kind, kindName: (KIND_INDEX[e.kind] || {}).name || '',
        era: e.era, title: e.title, line: e.line, deed: e.deed, lore: e.lore,
        tenure: tenureOf(e), verify: e.verify
      } : null
    };
  });
}

// 待核校清单（verify:'pending' 的条目，上线前逐条过）
function needsVerify() {
  return ENVOYS.filter(e => e.verify !== 'ok').map(e => ({ id: e.id, city: e.city, name: e.name, source: e.source }));
}

function resetAll() { save({ serving: {}, retired: [] }); }

module.exports = {
  KEY, KINDS, CITIES, ENVOYS, DEFAULTS,
  allEnvoys, allCities, envoysOfCity, envoyOf, findById, kindOf, isLive, tenureOf,
  canServe, uniqueViolations, setEnvoy, vacate, historyOf, servingMap,
  vacantCities, rollCall, needsVerify, resetAll
};
