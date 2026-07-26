Component({
  data: {
    selected: 0,
    color: "#9a9286",
    selectedColor: "#c8a35a",
    theme: "light",
    list: [
      { pagePath: "/pages/index/index", text: "发现", icon: "🔭", tabIndex: 0 },
      { pagePath: "/pages/tourism/tourism", text: "文旅", icon: "🏯", tabIndex: 1 },
      { pagePath: "/pages/publish/publish", text: "记一笔", icon: "✚", center: true },
      { pagePath: "/pages/message/message", text: "消息", icon: "✉", tabIndex: 2 },
      { pagePath: "/pages/profile/profile", text: "我的", icon: "👤", tabIndex: 3 }
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
      if (item.center) {
        wx.navigateTo({ url: item.pagePath });
        return;
      }
      wx.switchTab({ url: item.pagePath });
    }
  }
});
