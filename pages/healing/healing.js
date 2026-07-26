const { healings } = require('../../utils/mock.js');

Page({
  data: { healings, theme: 'light' },
  onShow() {
    const app = getApp();
    app.applyTheme();
    this.setData({ theme: app.getTheme() });
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 2 });
    }
  },
  play(e) {
    const h = this.data.healings[e.currentTarget.dataset.index];
    if (h.type === '咨询') {
      wx.showToast({ title: '跳转预约（演示）', icon: 'none' });
    } else {
      wx.showToast({ title: '播放：' + h.title, icon: 'none' });
    }
  }
});
