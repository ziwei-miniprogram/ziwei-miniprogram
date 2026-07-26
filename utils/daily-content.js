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
  getDailyStory, dateKey, dayIndex,
  SUSHE, HOSTS, SUSHE_LINE, SIGNS, ACTS, MOTIFS
};
