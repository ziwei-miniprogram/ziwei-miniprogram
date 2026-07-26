const { messages } = require('../../utils/mock.js');
const social = require('../../utils/social.js');

Page({
  behaviors: [require('../../behaviors/themeable.js')],
  data: {
    seg: 'chat',
    sessions: [],
    notices: [],
    meritFeed: [],
    tips: [],
    theme: 'light',
    fx: [],
    dust: []
  },
  onShow() {
    const app = getApp();
    if (app && typeof app.markRead === 'function') app.markRead();
    // 优先展示真实的「活」功德动态；无记录时回退演示数据
    const log = social.getLog();
    this.setData({
      sessions: messages.sessions,
      notices: messages.notices,
      meritFeed: log.length ? log : messages.meritFeed
    });
    this.buildTips(app);
    if (typeof this.getTabBar === 'function' && this.getTabBar()) this.getTabBar().setData({ selected: 2 });
  },
  // P1-5 行为序列消息：按用户当前状态生成上下文「星野小提示」
  buildTips(app) {
    if (!app || !app.globalData) { this.setData({ tips: [] }); return; }
    const tips = [];
    if (!app.checkedInToday()) {
      tips.push({ icon: '🪔', text: '今日心灯还没亮，点亮可得 +3 功德', route: '/pages/merit/merit' });
    }
    const toUnlock = 30 - app.globalData.merit;
    if (toUnlock > 0 && toUnlock <= 12) {
      tips.push({ icon: '✦', text: `再攒 ${toUnlock} 功德，即可解锁深度星图解读`, route: '/pages/chart/chart' });
    }
    try {
      const wish = wx.getStorageSync('my_wish');
      if (wish) tips.push({ icon: '🌿', text: `你的星愿「${wish}」正等着你日行一善`, route: '/pages/index/index' });
    } catch (e) {}
    if (app.globalData.streak >= 3) {
      tips.push({ icon: '🔥', text: `连签 ${app.globalData.streak} 天，火苗正旺，今天也来续上`, route: '/pages/merit/merit' });
    }
    this.setData({ tips });
  },
  switchSeg(e) { this.setData({ seg: e.currentTarget.dataset.s }); },
  openMeritItem(e) {
    const route = e.currentTarget.dataset.route;
    if (route) wx.navigateTo({ url: route });
  },
  openChat() { wx.showToast({ title: '打开会话（演示）', icon: 'none' }); }
});
