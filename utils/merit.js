// 功德系统配置与工具。
// 设计原则：以"日行一善"为核心，用正向行为（非金钱）积累功德值，替代原来的内容付费解锁。
// 合规：功德不可提现、不可交易、不可购买；仅用于解锁深度内容与社交玩法，保持「零金钱门槛」。

// 等级阶梯（累计功德值 -> 称号）。文化感命名，附加娱乐声明。
const LEVELS = [
  { min: 0, name: '善信', desc: '初入拾光驿，心怀善意' },
  { min: 50, name: '清信士', desc: '日日行善，渐入佳境' },
  { min: 150, name: '居士', desc: '可解锁深度星图解读' },
  { min: 400, name: '修士', desc: '可解锁 AI 星象长文' },
  { min: 900, name: '行者', desc: '可解锁进阶牌阵与专属模板' },
  { min: 2000, name: '大德', desc: '拾光驿之光，泽被有缘人' }
];

// 日行一善：免费、正向的可做功德行为。图标统一用 astro 名（见 components/icon/icon.js）。
const ACTIONS = [
  { key: 'checkin', icon: 'solar', name: '晨钟暮鼓·签到', merit: 3, streakBonus: 1, desc: '每日打卡，连续签到额外 +1（上限 +5）' },
  { key: 'meditate', icon: 'calm', name: '完成一次舒压冥想', merit: 5, desc: '完成任一疗愈/冥想疗程' },
  { key: 'lamp', icon: 'lamp', name: '点亮一盏莲灯（寄愿）', merit: 2, desc: '在寄愿页为他人或自己点灯' },
  { key: 'lot', icon: 'star', name: '抽取并分享心愿签', merit: 1, shareBonus: 2, desc: '抽签 +1，分享到朋友圈/群额外 +2' },
  { key: 'alms', icon: 'share', name: '在寄愿墙为他人添灯（布施）', merit: 3, desc: '把善意传递给陌生有缘人' },
  { key: 'group', icon: 'streak', name: '完成一次共修打卡', merit: 10, desc: '加入共修团，每日与同伴共修' },
  { key: 'ugc', icon: 'note', name: '发布过审感悟/游记', merit: 8, desc: '分享你的星野故事（需过内容安全）' },
  { key: 'invite', icon: 'share', name: '邀请好友结缘入驿', merit: 15, desc: '每结缘一位新友 +15' }
];

// 内容解锁门槛（替代付费）：达到对应等级即可解锁，保持零金钱门槛。
const UNLOCKS = {
  deepChart: { name: '深度星图解读', needLevel: '居士', cost: 30 },
  aiLong: { name: 'AI 星象长文', needLevel: '修士', cost: 50 },
  advanceTarot: { name: '进阶牌阵·小阿尔卡纳', needLevel: '行者', cost: 80 },
  wishVideo: { name: '专属寄愿视频模板', needLevel: '行者', cost: 60 }
};

// P1-2 今日三善：每日建议做满的 3 件小事（与「签到 +3」互不重叠，作为额外日常仪式）
const DEEDS = [
  { key: 'lamp', icon: 'lamp', name: '点亮一盏心灯', merit: 1 },
  { key: 'bond', icon: 'share', name: '随喜一位有缘人', merit: 1 },
  { key: 'meditate', icon: 'calm', name: '完成一次舒压冥想', merit: 5 }
];

function levelOf(merit) {
  let idx = 0;
  for (let i = 0; i < LEVELS.length; i++) {
    if (merit >= LEVELS[i].min) idx = i;
  }
  const cur = LEVELS[idx];
  const next = LEVELS[idx + 1] || null;
  const progress = next ? Math.min(100, Math.round(((merit - cur.min) / (next.min - cur.min)) * 100)) : 100;
  return {
    index: idx,
    lv: idx + 1,
    name: cur.name,
    desc: cur.desc,
    min: cur.min,
    next: next ? next.name : null,
    nextMin: next ? next.min : null,
    toNext: next ? next.min - merit : 0,
    progress
  };
}

function actionByKey(key) {
  return ACTIONS.find(a => a.key === key) || null;
}

module.exports = { LEVELS, ACTIONS, UNLOCKS, DEEDS, levelOf, actionByKey };
