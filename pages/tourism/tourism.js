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
    hasReward: false,
    // —— P2：全国守护礼 + 城市守护榜 ——
    allReward: { done: false, remain: checkin.TOTAL, rewardName: '', rewardDesc: '' },
    guardSelf: 0,
    guardOthers: 0,
    guardAllDone: false,
    // —— 文旅打卡 P1：GPS 地图 ——
    markers: [],
    mapLat: checkin.CITIES[0].lat,
    mapLng: checkin.CITIES[0].lng
  },
  onShow() {
    const app = getApp();
    if (app && app.applyTheme) app.applyTheme();
    this.setData({ theme: app ? app.getTheme() : 'light' });
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 1 });
    }
    this.refreshCheckin();
    this.buildMarkers();
    this.buildGuardBoard();
  },
  // P2：全国守护礼状态 + 城市守护榜（本地社会证明，驱动复访打卡）
  buildGuardBoard() {
    const p = checkin.progress();
    const all = checkin.allRewardInfo();
    // 演示基数 + 随已点亮城市数增长，营造「已有许多星友在守护」的从众感
    const others = 1280 + p.checkedCount * 37 + (p.allChecked ? 318 : 0);
    this.setData({
      allReward: all,
      guardSelf: p.checkedCount,
      guardOthers: others,
      guardAllDone: p.allChecked
    });
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
    this.buildGuardBoard();
  },
  // P1：根据点亮状态生成地图 marker（点亮城市金色高亮）
  buildMarkers() {
    const p = checkin.progress();
    const checkedSet = {};
    p.checked.forEach(id => { checkedSet[id] = true; });
    const markers = checkin.CITIES.map((c, i) => ({
      id: i,
      latitude: c.lat,
      longitude: c.lng,
      width: 28,
      height: 28,
      callout: {
        content: checkedSet[c.id] ? '★ ' + c.name : c.name,
        color: checkedSet[c.id] ? '#8a6a2a' : '#998f80',
        fontSize: 11,
        borderRadius: 8,
        padding: 6,
        bgColor: '#ffffff',
        display: 'ALWAYS'
      }
    }));
    this.setData({
      markers,
      mapLat: checkin.CITIES[0].lat,
      mapLng: checkin.CITIES[0].lng
    });
  },
  // P1：GPS 自动打卡——授权定位后，到访 1.5km 内城市即自动点亮
  detectNearby() {
    const self = this;
    wx.getLocation({
      type: 'gcj02',
      success(res) {
        const r = checkin.autoCheckInByLocation(res.latitude, res.longitude);
        if (r.status === 'none') {
          wx.showToast({ title: '附近暂无可点亮城市', icon: 'none' });
          return;
        }
        if (r.status === 'already') {
          wx.showToast({ title: '「' + r.city.name + '」已点亮过', icon: 'none' });
          self.refreshCheckin();
          self.buildMarkers();
          return;
        }
        // status === 'checked'
        self.refreshCheckin();
        self.buildMarkers();
        whimsy.burst(self, { text: '定位到访 · 星图自动点亮', emoji: '📍' });
        wx.showModal({
          title: '到访已记录 ✨',
          content: '系统定位到你在「' + r.city.name + '」附近（约 ' + r.meters + 'm），星图已自动点亮，解锁城市守护折扣 + 限定优先购资格（24h）。\n带这份守护，去星野好物挑一件伴手礼吧～',
          confirmText: '去商城',
          cancelText: '再逛逛',
          success: (m) => { if (m.confirm) wx.switchTab({ url: '/pages/mall/mall' }); }
        });
      },
      fail() {
        wx.showToast({ title: '未授权定位，可手动点亮', icon: 'none' });
      }
    });
  },
  // P0 手动到访打卡：点亮城市 + 解折扣券 + 优先购资格，飘星后引导去商城
  checkInCity(e) {
    const cityId = e.currentTarget.dataset.city;
    const city = checkin.CITIES.find(c => c.id === cityId) || {};
    const r = checkin.checkIn(cityId);
    if (!r.ok) {
      wx.showToast({ title: '这座城已点亮过啦', icon: 'none' });
      return;
    }
    this.refreshCheckin();
    this.buildMarkers();
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
