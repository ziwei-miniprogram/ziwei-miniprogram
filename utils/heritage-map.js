// utils/heritage-map.js — 非遗主题星图（闽南文化生态保护区）
//
// 依据《福建省"十五五"文化和旅游发展规划》：
//   「深化闽南文化、客家文化（闽西）、朱子文化、妈祖文化等文化生态保护区建设」
//   「积极培育非遗融入现代生活新场景……推动非遗生活化、产业化、时尚化」
// 本次只做第一个保护区打样；同一套机制可直接复制到客家（闽西）/ 朱子 / 妈祖三个保护区。
//
// 收集机制提案（本文件即机制的可执行定义，供打样验证）：
//   每个非遗节点需要 3 枚碎片，来源各自独立，必须跨行为才能点亮：
//     行迹 · 走到该节点所属城市的任一线路站点（接 utils/fujian-routes.js）
//     善行 · 累计完成每日三善
//     知见 · 完成一次该主题的文化答题
//   集齐 3 枚 → 节点点亮；一组 5 枚全亮 → 该象连成星线；20 枚全亮 → 星图整体点亮。
//   这样设计的用意：单一行为无法点亮任何一颗星，必须「走到 + 行善 + 知见」三者齐备——
//   与规划「非遗生活化」的落点一致，也天然规避「付费即得」的诱导。
//
// 合规：碎片与称号均为虚拟收集物，零金钱、不可提现、不可交易。
// 数据提示：非遗级别与名称以国家 / UNESCO 公开发布名录为准，本表用于机制打样，
//          正式上线前需逐条核校（见 each node 的 level 字段与 preview 页脚声明）。

const fujian = require('./fujian-routes.js');

const KEY = 'heritage_map_state';
const FRAGMENTS_PER_NODE = 3;

const FRAGMENT_KINDS = [
  { key: 'trace', name: '行迹', hint: '走到关联线路站点' },
  { key: 'deed', name: '善行', hint: '累计完成每日三善' },
  { key: 'lore', name: '知见', hint: '完成一次主题文化答题' }
];

const GROUPS = [
  { key: 'dy', name: '东方 · 乐', alias: '戏与曲', desc: '南音、梨园、高甲、歌仔与答嘴鼓，闽南人的耳朵。' },
  { key: 'nf', name: '南方 · 技', alias: '手艺', desc: '一瓷一木一灯一线，都是手上的时间。' },
  { key: 'xf', name: '西方 · 礼', alias: '信俗', desc: '送王船、保生大帝、关帝与圣王，海边的敬与愿。' },
  { key: 'bf', name: '北方 · 纸与衣', alias: '美术与服饰', desc: '剪纸、年画、珠绣与惠安女衣裳，民间的颜色。' }
];

// level：世界级 = UNESCO 名录直接收录；国家级 / 省级 = 中国非遗名录
// city：所属地市，用于「行迹碎片」来源判定（与 fujian-routes 的站点 city 对齐）
const NODES = [
  // 东方 · 乐
  { id: 'nanyin', name: '泉州南音', group: 'dy', city: '泉州', level: '世界级', cat: '音乐',
    desc: '又称「御前清曲」，中国现存最古老的乐种之一。' },
  { id: 'liyuan', name: '泉州梨园戏', group: 'dy', city: '泉州', level: '国家级', cat: '戏曲',
    desc: '宋元南戏遗响，十八步科母自成一格。' },
  { id: 'gaojia', name: '泉州高甲戏', group: 'dy', city: '泉州', level: '国家级', cat: '戏曲',
    desc: '以丑角见长，笑起来是闽南的腔调。' },
  { id: 'gezai', name: '歌仔戏（芗剧）', group: 'dy', city: '漳州', level: '国家级', cat: '戏曲',
    desc: '闽南与台湾共生的剧种，同源异名。' },
  { id: 'dazui', name: '厦门答嘴鼓', group: 'dy', city: '厦门', level: '国家级', cat: '曲艺',
    desc: '双人押韵对答，闽南式的相声。' },

  // 南方 · 技
  { id: 'dehua', name: '德化瓷烧制技艺', group: 'nf', city: '泉州', level: '国家级', cat: '技艺',
    desc: '「中国白」的故乡，明代海上丝路的远行者。' },
  { id: 'yingzao', name: '闽南民居营造技艺', group: 'nf', city: '泉州', level: '国家级', cat: '技艺',
    desc: '燕尾脊与红砖厝的营造法式；属 UNESCO「中国传统木结构建筑营造技艺」子项。' },
  { id: 'qixian', name: '厦门漆线雕', group: 'nf', city: '厦门', level: '国家级', cat: '技艺',
    desc: '细漆线盘绕成纹，佛像与器物皆可饰。' },
  { id: 'mutou', name: '漳州木偶头雕刻', group: 'nf', city: '漳州', level: '国家级', cat: '技艺',
    desc: '一刀一木，偶头先有神，戏才有魂。' },
  { id: 'huadeng', name: '泉州花灯', group: 'nf', city: '泉州', level: '国家级', cat: '技艺',
    desc: '针刺无骨灯，元宵夜照亮整条街巷。' },

  // 西方 · 礼
  { id: 'wangchuan', name: '送王船', group: 'xf', city: '厦门', level: '世界级', cat: '民俗',
    desc: '与马来西亚马六甲联合申报，共祈海上平安。' },
  { id: 'baosheng', name: '保生大帝信俗', group: 'xf', city: '厦门', level: '国家级', cat: '民俗',
    desc: '医者成神，海峡两岸同祀。' },
  { id: 'guandi', name: '东山关帝信俗', group: 'xf', city: '漳州', level: '国家级', cat: '民俗',
    desc: '东山岛关帝庙，闽台共仰的一炷香。' },
  { id: 'shengwang', name: '圣王巡安', group: 'xf', city: '漳州', level: '省级', cat: '民俗',
    desc: '开漳圣王陈元光，漳州这座城的起点。' },
  { id: 'pudu', name: '闽南普渡', group: 'xf', city: '泉州', level: '省级', cat: '民俗',
    desc: '七月普渡，敬祖怀远，邻里有份。' },

  // 北方 · 纸与衣
  { id: 'huian', name: '惠安女服饰', group: 'bf', city: '泉州', level: '国家级', cat: '民俗',
    desc: '「封建头、民主肚」，海边女人的衣裳。' },
  { id: 'zhangpu', name: '漳浦剪纸', group: 'bf', city: '漳州', level: '国家级', cat: '美术',
    desc: '纸上生花；属 UNESCO「中国剪纸」子项。' },
  { id: 'nianhua', name: '漳州木版年画', group: 'bf', city: '漳州', level: '国家级', cat: '美术',
    desc: '雕版彩印，门神与风俗都在纸上。' },
  { id: 'zhuangao', name: '泉州妆糕人', group: 'bf', city: '泉州', level: '省级', cat: '美术',
    desc: '糯米塑形，指尖上捏出的人物。' },
  { id: 'zhuxiu', name: '厦门珠绣', group: 'bf', city: '厦门', level: '省级', cat: '技艺',
    desc: '玻璃珠缀绣，纹样在光里换颜色。' }
];

const TOTAL = NODES.length;
const NODE_INDEX = {};
NODES.forEach(n => { NODE_INDEX[n.id] = n; });

// ─────────────────────────────────────────────────────────────
// 存储
// ─────────────────────────────────────────────────────────────
function load() {
  try {
    const s = wx.getStorageSync(KEY);
    if (s && typeof s === 'object' && s.frags && typeof s.frags === 'object') return s;
  } catch (e) {}
  return { frags: {} };
}
function save(s) {
  try { wx.setStorageSync(KEY, s); } catch (e) {}
}

function nodeById(id) { return NODE_INDEX[id] || null; }
function allNodes() { return NODES.slice(); }
function allGroups() { return GROUPS.slice(); }
function nodesByGroup(groupKey) { return NODES.filter(n => n.group === groupKey); }
function nodesByCity(city) { return NODES.filter(n => n.city === city); }

// 某个线路站点能给哪些非遗节点发「行迹碎片」——按站点所属地市匹配
function nodesBySpot(spotId) {
  const spot = fujian.spotById(spotId);
  if (!spot) return [];
  return nodesByCity(spot.city);
}

// ─────────────────────────────────────────────────────────────
// 状态计算（纯函数：fragMap 显式传入，便于单测）
// fragMap 形如 { nanyin: { trace: true, deed: true } }
// ─────────────────────────────────────────────────────────────
function emptyFrags() { return {}; }

function nodeFragState(node, fragMap) {
  const own = (fragMap && fragMap[node.id]) || {};
  const frags = {};
  let count = 0;
  FRAGMENT_KINDS.forEach(k => {
    const has = !!own[k.key];
    frags[k.key] = has;
    if (has) count++;
  });
  return { frags: frags, count: count, lit: count >= FRAGMENTS_PER_NODE };
}

function computeState(fragMap) {
  const nodes = NODES.map(n => {
    const st = nodeFragState(n, fragMap);
    return {
      id: n.id, name: n.name, city: n.city, level: n.level, cat: n.cat, desc: n.desc,
      group: n.group,
      frags: st.frags, count: st.count, lit: st.lit,
      remain: Math.max(0, FRAGMENTS_PER_NODE - st.count)
    };
  });

  const groups = GROUPS.map(g => {
    const gs = nodes.filter(n => n.group === g.key);
    const lit = gs.filter(n => n.lit).length;
    return {
      key: g.key, name: g.name, alias: g.alias, desc: g.desc,
      nodes: gs, lit: lit, total: gs.length,
      complete: lit >= gs.length
    };
  });

  const lit = nodes.filter(n => n.lit).length;
  const fragmentsTotal = nodes.reduce((sum, n) => sum + n.count, 0);

  return {
    nodes: nodes, groups: groups,
    lit: lit, total: TOTAL,
    fragmentsTotal: fragmentsTotal,
    fragmentsCap: TOTAL * FRAGMENTS_PER_NODE,
    groupLit: groups.filter(g => g.complete).length,
    groupTotal: GROUPS.length,
    complete: lit >= TOTAL,
    next: nodes.filter(n => !n.lit).sort((a, b) => b.count - a.count)[0] || null
  };
}

function state() { return computeState(load().frags); }
function fragmentsOf(nodeId) { return nodeFragState(NODE_INDEX[nodeId] || {}, load().frags); }

// ─────────────────────────────────────────────────────────────
// 写入
// ─────────────────────────────────────────────────────────────
function groupOf(nodeId) {
  const n = NODE_INDEX[nodeId];
  if (!n) return null;
  return GROUPS.filter(g => g.key === n.group)[0] || null;
}

// 加一枚碎片。幂等：同一节点同一类碎片重复加不叠加，返回 reason='dup'
function addFragment(nodeId, kind) {
  const node = NODE_INDEX[nodeId];
  if (!node) return { ok: false, reason: 'unknown' };
  if (FRAGMENT_KINDS.map(k => k.key).indexOf(kind) < 0) return { ok: false, reason: 'bad-kind' };

  const s = load();
  const before = computeState(s.frags);
  const beforeNode = before.nodes.filter(n => n.id === nodeId)[0];
  const beforeGroup = before.groups.filter(g => g.key === node.group)[0];
  const wasComplete = before.complete;

  if (!s.frags[nodeId]) s.frags[nodeId] = {};
  if (s.frags[nodeId][kind]) return { ok: false, reason: 'dup', node: node };

  s.frags[nodeId][kind] = true;
  save(s);

  const after = computeState(s.frags);
  const afterNode = after.nodes.filter(n => n.id === nodeId)[0];
  const afterGroup = after.groups.filter(g => g.key === node.group)[0];

  return {
    ok: true,
    node: node,
    kind: kind,
    nodeLit: afterNode.lit && !beforeNode.lit,
    groupComplete: afterGroup.complete && !beforeGroup.complete,
    mapComplete: after.complete && !wasComplete,
    count: afterNode.count,
    group: afterGroup
  };
}

// 打卡一个线路站点 → 给该地市全部非遗节点发「行迹碎片」
// 返回本次实际发出的碎片与由此点亮的节点 / 成组的象
function grantSpotFragments(spotId) {
  const spot = fujian.spotById(spotId);
  if (!spot) return { ok: false, reason: 'unknown-spot' };
  const targets = nodesByCity(spot.city);
  if (!targets.length) return { ok: false, reason: 'no-node', city: spot.city };

  const granted = [];
  const newlyLit = [];
  const groupLit = [];
  targets.forEach(n => {
    const r = addFragment(n.id, 'trace');
    if (r.ok) granted.push({ id: n.id, name: n.name });
    if (r.ok && r.nodeLit) newlyLit.push({ id: n.id, name: n.name });
    if (r.ok && r.groupComplete && groupLit.indexOf(r.group.name) < 0) groupLit.push(r.group.name);
  });
  return {
    ok: granted.length > 0,
    reason: granted.length ? undefined : 'all-dup',
    city: spot.city,
    spot: spot,
    granted: granted,
    newlyLit: newlyLit,
    groupLit: groupLit
  };
}

function resetAll() { save({ frags: {} }); }

module.exports = {
  KEY, FRAGMENTS_PER_NODE, FRAGMENT_KINDS, GROUPS, NODES, TOTAL,
  allNodes, allGroups, nodesByGroup, nodesByCity, nodesBySpot, nodeById,
  emptyFrags, computeState, state, fragmentsOf, groupOf,
  addFragment, grantSpotFragments, resetAll
};
