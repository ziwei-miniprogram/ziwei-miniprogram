// behaviors/themeable.js
// 双主题可复用行为（高阶封装）：页面一次性接入，自动在每次显示时把全局明暗
// 主题同步到「原生导航栏 + 本页 data.theme」，双主题令牌（--bg/--gold 等）永不漂移。
//
// 用法（页面 .js 顶部）：
//   Page({
//     behaviors: [require('../../behaviors/themeable.js')],
//     data: { ... },
//   })
//   // 对应 wxml 根节点加 class="page {{theme}}" 即可自动吃令牌
//
// 主动切换主题（如「夜灯模式」开关）请调用 this.syncTheme()，
// 不要再手动 applyTheme + setData，避免与行为重复、出现明暗不一致。
module.exports = Behavior({
  data: {
    theme: 'light'
  },
  methods: {
    // 同步当前主题：导航栏配色 + 本页 data.theme
    syncTheme() {
      const app = getApp();
      if (!app || typeof app.applyTheme !== 'function') return;
      app.applyTheme();
      this.setData({ theme: app.getTheme() });
    }
  },
  // 页面每次显示即同步（tab 切换 / 从详情页返回都触发），保证明暗永不漂移
  onShow() {
    this.syncTheme();
  }
});
