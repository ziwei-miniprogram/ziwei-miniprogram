// 紫微斗数（娱乐化排盘）
const { computeZiwei } = require('../../utils/divine.js');

Page({
  behaviors: [require('../../behaviors/themeable.js')],
  data: {
    theme: 'light',
    y: '',
    m: '',
    d: '',
    result: null
  },
  onShow() {
  },
  onY(e) { this.setData({ y: e.detail.value }); },
  onM(e) { this.setData({ m: e.detail.value }); },
  onD(e) { this.setData({ d: e.detail.value }); },
  run() {
    const y = parseInt(this.data.y, 10) || 1995;
    const m = parseInt(this.data.m, 10) || 1;
    const d = parseInt(this.data.d, 10) || 1;
    const result = computeZiwei(y, m, d);
    this.setData({ result });
    wx.showToast({ title: '命宫主星 · ' + result.star, icon: 'none' });
  },
  goChart() {
    wx.navigateTo({ url: '/pages/chart/chart' });
  },
  onShareAppMessage() {
    return { title: '紫微斗数 · 命宫主星', path: '/pages/ziwei/ziwei' };
  }
});
