// custom-tab-bar：底部导航（自定义）。
// 结构：发现 / 文旅 / 星野(居中主推) / 商城 / 我的
// 图标统一为线性 SVG（base64 data URI），选中态切换金色，明暗自适应。
const G = '#9a9286';    // 未选中（次级灰）
const GOLD = '#c8a35a'; // 选中（星辉金）

// 生成线性 SVG data URI（stroke 着色，fill none）
function svg(inner, color) {
  const s = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="' + color +
    '" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">' + inner + '</svg>';
  return 'data:image/svg+xml,' + encodeURIComponent(s);
}
// 居中星野：金色实心圆 + 深蓝星（始终高亮，强调品牌中枢）
function svgCenter() {
  const s = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">' +
    '<circle cx="12" cy="12" r="11" fill="#c8a35a"/>' +
    '<path d="M12 5l1.9 4.9L19 11l-5.1 1.1L12 17l-1.9-4.9L5 11l5.1-1.1z" fill="#0B1426"/></svg>';
  return 'data:image/svg+xml,' + encodeURIComponent(s);
}
const ICON = {
  compass: '<circle cx="12" cy="12" r="8"/><path d="M12 4v16M4 12h16"/>',
  map: '<path d="M12 3l8 4-8 4-8-4 8-4z"/><path d="M4 11v6l8 4 8-4v-6"/>',
  bag: '<path d="M6 8h12l-1 12H7z"/><path d="M9 8V6a3 3 0 016 0v2"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/>'
};

Component({
  data: {
    selected: 0,
    color: '#9a9286',
    selectedColor: '#c8a35a',
    theme: 'light',
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
    }
  },
  methods: {
    switchTab(e) {
      const item = e.currentTarget.dataset.item;
      // 全部为 tabBar 页（含居中星野），统一 switchTab
      wx.switchTab({ url: item.pagePath });
    }
  }
});
