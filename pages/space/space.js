// 星野 · 工具箱：全部工具型页面的唯一归口（接回孤儿页 journey / blessing）
const tools = [
  { key: 'chart', icon: '🔮', name: '星图', desc: '深度星象解读', url: '/pages/chart/chart' },
  { key: 'healing', icon: '🍃', name: '疗愈', desc: '呼吸与冥想', url: '/pages/healing/healing' },
  { key: 'journey', icon: '🌿', name: '心灵之旅', desc: '正念行走', url: '/pages/journey/journey' },
  { key: 'wish', icon: '🏮', name: '寄愿墙', desc: '心愿与灯', url: '/pages/merit/merit?tab=wish' },
  { key: 'blessing', icon: '🌟', name: '祝福视频', desc: '星夜祝福', url: '/pages/blessing/blessing' },
  { key: 'merit', icon: '🪔', name: '功德林', desc: '日行一善', url: '/pages/merit/merit' }
];

Page({
  data: { tools, theme: 'light' },
  onShow() {
    const app = getApp();
    app.applyTheme();
    this.setData({ theme: app.getTheme() });
  },
  go(e) {
    wx.navigateTo({ url: e.currentTarget.dataset.url });
  },
  onShareAppMessage() {
    return { title: '星野工具箱 · 星图疗愈寄愿', path: '/pages/index/index' };
  }
});
