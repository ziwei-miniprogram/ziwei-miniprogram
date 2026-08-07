const { meritBoard, meritGroups, wishWall, myBonds, cityLights } = require('../../utils/mock.js');
const merit = require('../../utils/merit.js');
const whimsy = require('../../utils/whimsy.js');
const { check, advice } = require('../../utils/censor.js');

Page({
  behaviors: [require('../../behaviors/themeable.js')],
  data: {
    tab: 'overview',
    merit: 0,
    level: {},
    streak: 0,
    checkedIn: false,
    actions: [],
    board: [],
    boardFilter: 'global',
    groups: [],
    wishes: [],
    bonds: [],
    cityLights: [],
    daily: null,
    anonymous: false,
    // —— 寄愿输入框（Act II 连接）状态位 ——
    myWishText: '',
    composing: false,
    myWishes: [],
    // —— P1 行为助推状态位 ——
    deeds: [],
    dailyDone: {},
    deedCount: 0,
    rankNudge: null,
    groupRemind: '',
    // —— 愉悦状态位 ——
    fx: [],
    dust: [],
    levelUp: null,
    theme: 'light'
  },

  onLoad(opts) {
    if (opts && opts.tab) this.setData({ tab: opts.tab });
  },

  onShow() {
    const app = getApp();
    const groups = meritGroups.map(g => ({ ...g }));
    const groupNotDone = groups.some(g => !g.myJoined);
    const groupProof = groups.reduce((s, g) => s + g.checked, 0);
    const boardRes = this.buildBoard(app);
    const dailyDone = app.getDailyDeeds();
    this.setData({
      merit: app.globalData.merit,
      level: app.globalData.level,
      streak: app.globalData.streak,
      checkedIn: app.checkedInToday(),
      actions: merit.ACTIONS,
      groups,
      wishes: wishWall.map(w => ({ ...w })),
      myWishes: (() => { try { const a = wx.getStorageSync('my_wishes'); return Array.isArray(a) ? a : []; } catch (e) { return []; } })(),
      bonds: myBonds.map(b => ({ ...b })),
      cityLights,
      board: boardRes.board,
      rankNudge: boardRes.rankNudge,
      daily: this.buildDaily(app),
      deeds: merit.DEEDS,
      dailyDone,
      deedCount: Object.keys(dailyDone).length,
      groupRemind: groupNotDone ? `今日已有 ${groupProof} 位同伴共修，你还没打卡哦～` : ''
    });
  },

  buildBoard(app) {
    const b = meritBoard.map(x => ({ ...x }));
    const me = b.find(x => x.me);
    if (me) { me.merit = app.globalData.merit; me.level = app.globalData.level.name; }
    b.sort((a, b) => b.merit - a.merit);
    b.forEach((x, i) => (x.rank = i + 1));
    // P1-3 排行榜跃升提示：超越百分比 + 前进名次所需功德
    const myM = app.globalData.merit;
    const above = b.filter(x => !x.me && x.merit > myM);
    const below = b.filter(x => !x.me && x.merit < myM);
    const total = b.length;
    const pct = total ? Math.round((below.length / (total - 1)) * 100) : 0;
    let gap = 0, ranks = 0;
    if (above.length) {
      const nextM = Math.min.apply(null, above.map(x => x.merit));
      gap = nextM - myM;
      ranks = above.filter(x => x.merit === nextM).length;
    }
    const rankNudge = {
      pct, gap, ranks,
      hasNext: above.length > 0,
      rank: me ? me.rank : total
    };
    return { board: b, rankNudge };
  },

  // 因果日报：把今日善行讲成一个小故事
  buildDaily(app) {
    const streak = app.globalData.streak;
    const flame = streak >= 7 ? '✦✦✦' : streak >= 3 ? '✦✦' : '✦';
    return {
      flame,
      streak,
      text: `今日你点亮心灯、签到、随喜，把善意流向了有缘人。连续 ${streak} 天日行一善，再坚持 ${Math.max(0, 7 - streak)} 天可解锁「月白莲灯」限定皮肤。`
    };
  },

  switchTab(e) { this.setData({ tab: e.currentTarget.dataset.tab }); },
  setFilter(e) { this.setData({ boardFilter: e.currentTarget.dataset.f }); },
  toggleAnonymous() { this.setData({ anonymous: !this.data.anonymous }); },

  checkin() {
    const app = getApp();
    const before = app.globalData.level;
    const r = app.doCheckin();
    if (!r.ok) { wx.showToast({ title: whimsy.COPY.error.signed, icon: 'none' }); return; }
    const after = app.globalData.level;
    this.setData({ merit: app.globalData.merit, level: after, streak: app.globalData.streak, checkedIn: true, daily: this.buildDaily(app) });
    whimsy.afterMerit(this, before, after, r.gain, 'checkin');
    // P1-1 连签里程碑庆祝
    if (r.milestone) {
      wx.showModal({
        title: '连签里程碑 ✦',
        content: `你已连续签到 ${r.milestone.streak} 天，星野为你献上里程碑礼 +${r.milestone.bonus} 功德。灯火不熄，前路有光。`,
        confirmText: '继续行善',
        showCancel: false
      });
    }
  },

  // P1-2 今日三善：点按即记一件今日善行（每日每事限一次）
  doDeed(e) {
    const key = e.currentTarget.dataset.key;
    const app = getApp();
    const done = app.getDailyDeeds();
    if (done[key]) { wx.showToast({ title: '今日已记', icon: 'none' }); return; }
    const deed = merit.DEEDS.find(d => d.key === key);
    if (!deed) return;
    const before = app.globalData.level;
    app.addMerit(deed.merit);
    const after = app.globalData.level;
    const nowDone = app.markDailyDeed(key);
    const count = Object.keys(nowDone).length;
    this.setData({ merit: app.globalData.merit, level: after, dailyDone: nowDone, deedCount: count });
    whimsy.afterMerit(this, before, after, deed.merit, 'good');
    if (count >= 3) {
      wx.showModal({
        title: '今日三善已成 ✦',
        content: '心灯、随喜、冥想皆已落定。日行三善，福虽未至，祸已远矣。',
        confirmText: '善哉',
        showCancel: false
      });
    }
  },

  doAction(e) {
    const key = e.currentTarget.dataset.key;
    const a = merit.actionByKey(key);
    if (!a) return;
    const app = getApp();
    const before = app.globalData.level;
    app.addMerit(a.merit);
    const after = app.globalData.level;
    this.setData({ merit: app.globalData.merit, level: after });
    whimsy.afterMerit(this, before, after, a.merit, 'good');
  },

  giveBond(e) {
    const i = e.currentTarget.dataset.i;
    const bonds = this.data.bonds.slice();
    if (bonds[i].todayGiven) { wx.showToast({ title: '今日已随喜', icon: 'none' }); return; }
    bonds[i].todayGiven = true;
    const app = getApp();
    const before = app.globalData.level;
    app.addMerit(1);
    const after = app.globalData.level;
    this.setData({ bonds, merit: app.globalData.merit, level: after });
    whimsy.afterMerit(this, before, after, 1, 'bond');
  },

  sendBond() {
    wx.showModal({
      title: '发送结缘帖',
      content: '将生成你的专属结缘帖，分享给好友即可结缘（每结缘一位新友 +15 功德）。',
      showCancel: false,
      confirmText: '好的'
    });
  },

  groupCheckin(e) {
    const i = e.currentTarget.dataset.i;
    const groups = this.data.groups.slice();
    if (!groups[i].myJoined) groups[i].myJoined = true;
    groups[i].checked = Math.min(groups[i].checked + 1, groups[i].members);
    const app = getApp();
    const before = app.globalData.level;
    app.addMerit(10);
    const after = app.globalData.level;
    this.setData({ groups, merit: app.globalData.merit, level: after });
    whimsy.afterMerit(this, before, after, 10, 'group');
  },

  addLamp(e) {
    const i = e.currentTarget.dataset.i;
    const wishes = this.data.wishes.slice();
    wishes[i].lamps += 1;
    const app = getApp();
    const before = app.globalData.level;
    app.addMerit(3);
    const after = app.globalData.level;
    this.setData({ wishes, merit: app.globalData.merit, level: after });
    whimsy.afterMerit(this, before, after, 3, 'lamp');
  },

  // 寄愿输入框即英雄：聚焦态 + 内容安全预检 + 存 storage + 星屑
  onWishFocus() { this.setData({ composing: true }); },
  onWishBlur() { this.setData({ composing: false }); },
  onWishInput(e) { this.setData({ myWishText: e.detail.value }); },
  sendMyWish() {
    const text = (this.data.myWishText || '').trim();
    if (!text) { wx.showToast({ title: '写点什么再寄出~', icon: 'none' }); return; }
    const c = check(text);
    if (!c.ok) {
      wx.showModal({ title: '内容需调整', content: advice(c.hits), showCancel: false });
      return;
    }
    const wish = { id: Date.now(), wish: text, lamps: 1 };
    const arr = this.data.myWishes.slice();
    arr.unshift(wish);
    let store = [];
    try { store = wx.getStorageSync('my_wishes'); } catch (e) {}
    if (!Array.isArray(store)) store = [];
    store.unshift(wish);
    try { wx.setStorageSync('my_wishes', store); } catch (e) {}
    const app = getApp();
    const before = app.globalData.level;
    app.addMerit(3, '寄愿');
    const after = app.globalData.level;
    this.setData({ myWishes: arr, myWishText: '', composing: false, merit: app.globalData.merit, level: after });
    whimsy.afterMerit(this, before, after, 3, 'wish');
    whimsy.stardust(this, { x: '50%', y: '30%' });
    wx.showToast({ title: '星河已收下你的愿 ✦', icon: 'none' });
  },

  onShareAppMessage() {
    return { title: '拾光驿·星野漫游 · 日行一善积功德', path: '/pages/index/index' };
  }
});
