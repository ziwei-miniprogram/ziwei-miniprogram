const { tours } = require('../../utils/mock.js');
const checkin = require('../../utils/checkin.js');
const fujian = require('../../utils/fujian-routes.js');
const heritage = require('../../utils/heritage-map.js');
const whimsy = require('../../utils/whimsy.js');

// 演示：为每条线路补充视觉梯度与「适合星象」标签
const deco = [
  { g: 'a', tag: '宜迁移宫旺' },
  { g: 'b', tag: '宜福德宫稳' },
  { g: 'c', tag: '宜命宫清' }
];
const tours2 = tours.map((t, i) => ({ ...t, g: deco[i % 3].g, tag: deco[i % 3].tag }));

Page({
  behaviors: [require('../../behaviors/themeable.js')],
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
    remoteMap: {},
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
    mapLng: checkin.CITIES[0].lng,
    // —— 福建官方线路（静态线路模板，对应省规划「三带 / 五圈」）——
    routes: [],
    routeOverall: {
      spotsDone: 0, spotsTotal: fujian.SPOT_TOTAL,
      routesDone: 0, routesTotal: fujian.ROUTE_TOTAL,
      shardCount: 0, shards: [], recommend: null
    },
    // —— 非遗星图（闽南文化生态保护区；碎片来自「走到 · 做善 · 答题」）——
    heritageFrags: {},
    heritageOverall: {
      lit: 0, total: heritage.TOTAL,
      groupLit: 0, groupTotal: 4,
      fragmentsTotal: 0, fragmentsCap: heritage.TOTAL * 3,
      next: null
    }
  },
  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 1 });
    }
    this.refreshCheckin();
    this.buildMarkers();
    this.buildGuardBoard();
    this.refreshRoutes();
    this.refreshHeritage();
  },
  // 非遗星图：从数据层同步碎片与总进度（三条碎片来源的写入都在别处，这里只读）
  refreshHeritage() {
    this.setData({
      heritageFrags: heritage.rawFrags(),
      heritageOverall: heritage.state()
    });
  },
  // 星图组件内部变动（答题得「知见」/ 立愿星）→ 重算
  onHeritageChange() {
    this.refreshHeritage();
  },
  // 走到线路站点 → 给该地市全部非遗星发行迹碎片；返回本次新得的碎片用于提示
  grantHeritageTrace(spotId) {
    const hg = heritage.grantSpotFragments(spotId);
    if (hg.ok) this.refreshHeritage();
    return hg;
  },
  // 福建线路：同步线路完成度与汇总（真实进度，不做虚高起点）
  refreshRoutes() {
    this.setData({
      routes: fujian.allRouteProgress(),
      routeOverall: fujian.overallProgress()
    });
  },
  // 线路站点打卡：记录 + 星屑 + 走完一条线解锁线路星（虚拟收集物，零金钱）
  checkInRouteSpot(e) {
    const spotId = e.currentTarget.dataset.spot;
    const r = fujian.checkInSpot(spotId);
    if (!r.ok) {
      wx.showToast({ title: r.reason === 'already' ? '这一站已打卡过啦' : '暂不可打卡', icon: 'none' });
      return;
    }
    this.refreshRoutes();
    whimsy.burst(this, { text: '巡礼打卡 · ' + r.spot.name, emoji: '✦' });
    if (r.newlyCompleted.length) {
      const names = r.newlyCompleted.map(c => c.name).join('、');
      const shards = r.newlyCompleted.map(c => c.shard.name).join('、');
      wx.showModal({
        title: '一条线路走完了',
        content: '「' + names + '」已走完，解锁线路星：' + shards + '。\n线路星会汇入星图碎片，集齐可点亮一张主题星图。',
        showCancel: false,
        confirmText: '知道了'
      });
      return;
    }
    wx.showToast({ title: '巡礼 +1 · 星屑 +' + r.shards, icon: 'none' });
  },
  // 推荐线路卡上的「打卡」：一键点亮该线的下一站（省掉找点的动作）
  checkInNext(e) {
    const routeId = e.currentTarget.dataset.route;
    const p = fujian.routeProgress(routeId);
    if (!p || !p.next) { wx.showToast({ title: '这条线已走完', icon: 'none' }); return; }
    this.checkInRouteSpot({ currentTarget: { dataset: { spot: p.next.id } } });
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
    const remoteMap = {};
    p.checked.forEach(id => { checkedMap[id] = true; remoteMap[id] = checkin.isRemote(id); });
    const checkedCount = p.checkedCount;
    const shown = Math.max(1, checkedCount); // 虚高起点
    this.setData({
      cities: checkin.CITIES,
      total: checkin.TOTAL,
      checkedMap: checkedMap,
      remoteMap: remoteMap,
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
        // 福建线路站点优先判定：景区级坐标比城市中心更精细。命中即记一次巡礼并结束本次检测，
        // 避免「线路提示 + 城市提示」双重弹窗。
        const rs = fujian.autoCheckInByLocation(res.latitude, res.longitude);
        if (rs.status === 'checked') {
          self.refreshRoutes();
          const hg = self.grantHeritageTrace(rs.spot.id);
          whimsy.burst(self, { text: '到访已记录 · ' + rs.spot.name, emoji: '✦' });
          wx.showToast({
            title: '到访「' + rs.spot.name + '」· 巡礼已记' + (hg.ok ? ' · 行迹 +' + hg.granted.length : ''),
            icon: 'none'
          });
          return;
        }
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
        whimsy.burst(self, { text: '定位到访 · 星图自动点亮', emoji: '✦' });
        wx.showModal({
          title: '到访已记录',
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
    whimsy.burst(this, { text: '星图已点亮 · 城市守护折扣到手', emoji: '✦' });
    wx.showModal({
      title: '城已点亮',
      content: `你点亮了「${city.name}」的星图，解锁「${r.coupon.label}」与限定优先购资格（24h）。\n带这份守护，去星野好物挑一件伴手礼吧～`,
      confirmText: '去商城',
      cancelText: '再逛逛',
      success: (res) => { if (res.confirm) wx.switchTab({ url: '/pages/mall/mall' }); }
    });
  },
  onFilter(e) {
    this.setData({ filter: e.currentTarget.dataset.f });
  },
  // P0-c 遥寄祝福：不在城市 1500m 内也能远程点亮（解 B6 GPS 硬门槛），与远程祈福定位一致
  remoteCheckInCity() {
    const self = this;
    const unchecked = checkin.CITIES.filter(c => !checkin.isChecked(c.id));
    if (!unchecked.length) {         wx.showToast({ title: '6 城皆已守护', icon: 'none' }); return; }
    wx.showActionSheet({
      itemList: unchecked.map(c => '遥寄 · ' + c.name),
      success(r) {
        const city = unchecked[r.tapIndex];
        const res = checkin.remoteCheckIn(city.id);
        if (!res.ok) { wx.showToast({ title: '这座城已点亮过', icon: 'none' }); return; }
        self.refreshCheckin();
        self.buildMarkers();
        whimsy.burst(self, { text: '遥寄祝福 · 星图已点亮', emoji: '✦' });
        wx.showModal({
          title: '遥寄已送达',
          content: `你为「${city.name}」遥寄了一盏祝福灯，星图已点亮，解锁城市守护折扣 + 限定优先购资格（24h）。带这份守护，去星野好物挑一件伴手礼吧～`,
          confirmText: '去商城',
          cancelText: '再逛逛',
          success: (m) => { if (m.confirm) wx.switchTab({ url: '/pages/mall/mall' }); }
        });
      }
    });
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
