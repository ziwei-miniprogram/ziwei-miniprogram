const { tours } = require('../../utils/mock.js');

// 演示：为每条线路补充视觉梯度与「适合星象」标签
const deco = [
  { g: 'a', tag: '宜迁移宫旺' },
  { g: 'b', tag: '宜福德宫稳' },
  { g: 'c', tag: '宜命宫清' }
];
const tours2 = tours.map((t, i) => ({ ...t, g: deco[i % 3].g, tag: deco[i % 3].tag }));

Page({
  data: {
    tours: tours2,
    feature: tours2[0],
    filters: ['全部', '按星象', '按节气', '按城市'],
    filter: '全部',
    theme: 'light',
    fx: [],
    dust: []
  },
  onShow() {
    const app = getApp();
    if (app && app.applyTheme) app.applyTheme();
    this.setData({ theme: app ? app.getTheme() : 'light' });
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 1 });
    }
  },
  onFilter(e) {
    this.setData({ filter: e.currentTarget.dataset.f });
  },
  book(e) {
    const t = this.data.tours[e.currentTarget.dataset.index];
    wx.showModal({
      title: '预订线路',
      content: t.title + '\n' + t.days + '天 · ¥' + t.price + '/人',
      confirmText: '立即预订',
      success: (r) => { if (r.confirm) wx.showToast({ title: '预订成功（演示）', icon: 'success' }); }
    });
  }
});
