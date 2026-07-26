const { tours } = require('../../utils/mock.js');
const checkin = require('../../utils/checkin.js');
const whimsy = require('../../utils/whimsy.js');

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
    dust: [],
    // —— 文旅打卡 P0 ——
    cities: [],
    checkedMap: {},
    checkedCount: 0,
    total: checkin.TOTAL,
    progressPct: 16,            // 虚高起点：即使 0 城也显示 16% 进度，给即时成就感
    remain: checkin.TOTAL,
    hasReward: false
  },
  onShow() {
    const app = getApp();
    if (app && app.applyTheme) app.applyTheme();
    this.setData({ theme: app ? app.getTheme() : 'light' });
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 1 });
    }
    this.refreshCheckin();
  },
  // 文旅打卡 P0：从 checkin 层同步点亮状态、进度、奖励提示
  refreshCheckin() {
    const p = checkin.progress();
    const checkedMap = {};
    p.checked.forEach(id => { checkedMap[id] = true; });
    const checkedCount = p.checkedCount;
    const shown = Math.max(1, checkedCount); // 虚高起点
    this.setData({
      cities: checkin.CITIES,
      total: checkin.TOTAL,
      checkedMap: checkedMap,
      checkedCount: checkedCount,
      progressPct: Math.round(shown / checkin.TOTAL * 100),
      remain: Math.max(0, checkin.TOTAL - checkedCount),
      hasReward: checkin.couponCount() > 0
    });
  },
  // 到访打卡：点亮城市 + 解折扣券 + 优先购资格，飘星后引导去商城
  checkInCity(e) {
    const cityId = e.currentTarget.dataset.city;
    const city = checkin.CITIES.find(c => c.id === cityId) || {};
    const r = checkin.checkIn(cityId);
    if (!r.ok) {
      wx.showToast({ title: '这座城已点亮过啦', icon: 'none' });
      return;
    }
    this.refreshCheckin();
    whimsy.burst(this, { text: '星图已点亮 · 城市守护折扣到手', emoji: '🌟' });
    wx.showModal({
      title: '城已点亮 ✨',
      content: `你点亮了「${city.name}」的星图，解锁「${r.coupon.label}」与限定优先购资格（24h）。\n带这份守护，去星野好物挑一件伴手礼吧～`,
      confirmText: '去商城',
      cancelText: '再逛逛',
      success: (res) => { if (res.confirm) wx.switchTab({ url: '/pages/mall/mall' }); }
    });
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
