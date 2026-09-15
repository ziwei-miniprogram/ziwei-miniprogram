// 星盘 · 星象合集（紫微斗数 / 四柱八字 / 星座测试 三合一内部 tab，解 B3 孤儿页）
// UX 架构 P1：把 ziwei/bazi/xingzuo 三个孤儿页合并为单一星盘中枢，内部 segmented tab 切换；
// 底部 LoopChip 把用户送回主循环（点亮星图/寄愿/三善/记笔记），消除「读完无回灌」断点。
const { HOURS, XZ, computeZiwei, computeBazi, computeXz } = require('../../utils/divine.js');

function starStr(n) {
  return '★'.repeat(n) + '☆'.repeat(5 - n);
}

Page({
  behaviors: [require('../../behaviors/themeable.js')],
  data: {
    theme: 'light',
    mode: 'ziwei',
    modes: [
      { key: 'ziwei', name: '紫微斗数' },
      { key: 'bazi', name: '四柱八字' },
      { key: 'xingzuo', name: '星座测试' }
    ],
    // 共享输入
    y: '', m: '', d: '',
    hIndex: 0, hours: HOURS,
    sIndex: 0, signs: XZ.map((s) => s + '座'),
    // 各模式结果（切换 tab 不丢上次结果）
    ziwei: null, bazi: null, xz: null,
    // 回灌闭环（解 B3）
    loopItems: [
      { icon: 'chart', label: '点亮今日星图', url: '/pages/chart/chart' },
      { icon: 'wish', label: '寄愿一笔', url: '/pages/merit/merit?tab=wish' },
      { icon: 'deeds', label: '今日三善', url: '/pages/merit/merit' },
      { icon: 'note', label: '记一笔感悟', url: '/pages/note/note' }
    ]
  },
  onLoad(q) {
    if (q && q.mode && ['ziwei', 'bazi', 'xingzuo'].indexOf(q.mode) >= 0) {
      this.setData({ mode: q.mode });
    }
  },
  switchMode(e) {
    this.setData({ mode: e.currentTarget.dataset.mode });
  },
  onY(e) { this.setData({ y: e.detail.value }); },
  onM(e) { this.setData({ m: e.detail.value }); },
  onD(e) { this.setData({ d: e.detail.value }); },
  onH(e) { this.setData({ hIndex: Number(e.detail.value) }); },
  onS(e) { this.setData({ sIndex: Number(e.detail.value) }); },
  run() {
    const { mode, y, m, d, hIndex, sIndex } = this.data;
    if (mode === 'ziwei') {
      const r = computeZiwei(parseInt(y, 10) || 1995, parseInt(m, 10) || 1, parseInt(d, 10) || 1);
      this.setData({ ziwei: { star: r.star, palace: '命宫', line: r.line, sushe: r.sushe } });
      wx.showToast({ title: '命宫主星 · ' + r.star, icon: 'none' });
    } else if (mode === 'bazi') {
      const r = computeBazi(parseInt(y, 10) || 1995, parseInt(m, 10) || 1, parseInt(d, 10) || 1, hIndex);
      this.setData({ bazi: r });
      wx.showToast({ title: '四柱排盘完成', icon: 'none' });
    } else {
      const r = computeXz(sIndex || 0);
      this.setData({
        xz: {
          sign: r.sign, line: r.line,
          starsAll: starStr(r.all), starsLove: starStr(r.love),
          starsCareer: starStr(r.career), starsHealth: starStr(r.health)
        }
      });
      wx.showToast({ title: '今日星语已点亮', icon: 'none' });
    }
  },
  goChart() {
    wx.navigateTo({ url: '/pages/chart/chart' });
  },
  onShareAppMessage() {
    const titles = { ziwei: '紫微斗数 · 命宫主星', bazi: '四柱八字 · 五行排盘', xingzuo: '星座 · 今日星语' };
    return { title: titles[this.data.mode], path: '/pages/star-panel/star-panel?mode=' + this.data.mode };
  }
});
