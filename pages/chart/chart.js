const { palaza } = require('../../utils/mock.js');
const merit = require('../../utils/merit.js');
const whimsy = require('../../utils/whimsy.js');

const DEEP_TEXT =
  '【深度解读 · 娱乐参考】\n' +
  '主宫紫微坐命，格局清正，主贵气与领导力；命宫三方四正会照天府、武曲，财官双美，宜在专业领域深耕。\n' +
  '事业宫贪狼化气为桃花与才艺，提示可跨界发展、以创意突围；夫妻宫太阳，配偶外向开朗，宜晚婚以稳。\n' +
  '福德宫天相，内心平和、晚运丰足。整体宜静心规划、循序渐进，不疾不速。\n' +
  '（以上为传统文化娱乐解读，不构成任何专业建议，请勿迷信。）';

// 三条明路：把「付费墙」变为「成长线」——一键直达可攒功德的地方。
const ROUTES = [
  { act: 'lamp', icon: '🪔', name: '点亮一盏心灯', desc: '寄愿墙 · +1 功德' },
  { act: 'checkin', icon: '🛎', name: '完成每日签到', desc: '功德林 · +3 功德' },
  { act: 'publish', icon: '✍️', name: '发布一篇感悟', desc: '记一笔 · +8 功德' }
];

Page({
  data: {
    palaza,
    active: 0,
    unlocked: false,
    deepText: DEEP_TEXT,
    cost: merit.UNLOCKS.deepChart.cost,
    levelName: merit.UNLOCKS.deepChart.needLevel,
    merit: 0,
    progress: 0,
    routes: ROUTES,
    // —— 愉悦状态位 ——
    fx: [],
    dust: [],
    levelUp: null,
    lit: false,
    tapIdx: -1,
    theme: 'light',
    starLit: 0,
    starGlow: false
  },
  onShow() {
    const app = getApp();
    const m = app.globalData.merit;
    const pct = Math.min(100, Math.round(m / this.data.cost * 100));
    const starLit = Math.max(0, Math.min(28, Math.floor(m / 2000 * 28)));
    app.applyTheme();
    this.setData({
      merit: m,
      progress: pct,
      toUnlock: Math.max(0, this.data.cost - m),
      near: pct >= 70,
      theme: app.getTheme(),
      starLit,
      starGlow: app.globalData.streak > 0
    });
    // 宫位依次点亮入场（仅首次进入播放，重复进入不重播）
    const self = this;
    if (!this.data._litPlayed) {
      setTimeout(() => self.setData({ lit: true }), 80);
      this.data._litPlayed = true;
    }
  },
  onSelect(e) {
    const i = e.currentTarget.dataset.index;
    this.setData({ active: i, tapIdx: i });
    const self = this;
    setTimeout(function () { if (self.data.tapIdx === i) self.setData({ tapIdx: -1 }); }, 500);
  },
  unlock() {
    const app = getApp();
    if (this.data.unlocked) return;
    if (app.globalData.merit < this.data.cost) {
      wx.showModal({
        title: '再攒一点功德就好',
        content: `点亮深度解读需 ${this.data.cost} 功德，当前 ${app.globalData.merit}（${this.data.progress}%）。去星野做几件「日行一善」，很快就能解锁，无需花钱～`,
        confirmText: '去攒功德',
        success: (r) => { if (r.confirm) wx.navigateTo({ url: '/pages/merit/merit' }); }
      });
      return;
    }
    const spent = this.data.cost;
    const ok = app.spendMerit(spent);
    if (ok) {
      this.setData({ unlocked: true, merit: app.globalData.merit });
      whimsy.burst(this, { text: whimsy.COPY.success.unlock, emoji: '🌟' });
    }
  },
  // 三条路径直达对应页面（操作完成后返回此页，进度自动刷新）
  onRoute(e) {
    const act = e.currentTarget.dataset.act;
    if (act === 'lamp') wx.navigateTo({ url: '/pages/merit/merit?tab=wish' });
    else if (act === 'checkin') wx.navigateTo({ url: '/pages/merit/merit' });
    else if (act === 'publish') wx.navigateTo({ url: '/pages/publish/publish' });
  },
  onShareAppMessage() {
    return { title: '我的星图解读', path: '/pages/index/index' };
  }
});
