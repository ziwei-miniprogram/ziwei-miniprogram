// custom-tab-bar：底部导航（自定义）。
// 结构：发现 / 文旅 / 星野(居中主推) / 商城 / 我的
// 图标统一为线性 SVG（base64 data URI），选中态切换金色，明暗自适应。
const G = '#9a9286';    // 未选中（次级灰）
const GOLD = '#c8a35a'; // 选中（星辉金）

// 生成线性 SVG data URI（stroke 着色，fill none）
function svg(inner, color) {
  const s = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="' + color +
    '" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' + inner + '</svg>';
  return 'data:image/svg+xml,' + encodeURIComponent(s);
}
// 居中星野：金色实心圆 + 深蓝星（始终高亮，强调品牌中枢）
function svgCenter() {
  const s = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">' +
    '<circle cx="12" cy="12" r="11" fill="#c8a35a"/>' +
    '<path d="M12 3.4 13.5 10.5 20.6 12 13.5 13.5 12 20.6 10.5 13.5 3.4 12 10.5 10.5 Z" fill="#0B1426"/></svg>';
  return 'data:image/svg+xml,' + encodeURIComponent(s);
}
const ICON = {
  // 发现：罗盘（外环 + 指针菱形 + 中心轴）
  compass: '<circle cx="12" cy="12" r="9"/><path d="M12 6.4 14 12l-2 5.6L10 12z"/><circle cx="12" cy="12" r="1"/>',
  // 文旅：地图定位针
  map: '<path d="M12 21.4S18.5 15.4 18.5 10A6.5 6.5 0 1 0 5.5 10c0 5.4 6.5 11.4 6.5 11.4z"/><circle cx="12" cy="10" r="2.4"/>',
  // 商城：精致购物袋（圆角袋身 + 提手）
  bag: '<path d="M6.5 8h11l-1 11.4h-9z"/><path d="M9.4 8v-1a2.6 2.6 0 0 1 5.2 0v1"/>',
  // 我的：人像（头部 + 肩部弧）
  user: '<circle cx="12" cy="8" r="3.6"/><path d="M5.4 20a6.6 6.6 0 0 1 13.2 0z"/>'
};

Component({
  data: {
    selected: 0,
    color: '#9a9286',
    selectedColor: '#c8a35a',
    theme: 'light',
    surprise: false,
    list: [
      { pagePath: '/pages/index/index', text: '发现', tabIndex: 0,
        icon: svg(ICON.compass, G), iconActive: svg(ICON.compass, GOLD) },
      { pagePath: '/pages/tourism/tourism', text: '文旅', tabIndex: 1,
        icon: svg(ICON.map, G), iconActive: svg(ICON.map, GOLD) },
      { pagePath: '/pages/space/space', text: '星野', center: true, iconCenter: svgCenter() },
      { pagePath: '/pages/mall/mall', text: '商城', tabIndex: 2,
        icon: svg(ICON.bag, G), iconActive: svg(ICON.bag, GOLD) },
      { pagePath: '/pages/profile/profile', text: '我的', tabIndex: 3,
        icon: svg(ICON.user, G), iconActive: svg(ICON.user, GOLD) }
    ]
  },
  pageLifetimes: {
    show() {
      const app = getApp();
      if (app && app.globalData) {
        this.setData({ unread: app.globalData.unread || 0, theme: app.getTheme() });
      }
      // 惊喜盲盒：进入页面时消费一次「待展示」标记（仅冷启动/前台返回触发）；
      // 延后至开窗动画之后，形成「开窗 → 拆礼」的连续惊喜序列。
      if (app && app.consumeSurprise && app.consumeSurprise()) {
        const self = this;
        setTimeout(() => self.setData({ surprise: true }), 1300);
      }
    }
  },
  methods: {
    switchTab(e) {
      const item = e.currentTarget.dataset.item;
      // 全部为 tabBar 页（含居中星野），统一 switchTab
      wx.switchTab({ url: item.pagePath });
    },
    // —— 惊喜盲盒回调 ——
    onSurpriseClaim(e) {
      const app = getApp();
      const r = e.detail.reward;
      const today = app.todayStr();
      let claimed = false;
      try { claimed = wx.getStorageSync('surprise_claim_date') === today; } catch (err) {}
      if (!claimed) {
        app.addMerit(r, '星礼');
        try { wx.setStorageSync('surprise_claim_date', today); } catch (err) {}
        wx.showToast({ title: `星礼 +${r} 功德 · 已收下`, icon: 'none' });
      } else {
        wx.showToast({ title: '今日星礼已收下啦', icon: 'none' });
      }
      this.setData({ surprise: false });
    },
    onSurpriseView() {
      wx.navigateTo({ url: '/pages/daily/daily' });
      this.setData({ surprise: false });
    },
    onSurpriseClose() {
      this.setData({ surprise: false });
    }
  }
});
