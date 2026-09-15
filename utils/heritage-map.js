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
//     善行 · 完成一次每日三善；碎片发给「愿星」（未设定则自动取进度最高的未点亮星），发完自动轮换
//     知见 · 答对该节点的文化小问（QUIZ，一题一星，答错可重答）
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
// 文化小问（知见碎片的唯一入口：答对才给，答错可重答）
// 一星一题；题目只考公开名录 / 常识层面的可考事实，不涉信俗灵验与否。
// a = 正确项下标。经由 quizOf() 对外只暴露题干与选项，答案不下发到视图。
// ─────────────────────────────────────────────────────────────
const QUIZ = {
  nanyin:   { q: '泉州南音还有一个流传更广的别称，是下面哪个？', opts: ['御前清曲', '刺桐古调', '海丝乐曲', '温陵雅乐'], a: 0 },
  liyuan:   { q: '泉州梨园戏被称为宋元什么戏文的遗响？', opts: ['南戏', '杂剧', '传奇', '傀儡戏'], a: 0 },
  gaojia:   { q: '泉州高甲戏最见长的是哪一类行当？', opts: ['丑角', '旦角', '净角', '武生'], a: 0 },
  gezai:    { q: '歌仔戏在漳州一带又被称为什么？', opts: ['芗剧', '潮剧', '高甲', '梨园'], a: 0 },
  dazui:    { q: '厦门答嘴鼓的表演形式是什么？', opts: ['双人押韵对答', '单人说唱', '多人合唱', '边舞边唱'], a: 0 },

  dehua:    { q: '德化白瓷在西方被称为什么？', opts: ['中国白', '象牙白', '甜白', '影青'], a: 0 },
  yingzao:  { q: '闽南红砖厝最醒目的屋顶特征是？', opts: ['燕尾脊', '马头墙', '悬鱼', '藻井'], a: 0 },
  qixian:   { q: '厦门漆线雕盘绕成纹的「线」，主要用什么材料做成？', opts: ['漆', '金箔', '瓷土', '丝线'], a: 0 },
  mutou:    { q: '漳州木偶头雕刻主要服务于哪一种偶戏？', opts: ['布袋木偶', '提线木偶', '杖头木偶', '铁枝木偶'], a: 0 },
  huadeng:  { q: '泉州花灯里的「针刺无骨灯」，特点是什么？', opts: ['不用骨架、以针刺出花纹', '以竹骨撑型', '以铁线为骨', '以纸捻成型'], a: 0 },

  wangchuan:{ q: '送王船是与哪个国家联合申报入选名录的？', opts: ['马来西亚', '新加坡', '菲律宾', '印度尼西亚'], a: 0 },
  baosheng: { q: '保生大帝信仰的原型人物，本来是什么身份？', opts: ['医者', '海商', '将军', '文士'], a: 0 },
  guandi:   { q: '台湾许多关帝庙的香火，溯源来自哪一座关帝庙？', opts: ['东山关帝庙', '泉州关岳庙', '漳州武庙', '厦门朝天宫'], a: 0 },
  shengwang:{ q: '「开漳圣王」指的是哪位人物？', opts: ['陈元光', '王审知', '郑成功', '施琅'], a: 0 },
  pudu:     { q: '闽南普渡在农历哪一个月举行？', opts: ['七月', '正月', '五月', '九月'], a: 0 },

  huian:    { q: '惠安女服饰「封建头、民主肚」的下一句是？', opts: ['节约衫、浪费裤', '大裾衫、阔脚裤', '长袖衫、短脚裤', '短上衣、宽裙摆'], a: 0 },
  zhangpu:  { q: '漳浦剪纸属于哪一项名录项目的子项？', opts: ['中国剪纸', '中国皮影', '中国篆刻', '中国木结构营造技艺'], a: 0 },
  nianhua:  { q: '漳州木版年画的色彩主要靠什么工艺形成？', opts: ['雕版套色印刷', '手绘上色', '石刻拓印', '刺绣拼贴'], a: 0 },
  zhuangao: { q: '泉州妆糕人捏塑人物，主要用什么材料？', opts: ['糯米粉', '陶土', '面筋', '石膏'], a: 0 },
  zhuxiu:   { q: '厦门珠绣所用的珠子是哪一种？', opts: ['玻璃珠', '珍珠', '玛瑙珠', '木珠'], a: 0 }
};

// 对外只给题干与选项，不下发正确项
function quizOf(nodeId) {
  const z = QUIZ[nodeId];
  if (!z) return null;
  return { nodeId: nodeId, q: z.q, opts: z.opts.slice() };
}

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

// ─────────────────────────────────────────────────────────────
// 愿星与善行碎片
// 善行碎片按「天」发行：一天最多一枚。发行对象是「愿星」——
// 用户在星图上选定的一颗未点亮星；未选定时自动落到进度最高的那颗。
// 发完自动轮换到下一颗未点亮的星，避免连续几天的三善都落在同一颗星上。
// ─────────────────────────────────────────────────────────────
function rawFrags() { return load().frags || {}; }
function pledgeOf() { return load().pledge || null; }

function setPledge(nodeId) {
  const node = NODE_INDEX[nodeId];
  if (!node) return { ok: false, reason: 'unknown' };
  const s = load();
  s.pledge = nodeId;
  save(s);
  return { ok: true, node: node };
}

// 下一颗可承接善行的星：优先愿星，否则取进度最高的、还没拿到善行碎片的那颗
function deedTargetFor(fragMap, pledge) {
  const st = computeState(fragMap);
  const unlit = st.nodes.filter(n => !n.lit);
  if (!unlit.length) return null;
  if (pledge) {
    const p = unlit.filter(n => n.id === pledge)[0];
    if (p && !p.frags.deed) return p;
  }
  const cand = unlit.filter(n => !n.frags.deed);
  if (!cand.length) return null;
  // 进度优先，同进度保持 NODES 顺序（稳定排序），首次发放自然落到第一颗星
  cand.sort((a, b) => b.count - a.count);
  return cand[0];
}

function grantDeed() {
  const s = load();
  const target = deedTargetFor(s.frags, s.pledge);
  if (!target) return { ok: false, reason: 'no-target' };
  const r = addFragment(target.id, 'deed');
  if (!r.ok) return { ok: false, reason: r.reason };
  // 发完把愿星挪到下一颗待补的星，原星补满善行后不再回头
  const next = deedTargetFor(load().frags, null);
  if (next) { const s2 = load(); s2.pledge = next.id; save(s2); }
  return {
    ok: true, node: r.node, count: r.count,
    pledgedTo: next ? next.id : null,
    nodeLit: r.nodeLit, groupComplete: r.groupComplete, mapComplete: r.mapComplete
  };
}

// 答题得「知见」：答对才发碎片；答错只回 wrong，不下发正确项，避免试错穷举
function answerQuiz(nodeId, pick) {
  const node = NODE_INDEX[nodeId];
  const z = QUIZ[nodeId];
  if (!node) return { ok: false, reason: 'unknown' };
  if (!z) return { ok: false, reason: 'no-quiz' };
  if (pick !== z.a) return { ok: false, reason: 'wrong', correct: false };
  const r = addFragment(nodeId, 'lore');
  if (!r.ok) return { ok: false, reason: r.reason, correct: true };
  return {
    ok: true, correct: true, node: r.node, kind: 'lore', count: r.count,
    nodeLit: r.nodeLit, groupComplete: r.groupComplete, mapComplete: r.mapComplete
  };
}

function resetAll() { save({ frags: {}, pledge: null }); }

module.exports = {
  KEY, FRAGMENTS_PER_NODE, FRAGMENT_KINDS, GROUPS, NODES, TOTAL,
  allNodes, allGroups, nodesByGroup, nodesByCity, nodesBySpot, nodeById,
  emptyFrags, computeState, state, fragmentsOf, groupOf,
  addFragment, grantSpotFragments,
  rawFrags, pledgeOf, setPledge, grantDeed, quizOf, answerQuiz,
  resetAll
};
