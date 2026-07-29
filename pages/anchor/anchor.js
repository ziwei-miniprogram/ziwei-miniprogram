const anchor = require('../../utils/anchor.js');
const whimsy = require('../../utils/whimsy.js');

function fmtDate(ts) {
  const t = new Date(ts);
  return `${t.getMonth() + 1}月${t.getDate()}日`;
}

Page({
  behaviors: [require('../../behaviors/themeable.js')],
  data: {
    theme: 'light',
    anchor: { name: '启明', wish: '', bornAt: 0, stars: [], deeds: [] },
    stars: [],
    returnedToday: false,
    deeds: [],
    showLamp: false,
    lampStep: 'choose',
    lampTier: '7d',
    lampPrice: 19.9,
    lastDeed: null
  },

  onShow() {
    const app = getApp();
    this.refresh();
    this.setData({ theme: app.getTheme() });
  },

  refresh() {
    const a = anchor.ensureBorn();
    const stars = (a.stars || []).map(s => ({ ...s, date: fmtDate(s.at) }));
    this.setData({
      anchor: a,
      stars,
      returnedToday: anchor.returnedToday(),
      deeds: (a.deeds || []).map(d => this.decorateDeed(d))
    });
  },

  decorateDeed(d) {
    return { ...d, timeline: (d.timeline || []).map(t => ({ ...t, date: fmtDate(t.at) })) };
  },

  // 归锚：每日保温层，沉一层星 + 回礼 1 功德
  doReturn() {
    if (anchor.returnedToday()) return;
    anchor.addStar('return', '今夜归锚 · 点灯');
    const app = getApp();
    app.addMerit(1, '归锚');
    if (whimsy && whimsy.stardust) whimsy.stardust(this, { x: '50%', y: '40%' });
    wx.showToast({ title: '锚点已温 ✦', icon: 'none' });
    this.refresh();
  },

  // 长明灯流程
  openLamp() {
    this.setData({ showLamp: true, lampStep: 'choose', lampTier: '7d', lampPrice: 19.9 });
  },
  closeLamp() { this.setData({ showLamp: false }); },
  noop() {},
  pickTier(e) {
    const k = e.currentTarget.dataset.k;
    this.setData({ lampTier: k, lampPrice: k === '49d' ? 99 : 19.9 });
  },
  backChoose() { this.setData({ lampStep: 'choose' }); },
  goPay() { this.setData({ lampStep: 'pay' }); },
  doPay() {
    const deed = anchor.lightLamp(this.data.lampTier, {});
    const app = getApp();
    app.addMerit(1, '星愿点亮回礼'); // 功德是善行回礼，非对价
    if (whimsy && whimsy.burst) whimsy.burst(this, { text: '星愿已落地 ✦', emoji: '✦' });
    this.setData({ lampStep: 'result', lastDeed: this.decorateDeed(deed) });
    this.refresh();
  }
});
