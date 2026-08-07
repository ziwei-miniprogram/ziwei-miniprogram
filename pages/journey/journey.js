const { healings } = require('../../utils/mock.js');

Page({
  behaviors: [require('../../behaviors/themeable.js')],
  data: {
    streak: 3,
    log: '',
    moods: ['低落', '平静', '舒缓', '愉悦', '释然'],
    moodSel: 2,
    meditations: healings,
    theme: 'light'
  },
  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 2 });
    }
  },
  pickMood(e) {
    this.setData({ moodSel: e.currentTarget.dataset.i });
  },
  onInput(e) {
    this.setData({ log: e.detail.value });
  },
  save() {
    if (!this.data.log.trim()) {
      wx.showToast({ title: '写点什么吧', icon: 'none' });
      return;
    }
    // 实际项目需调用内容安全 API 审核后再存储
    wx.showToast({ title: '已存入心灵日记', icon: 'success' });
    this.setData({ log: '' });
  }
});
