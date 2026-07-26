const { profileNotes, personality } = require('../../utils/mock.js');
const social = require('../../utils/social.js');
const whimsy = require('../../utils/whimsy.js');

// 构造笔记池：已发布（我的）在前 + 默认笔记。每条带 noteId 供社交状态筛选。
function buildPool() {
  let pub = [];
  try { pub = wx.getStorageSync('my_publishes'); } catch (e) {}
  if (!Array.isArray(pub)) pub = [];
  const mine = pub.map(p => ({ id: p.id, emoji: p.emoji, bg: p.bg, title: p.title, mine: true }));
  const def = profileNotes.map(n => ({ id: n.id, emoji: n.emoji, bg: n.bg, title: n.title, mine: false }));
  return mine.concat(def);
}

// 按分屏筛选：note=全部，collect=已收藏，like=已赞
function renderNotes(ptab, pool) {
  if (ptab === 'collect') return pool.filter(n => social.isCollected(n.id));
  if (ptab === 'like') return pool.filter(n => social.isLiked(n.id));
  return pool;
}

// 金色成就徽章：基于真实状态计算解锁（无金钱、纯正向里程碑）
function buildBadges(app) {
  let pub = [];
  try { pub = wx.getStorageSync('my_publishes'); } catch (e) {}
  if (!Array.isArray(pub)) pub = [];
  const follows = social.counts().follows;
  const daily = app.getDailyDeeds();
  const deedCount = Object.keys(daily).length;
  const m = app.globalData.merit;
  const streak = app.globalData.streak;
  const hasSign = !!wx.getStorageSync('star_sign');
  const list = [
    { key: 'chuguang', icon: '🌟', name: '初光', unlocked: m > 0 || !!wx.getStorageSync('first_launch'), desc: whimsy.badgeLine('chuguang', '初遇星野，光自此始') },
    { key: 'streak3', icon: '🔥', name: '三日火', unlocked: streak >= 3, desc: whimsy.badgeLine('streak3', '三日不断，灯火初成') },
    { key: 'streak7', icon: '🪔', name: '七日明', unlocked: streak >= 7, desc: whimsy.badgeLine('streak7', '七日相续，心灯长明') },
    { key: 'streak14', icon: '✨', name: '双七', unlocked: streak >= 14, desc: whimsy.badgeLine('streak14', '两周不辍，辉光渐盛') },
    { key: 'streak21', icon: '🌟', name: '廿一', unlocked: streak >= 21, desc: whimsy.badgeLine('streak21', '廿一日行，已成习惯') },
    { key: 'streak30', icon: '🌕', name: '月灯', unlocked: streak >= 30, desc: whimsy.badgeLine('streak30', '满月一轮，灯不曾熄') },
    { key: 'jushi', icon: '🪷', name: '居士', unlocked: m >= 150, desc: whimsy.badgeLine('jushi', '善行百五，居士初成') },
    { key: 'xiushi', icon: '🔮', name: '修士', unlocked: m >= 400, desc: whimsy.badgeLine('xiushi', '功德四百，修行有得') },
    { key: 'xingzhe', icon: '🌌', name: '行者', unlocked: m >= 900, desc: whimsy.badgeLine('xingzhe', '九百星程，步履不停') },
    { key: 'dade', icon: '👑', name: '大德', unlocked: m >= 2000, desc: whimsy.badgeLine('dade', '两千功德，大德之风') },
    { key: 'sanshan', icon: '🌿', name: '三善', unlocked: deedCount >= 3, desc: whimsy.badgeLine('sanshan', '日行三善，福虽未至祸已远') },
    { key: 'jiyuan', icon: '🤝', name: '结缘', unlocked: follows > 0, desc: whimsy.badgeLine('jiyuan', '结一份善缘，星桥已连') },
    { key: 'gongxiu', icon: '🔥', name: '共修', unlocked: m >= 30, desc: whimsy.badgeLine('gongxiu', '众善同行，灯火相照') },
    { key: 'jibi', icon: '✍️', name: '记一笔', unlocked: pub.length > 0, desc: whimsy.badgeLine('jibi', '一笔落成，星野添光') },
    { key: 'xingqian', icon: '🎴', name: '星签', unlocked: hasSign, desc: whimsy.badgeLine('xingqian', '一签在手，今日有语') }
  ];
  return list;
}

Page({
  behaviors: [require('../../behaviors/themeable.js')],
  data: {
    merit: 0,
    level: { name: '善信' },
    streak: 0,
    personality,
    notes: [],
    ptab: 'note',
    statNote: 0,
    statCollect: 0,
    statLike: 0,
    theme: 'light',
    unread: 0,
    starSign: null,
    starSignedToday: false,
    badges: [],
    badgeCount: 0,
    fx: [],
    dust: []
  },
  onShow() {
    const app = getApp();
    this.pool = buildPool();
    const c = social.counts();
    const badges = buildBadges(app);
    // 还原今日已抽星签
    let starSign = null, starSignedToday = false;
    try {
      const saved = wx.getStorageSync('star_sign');
      if (saved && saved.date === this.todayStr()) { starSign = saved.sign; starSignedToday = true; }
    } catch (e) {}
    this.setData({
      merit: app.globalData.merit,
      level: app.globalData.level,
      streak: app.globalData.streak,
      notes: renderNotes(this.data.ptab, this.pool),
      statNote: this.pool.length,
      statCollect: c.collects,
      statLike: c.likes,
      myWish: wx.getStorageSync('my_wish') || '',
      unread: app.globalData.unread || 0,
      badges,
      badgeCount: badges.filter(b => b.unlocked).length,
      starSign,
      starSignedToday
    });
    if (typeof this.getTabBar === 'function' && this.getTabBar()) this.getTabBar().setData({ selected: 3 });
  },

  // 夜灯模式：切换并同步原生导航栏 + tabBar + 浮标
  toggleTheme() {
    const app = getApp();
    const next = app.getTheme() === 'dark' ? 'light' : 'dark';
    app.setTheme(next);
    this.syncTheme();
    const tb = this.getTabBar && this.getTabBar();
    if (tb) tb.setData({ theme: next });
    wx.showToast({ title: next === 'dark' ? '夜灯已亮 🌙' : '回到暖纸 ☀', icon: 'none' });
  },

  // 每日星签：每日一签，次日可再抽
  drawStarSign() {
    const today = this.todayStr();
    let saved = null;
    try { saved = wx.getStorageSync('star_sign'); } catch (e) {}
    if (saved && saved.date === today) {
      this.setData({ starSign: saved.sign, starSignedToday: true });
      wx.showToast({ title: '今日已抽签，明日再来', icon: 'none' });
      return;
    }
    const sign = whimsy.randomStarSign();
    try { wx.setStorageSync('star_sign', { date: today, sign }); } catch (e) {}
    this.setData({ starSign: sign, starSignedToday: true });
    whimsy.stardust(this, { x: '50%', y: '28%' });
  },

  todayStr() {
    const t = new Date();
    return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`;
  },

  switchPTab(e) {
    const ptab = e.currentTarget.dataset.t;
    if (ptab === this.data.ptab) return;
    this.setData({ ptab, notes: renderNotes(ptab, this.pool) });
  },
  goSpace() { wx.switchTab({ url: '/pages/space/space' }); },
  goMerit() { wx.navigateTo({ url: '/pages/merit/merit' }); },
  goMall() { wx.switchTab({ url: '/pages/mall/mall' }); },
  goMessage() { wx.navigateTo({ url: '/pages/message/message' }); },
  goPublish() { wx.navigateTo({ url: '/pages/publish/publish' }); },
  openNote(e) { wx.navigateTo({ url: '/pages/note/note?id=' + e.currentTarget.dataset.id }); },
  editProfile() { wx.showToast({ title: '编辑资料（演示）', icon: 'none' }); }
});
