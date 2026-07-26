const templates = [
  { key: 'birthday', name: '生日', bg: '#ff9a9e,#fad0c4', emoji: '🎂', title: '生日快乐' },
  { key: 'newyear', name: '新年', bg: '#f6d365,#fda085', emoji: '🧧', title: '新年大吉' },
  { key: 'wedding', name: '婚庆', bg: '#c8a35a,#e6c9a8', emoji: '💍', title: '百年好合' },
  { key: 'bless', name: '寄愿', bg: '#84fab0,#8fd3f4', emoji: '🙏', title: '平安喜乐' }
];
const musics = ['轻柔钢琴', '自然白噪音', '古风笛声', '无'];
const whimsy = require('../../utils/whimsy.js');

Page({
  behaviors: [require('../../behaviors/themeable.js')],
  data: {
    templates,
    musics,
    tpl: 0,
    text: '愿你被这世界温柔以待',
    music: 0,
    saved: false,
    // —— 愉悦状态位 ——
    fx: [],
    levelUp: null,
    theme: 'light'
  },
  onShow() {
  },
  onReady() {
    this.initCanvas();
  },
  initCanvas() {
    const q = wx.createSelectorQuery();
    q.select('#cv').fields({ node: true, size: true }).exec((res) => {
      if (!res[0]) return;
      const canvas = res[0].node;
      const ctx = canvas.getContext('2d');
      const dpr = (wx.getSystemInfoSync && wx.getSystemInfoSync().pixelRatio) || 2;
      canvas.width = 300 * dpr;
      canvas.height = 400 * dpr;
      ctx.scale(dpr, dpr);
      this.canvas = canvas;
      this.ctx = ctx;
      this.draw();
    });
  },
  draw() {
    const ctx = this.ctx;
    if (!ctx) return;
    const t = this.data.templates[this.data.tpl];
    const colors = t.bg.split(',');
    const g = ctx.createLinearGradient(0, 0, 0, 400);
    g.addColorStop(0, colors[0]);
    g.addColorStop(1, colors[1]);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 300, 400);
    ctx.textAlign = 'center';
    ctx.font = '64px serif';
    ctx.fillText(t.emoji, 150, 150);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 30px sans-serif';
    ctx.fillText(t.title, 150, 215);
    ctx.font = '18px sans-serif';
    this.wrapText(this.data.text, 150, 255, 250, 26);
    ctx.fillStyle = 'rgba(255,255,255,.85)';
    ctx.font = '14px sans-serif';
    ctx.fillText('—— 来自拾光驿·星野漫游', 150, 372);
  },
  wrapText(text, x, y, maxW, lh) {
    const ctx = this.ctx;
    const chars = text.split('');
    let line = '';
    let yy = y;
    for (let i = 0; i < chars.length; i++) {
      const test = line + chars[i];
      if (ctx.measureText(test).width > maxW && line) {
        ctx.fillText(line, x, yy);
        line = chars[i];
        yy += lh;
      } else {
        line = test;
      }
    }
    if (line) ctx.fillText(line, x, yy);
  },
  pickTpl(e) {
    this.setData({ tpl: e.currentTarget.dataset.index }, () => this.draw());
  },
  onText(e) {
    this.setData({ text: e.detail.value }, () => this.draw());
  },
  pickMusic(e) {
    this.setData({ music: e.currentTarget.dataset.index });
  },
  generate() {
    if (!this.canvas) {
      wx.showToast({ title: '画布未就绪', icon: 'none' });
      return;
    }
    wx.showLoading({ title: '生成中' });
    wx.canvasToTempFilePath({
      canvas: this.canvas,
      success: (r) => {
        this.temp = r.tempFilePath;
        this.setData({ saved: true });
        wx.hideLoading();
        whimsy.burst(this, { text: whimsy.COPY.success.share, emoji: '🎁' });
        wx.showModal({
          title: '祝福已凝成星光',
          content: 'MVP 已导出封面图。正式视频请在开通云开发后调用 genBlessingVideo 云函数（模板+用户素材+背景音乐由 ffmpeg 合成为 MP4）。',
          confirmText: '保存到相册',
          success: (m) => { if (m.confirm) this.save(); }
        });
      },
      fail: () => {
        wx.hideLoading();
        wx.showToast({ title: '生成失败', icon: 'none' });
      }
    });
  },
  save() {
    if (!this.temp) return;
    wx.saveImageToPhotosAlbum({
      filePath: this.temp,
      success: () => wx.showToast({ title: '已保存', icon: 'success' }),
      fail: () => wx.showToast({ title: '请授权相册', icon: 'none' })
    });
  },
  onShareAppMessage() {
    return { title: '送你一段祝福视频~', path: '/pages/blessing/blessing' };
  }
});
