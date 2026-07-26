// 星座测试（娱乐化运势）
const { XZ, computeXz } = require('../../utils/divine.js');

function starStr(n) {
  return '★'.repeat(n) + '☆'.repeat(5 - n);
}

Page({
  behaviors: [require('../../behaviors/themeable.js')],
  data: {
    theme: 'light',
    signs: XZ.map((s) => s + '座'),
    sIndex: 0,
    result: null
  },
  onShow() {
  },
  onS(e) { this.setData({ sIndex: Number(e.detail.value) }); },
  run() {
    const r = computeXz(this.data.sIndex || 0);
    this.setData({
      result: {
        sign: r.sign,
        line: r.line,
        starsAll: starStr(r.all),
        starsLove: starStr(r.love),
        starsCareer: starStr(r.career),
        starsHealth: starStr(r.health)
      }
    });
    wx.showToast({ title: '今日运势已抽取', icon: 'none' });
  },
  onShareAppMessage() {
    return { title: '星座测试 · 今日运势', path: '/pages/xingzuo/xingzuo' };
  }
});
