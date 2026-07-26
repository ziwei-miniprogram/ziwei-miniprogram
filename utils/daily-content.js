// 星夜物语：每日确定性内容层（视觉叙事 P0 标杆内容）
// 同一天全员一致，便于社会证明、回访与单测；内容与二十八宿/节气叙事引擎同源。
// 合规：全部为传统文化与心理慰藉的娱乐参考，不预示吉凶、不承诺改运。

const { SUSHE } = require('./divine.js');

// 3 位星野引路人轮值（陪伴者角色，对应原型默认关注）
const HOSTS = ['星野引路人 · 青鸟', '星野引路人 · 拾光', '星野引路人 · 观星人'];

// 二十八宿对应的温柔物语（传统文化意象 + 心理慰藉，轻叙事、不迷信）
const SUSHE_LINE = [
  '角宿当值，宜起个温柔的头，让今天先有光。',
  '亢宿当值，事情有点多？先把它一件件轻轻放下。',
  '氐宿当值，安稳比赶路更重要，慢慢来就好。',
  '房宿当值，给重要的人一句关心，心就近了一点。',
  '心宿当值，顺从一次自己的心意，不为谁。',
  '尾宿当值，把散掉的心思收一收，专注一件小事。',
  '箕宿当值，想说就说，今晚适合把话轻轻放下。',
  '斗宿当值，量一量今天的小确幸，已经足够暖。',
  '牛宿当值，踏实做完一件难事，夜里会安稳。',
  '女宿当值，为自己留一点巧思，也留一点耐心。',
  '虚宿当值，允许空白，安静本身也是一种充能。',
  '危宿当值，收心守稳，星空会记得你的安稳。',
  '室宿当值，把心安放好，今夜宜好眠。',
  '壁宿当值，立一面温柔的界，护住自己的节奏。',
  '奎宿当值，文思与善意都在，写一句给自己吧。',
  '娄宿当值，聚拢身边的小温暖，别独自扛着。',
  '胃宿当值，好好吃饭，身体是星野的灯油。',
  '昴宿当值，七子同辉，你从不曾孤单。',
  '毕宿当值，网住今天的好，也放走不必的紧绷。',
  '觜宿当值，小小口舌，软语总胜过硬话。',
  '参宿当值，三星在天，目标清晰就不慌。',
  '井宿当值，心里清一清，甘泉自然来。',
  '鬼宿当值，怕的事说出口，就小了一半。',
  '柳宿当值，柔软一点，风也绕着你走。',
  '星宿当值，你是自己的那颗亮星，别忘。',
  '张宿当值，张开一点，好事会自己进来。',
  '翼宿当值，给念头一对翅，飞远些也无妨。',
  '轸宿当值，转个弯，路就宽了。'
];

// 星签池（当日运势文案，娱乐化）
const SIGNS = [
  '把一件小事做到底，星河自会记得。',
  '今天宜对自己说一句：已经很好了。',
  '给一个人发去不着边际的关心。',
  '把手机放下十分钟，看看窗外的天。',
  '写下一桩今日小确幸，睡前读一遍。',
  '原谅一个不完美的瞬间。',
  '为明天的自己，提前做一件容易的事。',
  '今天的善意，不必被谁看见。',
  '允许自己慢半拍，星野从不催你。',
  '把一句谢谢，认真说给身边的人。',
  '今夜宜早睡，星光替你守着。',
  '选一件挂心的事，先把它放一放。'
];

// 行动召唤池（点灯 / 三善 / 寄愿 / 共修……钩子）
const ACTS = [
  '点亮今日心灯', '记一笔今日三善', '写一张寄愿', '为星友留一句暖',
  '静心三分钟', '抄一句喜欢的诗', '给家人发个消息', '把今天的好收进星图'
];

// 母题轮换（演示母题系统：夜 / 灯 / 星）
const MOTIFS = ['night', 'lamp', 'star'];

/* ============================================================
   序列化叙事引擎：24 节气 × 二十八宿（视觉叙事「回访钩子」核心）
   说明：节气采用近似公历日期（传统文化娱乐参考，非天文精确值）；
   每年同一天稳定、同全员一致，便于社会证明与单测。
   章节 = 当前节气 + 第 N 日 + 当值二十八宿 + 季节物语，构成连续可读的「星夜物语」。
   ============================================================ */
const SOLAR_TERMS = [
  { name: '立春', m: 2, d: 4 }, { name: '雨水', m: 2, d: 19 }, { name: '惊蛰', m: 3, d: 6 },
  { name: '春分', m: 3, d: 21 }, { name: '清明', m: 4, d: 5 }, { name: '谷雨', m: 4, d: 20 },
  { name: '立夏', m: 5, d: 6 }, { name: '小满', m: 5, d: 21 }, { name: '芒种', m: 6, d: 6 },
  { name: '夏至', m: 6, d: 21 }, { name: '小暑', m: 7, d: 7 }, { name: '大暑', m: 7, d: 23 },
  { name: '立秋', m: 8, d: 8 }, { name: '处暑', m: 8, d: 23 }, { name: '白露', m: 9, d: 8 },
  { name: '秋分', m: 9, d: 23 }, { name: '寒露', m: 10, d: 8 }, { name: '霜降', m: 10, d: 24 },
  { name: '立冬', m: 11, d: 8 }, { name: '小雪', m: 11, d: 22 }, { name: '大雪', m: 12, d: 7 },
  { name: '冬至', m: 12, d: 22 }, { name: '小寒', m: 1, d: 6 }, { name: '大寒', m: 1, d: 20 }
];

// 24 节气各一句温柔物语（季节母题，轻叙事、不迷信、不预示吉凶）
const SEASON_LINES = [
  '东风解冻，万物始生。今日宜把心愿轻轻种下。',
  '好雨知时，润物无声。让心事被温柔浸软。',
  '春雷乍动，蛰虫始醒。也唤醒心里那个念头。',
  '昼夜均分，阴阳相半。找一找生活的平衡点。',
  '气清景明，万物皆显。把挂念的人，想起一遍。',
  '雨生百谷，润泽生长。今天的努力，会被记得。',
  '万物并秀，生机盎然。把节奏提一提，也别忘了呼吸。',
  '小得盈满，未及全盛。刚刚好，也是一种丰盈。',
  '有芒可种，忙而不乱。一事一件，从容落子。',
  '日长之至，阳气极盛。白昼最长，也留一点静。',
  '暑气初盛，心静自然。一杯凉茶，半页闲书。',
  '炎热至极，宜养神明。正午的烈，留给树荫。',
  '凉风至，暑气渐收。把夏天的事，轻轻收尾。',
  '暑气止，秋意初生。渐渐慢下来的好。',
  '露凝而白，清润心生。晨起的凉，是提醒。',
  '昼夜再均，收获在望。数一数今年的果实。',
  '露气寒冷，将凝为霜。添一件衣，也添一分暖。',
  '霜叶尽染，秋之尾声。把美景，看进心里。',
  '万物收藏，养精蓄锐。给身体，一个停顿。',
  '雪未盛，寒未极。煮一壶暖，等一场白。',
  '雪盛天寒，宜围炉。把故事，说给炉火听。',
  '阴极阳生，一线长。最长的夜，最暖的灯。',
  '寒气犹盛，静待春信。再熬一熬，就见光。',
  '寒之极也，岁末将尽。把这一年，温柔合上。'
];

// 取当前节气（含跨年回绕：1 月初归属上一年大雪/冬至/小寒/大寒）
function getSolarTerm(date) {
  const y = date.getFullYear();
  const cands = SOLAR_TERMS.map(t => ({ name: t.name, m: t.m, d: t.d, date: new Date(y, t.m - 1, t.d) }))
    .concat(SOLAR_TERMS.map(t => ({ name: t.name, m: t.m, d: t.d, date: new Date(y - 1, t.m - 1, t.d) })));
  let cur = null;
  for (const c of cands) {
    if (c.date <= date && (!cur || c.date > cur.date)) cur = c;
  }
  return cur || cands[0];
}

// 取下一个节气（用于进度条与回访钩子）
function getNextSolarTerm(date) {
  const y = date.getFullYear();
  const cands = SOLAR_TERMS.map(t => ({ name: t.name, date: new Date(y, t.m - 1, t.d) }))
    .concat(SOLAR_TERMS.map(t => ({ name: t.name, date: new Date(y + 1, t.m - 1, t.d) })));
  for (const c of cands) if (c.date > date) return c;
  return cands[0];
}

// 当日「章节」：节气 + 第 N 日 + 宿物语 + 季节物语 + 幸运签（序列化叙事单元）
function getDailyChapter(now) {
  now = now || new Date();
  const story = getDailyStory(now);
  const term = getSolarTerm(now);
  const next = getNextSolarTerm(now);
  const termDay = Math.max(1, Math.floor((now - term.date) / 86400000) + 1);
  const termLen = Math.max(1, Math.round((next.date - term.date) / 86400000));
  const nextTermIn = Math.max(0, Math.round((next.date - now) / 86400000));
  const termIdx = SOLAR_TERMS.findIndex(t => t.name === term.name);
  return {
    date: dateKey(now),
    term: term.name,
    termDay: termDay,
    termLen: termLen,
    nextTerm: next.name,
    nextTermIn: nextTermIn,
    mansion: story.sushe,
    mansionLine: story.body,
    seasonLine: SEASON_LINES[termIdx] || '',
    lucky: story.sign,
    action: story.action,
    host: story.host,
    motif: story.motif
  };
}

// 确定性「每日星礼」（盲盒揭晓内容）：节气 + 宿 + 幸运签 + 虚拟功德奖励
function getSurprise(now) {
  now = now || new Date();
  const ch = getDailyChapter(now);
  const reward = 3 + (dayIndex(now) % 7); // 3~9 功德，同日全员一致，纯娱乐激励
  return Object.assign({}, ch, { reward: reward });
}


function pad(n) { return n < 10 ? '0' + n : '' + n; }
function dateKey(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }

// 距锚定日 2026-01-01 的天数（确定性，便于同天一致 + 单测）
function dayIndex(d) {
  return Math.floor((Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) - Date.UTC(2026, 0, 1)) / 86400000);
}

// 返回当日星夜物语（确定性：同日期全员一致；now 可注入便于单测）
function getDailyStory(now) {
  now = now || new Date();
  const di = dayIndex(now);
  const k = ((di % SUSHE.length) + SUSHE.length) % SUSHE.length;
  return {
    date: dateKey(now),
    sushe: SUSHE[k],
    host: HOSTS[((di % HOSTS.length) + HOSTS.length) % HOSTS.length],
    body: SUSHE_LINE[k],
    sign: SIGNS[((di % SIGNS.length) + SIGNS.length) % SIGNS.length],
    action: ACTS[((di % ACTS.length) + ACTS.length) % ACTS.length],
    motif: MOTIFS[((di % MOTIFS.length) + MOTIFS.length) % MOTIFS.length]
  };
}

module.exports = {
  getDailyStory, getDailyChapter, getSurprise,
  getSolarTerm, getNextSolarTerm, dateKey, dayIndex,
  SUSHE, HOSTS, SUSHE_LINE, SIGNS, ACTS, MOTIFS,
  SOLAR_TERMS, SEASON_LINES
};
