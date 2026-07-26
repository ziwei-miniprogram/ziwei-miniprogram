// 八字命理（娱乐化排盘）
const { HOURS, computeBazi } = require('../../utils/divine.js');

Page({
  behaviors: [require('../../behaviors/themeable.js')],
  data: {
    theme: 'light',
    y: '',
    m: '',
    d: '',
    hIndex: 0,
    hours: HOURS,
    result: null
  },
  onShow() {
  },
  onY(e) { this.setData({ y: e.detail.value }); },
  onM(e) { this.setData({ m: e.detail.value }); },
  onD(e) { this.setData({ d: e.detail.value }); },
  onH(e) { this.setData({ hIndex: Number(e.detail.value) }); },
  run() {
    const y = parseInt(this.data.y, 10) || 1995;
    const m = parseInt(this.data.m, 10) || 1;
    const d = parseInt(this.data.d, 10) || 1;
    const h = this.data.hIndex || 0;
    const result = computeBazi(y, m, d, h);
    this.setData({ result });
    wx.showToast({ title: '四柱排盘完成', icon: 'none' });
  },
  onShareAppMessage() {
    return { title: '八字命理 · 五行排盘', path: '/pages/bazi/bazi' };
  }
});
