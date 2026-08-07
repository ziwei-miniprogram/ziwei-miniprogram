// utils/whimsy.js — 愉悦体验引擎 · 拾光驿 · 星野漫游
// 设计原则：星辉为光，善意有回响；所有愉悦元素带温度、可访问、不诱导消费、不触碰迷信敏感词。
// 用法：
//   1) 页面对 data.fx 初始化为 []，并把 whimsy.levelUp 数据位留空。
//   2) WXML 引入 <import src="/utils/whimsy.wxml"/>，并在根视图内放 <template is="whimsyFx"/>。
//   3) 调用 whimsy.burst(page, {...}) / afterMerit(page, before, after, gain, kind) 即可。
// 未挂载模板的页面调用 burst 也无副作用（仅写 data.fx，不渲染）。

let _seq = 0;

// ===== A/B 文案实验插槽（管线 learnings.json 已留位）=====
// 实验管线（carousel/learnings.json 收敛出胜出文案后）可将变体池写入
// storage 键 'whimsy_ab'，形如：
//   { starsign: [ {tip,line}, ... ], badgeDesc: { chuguang: '...', streak3: '...' } }
// 缺失时回退默认 COPY。读取一次后缓存，小程序运行期内生效。
let _ab = null;
function loadAB() {
  if (_ab) return _ab;
  try { _ab = (typeof wx !== 'undefined' && wx.getStorageSync) ? (wx.getStorageSync('whimsy_ab') || null) : null; } catch (e) { _ab = null; }
  return _ab;
}
// 实验管线调用：注入胜出文案池（覆盖默认），并持久化到 storage
function applyVariantPool(pool) {
  if (!pool || typeof pool !== 'object') return;
  _ab = pool;
  try { if (typeof wx !== 'undefined' && wx.setStorageSync) wx.setStorageSync('whimsy_ab', pool); } catch (e) {}
}
// 取某变体池：starsign -> 数组；badgeDesc -> 对象
function variantOf(key) {
  const ab = loadAB();
  return ab && ab[key] ? ab[key] : null;
}

// ===== 主题化文案库（星野漫游专属，规避「算命/改运/预测」等敏感词）=====
const COPY = {
  // 加载态：把等待变成星野小剧场
  loading: {
    refresh: '星河正在流转…',
    lunar: '正在请星君就位…',
    general: '洒一把星尘…',
    search: '星桥遥望，正在搜寻…',
    chart: '星盘正在归位…'
  },
  // 获得功德：随机轮换，避免重复疲劳
  merit: [
    '心灯已亮 · +1 功德',
    '一念清净 · +1 功德',
    '善念流转 · +1 功德',
    '星辉入户 · +1 功德',
    '微光成炬 · +1 功德'
  ],
  lamp: ['心灯长明 · +1 功德', '一灯能除千年暗 · +1 功德', '灯火可亲 · +1 功德'],
  like: ['心意已送达 · +1 功德', '为你点亮一颗星 · +1 功德', '善念共鸣 · +1 功德'],
  collect: ['已收藏 · 星河为你留痕', '收进星匣 · +1 功德', '此光已存入星匣'],
  follow: ['结一份善缘 · +1 功德', '星桥已连 · +1 功德', '与星光同行 · +1 功德'],
  checkin: ['晨钟已响 · 今日功德 +', '暮鼓未歇 · 签到得功德', '一日一善 · 签到 +'],
  publish: ['一笔落成 · 星野添新光', '记一笔 · 功德 +', '星河收到你的故事 · 功德 +'],
  good: ['日行一善 · 功德 +', '善行无价 · 功德 +', '星野记下一笔善 · 功德 +'],
  welcome: '星辉初光 · 赠你 +10 功德',
  bond: ['随喜一份善意 · +1 功德', '缘起于此 · +1 功德'],
  group: ['共修打卡 · 功德 +10', '众善同行 · 功德 +10'],
  // 行为助推文案（P1）
  milestone: ['连签里程碑 · 灯火更盛', '日拱一卒 · 连签有成'],
  deed: ['今日一善已记', '善念落定 · 三善又成一 ✦'],
  tip: ['星野小提示 · 与你同行', '拾光小语 · 慢慢来'],
  // 成功态
  success: {
    unlock: '金光乍现 · 深度解读已点亮',
    share: '愿这份光，照亮更多人',
    published: '已记入星野 · 静待同好'
  },
  // 空状态：温柔引导而非冷冰冰的「暂无数据」
  empty: {
    follow: '星野辽阔，尚未结缘。去「发现」逛逛，遇同好便点关注，+1 功德',
    feed: '这里还很安静——做一件小事，让星野热闹起来。',
    search: '星海中暂无此物，换个词，或许另有一番光景。',
    note: '你的星匣还是空的，去「记一笔」留一道光吧。',
    wish: '寄愿墙静候第一缕心愿，写下它，星野为你留灯。'
  },
  // 异常态：化阻力为轻巧
  error: {
    net: '星光暂被云遮，稍候片刻再试～',
    generic: '星盘转了个弯，再试一次就好。',
    censor: '此愿恐惊扰星君，换个说法更安心。',
    signed: '今日心灯已亮过啦，明早再来～'
  },
  // 首页祝福语池：随机轮换，制造每日新鲜感
  blessings: [
    ['愿你所行皆坦途', '所念皆如愿'],
    ['心有星野', '不必慌张'],
    ['一念清净', '万里无云'],
    ['且将星火', '予人微光'],
    ['今夜星垂', '好运正在赶来'],
    ['风停雨霁', '星河可亲']
  ],
  // 每日星签池：传统文化意象 + 心理慰藉，规避「算命/改运」敏感词
  starsign: [
    { tip: '室火猪 · 宜静心', line: '今夜星子低语：把心事放下，明天自有光来。' },
    { tip: '角木蛟 · 宜起念', line: '一动念，便种下一颗星。今天想成为什么样的人？' },
    { tip: '箕水豹 · 宜随缘', line: '不强求，不慌张，缘来时自会相逢。' },
    { tip: '心月狐 · 宜自照', line: '照看自己的心，比仰望星空更重要。' },
    { tip: '尾火虎 · 宜笃行', line: '一步一印，星野记得每个踏实的人。' },
    { tip: '轸水蚓 · 宜疗愈', line: '允许自己慢慢来，伤口愈合也需要星光的耐心。' },
    { tip: '井木犴 · 宜清简', line: '减去一分杂念，便多一分清明。' },
    { tip: '张月鹿 · 宜感恩', line: '今日宜对身边人说一句：有你真好。' },
    { tip: '危月燕 · 宜守静', line: '风浪起时，守住内心的灯，便不迷航。' },
    { tip: '虚日鼠 · 宜蓄力', line: '今夜宜早睡，明日星河为你蓄满电。' }
  ]
};

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

// 漂浮一颗「功德星光」：无侵入地操作 page.data.fx。
function burst(page, opts) {
  if (!page || !page.setData) return;
  opts = opts || {};
  const item = {
    id: ++_seq,
    text: opts.text || '+1 功德',
    emoji: opts.emoji || '✦',
    x: opts.x != null ? opts.x : (38 + Math.random() * 24) + '%',
    dur: 1500
  };
  const list = (page.data.fx || []).concat(item);
  page.setData({ fx: list });
  setTimeout(function () {
    const cur = page.data.fx || [];
    if (cur.length) page.setData({ fx: cur.filter(function (f) { return f.id !== item.id; }) });
  }, item.dur + 260);
}

// 获得功德后的标准反馈：飘星 + （等级变化时）晋阶庆祝。
// before/after 为等级对象（含 .name）；gain 为本次获得数；kind 见 COPY 键。
function afterMerit(page, before, after, gain, kind) {
  const map = { lamp: 'lamp', like: 'like', collect: 'collect', follow: 'follow', checkin: 'checkin', publish: 'publish', good: 'good', bond: 'bond', group: 'group' };
  let title;
  if (kind && COPY[map[kind]]) title = pick(COPY[map[kind]]);
  else title = pick(COPY.merit);
  if (gain && title.charAt(title.length - 1) === '+') title = title + gain + ' 功德';
  burst(page, { text: title, emoji: '✦' });
  if (after && before && after.name && before.name && after.name !== before.name) {
    levelUp(page, after.name);
  }
}

// 晋阶庆祝卡（自动消失）
function levelUp(page, name) {
  if (!page || !page.setData) return;
  const item = { id: ++_seq, name: name || '' };
  page.setData({ levelUp: item });
  setTimeout(function () {
    if (page.data.levelUp && page.data.levelUp.id === item.id) page.setData({ levelUp: null });
  }, 2600);
}

// 彩蛋：连点星星 ×5 → 星河贯通（彩虹星模式，移动端原生友好）
function rainbow(page) {
  if (!page || !page.setData) return;
  page.setData({ rainbow: true });
  setTimeout(function () { page.setData({ rainbow: false }); }, 6000);
  burst(page, { text: '星河贯通 · 你唤醒了星图', emoji: '✦' });
}

// 随机首页祝福语
function randomBlessing() { return pick(COPY.blessings); }

// 随机每日星签（A/B：优先取胜出变体池，缺失回退默认）
function randomStarSign() {
  const v = variantOf('starsign');
  return pick(v && v.length ? v : COPY.starsign);
}

// 徽章文案（A/B）：badgeDesc 池为 { key: '描述' }，缺失回退默认
function badgeLine(key, def) {
  const map = variantOf('badgeDesc');
  if (map && map[key]) return map[key];
  return def;
}

// 星屑分型微交互：from afterMerit，从触发点放射细碎星光（尊重 reduced-motion 由 CSS 处理）
function stardust(page, opts) {
  if (!page || !page.setData) return;
  opts = opts || {};
  const n = opts.n || 7;
  const cx = opts.x != null ? opts.x : '50%';
  const cy = opts.y != null ? opts.y : '32%';
  const list = [];
  for (let i = 0; i < n; i++) {
    const ang = (Math.PI * 2 * i) / n + Math.random() * 0.5;
    const dist = 70 + Math.random() * 90;
    list.push({
      id: ++_seq,
      x: cx, y: cy,
      dx: Math.cos(ang) * dist,
      dy: Math.sin(ang) * dist
    });
  }
  const cur = (page.data.dust || []).concat(list);
  page.setData({ dust: cur });
  setTimeout(function () {
    const now = page.data.dust || [];
    if (now.length) page.setData({ dust: now.filter(function (d) { return list.indexOf(d) === -1; }) });
  }, 1000);
}

// Hero 星爆：首屏一次性放射星爆（社媒新用户 3 秒浪漫感）。返回粒子数组供页面渲染。
function heroBurst(page) {
  if (!page || !page.setData) return;
  const list = [];
  const n = 16;
  for (let i = 0; i < n; i++) {
    const ang = (Math.PI * 2 * i) / n;
    const dist = 160 + Math.random() * 140;
    list.push({ id: i, dx: Math.cos(ang) * dist, dy: Math.sin(ang) * dist });
  }
  page.setData({ heroBurst: list });
  setTimeout(function () { if (page.data.heroBurst) page.setData({ heroBurst: null }); }, 1600);
}

module.exports = { COPY, pick, burst, afterMerit, levelUp, rainbow, randomBlessing, randomStarSign, stardust, heroBurst, applyVariantPool, badgeLine, variantOf };
