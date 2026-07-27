// 每日命理内容 · 序列化叙事流（24 节气 × 二十八宿回访钩子）
// 展示：当前节气章节（Hero）+ 今日星夜物语（story-card）+ 往日星轨（时间线）+ 距下一节气进度。
const daily = require('../../utils/daily-content.js');

Page({
  behaviors: [require('../../behaviors/themeable.js')],
  data: {
    theme: 'light',
    chapter: null,
    past: [],
    progress: 0,
    inList: []
  },

  onShow() {
    const now = new Date();
    const ch = daily.getDailyChapter(now);
    // 往日星轨：前 6 天（确定性，构成连续可读的时间线）
    const past = [];
    for (let i = 1; i <= 6; i++) {
      const d = new Date(now.getTime() - i * 86400000);
      const s = daily.getDailyStory(d);
      past.push({
        date: daily.dateKey(d),
        dateLabel: (d.getMonth() + 1) + '/' + d.getDate(),
        mansion: s.sushe,
        line: s.body,
        sign: s.sign,
        motif: s.motif
      });
    }
    const progress = ch.termLen > 0 ? Math.min(100, Math.round(ch.termDay / ch.termLen * 100)) : 0;
    // LoopChip（UX 架构 P0-b，解 B4 死胡同）：把读完星语的用户送回主循环
    const loopItems = [
      { icon: '🔭', label: '点亮今日星图', url: '/pages/chart/chart' },
      { icon: '🪔', label: '寄愿一笔', url: '/pages/merit/merit?tab=wish' },
      { icon: '🛎', label: '今日三善', url: '/pages/merit/merit' },
      { icon: '✍️', label: '记一笔感悟', url: '/pages/note/note' }
    ];
    this.setData({ chapter: ch, past: past, progress: progress, loopItems: loopItems, inList: [] });
    const self = this;
    setTimeout(() => self.observeChapters(), 60);
  },

  // 章节式滚动：进入视口时淡入上移（尊重 reduced-motion 由 CSS 关闭过渡）
  observeChapters() {
    const self = this;
    if (this._io) { try { this._io.disconnect(); } catch (e) {} }
    this._io = wx.createIntersectionObserver(this);
    this._io.relativeToViewport({ bottom: 60 });
    this._io.observe('.chapter', (res) => {
      if (res.intersectionRatio > 0 && res.id) {
        const i = Number(String(res.id).replace('ch', ''));
        if (!isNaN(i) && !self.data.inList[i]) {
          self.setData({ ['inList[' + i + ']']: true });
        }
      }
    });
  },

  onUnload() {
    if (this._io) { try { this._io.disconnect(); } catch (e) {} }
  },

  goIndex() { wx.switchTab({ url: '/pages/index/index' }); },

  onShareAppMessage() {
    return { title: '今日星夜物语 · 星野漫游', path: '/pages/daily/daily' };
  }
});
