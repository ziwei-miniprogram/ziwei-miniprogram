// 卡面模板（方向 B）：不用 emoji 字形，节令差异只靠「眉标 + 题字 + 一层极淡主题色晕」。
// icon 为站内 astro 图标名，仅用于选择器；卡面星芒由 drawSpark 矢量绘制，与 astro 同源。
const templates = [
  { key: 'birthday', name: '生日', icon: 'star',    eyebrow: '岁岁平安', title: '生日快乐', tint: '#c8a35a' },
  { key: 'newyear',  name: '新年', icon: 'lamp',    eyebrow: '岁序更新', title: '新年大吉', tint: '#b8703f' },
  { key: 'wedding',  name: '婚庆', icon: 'heart',   eyebrow: '双星同辉', title: '百年好合', tint: '#a8894f' },
  { key: 'bless',    name: '寄愿', icon: 'wish',    eyebrow: '心有所寄', title: '平安喜乐', tint: '#5f7d6a' }
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
    // 主题可能在别页被切换，回到本页按新令牌重绘卡面（暖纸 / 星夜自适应）
    if (this.ctx) this.draw();
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
  // #RRGGBB -> rgba()，用于极淡主题色晕
  rgba(hex, a) {
    const h = String(hex).replace('#', '');
    const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
    const n = parseInt(full, 16);
    return 'rgba(' + ((n >> 16) & 255) + ',' + ((n >> 8) & 255) + ',' + (n & 255) + ',' + a + ')';
  },
  // 四芒星 ✦：矢量描绘，与站内 astro 图标同源，不依赖 emoji 字形（跨端字形不一致）
  drawSpark(cx, cy, r, color, alpha) {
    const ctx = this.ctx;
    ctx.save();
    ctx.globalAlpha = alpha === undefined ? 1 : alpha;
    ctx.beginPath();
    ctx.moveTo(cx, cy - r);
    ctx.quadraticCurveTo(cx + r * 0.16, cy - r * 0.16, cx + r, cy);
    ctx.quadraticCurveTo(cx + r * 0.16, cy + r * 0.16, cx, cy + r);
    ctx.quadraticCurveTo(cx - r * 0.16, cy + r * 0.16, cx - r, cy);
    ctx.quadraticCurveTo(cx - r * 0.16, cy - r * 0.16, cx, cy - r);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
    ctx.restore();
  },
  // canvas 无 letterSpacing，逐字绘制实现字距（方向 B 的克制排版靠字距撑气口）
  drawTracked(text, cx, y, tracking) {
    const ctx = this.ctx;
    const chars = String(text).split('');
    const total = chars.reduce((sum, c) => sum + ctx.measureText(c).width + tracking, 0) - tracking;
    const align = ctx.textAlign;
    let x = cx - total / 2;
    ctx.textAlign = 'left';
    chars.forEach((c) => {
      ctx.fillText(c, x, y);
      x += ctx.measureText(c).width + tracking;
    });
    ctx.textAlign = align;
  },
  // 细金线
  drawHair(y, x1, x2, color, alpha) {
    const ctx = this.ctx;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x1, y + 0.5);
    ctx.lineTo(x2, y + 0.5);
    ctx.stroke();
    ctx.restore();
  },
  draw() {
    const ctx = this.ctx;
    if (!ctx) return;
    const t = this.data.templates[this.data.tpl];
    const dark = this.data.theme === 'dark';
    const W = 300;
    const H = 400;
    const paper = dark ? '#0B1426' : '#f7f5f0';
    const ink = dark ? '#f4efe4' : '#1f1b16';
    const gold = dark ? '#d9b66a' : '#8a6a2a';
    const sub = dark ? 'rgba(244,239,228,.62)' : 'rgba(31,27,22,.56)';

    // 暖纸 / 星夜底
    ctx.fillStyle = paper;
    ctx.fillRect(0, 0, W, H);
    // 主题色只留一层极淡上晕，作节令区分，不喧宾夺主
    const g = ctx.createLinearGradient(0, 0, 0, H * 0.78);
    g.addColorStop(0, this.rgba(t.tint, dark ? 0.20 : 0.12));
    g.addColorStop(1, this.rgba(t.tint, 0));
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
    // 细金线内框
    ctx.save();
    ctx.globalAlpha = 0.42;
    ctx.strokeStyle = gold;
    ctx.lineWidth = 1;
    ctx.strokeRect(18.5, 18.5, W - 37, H - 37);
    ctx.restore();

    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    // 星芒
    this.drawSpark(150, 104, 12, gold, 0.9);
    // 眉标
    ctx.fillStyle = gold;
    ctx.font = '11px sans-serif';
    this.drawTracked(t.eyebrow, 150, 148, 5);
    // 题字
    ctx.fillStyle = ink;
    ctx.font = '30px serif';
    this.drawTracked(t.title, 150, 198, 4);
    // 细金线分隔
    this.drawHair(224, 100, 200, gold, 0.5);
    // 祝语
    ctx.fillStyle = sub;
    ctx.font = '15px sans-serif';
    this.wrapText(this.data.text, 150, 264, 200, 26);
    // 落款
    ctx.save();
    ctx.globalAlpha = 0.82;
    ctx.fillStyle = gold;
    ctx.font = '11px sans-serif';
    this.drawTracked('星野漫游 · 拾光驿', 150, 356, 3);
    ctx.restore();
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
        whimsy.burst(this, { text: whimsy.COPY.success.share, emoji: '✦' });
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
